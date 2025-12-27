import { PinataSDK } from "pinata-web3";
import { AuthenticationError, NetworkError, StorageError } from "../errors";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
});

export async function uploadToPinata(
  fileBuffer: Buffer,
  fileName: string
): Promise<string> {
  try {
    if (!process.env.PINATA_JWT) {
      throw new AuthenticationError("PINATA_JWT not configured");
    }

    const file = new File([fileBuffer], fileName, { type: "application/octet-stream" });
    const uploadResponse = await pinata.upload.file(file);
    const ipfsHash = uploadResponse.IpfsHash;
    console.log(`✅ Uploaded to IPFS: ${ipfsHash}`);
    return ipfsHash;
  } catch (error: any) {
    console.error("❌ IPFS upload failed:", error);
    
    if (error.status === 401 || error.status === 403) {
      throw new AuthenticationError("Invalid Pinata credentials", 401, error);
    }
    if (error.status >= 400 && error.status < 500) {
      throw new NetworkError("IPFS upload failed", error.status, error);
    }
    throw new StorageError(`IPFS upload failed: ${error.message}`, error);
  }
}

export function getIpfsUrl(hash: string): string {
  return `https://ipfs.io/ipfs/${hash}`;
}
