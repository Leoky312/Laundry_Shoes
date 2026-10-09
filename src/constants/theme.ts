export const Theme = {
  colors: {
    primary: '#2E7D32',
    primaryDark: '#1B5E20',
    primaryLight: '#E8F5E9',
    background: '#F6FAF6',
    card: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    badgePendingBg: '#FFF1C2',
    badgePendingText: '#B7791F',
    badgeCompletedBg: '#DDF3DF',
    badgeCompletedText: '#2E7D32',
    badgeCancelledBg: '#FDE2E0',
    badgeCancelledText: '#D32F2F',
    danger: '#E53935',
    rating: '#F5B301',
    white: '#FFFFFF',
    subtle: '#F1F5F9',
    danaBlue: '#118EEA',
  },
  radius: {
    button: 14,
    input: 12,
    card: 18,
    banner: 20,
    badge: 999,
    sm: 8,
  },
  typography: {
    titleLarge: 22,
    title: 18,
    body: 14,
    caption: 12,
  },
  shadow: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    button: {
      shadowColor: '#2E7D32',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 3,
    },
    tabBar: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.04,
      shadowRadius: 10,
      elevation: 4,
    },
  },
};

// Compatibility exports for Expo default template components
export const Colors = {
  light: {
    text: '#11181C',
    textSecondary: '#687076',
    background: '#fff',
    tint: '#2E7D32',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#2E7D32',
    backgroundElement: '#f4f4f4',
    backgroundSelected: '#e0e0e0',
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    background: '#151718',
    tint: '#fff',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#fff',
    backgroundElement: '#222',
    backgroundSelected: '#333',
  },
};

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,
  seven: 28,
  eight: 32,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const Fonts = {
  headline: 'sans-serif',
  body: 'sans-serif',
  caption: 'sans-serif',
  mono: 'monospace',
};

export const BottomTabInset = 16;
export const MaxContentWidth = 800;

export type ThemeColor = keyof typeof Colors.light;

export default Theme;
