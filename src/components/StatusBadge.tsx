import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OrderStatus } from '../constants/data';
import Theme from '../constants/theme';

interface StatusBadgeProps {
  status: OrderStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'DALAM_PROSES':
        return {
          label: 'Dalam Proses',
          backgroundColor: Theme.colors.badgePendingBg,
          color: Theme.colors.badgePendingText,
        };
      case 'SELESAI':
        return {
          label: 'Selesai',
          backgroundColor: Theme.colors.badgeCompletedBg,
          color: Theme.colors.badgeCompletedText,
        };
      case 'DIBATALKAN':
        return {
          label: 'Dibatalkan',
          backgroundColor: Theme.colors.badgeCancelledBg,
          color: Theme.colors.badgeCancelledText,
        };
      default:
        return {
          label: status,
          backgroundColor: Theme.colors.subtle,
          color: Theme.colors.textSecondary,
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <View style={[styles.badge, { backgroundColor: config.backgroundColor }]}>
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.radius.badge,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
  },
});

export default StatusBadge;
