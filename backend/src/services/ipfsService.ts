import { PinataSDK } from "pinata-web3";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
});

export async function uploadToPinata(
  fileBuffer: Buffer,
  fileName: string
): Promise<string> {
  try {
    const file = new File([fileBuffer], fileName, { type: "application/octet-stream" });
    const uploadResponse = await pinata.upload.file(file);
    const ipfsHash = uploadResponse.IpfsHash;
    console.log(`✅ Uploaded to IPFS: ${ipfsHash}`);
    return ipfsHash;
  } catch (error) {
    console.error("❌ IPFS upload failed:", error);
    throw new Error(`IPFS upload failed: ${error}`);
  }
}

export function getIpfsUrl(hash: string): string {
  return `https://ipfs.io/ipfs/${hash}`;
}
