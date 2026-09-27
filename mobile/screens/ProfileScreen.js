import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Colors from '../constants/colors';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../services/api';

const ProfileScreen = () => {
  const { user, logout, updateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [saving, setSaving] = useState(false);

  const handleChooseAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const photo = result.assets[0];
        const formData = new FormData();
        const uriParts = photo.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];

        formData.append('avatar', {
          uri: photo.uri,
          name: `avatar_${Date.now()}.${fileType}`,
          type: `image/${fileType}`,
        });

        const res = await updateProfile(formData);
        if (res.success) {
          Alert.alert('Sukses', 'Foto profil berhasil diperbarui!');
        } else {
          Alert.alert('Gagal', res.message);
        }
      }
    } catch (err) {
      console.log('Error avatar pick:', err);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const res = await updateProfile({ name, phone, address });
      setSaving(false);

      if (res.success) {
        setIsEditing(false);
        Alert.alert('Sukses', 'Profil berhasil diperbarui!');
      } else {
        Alert.alert('Gagal', res.message);
      }
    } catch (e) {
      setSaving(false);
      Alert.alert('Gagal', e.message);
    }
  };

  const handleLogout = () => {
    Alert.alert('Konfirmasi Keluar', 'Apakah Anda yakin ingin keluar dari akun?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Ya, Keluar', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Profile Card */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarWrapper}>
          <Image
            source={{
              uri:
                getImageUrl(user?.avatar) ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
            }}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.cameraIconBtn} onPress={handleChooseAvatar}>
            <Ionicons name="camera" size={16} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role}</Text>
        </View>
      </View>

      {/* Profile Details Card */}
      <Card style={styles.detailsCard}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle}>Informasi Akun</Text>
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
            <Text style={styles.editBtnText}>{isEditing ? 'Batal' : 'Edit Profil'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {isEditing ? (
          <View>
            <Input label="Nama Lengkap" value={name} onChangeText={setName} />
            <Input label="Nomor Telepon" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <Input label="Alamat Penjemputan" value={address} onChangeText={setAddress} multiline numberOfLines={2} />
            <Button title="Simpan Perubahan" onPress={handleSaveProfile} loading={saving} style={{ marginTop: 10 }} />
          </View>
        ) : (
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Ionicons name="call-outline" size={18} color={Colors.primary} />
              <View style={styles.infoTexts}>
                <Text style={styles.infoLabel}>Nomor WhatsApp</Text>
                <Text style={styles.infoValue}>{user?.phone || 'Belum diatur'}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={18} color={Colors.primary} />
              <View style={styles.infoTexts}>
                <Text style={styles.infoLabel}>Alamat Penjemputan</Text>
                <Text style={styles.infoValue}>{user?.address || 'Belum diatur'}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
              <View style={styles.infoTexts}>
                <Text style={styles.infoLabel}>Bergabung Sejak</Text>
                <Text style={styles.infoValue}>
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : '-'}
                </Text>
              </View>
            </View>
          </View>
        )}
      </Card>

      {/* Logout Button */}
      <Button
        title="Keluar dari Akun"
        variant="danger"
        onPress={handleLogout}
        icon={<Ionicons name="log-out-outline" size={20} color={Colors.white} />}
        style={styles.logoutBtn}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.surfaceAlt,
  },
  cameraIconBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.secondary,
  },
  userEmail: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  detailsCard: {
    marginBottom: 24,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.secondary,
  },
  editBtnText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  infoList: {
    gap: 14,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoTexts: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.secondary,
    marginTop: 2,
  },
  logoutBtn: {
    marginTop: 10,
  },
});

export default ProfileScreen;
