// API Service for ProofSnap Backend

// Backend URL from environment variable or fallback to ngrok
// For local development, ngrok URL is used. For production, use EXPO_PUBLIC_API_URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://48cf1e5b403d.ngrok-free.app';

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
  ipfsHash: string;  // Direct access, more reliable
  contentHash: string;
  txHash: string;
  verificationUrl: string;
  mediaRecord?: {    // Optional - may be null if DB fails
    id: string;
    ipfs_hash: string;
    content_hash: string;
    tx_hash: string;
    status: string;
  } | null;
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

