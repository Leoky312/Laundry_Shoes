import { StyleSheet, Dimensions } from 'react-native';
import Theme from './theme';

const { width } = Dimensions.get('window');

export const GlobalStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  safeAreaWhite: {
    flex: 1,
    backgroundColor: Theme.colors.white,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 32,
  },

  // Headers
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: Theme.colors.background,
  },
  headerWhite: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: Theme.colors.white,
  },
  headerBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadow.card,
  },
  headerTitle: {
    fontSize: Theme.typography.title,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  headerRightPlaceholder: {
    width: 40,
  },

  // Primary Button
  primaryButton: {
    height: 52,
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: '100%',
    ...Theme.shadow.button,
  },
  primaryButtonText: {
    color: Theme.colors.white,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  // Outline Button
  outlineButton: {
    height: 48,
    borderWidth: 1.5,
    borderColor: Theme.colors.primary,
    borderRadius: Theme.radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: '100%',
    backgroundColor: Theme.colors.white,
  },
  outlineButtonText: {
    color: Theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },

  // Input Field
  inputContainer: {
    marginBottom: 14,
  },
  inputBox: {
    height: 52,
    backgroundColor: Theme.colors.white,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.input,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  inputField: {
    flex: 1,
    height: '100%',
    fontSize: Theme.typography.body,
    color: Theme.colors.text,
  },
  inputEyeBtn: {
    padding: 6,
  },

  // Card
  card: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.radius.card,
    padding: 16,
    marginBottom: 14,
    ...Theme.shadow.card,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 4,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  seeAllLink: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.primary,
  },

  // Status Badge
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Theme.radius.badge,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Stepper (− 1 +)
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: 8,
    backgroundColor: Theme.colors.white,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  stepperValue: {
    paddingHorizontal: 10,
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.text,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: Theme.colors.border,
    marginVertical: 12,
  },

  // Bottom Fixed Bar
  bottomBar: {
    backgroundColor: Theme.colors.white,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    ...Theme.shadow.tabBar,
  },
});

export default GlobalStyles;
