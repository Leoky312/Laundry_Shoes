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

const VARIANT_CONFIG = {
  success: {
    bg: Colors.successLight,
    text: '#047857',
  },
  danger: {
    bg: Colors.dangerLight,
    text: '#B91C1C',
  },
  warning: {
    bg: Colors.warningLight,
    text: '#B45309',
  },
  primary: {
    bg: Colors.primaryLight,
    text: Colors.primaryDark,
  },
  default: {
    bg: Colors.surfaceAlt,
    text: Colors.textMuted,
  },
};

const Badge = ({ status, label, variant, size = 'md', style, textStyle }) => {
  let displayLabel = label;
  let bg = Colors.surfaceAlt;
  let text = Colors.textMuted;

  if (status && STATUS_CONFIG[status]) {
    displayLabel = STATUS_CONFIG[status].label;
    bg = STATUS_CONFIG[status].bg;
    text = STATUS_CONFIG[status].text;
  } else if (variant && VARIANT_CONFIG[variant]) {
    bg = VARIANT_CONFIG[variant].bg;
    text = VARIANT_CONFIG[variant].text;
    displayLabel = label || variant;
  } else if (!displayLabel && status) {
    displayLabel = status;
  }

  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        isSmall && styles.badgeSm,
        { backgroundColor: bg },
        style,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          isSmall && styles.badgeTextSm,
          { color: text },
          textStyle,
        ]}
      >
        {displayLabel}
      </Text>
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
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  badgeTextSm: {
    fontSize: 10,
    fontWeight: '700',
  },
});

export default Badge;
