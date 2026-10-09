import React, { ReactNode } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, StyleProp, ViewStyle, TextStyle } from 'react-native';
import Colors from '../constants/Colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: ReactNode;
}

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}: ButtonProps) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.btnSecondary;
      case 'outline':
        return styles.btnOutline;
      case 'danger':
        return styles.btnDanger;
      default:
        return styles.btnPrimary;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return styles.textOutline;
      default:
        return styles.textSolid;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        (styles as any)[`size_${size}`],
        getButtonStyle(),
        disabled && styles.btnDisabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? Colors.primary : Colors.white} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, getTextStyle(), styles[`textSize_${size}` as keyof typeof styles], textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  size_sm: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  size_md: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  size_lg: {
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  btnPrimary: {
    backgroundColor: Colors.primary,
  },
  btnSecondary: {
    backgroundColor: Colors.secondary,
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  btnDanger: {
    backgroundColor: Colors.danger,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
  },
  textSize_sm: {
    fontSize: 13,
  },
  textSize_md: {
    fontSize: 15,
  },
  textSize_lg: {
    fontSize: 16,
  },
  textSolid: {
    color: Colors.white,
  },
  textOutline: {
    color: Colors.primary,
  },
});

export default Button;
