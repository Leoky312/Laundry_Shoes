import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import GlobalStyles from '../constants/styles';
import Theme from '../constants/theme';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  showBack?: boolean;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  isWhite?: boolean;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  onBack,
  showBack = true,
  rightIcon,
  onRightPress,
  isWhite = false,
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={isWhite ? GlobalStyles.headerWhite : GlobalStyles.header}>
      {showBack ? (
        <TouchableOpacity
          style={GlobalStyles.headerBackBtn}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={Theme.colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={GlobalStyles.headerRightPlaceholder} />
      )}

      <Text style={GlobalStyles.headerTitle}>{title}</Text>

      {rightIcon ? (
        <TouchableOpacity
          style={GlobalStyles.headerBackBtn}
          onPress={onRightPress}
          activeOpacity={0.7}
        >
          <Ionicons name={rightIcon} size={22} color={Theme.colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={GlobalStyles.headerRightPlaceholder} />
      )}
    </View>
  );
};

export default ScreenHeader;
