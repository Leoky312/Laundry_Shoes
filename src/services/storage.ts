import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const memoryStorage = new Map();

export const Storage = {
  async getItem(key: string) {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return await AsyncStorage.getItem(key);
    } catch (error) {
      return memoryStorage.get(key) || null;
    }
  },

  async setItem(key: string, value: string) {
    try {
      memoryStorage.set(key, value);
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
      await AsyncStorage.setItem(key, value);
    } catch (error) {
    }
  },

  async removeItem(key: string) {
    try {
      memoryStorage.delete(key);
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
      await AsyncStorage.removeItem(key);
    } catch (error) {
    }
  },
};

export default Storage;
