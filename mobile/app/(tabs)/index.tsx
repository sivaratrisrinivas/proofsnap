import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import CameraScreen from '../../src/screens/CameraScreen';
import { useWallet } from '../../hooks/useWallet';

export default function HomeScreen() {
    const { walletAddress, wallet, loading, error } = useWallet();

    return (
        <View style={{ flex: 1 }}>
            {/* Full Screen Camera */}
            <CameraScreen wallet={wallet} />

            {/* Overlay: Wallet Info (Top) */}
            <View
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    paddingHorizontal: 16,
                    paddingTop: 12,
                    paddingBottom: 8,
                    zIndex: 10,
                }}
            >
                {/* Header */}
                <Text
                    style={{
                        fontSize: 24,
                        fontWeight: 'bold',
                        color: '#fff',
                    }}
                >
                    ProofSnap
                </Text>
                <Text
                    style={{
                        fontSize: 12,
                        color: '#aaa',
                        marginBottom: 8,
                    }}
                >
                    Capture & Prove
                </Text>

                {/* Wallet Card */}
                <View
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: 8,
                        padding: 12,
                        marginTop: 4,
                    }}
                >
                    <Text
                        style={{
                            fontSize: 14,
                            fontWeight: '600',
                            color: '#333',
                            marginBottom: 6,
                        }}
                    >
                        🔐 Your Wallet
                    </Text>

                    {loading ? (
                        <View style={{ alignItems: 'center', paddingVertical: 8 }}>
                            <ActivityIndicator size="small" color="#2563eb" />
                            <Text
                                style={{
                                    fontSize: 12,
                                    color: '#666',
                                    marginTop: 4,
                                }}
                            >
                                Initializing...
                            </Text>
                        </View>
                    ) : error ? (
                        <Text style={{ fontSize: 12, color: '#ef4444' }}>
                            ❌ {error}
                        </Text>
                    ) : (
                        <>
                            <Text
                                style={{
                                    fontSize: 13,
                                    fontWeight: '600',
                                    color: '#2563eb',
                                    fontFamily: 'monospace',
                                    marginBottom: 4,
                                }}
                            >
                                {walletAddress}
                            </Text>
                            <Text
                                style={{
                                    fontSize: 11,
                                    color: '#16a34a',
                                    fontWeight: '500',
                                }}
                            >
                                ✓ Ready to create proofs
                            </Text>
                        </>
                    )}
                </View>
            </View>
        </View>
    );
}
