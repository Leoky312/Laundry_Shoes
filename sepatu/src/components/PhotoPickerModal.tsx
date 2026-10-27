import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

interface PhotoPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onImageSelected: (uri: string) => void;
  title?: string;
  description?: string;
  aspect?: [number, number];
}

export const PhotoPickerModal: React.FC<PhotoPickerModalProps> = ({
  visible,
  onClose,
  onImageSelected,
  title = 'Pilih Sumber Foto',
  description = 'Gunakan kamera untuk memotret langsung atau pilih dari galeri.',
  aspect = [4, 3],
}) => {
  const handleTakePhoto = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Izin Kamera Ditolak',
            'ShoeFresh memerlukan izin kamera untuk memotret foto sepatu atau bukti transfer.'
          );
          return;
        }
      }

      onClose();

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error: any) {
      console.log('Error opening camera:', error);
      Alert.alert('Gagal Membuka Kamera', error?.message || 'Terjadi kesalahan saat membuka kamera.');
    }
  };

  const handlePickFromGallery = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Izin Galeri Ditolak',
            'ShoeFresh memerlukan izin galeri untuk memilih foto.'
          );
          return;
        }
      }

      onClose();

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error: any) {
      console.log('Error picking image from library:', error);
      Alert.alert('Gagal Memilih Foto', error?.message || 'Terjadi kesalahan saat memilih foto.');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              <View style={styles.dragHandle} />
              <Text style={styles.sheetTitle}>{title}</Text>
              <Text style={styles.sheetDesc}>{description}</Text>

              <View style={styles.optionsList}>
                {/* Kamera Button */}
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={handleTakePhoto}
                  activeOpacity={0.8}
                >
                  <View style={[styles.iconBox, { backgroundColor: '#EAF5EC' }]}>
                    <Ionicons name="camera" size={24} color="#236B38" />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Buka Kamera</Text>
                    <Text style={styles.optionSub}>Jepret langsung menggunakan kamera perangkat</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>

                {/* Galeri Button */}
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={handlePickFromGallery}
                  activeOpacity={0.8}
                >
                  <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
                    <Ionicons name="images" size={24} color="#2563EB" />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Pilih dari Galeri</Text>
                    <Text style={styles.optionSub}>Unggah foto atau tangkapan layar yang ada</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>Batal</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  sheetContainer: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  dragHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#132A1B',
    marginBottom: 4,
  },
  sheetDesc: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 18,
  },
  optionsList: {
    gap: 12,
    marginBottom: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  optionSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  cancelBtn: {
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4B5563',
  },
});

export default PhotoPickerModal;
