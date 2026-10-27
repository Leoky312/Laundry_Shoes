import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetwork } from '../context/NetworkContext';

export const OfflineBanner = () => {
  const { isOffline, checkConnection } = useNetwork();
  const [checking, setChecking] = useState(false);

  if (!isOffline) {
    return null;
  }

  const handleCheck = async () => {
    setChecking(true);
    await checkConnection();
    setTimeout(() => {
      setChecking(false);
    }, 600);
  };

  return (
    <View style={styles.bannerContainer}>
      <View style={styles.contentRow}>
        <View style={styles.iconWrapper}>
          <Ionicons name="cloud-offline-outline" size={18} color="#FFFFFF" />
        </View>
        <View style={styles.textWrapper}>
          <Text style={styles.titleText}>Tidak Ada Koneksi Internet</Text>
          <Text style={styles.descText}>Menggunakan data tersimpan (mode offline).</Text>
        </View>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={handleCheck}
          disabled={checking}
          activeOpacity={0.8}
        >
          {checking ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <View style={styles.retryInner}>
              <Ionicons name="refresh" size={13} color="#FFFFFF" />
              <Text style={styles.retryText}>Cek</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    backgroundColor: '#DC2626',
    paddingVertical: 8,
    paddingHorizontal: 16,
    width: '100%',
    zIndex: 99999,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 1120,
    alignSelf: 'center',
    width: '100%',
    gap: 10,
  },
  iconWrapper: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrapper: {
    flex: 1,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  descText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11,
    marginTop: 1,
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  retryInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default OfflineBanner;
