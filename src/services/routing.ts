import * as Location from 'expo-location';
import { Coordinates, GEOFENCE_CONFIG, OUTLET_LOCATION } from '../constants/location';

export interface RouteResult {
  coordinates: [number, number][]; // [latitude, longitude] untuk polyline Leaflet
  distanceMeters: number;
  distanceKm: number;
  durationMinutes: number;
  summary: string;
}

/**
 * Menghitung jarak garis lurus (Haversine formula) sebagai fallback offline
 */
export function calculateHaversineDistance(from: Coordinates, to: Coordinates): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371; // Radius bumi dalam km
  const dLat = toRad(to.latitude - from.latitude);
  const dLon = toRad(to.longitude - from.longitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(from.latitude)) * Math.cos(toRad(to.latitude)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

/**
 * Mengambil rute jalur jalan raya nyata dari OSRM Driving API (100% Gratis, Tanpa API Key)
 */
export async function getRoadRoute(
  origin: Coordinates,
  destination: Coordinates
): Promise<RouteResult> {
  // Format OSRM: /route/v1/driving/{lon1},{lat1};{lon2},{lat2}?overview=full&geometries=geojson
  const url = `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`OSRM HTTP status ${response.status}`);
    }

    const data = await response.json();
    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const distanceMeters = route.distance || 0;
      const distanceKm = parseFloat((distanceMeters / 1000).toFixed(2));
      const durationMinutes = Math.ceil((route.duration || 0) / 60);

      // Konversi GeoJSON [lon, lat] menjadi format Leaflet [lat, lon]
      const coordinates: [number, number][] = (route.geometry.coordinates || []).map(
        (point: [number, number]) => [point[1], point[0]]
      );

      return {
        coordinates,
        distanceMeters,
        distanceKm,
        durationMinutes,
        summary: route.legs?.[0]?.summary || 'Rute Jalan Raya',
      };
    }
  } catch (error: any) {
    console.warn('Gagal memuat rute OSRM, menggunakan fallback Haversine:', error?.message);
  }

  // Fallback jika offline atau OSRM gagal
  const fallbackKm = calculateHaversineDistance(origin, destination);
  return {
    coordinates: [
      [origin.latitude, origin.longitude],
      [destination.latitude, destination.longitude],
    ],
    distanceMeters: fallbackKm * 1000,
    distanceKm: fallbackKm,
    durationMinutes: Math.ceil(fallbackKm * 3), // Estimasi 3 menit per km
    summary: 'Estimasi Jarak Langsung',
  };
}

export interface GeofenceStatus {
  isInside: boolean;
  status: 'INSIDE' | 'OUTSIDE';
  distanceMeters: number;
  distanceKm: number;
  radiusMeters: number;
  message: string;
}

/**
 * Target 3: Logika deteksi event geofence (menghitung jarak dan status jangkauan)
 */
export function checkGeofenceStatus(
  userCoords: Coordinates,
  outletCoords: Coordinates = OUTLET_LOCATION,
  radiusMeters: number = GEOFENCE_CONFIG.RADIUS_METERS
): GeofenceStatus {
  const distanceKm = calculateHaversineDistance(outletCoords, userCoords);
  const distanceMeters = Math.round(distanceKm * 1000);
  const isInside = distanceMeters <= radiusMeters;

  return {
    isInside,
    status: isInside ? 'INSIDE' : 'OUTSIDE',
    distanceMeters,
    distanceKm,
    radiusMeters,
    message: isInside
      ? 'Anda berada di dalam area jangkauan layanan laundry.'
      : 'Lokasi Anda berada di luar area jangkauan layanan.',
  };
}

/**
 * Target 1: Konversi koordinat menjadi alamat teks lengkap (Reverse Geocoding)
 * Menggunakan expo-location dengan fallback OpenStreetMap Nominatim.
 */
export async function reverseGeocodeCoords(coords: Coordinates): Promise<string> {
  // 1. Coba expo-location
  try {
    const results = await Location.reverseGeocodeAsync(coords);
    if (results && results.length > 0) {
      const place = results[0];
      const parts = [
        place.street || place.name,
        place.district || place.subregion,
        place.city,
        place.region,
      ].filter(Boolean);
      if (parts.length > 0) {
        return parts.join(', ');
      }
    }
  } catch (_e) {
    // Pada platform web atau perangkat tanpa Google Play Services, gunakan fallback
  }

  // 2. Fallback Nominatim OpenStreetMap (bekerja pada Web Browser dan Mobile)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&addressdetails=1`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const street = addr.road || addr.street || addr.pedestrian || addr.suburb || '';
        const subdistrict = addr.suburb || addr.village || addr.neighbourhood || '';
        const district = addr.city_district || addr.county || '';
        const city = addr.city || addr.town || addr.municipality || addr.state || '';

        const parts = [street, subdistrict !== street ? subdistrict : null, district, city].filter(Boolean);
        if (parts.length > 0) {
          return parts.join(', ');
        }
      }
      if (data?.display_name) {
        return data.display_name.split(', ').slice(0, 4).join(', ');
      }
    }
  } catch (_e) {
    // Abaikan error jika offline
  }

  return `Koordinat: ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`;
}

