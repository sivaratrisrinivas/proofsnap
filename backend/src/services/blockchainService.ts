import { ethers } from "ethers";

// Hardhat local network
const HARDHAT_RPC = "http://127.0.0.1:8545";
const PROOFSNAP_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Contract ABI (minimal—just the registerMedia function)
const PROOFSNAP_ABI = [
  "function registerMedia(bytes32 _contentHash, string calldata _locationData, string calldata _deviceId) external",
  "function getProof(bytes32 _contentHash) external view returns (tuple(bytes32 contentHash, uint256 timestamp, address creator, string locationData, string deviceId))",
];

export async function registerMediaOnChain(
  contentHash: string,
  locationData: string,
  deviceId: string
): Promise<{ txHash: string; blockNumber: number }> {
  try {
    // Connect to Hardhat network (no private key needed for local testing)
    const provider = new ethers.JsonRpcProvider(HARDHAT_RPC);
    const signer = await provider.getSigner(0); // Use first Hardhat account

    const contract = new ethers.Contract(
      PROOFSNAP_CONTRACT_ADDRESS,
      PROOFSNAP_ABI,
      signer
    );

    console.log(`📝 Registering media on blockchain...`);
    const tx = await contract.registerMedia(
      contentHash,
      locationData,
      deviceId
    );

    const receipt = await tx.wait();
    console.log(`✅ Transaction confirmed: ${receipt.hash}`);

    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  } catch (error) {
    console.error("❌ Blockchain registration failed:", error);
    throw new Error(`Blockchain registration failed: ${error}`);
  }
}

export async function getProofFromChain(
  contentHash: string
): Promise<any> {
  try {
    const provider = new ethers.JsonRpcProvider(HARDHAT_RPC);
    const contract = new ethers.Contract(
      PROOFSNAP_CONTRACT_ADDRESS,
      PROOFSNAP_ABI,
      provider
    );

    const proof = await contract.getProof(contentHash);
    return proof;
  } catch (error) {
    console.error("❌ Failed to fetch proof:", error);
    throw new Error(`Failed to fetch proof: ${error}`);
  }
}
