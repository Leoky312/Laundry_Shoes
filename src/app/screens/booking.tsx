import React, { useState, useEffect } from 'react';
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';
import api from '../../services/api';
import { paymentMethods, formatRupiah } from '../../constants/serviceData';

export default function BookingScreen() {
  const router = useRouter();
  const { serviceId } = useLocalSearchParams();
  const [service, setService] = useState<any>(null);

  const [shoeBrand, setShoeBrand] = useState('Nike Air Jordan 1');
  const [shoeColor, setShoeColor] = useState('White / Black');
  const [shoeSize, setShoeSize] = useState('42');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('TRANSFER_BANK');
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchServiceDetail = async () => {
      try {
        const res: any = await api.get(`/services/${serviceId}`);
        if (res) {
          setService(res);
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (serviceId) fetchServiceDetail();
  }, [serviceId]);

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Izin Dibutuhkan', 'Kami membutuhkan izin akses galeri untuk mengunggah foto sepatu.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0]);
      }
    } catch (err) {
      console.log('Error selecting photo:', err);
    }
  };

  const handleBooking = async () => {
    if (!shoeBrand) {
      Alert.alert('Data Belum Lengkap', 'Mohon isi merek / model sepatu Anda.');
      return;
    }

    try {
      setLoading(true);

      const items = [
        {
          serviceId: service?.id || 1,
          shoeBrand,
          shoeColor,
          shoeSize,
          notes,
          quantity: 1,
        },
      ];

      const formData = new FormData();
      formData.append('items', JSON.stringify(items));
      formData.append('paymentMethod', paymentMethod);
      formData.append('notes', notes);
      formData.append('pickupDate', new Date(Date.now() + 86400000).toISOString());

      if (selectedImage) {
        const uriParts = selectedImage.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        (formData as any).append('shoePhoto', {
          uri: selectedImage.uri,
          name: `shoe_${Date.now()}.${fileType}`,
          type: `image/${fileType}`,
        });
      }

      const res: any = await api.post('/orders', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res) {
        Alert.alert(
          'Pemesanan Berhasil! 🎉',
          `Nomor pesanan Anda: ${res.orderNumber}`,
          [
            {
              text: 'Lacak Pesanan',
              onPress: () =>
                router.replace({ pathname: '/screens/orderTracking', params: { orderId: res.id, orderNumber: res.orderNumber } }),
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Gagal Membuat Pesanan', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Form Pemesanan</Text>
          <View style={{ width: 40 }} />
        </View>

        <Card style={styles.serviceSummaryCard}>
          <Text
            style={{
              fontSize: 11,
              color: Colors.primaryDark,
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Layanan Pilihan
          </Text>
          <Text style={styles.serviceName}>{service?.name || 'Deep Cleaning'}</Text>
          <Text style={styles.servicePrice}>{formatRupiah(service?.price || 50000)}</Text>
        </Card>

        <Text style={styles.sectionTitle}>1. Informasi Sepatu</Text>
        <Input
          label="Merek & Model Sepatu *"
          placeholder="Contoh: Nike Air Jordan 1 / Converse 70s"
          value={shoeBrand}
          onChangeText={setShoeBrand}
          iconName="pricetag-outline"
        />

        <View style={styles.rowInputs}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Input
              label="Warna Sepatu"
              placeholder="Contoh: Putih"
              value={shoeColor}
              onChangeText={setShoeColor}
              iconName="color-palette-outline"
            />
          </View>
          <View style={{ width: 110 }}>
            <Input
              label="Ukuran"
              placeholder="42"
              value={shoeSize}
              onChangeText={setShoeSize}
              keyboardType="numeric"
              iconName="resize-outline"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>2. Upload Foto Sepatu Saat Ini</Text>
        <TouchableOpacity style={styles.photoBox} onPress={pickImage} activeOpacity={0.8}>
          {selectedImage ? (
            <Image source={{ uri: selectedImage.uri }} style={styles.uploadedImg} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="camera-outline" size={36} color={Colors.primary} />
              <Text style={styles.photoPlaceholderTitle}>Pilih Foto dari Galeri</Text>
              <Text style={styles.photoPlaceholderSub}>Membantu kami melihat tingkat noda sepatu</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>3. Catatan Tambahan (Opsional)</Text>
        <Input
          placeholder="Tuliskan jika ada noda khusus atau permintaan ekstra..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.sectionTitle}>4. Metode Pembayaran</Text>
        <View style={styles.paymentMethods}>
          {paymentMethods.map((pm) => (
            <TouchableOpacity
              key={pm.id}
              style={[
                styles.paymentOption,
                paymentMethod === pm.id && styles.paymentOptionSelected,
              ]}
              onPress={() => setPaymentMethod(pm.id)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={pm.icon as any}
                size={20}
                color={paymentMethod === pm.id ? Colors.primary : Colors.textMuted}
              />
              <Text
                style={[
                  styles.paymentOptionText,
                  paymentMethod === pm.id && styles.paymentOptionTextSelected,
                ]}
              >
                {pm.label}
              </Text>
              {paymentMethod === pm.id && (
                <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title="Konfirmasi & Buat Pesanan"
          onPress={handleBooking}
          loading={loading}
          style={styles.submitBtn}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.secondary,
  },
  serviceSummaryCard: {
    backgroundColor: Colors.primaryLight,
    borderColor: '#BFDBFE',
    marginBottom: 24,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.primaryDark,
    fontWeight: '600',
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primaryDark,
    marginTop: 2,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.secondary,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.secondary,
    marginBottom: 10,
    marginTop: 6,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  photoBox: {
    height: 140,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 20,
  },
  uploadedImg: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    alignItems: 'center',
    padding: 12,
  },
  photoPlaceholderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 6,
  },
  photoPlaceholderSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  paymentMethods: {
    gap: 10,
    marginBottom: 24,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    gap: 12,
  },
  paymentOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F7FF',
  },
  paymentOptionText: {
    flex: 1,
    fontSize: 13,
    color: Colors.secondary,
    fontWeight: '500',
  },
  paymentOptionTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  submitBtn: {
    marginTop: 10,
  },
});
