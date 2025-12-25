import AsyncStorage from '@react-native-async-storage/async-storage';

const GALLERY_KEY = 'proofsnap_gallery';

export interface GalleryItem {
  id: string;
  uri: string;
  ipfsHash: string;
  ipfsUrl: string;
  txHash: string;
  verificationUrl: string;
  createdAt: string;
}

/**
 * Get all secured photos from local storage
 */
export async function getGalleryItems(): Promise<GalleryItem[]> {
  try {
    const data = await AsyncStorage.getItem(GALLERY_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('[Storage] Failed to get gallery:', error);
    return [];
  }
}

/**
 * Add a new secured photo to the gallery
 */
export async function addGalleryItem(item: Omit<GalleryItem, 'id' | 'createdAt'>): Promise<GalleryItem> {
  try {
    const existing = await getGalleryItems();
    
    const newItem: GalleryItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    // Add to beginning (newest first)
    const updated = [newItem, ...existing];
    await AsyncStorage.setItem(GALLERY_KEY, JSON.stringify(updated));
    
    console.log('[Storage] Added item to gallery:', newItem.id);
    return newItem;
  } catch (error) {
    console.error('[Storage] Failed to add gallery item:', error);
    throw error;
  }
}

/**
 * Remove a photo from the gallery
 */
export async function removeGalleryItem(id: string): Promise<void> {
  try {
    const existing = await getGalleryItems();
    const updated = existing.filter(item => item.id !== id);
    await AsyncStorage.setItem(GALLERY_KEY, JSON.stringify(updated));
    console.log('[Storage] Removed item from gallery:', id);
  } catch (error) {
    console.error('[Storage] Failed to remove gallery item:', error);
    throw error;
  }
}

/**
 * Clear all gallery items
 */
export async function clearGallery(): Promise<void> {
  try {
    await AsyncStorage.removeItem(GALLERY_KEY);
    console.log('[Storage] Gallery cleared');
  } catch (error) {
    console.error('[Storage] Failed to clear gallery:', error);
    throw error;
  }
}

