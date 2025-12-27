import type { Context } from "hono";
import { uploadToPinata, getIpfsUrl } from "../services/ipfsService";
import { registerMediaOnChain } from "../services/blockchainService";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { z } from "zod";
import { verifyMessage } from "ethers";
import { AuthenticationError, NetworkError, BlockchainError, ProofSnapError } from "../errors";

// Zod schema for mint request validation
const mintRequestSchema = z.object({
  imageBuffer: z.string(),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
  signature: z.string().optional(),
  locationData: z.string().optional(),
  deviceId: z.string().optional(),
});

// Base URL for verification links - MUST be set in .env
// For dev: your ngrok URL. For prod: your domain
const VERIFY_BASE_URL = process.env.API_BASE_URL;
if (!VERIFY_BASE_URL) {
  console.error("❌ API_BASE_URL not set in .env - verification links will fail!");
}
console.log(`[Config] VERIFY_BASE_URL: ${VERIFY_BASE_URL || "NOT SET"}`);

// Use service_role key to bypass RLS for backend operations
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY!
);

async function verifySignature(
  signature: string,
  walletAddress: string,
  contentHash: string
): Promise<boolean> {
  try {
    const recoveredAddress = await verifyMessage(contentHash, signature);
    return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
  } catch (error) {
    console.error("[Signature] Verification failed:", error);
    return false;
  }
}

export async function mintMedia(c: Context) {
  try {
    const body = await c.req.json();
    const validationResult = mintRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return c.json(
        { error: "Invalid request", details: validationResult.error.message },
        400
      );
    }

    const { imageBuffer, walletAddress, signature, locationData, deviceId } = validationResult.data;

    if (!imageBuffer || !walletAddress) {
      return c.json(
        { error: "Missing imageBuffer or walletAddress" },
        400
      );
    }

    // Convert base64 to Buffer for IPFS upload and hashing
    const buffer = Buffer.from(imageBuffer, "base64");

    // Generate content hash (SHA-256) from RAW IMAGE BYTES
    // Mobile uses: ethers.sha256(ethers.decodeBase64(base64String))
    // Both sides hash the decoded raw bytes, not the base64 string
    const contentHash = "0x" + crypto
      .createHash("sha256")
      .update(buffer)  // Hash raw bytes (decoded from base64)
      .digest("hex");

    console.log(`📤 Minting media with hash: ${contentHash}`);

    if (signature) {
      const isValid = await verifySignature(signature, walletAddress, contentHash);
      if (!isValid) {
        return c.json(
          { error: "Invalid signature - wallet address doesn't match" },
          403
        );
      }
      console.log("✅ Signature verified");
    } else {
      console.warn("⚠️ No signature provided - skipping verification");
    }

    // Step 1: Upload to IPFS
    const ipfsHash = await uploadToPinata(buffer, `image-${Date.now()}.jpg`);
    console.log(`✅ IPFS uploaded: ${ipfsHash}`);

    // Step 2: Register on blockchain
    const { txHash, blockNumber } = await registerMediaOnChain(
      contentHash,
      locationData || "encrypted:0,0",
      deviceId || "unknown"
    );
    console.log(`✅ Blockchain registered: ${txHash}`);

    // Step 3: Ensure user exists in DB
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("wallet_address", walletAddress)
      .single();

    let userId = user?.id;
    if (!userId) {
      const { data: newUser } = await supabase
        .from("users")
        .insert({ wallet_address: walletAddress })
        .select("id")
        .single();
      userId = newUser?.id;
    }

    // Step 4: Save to Supabase
    const { data: mediaRecord, error: dbError } = await supabase
      .from("media_records")
      .insert({
        user_id: userId,
        ipfs_hash: ipfsHash,
        content_hash: contentHash,
        tx_hash: txHash,
        status: "VERIFIED",
      })
      .select()
      .single();

    if (dbError) {
      console.error(`⚠️ DB insert error:`, dbError);
    }
    console.log(`✅ Saved to DB: ${mediaRecord?.id || 'failed'}`);

    const verificationUrl = `${VERIFY_BASE_URL}/api/v1/verify/${ipfsHash}`;

    return c.json({
      status: "success",
      ipfsUrl: getIpfsUrl(ipfsHash),
      ipfsHash, // Include directly for reliability
      contentHash,
      txHash,
      verificationUrl,
      mediaRecord,
    });
  } catch (error) {
    console.error("❌ Mint failed:", error);
    
    if (error instanceof ProofSnapError) {
      return c.json(
        { 
          error: error.message, 
          code: error.code,
        },
        error.statusCode || 500
      );
    }
    
    return c.json({ error: `Mint failed: ${error}` }, 500);
  }
}
