import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';
import GlobalStyles from '../constants/styles';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[
        GlobalStyles.primaryButton,
        disabled && { opacity: 0.6 },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      {icon}
      <Text style={[GlobalStyles.primaryButtonText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

export default PrimaryButton;
