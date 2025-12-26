import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { ethers } from 'ethers';

export const useWallet = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [wallet, setWallet] = useState<ethers.HDNodeWallet | ethers.Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeWallet();
  }, []);

  const initializeWallet = async () => {
    try {
      setLoading(true);
      console.log('[ProofSnap] Initializing wallet...');

      // Try to retrieve existing wallet
      const existingKey = await SecureStore.getItemAsync('proofsnap_private_key');

      let wallet: ethers.HDNodeWallet | ethers.Wallet;

      if (existingKey) {
        console.log('[ProofSnap] Found existing wallet, restoring...');
        wallet = new ethers.Wallet(existingKey);
      } else {
        console.log('[ProofSnap] No existing wallet, generating new one...');
        // Generate random bytes using expo-crypto for secure randomness
        const randomBytes = await Crypto.getRandomBytesAsync(32);
        // Convert Uint8Array to hex string without Buffer
        const privateKey = '0x' + Array.from(randomBytes)
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
        wallet = new ethers.Wallet(privateKey);
        // Store private key securely
        await SecureStore.setItemAsync('proofsnap_private_key', wallet.privateKey);
        console.log('[ProofSnap] Wallet created and stored securely');
      }

      console.log('[ProofSnap] Wallet address:', wallet.address);
      setWallet(wallet);
      setWalletAddress(wallet.address);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize wallet';
      console.error('[ProofSnap] Wallet initialization error:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { walletAddress, wallet, loading, error };
};
