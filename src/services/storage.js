import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Fallback in-memory storage jika native module belum siap / null
const memoryStorage = new Map();

/**
 * Robust Isomorphic Storage Helper
 * Bekerja mulus di Expo Go (HP), Android Emulator, iOS, dan Web Browser
 */
export const Storage = {
  async getItem(key) {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return await AsyncStorage.getItem(key);
    } catch (error) {
      // Jika terjadi "Native module is null", gunakan in-memory fallback
      return memoryStorage.get(key) || null;
    }
  },

  async setItem(key, value) {
    try {
      memoryStorage.set(key, value);
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      // Tetap tersimpan di memoryStorage
    }
  },

  async removeItem(key) {
    try {
      memoryStorage.delete(key);
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
      await AsyncStorage.removeItem(key);
    } catch (error) {
      // Tetap terhapus dari memoryStorage
    }
  },
};

export default Storage;
