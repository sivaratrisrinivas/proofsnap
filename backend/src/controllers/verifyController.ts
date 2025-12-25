import type { Context } from "hono";
import { createClient } from "@supabase/supabase-js";
import { getProofFromChain } from "../services/blockchainService";
import { getIpfsUrl } from "../services/ipfsService";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
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

    // Optionally verify on blockchain
    let blockchainProof = null;
    try {
      if (mediaRecord.content_hash) {
        blockchainProof = await getProofFromChain(mediaRecord.content_hash);
        console.log(`✅ Blockchain proof found`);
      }
    } catch (chainError) {
      console.warn(`⚠️ Could not fetch blockchain proof:`, chainError);
      // Continue without blockchain data - DB is source of truth for now
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
      blockchain: blockchainProof ? {
        timestamp: Number(blockchainProof.timestamp),
        creator: blockchainProof.creator,
        locationData: blockchainProof.locationData,
        deviceId: blockchainProof.deviceId,
      } : null,
    };

    console.log(`✅ Verification complete for: ${hash}`);
    return c.json(response);

  } catch (error) {
    console.error("❌ Verify failed:", error);
    return c.json({ error: `Verification failed: ${error}` }, 500);
  }
}

