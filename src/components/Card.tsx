import React, { ReactNode } from 'react';
import { View, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import Colors from '../constants/Colors';

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

const Card = ({ children, style, onPress }: CardProps) => {
  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={[styles.card, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
});

export default Card;
