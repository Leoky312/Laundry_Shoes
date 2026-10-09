import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle, TextStyle, KeyboardTypeOptions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  iconName?: keyof typeof Ionicons.glyphMap;
  error?: string;
  multiline?: boolean;
  numberOfLines?: number;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  iconName,
  error,
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
}: InputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const shouldHideText = secureTextEntry && !isPasswordVisible;

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          error && styles.inputError,
          multiline && { height: 24 * numberOfLines + 20, alignItems: 'flex-start' },
        ]}
      >
        {iconName && (
          <Ionicons
            name={iconName}
            size={20}
            color={isFocused ? Colors.primary : Colors.textMuted}
            style={styles.icon as any}
          />
        )}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textLight}
          secureTextEntry={shouldHideText}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[styles.input, inputStyle]}
        />

        {secureTextEntry && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={Colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 50,
  },
  inputFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    paddingVertical: 10,
  },
  eyeIcon: {
    padding: 6,
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default Input;
