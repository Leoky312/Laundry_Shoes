import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/colors';

const STATUS_CONFIG = {
  MENUNGGU: {
    label: 'Menunggu',
    bg: Colors.warningLight,
    text: '#B45309',
  },
  DIPROSES: {
    label: 'Diproses',
    bg: Colors.primaryLight,
    text: Colors.primaryDark,
  },
  DICUCI: {
    label: 'Dicuci',
    bg: '#E0E7FF',
    text: '#4338CA',
  },
  DRYING: {
    label: 'Drying',
    bg: Colors.infoLight,
    text: '#0369A1',
  },
  FINISHING: {
    label: 'Finishing',
    bg: '#EDE9FE',
    text: '#6D28D9',
  },
  SELESAI: {
    label: 'Selesai',
    bg: Colors.successLight,
    text: '#047857',
  },
  DIBATALKAN: {
    label: 'Dibatalkan',
    bg: Colors.dangerLight,
    text: '#B91C1C',
  },
};

const Badge = ({ status, style }) => {
  const config = STATUS_CONFIG[status] || {
    label: status,
    bg: Colors.surfaceAlt,
    text: Colors.textMuted,
  };

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, style]}>
      <Text style={[styles.badgeText, { color: config.text }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});

export default Badge;
