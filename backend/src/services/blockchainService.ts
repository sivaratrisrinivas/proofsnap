import { ethers } from "ethers";
import { NetworkError, BlockchainError } from "../errors";

// Network configuration from environment
// BLOCKCHAIN_NETWORK: "local" | "sepolia" | "amoy" | "polygon"
const BLOCKCHAIN_NETWORK = process.env.BLOCKCHAIN_NETWORK || "local";
const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const PRIVATE_KEY = process.env.PRIVATE_KEY; // Required for non-local networks

console.log(`[Blockchain] Network: ${BLOCKCHAIN_NETWORK}, RPC: ${RPC_URL.substring(0, 30)}...`);

// Contract ABI (minimal—just the registerMedia function)
const PROOFSNAP_ABI = [
  "function registerMedia(bytes32 _contentHash, string calldata _locationData, string calldata _deviceId) external",
  "function getProof(bytes32 _contentHash) external view returns (tuple(bytes32 contentHash, uint256 timestamp, address creator, string locationData, string deviceId))",
  "function proofExists(bytes32 _contentHash) external view returns (bool)",
];

// Get signer based on network type
async function getSigner(provider: ethers.JsonRpcProvider): Promise<ethers.Signer> {
  if (BLOCKCHAIN_NETWORK === "local") {
    // Use Hardhat's first account for local testing
    return provider.getSigner(0);
  }
  // For testnets/mainnet, use private key from env
  if (!PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY required for non-local networks");
  }
  return new ethers.Wallet(PRIVATE_KEY, provider);
}

export async function registerMediaOnChain(
  contentHash: string,
  locationData: string,
  deviceId: string
): Promise<{ txHash: string; blockNumber: number }> {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const signer = await getSigner(provider);

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      PROOFSNAP_ABI,
      signer
    ) as ethers.Contract & {
      registerMedia: (hash: string, location: string, device: string) => Promise<ethers.ContractTransactionResponse>;
    };

    console.log(`📝 Registering media on blockchain...`);
    const tx = await contract.registerMedia(
      contentHash,
      locationData,
      deviceId
    );

    const receipt = await tx.wait();
    if (!receipt) {
      throw new BlockchainError("Transaction receipt is null");
    }
    console.log(`✅ Transaction confirmed: ${receipt.hash}`);

    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  } catch (error: any) {
    console.error("❌ Blockchain registration failed:", error);
    
    if (error.code === "NETWORK_ERROR") {
      throw new NetworkError("Cannot connect to blockchain", 503, error);
    }
    if (error.code === "INSUFFICIENT_FUNDS") {
      throw new BlockchainError("Insufficient funds for transaction", error);
    }
    throw new BlockchainError(`Blockchain registration failed: ${error.message}`, error);
  }
}

export async function getProofFromChain(
  contentHash: string
): Promise<any> {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      PROOFSNAP_ABI,
      provider
    ) as ethers.Contract & {
      getProof: (hash: string) => Promise<any>;
    };

    const proof = await contract.getProof(contentHash);
    return proof;
  } catch (error: any) {
    console.error("❌ Failed to fetch proof:", error);
    
    if (error.code === "NETWORK_ERROR") {
      throw new NetworkError("Cannot connect to blockchain", 503, error);
    }
    throw new BlockchainError(`Failed to fetch proof: ${error.message}`, error);
  }
}

export async function checkProofExists(contentHash: string): Promise<boolean> {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      PROOFSNAP_ABI,
      provider
    ) as ethers.Contract & {
      proofExists: (hash: string) => Promise<boolean>;
    };

    return await contract.proofExists(contentHash);
  } catch (error: any) {
    console.error("❌ Failed to check proof existence:", error);
    
    if (error.code === "NETWORK_ERROR") {
      throw new NetworkError("Cannot connect to blockchain", 503, error);
    }
    throw new BlockchainError(`Failed to check proof: ${error.message}`, error);
  }
}
