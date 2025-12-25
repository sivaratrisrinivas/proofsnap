import { Share } from 'react-native';

export interface WatermarkOptions {
  verificationUrl?: string;
  ipfsHash?: string;
}

/**
 * For MVP: Returns the original image URI
 * The "watermark" is displayed as a UI overlay in the success screen
 * 
 * Future: Use react-native-view-shot to burn overlay into image
 */
export async function addWatermark(
  imageUri: string,
  options: WatermarkOptions = {}
): Promise<string> {
  console.log('[Watermark] Preparing image with verification overlay (UI-based)');
  // For MVP, we just return the original - the UI shows the verification badge
  return imageUri;
}

/**
 * Share verified media with verification link
 */
export async function shareVerifiedMedia(
  verificationUrl: string,
  _ipfsHash?: string
): Promise<boolean> {
  try {
    const result = await Share.share({
      message: generateShareMessage(verificationUrl),
      title: 'ProofSnap Verified Photo',
    });
    return result.action === Share.sharedAction;
  } catch (error) {
    console.error('[Share] Failed:', error);
    return false;
  }
}

/**
 * Generate a share message with verification link
 */
export function generateShareMessage(verificationUrl: string): string {
  return `📸 Verified by ProofSnap\n\n` +
    `This photo's authenticity is cryptographically proven.\n\n` +
    `🔗 Verify: ${verificationUrl}\n\n` +
    `#ProofSnap #VerifiedMedia #TruthLens`;
}

/**
 * Get the verification URL for a given IPFS hash
 */
export function getVerificationUrl(ipfsHash: string): string {
  return `https://proofsnap.app/verify/${ipfsHash}`;
}

