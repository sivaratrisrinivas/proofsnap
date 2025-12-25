// API Service for ProofSnap Backend

// Configure your backend URL here
// For local development with Expo Go, use your machine's local IP
// Find your IP with: hostname -I | awk '{print $1}'
// e.g., "http://192.168.1.100:3000"
// 
// TODO: Replace with your machine's IP address for physical device testing
const API_BASE_URL = 'https://4be3d2da1d06.ngrok-free.app'; // ngrok tunnel to backend

export interface MintRequest {
  imageBuffer: string;      // base64 encoded image
  walletAddress: string;    // 0x... address
  signature?: string;       // signed hash
  locationData?: string;    // encrypted:lat,lng
  deviceId?: string;        // device identifier
}

export interface MintResponse {
  status: string;
  ipfsUrl: string;
  contentHash: string;
  txHash: string;
  verificationUrl: string;
  mediaRecord: {
    id: string;
    ipfs_hash: string;
    content_hash: string;
    tx_hash: string;
    status: string;
  };
}

export interface ApiError {
  error: string;
}

export async function mintMedia(request: MintRequest): Promise<MintResponse> {
  console.log('[API] Minting media...');
  console.log('[API] URL:', `${API_BASE_URL}/api/v1/mint`);
  
  const response = await fetch(`${API_BASE_URL}/api/v1/mint`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('[API] Mint failed:', data);
    throw new Error((data as ApiError).error || 'Mint failed');
  }

  console.log('[API] Mint successful:', data.txHash);
  return data as MintResponse;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

