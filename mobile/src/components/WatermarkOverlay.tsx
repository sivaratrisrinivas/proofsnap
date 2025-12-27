import React from 'react';
import { View, StyleSheet, Text as RNText } from 'react-native';

interface WatermarkOverlayProps {
  ipfsHash: string;
}

export default function WatermarkOverlay({ ipfsHash }: WatermarkOverlayProps) {
  const shortHash = ipfsHash.substring(0, 16) + '...';

  return (
    <View style={styles.overlay}>
      <View style={styles.badge}>
        <RNText style={styles.verifiedText}>✓ ProofSnap Verified</RNText>
        <RNText style={styles.hashText}>{shortHash}</RNText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  badge: {
    alignItems: 'flex-start',
  },
  verifiedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00C853',
    marginBottom: 4,
  },
  hashText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'monospace',
  },
});
