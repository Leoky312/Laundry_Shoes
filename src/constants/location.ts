import Storage from '../services/storage';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface MapLocation extends Coordinates {
  title?: string;
  address?: string;
}

export const STORAGE_KEY_OUTLET_LOCATION = '@shoefresh_custom_outlet_location';
export const STORAGE_KEY_GEOFENCE_RADIUS = '@shoefresh_custom_geofence_radius';

// Default resmi Outlet Shoefresh (Jl. Jend. Sudirman No. 88, Jakarta Pusat)
export const DEFAULT_OUTLET_LOCATION: MapLocation = {
  latitude: -6.2088,
  longitude: 106.8227,
  title: 'Outlet Laundry',
  address: 'Workshop Shoefresh, Jl. Jend. Sudirman No. 88, Jakarta Pusat',
};

// Titik aktif Outlet Laundry yang digunakan seluruh sistem aplikasi
export const OUTLET_LOCATION: MapLocation = {
  ...DEFAULT_OUTLET_LOCATION,
};

// Default koordinat pelanggan (Jakarta Selatan / Pusat) jika GPS belum didapatkan
export const DEFAULT_CUSTOMER_LOCATION: Coordinates = {
  latitude: -6.2255,
  longitude: 106.8095,
};

// Batas parameter Area Geofence Layanan Laundry (5.000 meter / 5 km)
export const GEOFENCE_CONFIG = {
  CENTER: OUTLET_LOCATION,
  RADIUS_METERS: 5000,
  RADIUS_KM: 5,
};

type LocationListener = (loc: MapLocation, radiusMeters: number) => void;
const outletListeners = new Set<LocationListener>();

export function subscribeOutletLocation(listener: LocationListener): () => void {
  outletListeners.add(listener);
  return () => {
    outletListeners.delete(listener);
  };
}

export function notifyOutletLocationChanged(): void {
  outletListeners.forEach((fn) => fn({ ...OUTLET_LOCATION }, GEOFENCE_CONFIG.RADIUS_METERS));
}

/**
 * Membaca lokasi outlet dari storage persisten saat aplikasi berjalan
 */
export async function loadStoredOutletLocation(): Promise<MapLocation> {
  try {
    const rawLoc = await Storage.getItem(STORAGE_KEY_OUTLET_LOCATION);
    if (rawLoc) {
      const parsed = JSON.parse(rawLoc);
      if (parsed && typeof parsed.latitude === 'number' && typeof parsed.longitude === 'number') {
        OUTLET_LOCATION.latitude = parsed.latitude;
        OUTLET_LOCATION.longitude = parsed.longitude;
        OUTLET_LOCATION.title = parsed.title || DEFAULT_OUTLET_LOCATION.title;
        OUTLET_LOCATION.address = parsed.address || DEFAULT_OUTLET_LOCATION.address;
        GEOFENCE_CONFIG.CENTER = OUTLET_LOCATION;
      }
    }
    const rawRadius = await Storage.getItem(STORAGE_KEY_GEOFENCE_RADIUS);
    if (rawRadius) {
      const rad = parseInt(rawRadius, 10);
      if (!isNaN(rad) && rad > 0) {
        GEOFENCE_CONFIG.RADIUS_METERS = rad;
        GEOFENCE_CONFIG.RADIUS_KM = Math.round(rad / 1000);
      }
    }
  } catch (_e) {
    // Gunakan default jika terjadi kendala membaca storage
  }
  return { ...OUTLET_LOCATION };
}

/**
 * Menyimpan pembaruan titik koordinat outlet dan radius geofence ke storage
 */
export async function saveStoredOutletLocation(
  loc: MapLocation,
  radiusMeters?: number
): Promise<MapLocation> {
  OUTLET_LOCATION.latitude = parseFloat(loc.latitude.toFixed(6));
  OUTLET_LOCATION.longitude = parseFloat(loc.longitude.toFixed(6));
  OUTLET_LOCATION.title = loc.title || 'Outlet Laundry';
  OUTLET_LOCATION.address = loc.address || '';
  GEOFENCE_CONFIG.CENTER = OUTLET_LOCATION;

  if (radiusMeters && radiusMeters > 0) {
    GEOFENCE_CONFIG.RADIUS_METERS = radiusMeters;
    GEOFENCE_CONFIG.RADIUS_KM = Math.round(radiusMeters / 1000);
    await Storage.setItem(STORAGE_KEY_GEOFENCE_RADIUS, String(radiusMeters));
  }

  await Storage.setItem(STORAGE_KEY_OUTLET_LOCATION, JSON.stringify(OUTLET_LOCATION));
  notifyOutletLocationChanged();
  return { ...OUTLET_LOCATION };
}

// Inisialisasi otomatis pada runtime
loadStoredOutletLocation().catch(() => {});

// Aturan tarif pengantaran / ongkos kirim berdasarkan jarak OSRM
export const DELIVERY_RATES = {
  BASE_FEE: 5000, // Tarif dasar (hingga 2 km)
  BASE_DISTANCE_KM: 2,
  PER_KM_FEE: 2500, // Biaya per km tambahan
  MAX_DELIVERY_KM: 25, // Batas maksimal pengantaran
};

/**
 * Menghitung ongkir berdasarkan jarak rute jalan raya (km)
 */
export function calculateDeliveryFee(distanceKm: number): number {
  if (distanceKm <= 0) return 0;
  if (distanceKm <= DELIVERY_RATES.BASE_DISTANCE_KM) {
    return DELIVERY_RATES.BASE_FEE;
  }
  const extraKm = distanceKm - DELIVERY_RATES.BASE_DISTANCE_KM;
  const total = DELIVERY_RATES.BASE_FEE + Math.ceil(extraKm) * DELIVERY_RATES.PER_KM_FEE;
  return total;
}

