import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  isRetrying?: boolean;
  compact?: boolean;
  iconName?: keyof typeof Ionicons.glyphMap;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Gagal Memuat Data',
  message = 'Terjadi kendala saat mengambil data. Silakan periksa jaringan Anda dan coba lagi.',
  onRetry,
  retryText = 'Coba Lagi',
  isRetrying = false,
  compact = false,
  iconName = 'alert-circle-outline',
}) => {
  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      <View style={[styles.iconCircle, compact && styles.compactIconCircle]}>
        <Ionicons name={iconName} size={compact ? 28 : 44} color="#EF4444" />
      </View>

      <Text style={[styles.title, compact && styles.compactTitle]}>{title}</Text>
      <Text style={[styles.message, compact && styles.compactMessage]}>{message}</Text>

      {onRetry && (
        <TouchableOpacity
          style={[styles.retryBtn, isRetrying && styles.retryBtnDisabled]}
          onPress={onRetry}
          disabled={isRetrying}
          activeOpacity={0.8}
        >
          {isRetrying ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <View style={styles.btnContent}>
              <Ionicons name="refresh" size={16} color="#FFFFFF" />
              <Text style={styles.retryBtnText}>{retryText}</Text>
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginVertical: 16,
    marginHorizontal: 4,
  },
  compactContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  compactIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  compactTitle: {
    fontSize: 15,
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 360,
    marginBottom: 20,
  },
  compactMessage: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#236B38',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    shadowColor: '#236B38',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  retryBtnDisabled: {
    opacity: 0.6,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default ErrorState;
