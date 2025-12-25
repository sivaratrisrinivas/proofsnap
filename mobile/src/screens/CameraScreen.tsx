import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Crypto from 'expo-crypto';
import { ethers } from 'ethers';
import { mintMedia } from '../services/apiService';

// Define captured photo state type
interface CapturedPhoto {
    uri: string;
    base64: string;
    hash: string;
    signature?: string;
}

interface CameraScreenProps {
    wallet?: ethers.Wallet | ethers.HDNodeWallet | null;
}

export default function CameraScreen({ wallet }: CameraScreenProps) {
    const cameraRef = useRef<CameraView>(null);
    const [permission, requestPermission] = useCameraPermissions();
    const [capturedPhoto, setCapturedPhoto] = useState<CapturedPhoto | null>(null);
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

            // Generate SHA-256 hash from base64 string
            const contentHash = await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                fileDataBase64
            );

            console.log('📸 Photo captured!');
            console.log('URI:', fileUri);
            console.log('Hash:', contentHash);
            console.log('Base64 length:', fileDataBase64.length);

            // Sign the hash with the wallet (Step 17)
            let signature: string | undefined;
            if (wallet) {
                try {
                    // Sign the hash (prefixed with 0x for proper bytes32 format)
                    const hashToSign = '0x' + contentHash;
                    signature = await wallet.signMessage(hashToSign);
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
                // TODO: Add location and device ID later
            });

            console.log('✅ Secured!', result);

            Alert.alert(
                '🎉 Secured!',
                `Your photo has been permanently secured.\n\nTransaction: ${result.txHash.substring(0, 20)}...\n\nIPFS: ${result.ipfsUrl}`,
                [
                    {
                        text: 'Take Another',
                        onPress: () => setCapturedPhoto(null),
                    },
                ]
            );
        } catch (error) {
            console.error('❌ Upload error:', error);
            Alert.alert('Upload Failed', (error as Error).message);
        } finally {
            setIsUploading(false);
        }
    };

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
});
