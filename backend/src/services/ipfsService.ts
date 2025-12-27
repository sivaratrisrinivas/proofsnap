import { PinataSDK } from "pinata-web3";
import { AuthenticationError, NetworkError, StorageError } from "../errors";
import { retryWithBackoff } from "../utils";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
});

export async function uploadToPinata(
  fileBuffer: Buffer,
  fileName: string
): Promise<string> {
  if (!process.env.PINATA_JWT) {
    throw new AuthenticationError("PINATA_JWT not configured");
  }

  return retryWithBackoff(async () => {
    const file = new File([fileBuffer], fileName, { type: "application/octet-stream" });
    const uploadResponse = await pinata.upload.file(file);
    const ipfsHash = uploadResponse.IpfsHash;
    console.log(`✅ Uploaded to IPFS: ${ipfsHash}`);
    return ipfsHash;
  }, {
    maxAttempts: 3,
    initialDelay: 2000,
    maxDelay: 10000,
    shouldRetry: (error: any) => {
      const status = error?.status || 0;
      return status >= 500 || status === 429;
    }
  });
}

export function getIpfsUrl(hash: string): string {
  return `https://ipfs.io/ipfs/${hash}`;
}
