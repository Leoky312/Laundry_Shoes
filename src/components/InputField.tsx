import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlobalStyles from '../constants/styles';
import Theme from '../constants/theme';

interface InputFieldProps {
  iconName: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  isPassword?: boolean;
  keyboardType?: any;
  containerStyle?: ViewStyle;
}

export const InputField: React.FC<InputFieldProps> = ({
  iconName,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  isPassword = false,
  keyboardType = 'default',
  containerStyle,
}) => {
  const [hidePassword, setHidePassword] = useState(secureTextEntry);

  return (
    <View style={[GlobalStyles.inputContainer, containerStyle]}>
      <View style={GlobalStyles.inputBox}>
        <Ionicons
          name={iconName}
          size={20}
          color={Theme.colors.textSecondary}
          style={GlobalStyles.inputIcon}
        />
        <TextInput
          style={GlobalStyles.inputField}
          placeholder={placeholder}
          placeholderTextColor={Theme.colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword ? hidePassword : false}
          keyboardType={keyboardType}
          autoCapitalize="none"
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setHidePassword(!hidePassword)}
            style={GlobalStyles.inputEyeBtn}
            activeOpacity={0.7}
          >
            <Ionicons
              name={hidePassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={Theme.colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default InputField;
