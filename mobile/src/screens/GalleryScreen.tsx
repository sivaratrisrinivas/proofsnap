import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Share,
  RefreshControl,
  Alert,
} from 'react-native';
import { GalleryItem, getGalleryItems, removeGalleryItem } from '../services/storageService';
import { generateShareMessage } from '../services/watermarkService';

interface GalleryScreenProps {
  onOpenCamera?: () => void;
}

export default function GalleryScreen({ onOpenCamera }: GalleryScreenProps) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadItems = useCallback(async () => {
    const galleryItems = await getGalleryItems();
    setItems(galleryItems);
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  };

  const handleShare = async (item: GalleryItem) => {
    try {
      const message = generateShareMessage(item.verificationUrl);
      await Share.share({
        message,
        url: item.verificationUrl,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleDelete = (item: GalleryItem) => {
    Alert.alert(
      'Delete Photo',
      'Remove this photo from your gallery? (The blockchain proof will remain.)',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await removeGalleryItem(item.id);
            loadItems();
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderItem = ({ item }: { item: GalleryItem }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.uri }} style={styles.thumbnail} />
      
      <View style={styles.cardContent}>
        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedText}>✓ Verified</Text>
        </View>
        
        <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
        
        <Text style={styles.hashText} numberOfLines={1}>
          IPFS: {item.ipfsHash.substring(0, 20)}...
        </Text>
        
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.shareBtn]}
            onPress={() => handleShare(item)}
          >
            <Text style={styles.actionText}>📤 Share</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => handleDelete(item)}
          >
            <Text style={styles.actionText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📷</Text>
      <Text style={styles.emptyTitle}>No Verified Photos Yet</Text>
      <Text style={styles.emptySubtitle}>
        Take your first photo and secure it on the blockchain
      </Text>
      {onOpenCamera && (
        <TouchableOpacity style={styles.cameraBtn} onPress={onOpenCamera}>
          <Text style={styles.cameraBtnText}>📸 Open Camera</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏛️ Gallery</Text>
        <Text style={styles.headerSubtitle}>Your Verified Photos</Text>
      </View>

      {/* Photo List */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={items.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00C853"
          />
        }
        numColumns={1}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  list: {
    padding: 12,
  },
  emptyList: {
    flex: 1,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  thumbnail: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 16,
  },
  verifiedBadge: {
    backgroundColor: '#00C853',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  verifiedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dateText: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4,
  },
  hashText: {
    color: '#666',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  shareBtn: {
    backgroundColor: '#2563eb',
    flex: 1,
    alignItems: 'center',
  },
  deleteBtn: {
    backgroundColor: '#333',
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
  cameraBtn: {
    marginTop: 24,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
  },
  cameraBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

