import type { Context } from "hono";
import { createClient } from "@supabase/supabase-js";
import { getProofFromChain, checkProofExists } from "../services/blockchainService";
import { getIpfsUrl } from "../services/ipfsService";

// Use service_role key to bypass RLS for backend operations
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY!
);

export async function verifyMedia(c: Context) {
  try {
    const hash = c.req.param("hash");

    if (!hash) {
      return c.json({ error: "Missing hash parameter" }, 400);
    }

    console.log(`🔍 Verifying media: ${hash}`);

    // Query database for the media record
    // hash could be ipfs_hash or content_hash
    const { data: mediaRecord, error: dbError } = await supabase
      .from("media_records")
      .select(`
        id,
        ipfs_hash,
        content_hash,
        tx_hash,
        status,
        created_at,
        users (
          wallet_address
        )
      `)
      .or(`ipfs_hash.eq.${hash},content_hash.eq.${hash}`)
      .single();

    if (dbError || !mediaRecord) {
      console.log(`❌ Media not found in database: ${hash}`);
      return c.json({
        verified: false,
        error: "Media not found",
        message: "No proof exists for this hash",
      }, 404);
    }

    // Verify on blockchain - check proof exists first
    if (!mediaRecord.content_hash) {
      return c.json({
        verified: false,
        error: "Missing content hash",
        message: "Database record missing content hash",
      }, 500);
    }

    let blockchainProof;
    try {
      const exists = await checkProofExists(mediaRecord.content_hash);
      if (!exists) {
        console.error(`❌ Proof not found on blockchain for hash: ${mediaRecord.content_hash}`);
        return c.json({
          verified: false,
          error: "Proof not found",
          message: "No blockchain proof exists for this media",
        }, 404);
      }

      blockchainProof = await getProofFromChain(mediaRecord.content_hash);
      console.log(`✅ Blockchain proof found`);
    } catch (chainError) {
      console.error(`❌ Blockchain verification failed:`, chainError);
      return c.json(
        {
          verified: false,
          error: "Blockchain verification failed",
          message: "Could not verify proof on blockchain",
        },
        500
      );
    }

    const response = {
      verified: true,
      status: mediaRecord.status,
      proof: {
        contentHash: mediaRecord.content_hash,
        ipfsHash: mediaRecord.ipfs_hash,
        ipfsUrl: getIpfsUrl(mediaRecord.ipfs_hash),
        txHash: mediaRecord.tx_hash,
        createdAt: mediaRecord.created_at,
        creator: (mediaRecord.users as any)?.wallet_address || null,
      },
      blockchain: {
        timestamp: Number(blockchainProof.timestamp),
        creator: blockchainProof.creator,
        locationData: blockchainProof.locationData,
        deviceId: blockchainProof.deviceId,
      },
    };

    console.log(`✅ Verification complete for: ${hash}`);
    return c.json(response);

  } catch (error) {
    console.error("❌ Verify failed:", error);
    return c.json({ error: `Verification failed: ${error}` }, 500);
  }
}

