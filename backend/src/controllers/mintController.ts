import type { Context } from "hono";
import { uploadToPinata, getIpfsUrl } from "../services/ipfsService";
import { registerMediaOnChain } from "../services/blockchainService";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// Base URL for verification links - set via env or defaults to ngrok URL
// Update this when deploying to production
const VERIFY_BASE_URL = process.env.API_BASE_URL || "https://4be3d2da1d06.ngrok-free.app";
console.log(`[Config] VERIFY_BASE_URL: ${VERIFY_BASE_URL}`);

// Use service_role key to bypass RLS for backend operations
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY!
);

export async function mintMedia(c: Context) {
  try {
    const body = await c.req.json();
    const { imageBuffer, walletAddress, locationData, deviceId } = body;

    if (!imageBuffer || !walletAddress) {
      return c.json(
        { error: "Missing imageBuffer or walletAddress" },
        400
      );
    }

    // Convert base64 to Buffer
    const buffer = Buffer.from(imageBuffer, "base64");

    // Generate content hash (SHA-256)
    const contentHash = "0x" + crypto
      .createHash("sha256")
      .update(buffer)
      .digest("hex");

    console.log(`📤 Minting media with hash: ${contentHash}`);

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
    return c.json({ error: `Mint failed: ${error}` }, 500);
  }
}
