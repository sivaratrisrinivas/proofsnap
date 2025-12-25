import React, { useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import CameraScreen from '../../src/screens/CameraScreen';
import GalleryScreen from '../../src/screens/GalleryScreen';
import { useWallet } from '../../hooks/useWallet';

type Tab = 'camera' | 'gallery';

export default function HomeScreen() {
    const { walletAddress, wallet, loading, error } = useWallet();
    const [activeTab, setActiveTab] = useState<Tab>('camera');

    return (
        <View style={styles.container}>
            {/* Main Content */}
            {activeTab === 'camera' ? (
                <>
                    <CameraScreen wallet={wallet} />
                    
                    {/* Wallet Overlay (Camera only) */}
                    <View style={styles.headerOverlay}>
                        <Text style={styles.appTitle}>ProofSnap</Text>
                        <Text style={styles.appSubtitle}>Capture & Prove</Text>

                        <View style={styles.walletCard}>
                            <Text style={styles.walletLabel}>🔐 Your Wallet</Text>

                            {loading ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="small" color="#2563eb" />
                                    <Text style={styles.loadingText}>Initializing...</Text>
                                </View>
                            ) : error ? (
                                <Text style={styles.errorText}>❌ {error}</Text>
                            ) : (
                                <>
                                    <Text style={styles.walletAddress}>{walletAddress}</Text>
                                    <Text style={styles.readyText}>✓ Ready to create proofs</Text>
                                </>
                            )}
                        </View>
                    </View>
                </>
            ) : (
                <GalleryScreen onOpenCamera={() => setActiveTab('camera')} />
            )}

            {/* Tab Bar */}
            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'camera' && styles.activeTab]}
                    onPress={() => setActiveTab('camera')}
                >
                    <Text style={[styles.tabIcon, activeTab === 'camera' && styles.activeTabText]}>
                        📷
                    </Text>
                    <Text style={[styles.tabLabel, activeTab === 'camera' && styles.activeTabText]}>
                        Camera
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'gallery' && styles.activeTab]}
                    onPress={() => setActiveTab('gallery')}
                >
                    <Text style={[styles.tabIcon, activeTab === 'gallery' && styles.activeTabText]}>
                        🏛️
                    </Text>
                    <Text style={[styles.tabLabel, activeTab === 'gallery' && styles.activeTabText]}>
                        Gallery
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    headerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
        zIndex: 10,
    },
    appTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    appSubtitle: {
        fontSize: 12,
        color: '#aaa',
        marginBottom: 8,
    },
    walletCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 8,
        padding: 12,
        marginTop: 4,
    },
    walletLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 6,
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    loadingText: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    errorText: {
        fontSize: 12,
        color: '#ef4444',
    },
    walletAddress: {
        fontSize: 13,
        fontWeight: '600',
        color: '#2563eb',
        fontFamily: 'monospace',
        marginBottom: 4,
    },
    readyText: {
        fontSize: 11,
        color: '#16a34a',
        fontWeight: '500',
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#111',
        borderTopWidth: 1,
        borderTopColor: '#222',
        paddingBottom: 20, // Safe area padding
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
    },
    activeTab: {
        backgroundColor: '#1a1a1a',
    },
    tabIcon: {
        fontSize: 24,
        marginBottom: 4,
    },
    tabLabel: {
        fontSize: 12,
        color: '#888',
    },
    activeTabText: {
        color: '#fff',
    },
});
