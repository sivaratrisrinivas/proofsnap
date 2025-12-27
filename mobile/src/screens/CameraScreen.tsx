import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator, Share } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { captureRef } from 'react-native-view-shot';
import * as Crypto from 'expo-crypto';
import { ethers } from 'ethers';
import { mintMedia, MintResponse } from '../services/apiService';
import { addWatermark, generateShareMessage } from '../services/watermarkService';
import { addGalleryItem } from '../services/storageService';
import WatermarkOverlay from '../components/WatermarkOverlay';

// Define captured photo state type
interface CapturedPhoto {
    uri: string;
    base64: string;
    hash: string;
    signature?: string;
}

// Secured photo after minting
interface SecuredPhoto {
    uri: string;
    ipfsHash: string;
    ipfsUrl: string;
    txHash: string;
    verificationUrl: string;
}

interface CameraScreenProps {
    wallet?: ethers.Wallet | ethers.HDNodeWallet | null;
}

export default function CameraScreen({ wallet }: CameraScreenProps) {
    const cameraRef = useRef<CameraView>(null);
    const shareRef = useRef<View>(null);
    const [permission, requestPermission] = useCameraPermissions();
    const [capturedPhoto, setCapturedPhoto] = useState<CapturedPhoto | null>(null);
    const [securedPhoto, setSecuredPhoto] = useState<SecuredPhoto | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Request camera permission
    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>We need your permission to use the camera</Text>
                <TouchableOpacity style={styles.button} onPress={requestPermission}>
                    <Text style={styles.buttonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const takePicture = async () => {
        if (!cameraRef.current) return;

        try {
            setIsLoading(true);

            // Capture photo with base64 included
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.8,
                base64: true,
            });

            if (!photo || !photo.uri) {
                throw new Error('Failed to capture photo');
            }

            if (!photo.base64) {
                throw new Error('Failed to get base64 data from photo');
            }

            const fileUri = photo.uri;
            const fileDataBase64 = photo.base64;

            // Hash raw image bytes (decode base64 first, then SHA256)
            // This must match backend: crypto.createHash('sha256').update(Buffer.from(base64, 'base64'))
            const rawBytes = ethers.decodeBase64(fileDataBase64);
            const contentHash = ethers.sha256(rawBytes); // Returns 0x-prefixed hash

            console.log('📸 Photo captured!');
            console.log('URI:', fileUri);
            console.log('Hash:', contentHash);
            console.log('Base64 length:', fileDataBase64.length);

            // Sign the hash with the wallet (contentHash is already 0x-prefixed)
            let signature: string | undefined;
            if (wallet) {
                try {
                    signature = await wallet.signMessage(contentHash);
                    console.log('✍️ Signature:', signature);
                } catch (signError) {
                    console.error('❌ Signing error:', signError);
                }
            } else {
                console.warn('⚠️ No wallet available for signing');
            }

            // Store for later use - properly typed
            setCapturedPhoto({
                uri: fileUri,
                base64: fileDataBase64,
                hash: contentHash,
                signature,
            });

            setIsLoading(false);
        } catch (error) {
            console.error('❌ Camera error:', error);
            setIsLoading(false);
            alert('Failed to capture photo: ' + (error as Error).message);
        }
    };

    const handleSecure = async () => {
        if (!capturedPhoto || !wallet) {
            Alert.alert('Error', 'No photo or wallet available');
            return;
        }

        try {
            setIsUploading(true);
            console.log('🚀 Uploading to backend...');

            const result = await mintMedia({
                imageBuffer: capturedPhoto.base64,
                walletAddress: wallet.address,
                signature: capturedPhoto.signature,
            });

            console.log('✅ Secured!', result);

            const securedData = {
                uri: capturedPhoto.uri,
                ipfsHash: result.ipfsHash,
                ipfsUrl: result.ipfsUrl,
                txHash: result.txHash,
                verificationUrl: result.verificationUrl,
            };
            setSecuredPhoto(securedData);

            // Save to gallery for history
            await addGalleryItem(securedData);

            setCapturedPhoto(null);

        } catch (error) {
            console.error('❌ Upload error:', error);
            Alert.alert('Upload Failed', (error as Error).message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleShare = async () => {
        if (!securedPhoto || !shareRef.current) return;

        try {
            const uri = await captureRef(shareRef, {
                format: 'jpg',
                quality: 0.9,
            });

            const message = generateShareMessage(securedPhoto.verificationUrl);
            await Share.share({
                message,
                url: uri,
            });
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    const handleTakeAnother = () => {
        setSecuredPhoto(null);
        setCapturedPhoto(null);
    };

    // Success screen after securing
    if (securedPhoto) {
        return (
            <View style={styles.container}>
                <View ref={shareRef} collapsable={false} style={styles.shareContainer}>
                    <Image source={{ uri: securedPhoto.uri }} style={styles.preview} />
                    <WatermarkOverlay ipfsHash={securedPhoto.ipfsHash} />
                </View>

                <View style={styles.successBanner}>
                    <Text style={styles.successIcon}>✅</Text>
                    <Text style={styles.successTitle}>Photo Secured!</Text>
                    <Text style={styles.successSubtitle}>
                        Permanently stored on IPFS & Blockchain
                    </Text>
                </View>

                <View style={styles.infoCard}>
                    <Text style={styles.infoLabel}>IPFS Hash</Text>
                    <Text style={styles.infoValue} numberOfLines={1}>
                        {securedPhoto.ipfsHash}
                    </Text>

                    <Text style={styles.infoLabel}>Transaction</Text>
                    <Text style={styles.infoValue} numberOfLines={1}>
                        {securedPhoto.txHash}
                    </Text>
                </View>

                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[styles.button, styles.retakeBtn]}
                        onPress={handleTakeAnother}
                    >
                        <Text style={styles.buttonText}>📷 New Photo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.shareBtn]}
                        onPress={handleShare}
                    >
                        <Text style={styles.buttonText}>📤 Share</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // If photo captured, show preview
    if (capturedPhoto) {
        return (
            <View style={styles.container}>
                <Image source={{ uri: capturedPhoto.uri }} style={styles.preview} />
                <Text style={styles.hashText}>
                    Hash: {capturedPhoto.hash.substring(0, 40)}...
                </Text>

                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[styles.button, styles.retakeBtn]}
                        onPress={() => setCapturedPhoto(null)}
                        disabled={isUploading}
                    >
                        <Text style={styles.buttonText}>↻ Retake</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.uploadBtn, isUploading && styles.disabledBtn]}
                        onPress={handleSecure}
                        disabled={isUploading || !wallet}
                    >
                        {isUploading ? (
                            <View style={styles.uploadingRow}>
                                <ActivityIndicator size="small" color="#fff" />
                                <Text style={styles.buttonText}> Uploading...</Text>
                            </View>
                        ) : (
                            <Text style={styles.buttonText}>🔐 Secure</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // Camera view - button overlay positioned absolutely (CameraView doesn't support children)
    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} ref={cameraRef} facing="back" />
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.captureBtn]}
                    onPress={takePicture}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>
                        {isLoading ? '📷 Processing...' : '📷 Capture'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#000',
    },
    shareContainer: {
        flex: 1,
        width: '100%',
        position: 'relative',
    },
    shareImageWrapper: {
        flex: 1,
        width: '100%',
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 64,
        left: 0,
        right: 0,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 50,
        backgroundColor: '#007AFF',
        marginHorizontal: 10,
    },
    captureBtn: {
        backgroundColor: '#FF6B35',
        paddingHorizontal: 30,
        paddingVertical: 15,
    },
    retakeBtn: {
        backgroundColor: '#888',
    },
    uploadBtn: {
        backgroundColor: '#00C853',
    },
    disabledBtn: {
        opacity: 0.6,
    },
    uploadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginBottom: 20,
    },
    preview: {
        flex: 1,
        width: '100%',
    },
    hashText: {
        color: '#fff',
        padding: 10,
        backgroundColor: '#333',
        fontSize: 12,
        fontFamily: 'monospace',
        textAlign: 'center',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 20,
        backgroundColor: '#111',
    },
    // Success screen styles
    successBanner: {
        backgroundColor: '#00C853',
        paddingVertical: 16,
        alignItems: 'center',
    },
    successIcon: {
        fontSize: 32,
        marginBottom: 4,
    },
    successTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
    },
    successSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 4,
    },
    infoCard: {
        backgroundColor: '#1a1a1a',
        padding: 16,
    },
    infoLabel: {
        fontSize: 12,
        color: '#888',
        marginTop: 8,
    },
    infoValue: {
        fontSize: 14,
        color: '#fff',
        fontFamily: 'monospace',
        marginTop: 4,
    },
    shareBtn: {
        backgroundColor: '#2563eb',
    },
});
