import { useRouter } from 'expo-router';
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  ScrollView,
  Platform,
  Alert,
  Image,
  Switch,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import Input from '@/components/Input';
import api, { getImageUrl } from '@/services/api';

// Pilihan preset foto cepat agar admin mudah memilih jika tidak input manual
const PRESET_IMAGES = [
  {
    label: 'Sneakers General',
    url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Express Clean',
    url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Unyellowing Sol',
    url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Canvas / White',
    url: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Waterproof Spray',
    url: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Leather Polish',
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
  },
];

const ManageServicesScreen = () => {
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'INACTIVE'

  // Modal Form State (Create / Update)
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formErrors, setFormErrors] = useState({});

  // Delete Modal State
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/services?all=true');
      if (res.data) {
        setServices(res.data);
      }
    } catch (err) {
      console.log('Error fetch services:', err.message);
      showNotice('Gagal Memuat Data', err.message || 'Tidak dapat memuat daftar layanan.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchServices();
  };

  const showNotice = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const formatRupiah = (val) => {
    return 'Rp ' + parseInt(val || 0).toLocaleString('id-ID');
  };

  // Filter Services
  const filteredServices = useMemo(() => {
    return services.filter((item) => {
      // Status filter
      if (filterStatus === 'ACTIVE' && !item.isActive) return false;
      if (filterStatus === 'INACTIVE' && item.isActive) return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = item.name?.toLowerCase().includes(query);
        const matchDesc = item.description?.toLowerCase().includes(query);
        return matchName || matchDesc;
      }
      return true;
    });
  }, [services, filterStatus, searchQuery]);

  // Open Form for Create
  const handleOpenCreate = () => {
    setIsEditing(false);
    setSelectedServiceId(null);
    setFormName('');
    setFormDescription('');
    setFormDuration('2 - 3 Hari');
    setFormPrice('');
    setFormImage(PRESET_IMAGES[0].url);
    setFormIsActive(true);
    setFormErrors({});
    setFormModalVisible(true);
  };

  // Open Form for Edit
  const handleOpenEdit = (item) => {
    setIsEditing(true);
    setSelectedServiceId(item.id);
    setFormName(item.name || '');
    setFormDescription(item.description || '');
    setFormDuration(item.duration || '');
    setFormPrice(item.price ? String(parseInt(item.price, 10)) : '');
    setFormImage(item.image || '');
    setFormIsActive(item.isActive ?? true);
    setFormErrors({});
    setFormModalVisible(true);
  };

  // Validate & Submit Form (Create / Update)
  const handleSubmitForm = async () => {
    const errors = {};
    if (!formName.trim()) errors.name = 'Nama layanan wajib diisi';
    if (!formDescription.trim()) errors.description = 'Deskripsi layanan wajib diisi';
    if (!formDuration.trim()) errors.duration = 'Estimasi durasi wajib diisi';
    if (!formPrice.trim() || isNaN(formPrice) || parseFloat(formPrice) <= 0) {
      errors.price = 'Harga harus berupa angka valid lebih dari 0';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: formName.trim(),
        description: formDescription.trim(),
        duration: formDuration.trim(),
        price: parseFloat(formPrice),
        image: formImage.trim() || null,
        isActive: formIsActive,
      };

      if (isEditing && selectedServiceId) {
        // UPDATE (PUT)
        await api.put(`/services/${selectedServiceId}`, payload);
        showNotice('Berhasil', 'Data layanan berhasil diperbarui!');
      } else {
        // CREATE (POST)
        await api.post('/services', payload);
        showNotice('Berhasil', 'Layanan baru berhasil ditambahkan!');
      }

      setFormModalVisible(false);
      fetchServices();
    } catch (err) {
      console.log('Error saving service:', err.message);
      showNotice('Gagal Menyimpan', err.message || 'Terjadi kesalahan saat menyimpan layanan.');
    } finally {
      setSaving(false);
    }
  };

  // Quick Toggle Active Status
  const handleToggleActive = async (item) => {
    try {
      const nextStatus = !item.isActive;
      // Optimistic update
      setServices((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, isActive: nextStatus } : s))
      );

      await api.put(`/services/${item.id}`, {
        name: item.name,
        isActive: nextStatus,
      });
    } catch (err) {
      console.log('Error toggling status:', err.message);
      showNotice('Gagal Mengubah Status', err.message);
      fetchServices();
    }
  };

  // Open Delete Confirmation
  const handlePromptDelete = (item) => {
    setServiceToDelete(item);
    setDeleteModalVisible(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return;
    try {
      setDeleting(true);
      const res = await api.delete(`/services/${serviceToDelete.id}`);
      setDeleteModalVisible(false);
      showNotice('Berhasil', res.message || 'Layanan berhasil diproses.');
      fetchServices();
    } catch (err) {
      console.log('Error delete service:', err.message);
      showNotice('Gagal Menghapus', err.message || 'Tidak dapat menghapus layanan ini.');
    } finally {
      setDeleting(false);
      setServiceToDelete(null);
    }
  };

  const renderServiceItem = ({ item }) => {
    const imgSource = item.image
      ? { uri: getImageUrl(item.image) }
      : { uri: PRESET_IMAGES[0].url };

    return (
      <Card style={[styles.serviceCard, !item.isActive && styles.serviceCardInactive]}>
        <View style={styles.cardHeaderRow}>
          <Image source={imgSource} style={styles.serviceImage} resizeMode="cover" />

          <View style={styles.serviceInfoCol}>
            <View style={styles.nameBadgeRow}>
              <Text style={styles.serviceName} numberOfLines={1}>
                {item.name}
              </Text>
              <Badge
                label={item.isActive ? 'Aktif' : 'Nonaktif'}
                variant={item.isActive ? 'success' : 'default'}
                size="sm"
              />
            </View>

            <View style={styles.metaRow}>
              <View style={styles.durationBadge}>
                <Ionicons name="time-outline" size={13} color={Colors.textMuted} />
                <Text style={styles.durationText}>{item.duration}</Text>
              </View>
              <Text style={styles.priceText}>{formatRupiah(item.price)}</Text>
            </View>

            <Text style={styles.serviceDescription} numberOfLines={2}>
              {item.description}
            </Text>
          </View>
        </View>

        {/* Action Buttons Row */}
        <View style={styles.cardActionsRow}>
          {/* Quick Toggle Status */}
          <TouchableOpacity
            style={[
              styles.actionBtn,
              item.isActive ? styles.btnDeactivate : styles.btnActivate,
            ]}
            onPress={() => handleToggleActive(item)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={item.isActive ? 'eye-off-outline' : 'eye-outline'}
              size={15}
              color={item.isActive ? '#D97706' : Colors.primary}
            />
            <Text
              style={[
                styles.actionBtnText,
                { color: item.isActive ? '#D97706' : Colors.primary },
              ]}
            >
              {item.isActive ? 'Nonaktifkan' : 'Aktifkan'}
            </Text>
          </TouchableOpacity>

          {/* Edit Button */}
          <TouchableOpacity
            style={[styles.actionBtn, styles.btnEdit]}
            onPress={() => handleOpenEdit(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={15} color="#2563EB" />
            <Text style={[styles.actionBtnText, { color: '#2563EB' }]}>Edit</Text>
          </TouchableOpacity>

          {/* Delete Button */}
          <TouchableOpacity
            style={[styles.actionBtn, styles.btnDelete]}
            onPress={() => handlePromptDelete(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={15} color={Colors.danger} />
            <Text style={[styles.actionBtnText, { color: Colors.danger }]}>Hapus</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Kelola Layanan</Text>
          <Text style={styles.headerSubtitle}>
            CRUD Master Data Tarif & Perawatan Sepatu
          </Text>
        </View>

        <TouchableOpacity
          style={styles.btnAddHeader}
          onPress={handleOpenCreate}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle" size={18} color={Colors.white} />
          <Text style={styles.btnAddHeaderText}>Tambah</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={Colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari layanan laundry..."
          placeholderTextColor={Colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterChip, filterStatus === 'ALL' && styles.filterChipActive]}
          onPress={() => setFilterStatus('ALL')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterChipText,
              filterStatus === 'ALL' && styles.filterChipTextActive,
            ]}
          >
            Semua ({services.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filterStatus === 'ACTIVE' && styles.filterChipActive]}
          onPress={() => setFilterStatus('ACTIVE')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterChipText,
              filterStatus === 'ACTIVE' && styles.filterChipTextActive,
            ]}
          >
            Aktif ({services.filter((s) => s.isActive).length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filterStatus === 'INACTIVE' && styles.filterChipActive]}
          onPress={() => setFilterStatus('INACTIVE')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterChipText,
              filterStatus === 'INACTIVE' && styles.filterChipTextActive,
            ]}
          >
            Nonaktif ({services.filter((s) => !s.isActive).length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* List Content */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Memuat layanan laundry...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredServices}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderServiceItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="sparkles-outline" size={40} color={Colors.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>Layanan Tidak Ditemukan</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? `Tidak ada layanan yang cocok dengan kata kunci "${searchQuery}".`
                  : 'Belum ada data layanan laundry yang terdaftar.'}
              </Text>
              <TouchableOpacity style={styles.emptyBtnAdd} onPress={handleOpenCreate}>
                <Ionicons name="add" size={18} color={Colors.white} />
                <Text style={styles.emptyBtnAddText}>Tambah Layanan Sekarang</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* MODAL FORM: TAMBAH / EDIT LAYANAN */}
      <Modal
        visible={formModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFormModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <View style={styles.modalHeaderIconBox}>
                  <Ionicons
                    name={isEditing ? 'create-outline' : 'sparkles-outline'}
                    size={20}
                    color={Colors.primary}
                  />
                </View>
                <View>
                  <Text style={styles.modalTitle}>
                    {isEditing ? 'Edit Layanan' : 'Tambah Layanan Baru'}
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    {isEditing
                      ? 'Perbarui detail data layanan sepatu'
                      : 'Isi formulir untuk menambahkan paket layanan baru'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setFormModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color={Colors.text} />
              </TouchableOpacity>
            </View>

            {/* Modal Form ScrollView */}
            <ScrollView style={styles.modalFormScroll} showsVerticalScrollIndicator={false}>
              {/* Nama Layanan */}
              <Input
                label="Nama Layanan *"
                placeholder="Contoh: Sole Whitening Pro"
                value={formName}
                onChangeText={(text) => {
                  setFormName(text);
                  if (formErrors.name) setFormErrors({ ...formErrors, name: null });
                }}
                iconName="pricetag-outline"
                error={formErrors.name}
              />

              {/* Estimasi Durasi */}
              <Input
                label="Estimasi Durasi Pengerjaan *"
                placeholder="Contoh: 2 - 3 Hari, atau 1 Hari"
                value={formDuration}
                onChangeText={(text) => {
                  setFormDuration(text);
                  if (formErrors.duration) setFormErrors({ ...formErrors, duration: null });
                }}
                iconName="time-outline"
                error={formDuration ? null : formErrors.duration}
              />

              {/* Harga Layanan */}
              <Input
                label="Harga Layanan (Rp) *"
                placeholder="Contoh: 50000"
                value={formPrice}
                onChangeText={(text) => {
                  setFormPrice(text.replace(/[^0-9]/g, ''));
                  if (formErrors.price) setFormErrors({ ...formErrors, price: null });
                }}
                keyboardType="numeric"
                iconName="cash-outline"
                error={formErrors.price}
              />

              {/* Deskripsi */}
              <Input
                label="Deskripsi Layanan *"
                placeholder="Jelaskan proses perawatan, bagian sepatu yang dibersihkan, dan keunggulan treatment..."
                value={formDescription}
                onChangeText={(text) => {
                  setFormDescription(text);
                  if (formErrors.description) setFormErrors({ ...formErrors, description: null });
                }}
                multiline={true}
                numberOfLines={3}
                iconName="document-text-outline"
                error={formErrors.description}
              />

              {/* URL Gambar */}
              <Input
                label="URL Gambar Sepatu (Opsional)"
                placeholder="https://images.unsplash.com/..."
                value={formImage}
                onChangeText={setFormImage}
                iconName="image-outline"
              />

              {/* Preset Foto Cepat */}
              <Text style={styles.presetSectionTitle}>Pilih Preset Foto Cepat:</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.presetScroll}
              >
                {PRESET_IMAGES.map((preset, idx) => {
                  const isSelected = formImage === preset.url;
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.presetCard, isSelected && styles.presetCardSelected]}
                      onPress={() => setFormImage(preset.url)}
                      activeOpacity={0.8}
                    >
                      <Image source={{ uri: preset.url }} style={styles.presetImg} />
                      <Text
                        style={[
                          styles.presetLabel,
                          isSelected && styles.presetLabelSelected,
                        ]}
                        numberOfLines={1}
                      >
                        {preset.label}
                      </Text>
                      {isSelected && (
                        <View style={styles.presetCheckBadge}>
                          <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Status Switch */}
              <View style={styles.switchRow}>
                <View style={styles.switchTextBox}>
                  <Text style={styles.switchTitle}>Status Layanan Aktif</Text>
                  <Text style={styles.switchDesc}>
                    {formIsActive
                      ? 'Layanan akan langsung tampil di halaman katalog pelanggan'
                      : 'Layanan disembunyikan dari katalog pelanggan'}
                  </Text>
                </View>
                <Switch
                  value={formIsActive}
                  onValueChange={setFormIsActive}
                  trackColor={{ false: '#D1D5DB', true: Colors.primaryLight }}
                  thumbColor={formIsActive ? Colors.primary : '#9CA3AF'}
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.modalButtonRow}>
                <Button
                  title="Batal"
                  variant="outline"
                  onPress={() => setFormModalVisible(false)}
                  style={styles.btnModalCancel}
                />
                <Button
                  title={saving ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambahkan Layanan'}
                  variant="primary"
                  loading={saving}
                  onPress={handleSubmitForm}
                  style={styles.btnModalSave}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL KONFIRMASI HAPUS */}
      <Modal
        visible={deleteModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalBox}>
            <View style={styles.deleteIconBox}>
              <Ionicons name="trash" size={28} color={Colors.danger} />
            </View>

            <Text style={styles.deleteTitle}>Hapus Layanan?</Text>
            <Text style={styles.deleteDesc}>
              Apakah Anda yakin ingin menghapus layanan{' '}
              <Text style={{ fontWeight: '700', color: Colors.text }}>
                "{serviceToDelete?.name}"
              </Text>
              ? Jika layanan ini sudah memiliki riwayat pesanan, statusnya akan dinonaktifkan
              secara aman.
            </Text>

            <View style={styles.deleteButtonRow}>
              <Button
                title="Batal"
                variant="outline"
                onPress={() => setDeleteModalVisible(false)}
                style={styles.btnModalCancel}
                disabled={deleting}
              />
              <Button
                title={deleting ? 'Menghapus...' : 'Ya, Hapus'}
                variant="danger"
                loading={deleting}
                onPress={handleConfirmDelete}
                style={styles.btnModalSave}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAF9',
  },
  header: {
    backgroundColor: Colors.white,
    paddingTop: Platform.select({ ios: 52, android: 44, default: 24 }),
    paddingBottom: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2EE',
  },
  headerTitleBox: {
    flex: 1,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  btnAddHeader: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  btnAddHeaderText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 18,
    marginTop: 14,
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8E2',
    paddingHorizontal: 12,
    height: 46,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    outlineStyle: 'none',
  },
  clearSearchBtn: {
    padding: 4,
  },

  // Filter Chips
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#E2E8E2',
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  filterChipTextActive: {
    color: Colors.white,
  },

  // List
  listContainer: {
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  serviceCard: {
    marginBottom: 14,
    padding: 14,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF2EE',
  },
  serviceCardInactive: {
    opacity: 0.72,
    backgroundColor: '#FDFDFD',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    gap: 12,
  },
  serviceImage: {
    width: 82,
    height: 82,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  serviceInfoCol: {
    flex: 1,
    justifyContent: 'space-between',
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.secondary,
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  serviceDescription: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 16,
  },

  // Card Actions
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 4,
  },
  btnActivate: {
    backgroundColor: '#EAF5EC',
  },
  btnDeactivate: {
    backgroundColor: '#FEF3C7',
  },
  btnEdit: {
    backgroundColor: '#EFF6FF',
  },
  btnDelete: {
    backgroundColor: '#FEE2E2',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Center / Loading / Empty
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: Colors.textMuted,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EAF5EC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.secondary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  emptyBtnAdd: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 22,
    gap: 6,
  },
  emptyBtnAddText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },

  // Modal Common
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalBox: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
    backgroundColor: Colors.white,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2EE',
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  modalHeaderIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAF5EC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.secondary,
  },
  modalSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalFormScroll: {
    padding: 20,
  },

  // Preset Section
  presetSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.secondary,
    marginBottom: 8,
  },
  presetScroll: {
    marginBottom: 16,
  },
  presetCard: {
    width: 100,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8E2',
    borderRadius: 12,
    padding: 6,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  presetCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F2F9F3',
  },
  presetImg: {
    width: 84,
    height: 60,
    borderRadius: 8,
    marginBottom: 6,
  },
  presetLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    textAlign: 'center',
  },
  presetLabelSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  presetCheckBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
  },

  // Switch Row
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAF8',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8E2',
    marginBottom: 20,
  },
  switchTextBox: {
    flex: 1,
    marginRight: 12,
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.secondary,
  },
  switchDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },

  // Modal Buttons
  modalButtonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
    marginBottom: 16,
  },
  btnModalCancel: {
    flex: 1,
  },
  btnModalSave: {
    flex: 1.6,
  },

  // Delete Modal
  deleteModalBox: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
  },
  deleteIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  deleteTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.secondary,
    marginBottom: 8,
  },
  deleteDesc: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  deleteButtonRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
});

export default ManageServicesScreen;
