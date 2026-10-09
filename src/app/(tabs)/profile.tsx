import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Theme from '../../constants/theme';
import GlobalStyles from '../../constants/styles';
import { PROFILE_MENU_ITEMS, MenuItem } from '../../constants/data';
import ScreenHeader from '../../components/ScreenHeader';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutPress = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    try {
      if (logout) {
        await logout();
      }
    } catch (e) {
      console.warn('Logout error:', e);
    }
    router.replace('/(auth)/login');
  };

  // Custom function for rendering menu items
  const renderMenuItem = (item: MenuItem, index: number) => {
    const isLast = index === PROFILE_MENU_ITEMS.length - 1;

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.menuItem, isLast && styles.menuItemLast]}
        activeOpacity={0.7}
        onPress={() => {
          if (item.route) {
            router.push(item.route as any);
          }
        }}
      >
        <Ionicons
          name={item.icon as any}
          size={20}
          color={Theme.colors.text}
          style={styles.menuIcon}
        />
        <Text style={styles.menuTitle}>{item.title}</Text>
        <Ionicons name="chevron-forward" size={18} color={Theme.colors.textSecondary} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={GlobalStyles.safeArea} edges={['top']}>
      <ScreenHeader
        title="Profil"
        rightIcon="settings-outline"
        onRightPress={() => {}}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Avatar & Contact */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarBox}>
            <Image
              source={require('../../../assets/images/avatar.png')}
              style={styles.avatarImage}
            />
          </View>
          <Text style={styles.userName}>{user?.name || 'Fatir'}</Text>
          <Text style={styles.userPhone}>{user?.phone || '0812 3456 7890'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'fatir@example.com'}</Text>
        </View>

        {/* White Menu Card */}
        <View style={styles.menuCard}>
          {PROFILE_MENU_ITEMS.map(renderMenuItem)}
        </View>

        {/* Logout Button (Separate Card) */}
        <TouchableOpacity
          style={styles.logoutCard}
          activeOpacity={0.8}
          onPress={handleLogoutPress}
        >
          <Ionicons name="log-out-outline" size={20} color={Theme.colors.danger} />
          <Text style={styles.logoutText}>Keluar</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal Konfirmasi Logout (Bekerja di Web & Mobile) */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconCircle}>
              <Ionicons name="log-out-outline" size={30} color={Theme.colors.danger} />
            </View>
            <Text style={styles.modalTitle}>Konfirmasi Keluar</Text>
            <Text style={styles.modalSubtitle}>
              Apakah Anda yakin ingin keluar dari akun ShoeFresh?
            </Text>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                activeOpacity={0.8}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.modalCancelText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                activeOpacity={0.85}
                onPress={confirmLogout}
              >
                <Text style={styles.modalConfirmText}>Keluar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 100,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 6,
  },
  avatarBox: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#E2F0E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    overflow: 'hidden',
    ...Theme.shadow.card,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: Theme.colors.text,
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
  },
  menuCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.radius.card,
    paddingVertical: 4,
    paddingHorizontal: 16,
    marginBottom: 16,
    ...Theme.shadow.card,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    marginRight: 14,
  },
  menuTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  logoutCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.radius.card,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...Theme.shadow.card,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.danger,
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    ...Theme.shadow.card,
  },
  modalIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FDECEC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  modalActionsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.white,
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.textSecondary,
  },
  modalConfirmBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: Theme.colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadow.button,
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.white,
  },
});