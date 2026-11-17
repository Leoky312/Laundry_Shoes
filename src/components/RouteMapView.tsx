import React, { useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, Platform, ActivityIndicator, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { Coordinates, OUTLET_LOCATION, GEOFENCE_CONFIG } from '../constants/location';

export interface RouteMapViewProps {
  // Koordinat lokasi penjemputan pelanggan
  customerLocation: Coordinates;
  // Koordinat outlet toko laundry (default: OUTLET_LOCATION)
  outletLocation?: Coordinates;
  // Koordinat kurir (opsional, jika dalam mode tracking pengantaran)
  courierLocation?: Coordinates | null;
  // Jalur koordinat jalan raya [[lat, lng], [lat, lng], ...]
  routeCoordinates?: [number, number][];
  // Apakah pin pelanggan dapat digeser untuk memilih titik koordinat
  isDraggable?: boolean;
  // Callback saat lokasi penjemputan berubah (digeser atau peta diklik)
  onLocationChange?: (coords: Coordinates) => void;
  // Tinggi komponen peta
  height?: number;
  // Status loading kalkulasi rute
  isLoading?: boolean;
  // Jarak tempuh dalam km untuk ditampilkan pada badge info
  distanceKm?: number;
  // Estimasi waktu tempuh dalam menit
  durationMinutes?: number;
  // Apakah lingkaran batas area geofence ditampilkan pada peta
  showGeofence?: boolean;
  // Radius batas area geofence dalam meter
  geofenceRadiusMeters?: number;
  // Apakah pin outlet dapat digeser untuk mengubah titik toko
  isOutletDraggable?: boolean;
  // Callback saat lokasi outlet berubah (digeser atau peta diklik)
  onOutletLocationChange?: (coords: Coordinates) => void;
  // Apakah menyembunyikan marker customer (misal saat mode admin outlet)
  hideCustomerMarker?: boolean;
  // Fokus awal peta ke outlet atau customer
  centerOn?: 'customer' | 'outlet';
}

export const RouteMapView: React.FC<RouteMapViewProps> = ({
  customerLocation,
  outletLocation = OUTLET_LOCATION,
  courierLocation = null,
  routeCoordinates = [],
  isDraggable = false,
  onLocationChange,
  height = 260,
  isLoading = false,
  distanceKm,
  durationMinutes,
  showGeofence = true,
  geofenceRadiusMeters = GEOFENCE_CONFIG.RADIUS_METERS,
  isOutletDraggable = false,
  onOutletLocationChange,
  hideCustomerMarker = false,
  centerOn = 'customer',
}) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Buat HTML dokumen yang berisi Leaflet + OpenStreetMap
  const htmlContent = useMemo(() => {
    const outletLat = outletLocation.latitude;
    const outletLng = outletLocation.longitude;
    const custLat = customerLocation.latitude;
    const custLng = customerLocation.longitude;
    const courierLat = courierLocation ? courierLocation.latitude : null;
    const courierLng = courierLocation ? courierLocation.longitude : null;

    const routeJson = JSON.stringify(routeCoordinates);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map {
      height: 100%;
      width: 100%;
      margin: 0;
      padding: 0;
      background: #F8FAF8;
      overflow: hidden;
    }
    .custom-pin {
      display: flex;
      flex-direction: column;
      align-items: center;
      transform: translate(-50%, -100%);
      pointer-events: auto;
    }
    .pin-label {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 11px;
      font-weight: 700;
      color: #FFFFFF;
      padding: 3px 8px;
      border-radius: 4px;
      white-space: nowrap;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      margin-bottom: 2px;
      user-select: none;
    }
    .pin-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid #FFFFFF;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    .pin-arrow {
      width: 0;
      height: 0;
      border-left: 4px solid transparent;
      border-right: 4px solid transparent;
      margin-top: -1px;
    }

    /* Outlet: Merah dengan label teks Outlet Laundry */
    .pin-outlet .pin-label { background-color: #DC2626; }
    .pin-outlet .pin-dot { background-color: #DC2626; }
    .pin-outlet .pin-arrow { border-top: 5px solid #DC2626; }

    /* Pelanggan: Biru dengan label teks Lokasi Penjemputan */
    .pin-customer .pin-label { background-color: #2563EB; }
    .pin-customer .pin-dot { background-color: #2563EB; }
    .pin-customer .pin-arrow { border-top: 5px solid #2563EB; }

    /* Kurir: Hijau dengan label teks Posisi Kurir */
    .pin-courier .pin-label { background-color: #16A34A; }
    .pin-courier .pin-dot { background-color: #16A34A; }
    .pin-courier .pin-arrow { border-top: 5px solid #16A34A; }

    /* Tooltip Geofence Lingkaran Area */
    .geofence-tooltip {
      background: #047857;
      color: #FFFFFF;
      border: none;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.25);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var outletPos = [${outletLat}, ${outletLng}];
    var custPos = [${custLat}, ${custLng}];
    var courierPos = ${courierLat !== null && courierLng !== null ? `[${courierLat}, ${courierLng}]` : 'null'};
    var routeCoords = ${routeJson};
    var isDraggable = ${isDraggable ? 'true' : 'false'};
    var isOutletDraggable = ${isOutletDraggable ? 'true' : 'false'};
    var hideCustomerMarker = ${hideCustomerMarker ? 'true' : 'false'};
    var centerPos = ${centerOn === 'outlet' ? 'outletPos' : 'custPos'};

    var map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).setView(centerPos, 14);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // OpenStreetMap Standard Tiles (100% Gratis & Legal)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    function createBadgeIcon(className, text) {
      return L.divIcon({
        className: 'custom-pin ' + className,
        html: '<div class="pin-label">' + text + '</div><div class="pin-dot"></div><div class="pin-arrow"></div>',
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      });
    }

    // 1. Penanda Outlet (Merah)
    var outletMarker = L.marker(outletPos, {
      icon: createBadgeIcon('pin-outlet', 'Outlet Laundry'),
      draggable: isOutletDraggable
    }).addTo(map);

    // Visualisasi Batas Area Geofence (Radius Jangkauan Layanan)
    var showGeofence = ${showGeofence ? 'true' : 'false'};
    var geofenceRadius = ${geofenceRadiusMeters};
    var geofenceCircle = null;
    if (showGeofence && geofenceRadius > 0) {
      geofenceCircle = L.circle(outletPos, {
        radius: geofenceRadius,
        color: '#059669',
        weight: 2,
        opacity: 0.85,
        fillColor: '#10B981',
        fillOpacity: 0.12,
        dashArray: '5, 5'
      }).addTo(map);

      geofenceCircle.bindTooltip('Batas Jangkauan Layanan (' + (geofenceRadius / 1000) + ' km)', {
        permanent: false,
        direction: 'center',
        className: 'geofence-tooltip'
      });
    }

    function notifyOutletPosition(lat, lng) {
      var payload = JSON.stringify({
        type: 'OUTLET_LOCATION_CHANGED',
        latitude: parseFloat(lat.toFixed(6)),
        longitude: parseFloat(lng.toFixed(6))
      });
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(payload);
      } else if (window.parent && window.parent.postMessage) {
        window.parent.postMessage(payload, '*');
      }
    }

    if (isOutletDraggable) {
      outletMarker.on('dragend', function(e) {
        var pos = e.target.getLatLng();
        if (geofenceCircle) geofenceCircle.setLatLng(pos);
        notifyOutletPosition(pos.lat, pos.lng);
      });

      map.on('click', function(e) {
        outletMarker.setLatLng(e.latlng);
        if (geofenceCircle) geofenceCircle.setLatLng(e.latlng);
        notifyOutletPosition(e.latlng.lat, e.latlng.lng);
      });
    }

    // 2. Penanda Lokasi Penjemputan Pelanggan (Biru)
    var custMarker = null;
    if (!hideCustomerMarker) {
      custMarker = L.marker(custPos, {
        icon: createBadgeIcon('pin-customer', 'Lokasi Penjemputan'),
        draggable: isDraggable
      }).addTo(map);

      if (isDraggable) {
        custMarker.on('dragend', function(e) {
          var pos = e.target.getLatLng();
          notifyPosition(pos.lat, pos.lng);
        });

        map.on('click', function(e) {
          custMarker.setLatLng(e.latlng);
          notifyPosition(e.latlng.lat, e.latlng.lng);
        });
      }
    }

    function notifyPosition(lat, lng) {
      var payload = JSON.stringify({
        type: 'LOCATION_CHANGED',
        latitude: parseFloat(lat.toFixed(6)),
        longitude: parseFloat(lng.toFixed(6))
      });
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(payload);
      } else if (window.parent && window.parent.postMessage) {
        window.parent.postMessage(payload, '*');
      }
    }

    // 3. Penanda Kurir (Hijau) jika ada
    if (courierPos) {
      L.marker(courierPos, {
        icon: createBadgeIcon('pin-courier', 'Posisi Kurir')
      }).addTo(map);
    }

    // 4. Gambar Garis Rute Jalan Raya (Polyline)
    if (routeCoords && routeCoords.length > 0) {
      var polyline = L.polyline(routeCoords, {
        color: '#2563EB',
        weight: 5,
        opacity: 0.85,
        lineJoin: 'round'
      }).addTo(map);

      map.fitBounds(polyline.getBounds(), { padding: [35, 35] });
    } else if (hideCustomerMarker) {
      map.setView(outletPos, 14);
    } else {
      var bounds = L.latLngBounds([outletPos, custPos]);
      if (courierPos) bounds.extend(courierPos);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  </script>
</body>
</html>
    `;
  }, [
    customerLocation,
    outletLocation,
    courierLocation,
    routeCoordinates,
    isDraggable,
    showGeofence,
    geofenceRadiusMeters,
    isOutletDraggable,
    hideCustomerMarker,
    centerOn,
  ]);

  // Listener untuk pesan dari iframe pada platform Web
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleWebMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data && data.type === 'LOCATION_CHANGED') {
          onLocationChange?.({
            latitude: data.latitude,
            longitude: data.longitude,
          });
        } else if (data && data.type === 'OUTLET_LOCATION_CHANGED') {
          onOutletLocationChange?.({
            latitude: data.latitude,
            longitude: data.longitude,
          });
        }
      } catch (_e) {
        // abaikan pesan yang bukan dari peta
      }
    };

    window.addEventListener('message', handleWebMessage);
    return () => {
      window.removeEventListener('message', handleWebMessage);
    };
  }, [onLocationChange, onOutletLocationChange]);

  const handleMobileMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data && data.type === 'LOCATION_CHANGED') {
        onLocationChange?.({
          latitude: data.latitude,
          longitude: data.longitude,
        });
      } else if (data && data.type === 'OUTLET_LOCATION_CHANGED') {
        onOutletLocationChange?.({
          latitude: data.latitude,
          longitude: data.longitude,
        });
      }
    } catch (_e) {
      // abaikan
    }
  };

return (
  <View style={[styles.container, { height }]}>
    {Platform.OS === 'web' ? (
      <iframe
        ref={iframeRef}
        srcDoc={htmlContent}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: 14,
          display: 'block',
        }}
        title="Peta Rute Jalan"
      />
    ) : (
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        onMessage={handleMobileMessage}
        style={styles.webView}
        scrollEnabled={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    )}

    {/* Info Jarak & Waktu Tempuh Banner */}
    {distanceKm !== undefined && distanceKm > 0 && (
      <View style={styles.routeInfoPill}>
        <Text style={styles.routeInfoText}>
          Jarak: {distanceKm} km
          {durationMinutes !== undefined && durationMinutes > 0 ? ` • ±${durationMinutes} mnt` : ''}
        </Text>
      </View>
    )}

    {/* Indikator Mode Pemilihan Titik */}
    {isDraggable && (
      <View style={styles.draggableHintPill}>
        <Text style={styles.draggableHintText}>Ketuk atau geser penanda untuk ubah titik</Text>
      </View>
    )}

    {isLoading && (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="small" color="#2563EB" />
        <Text style={styles.loadingText}>Menghitung rute jalan...</Text>
      </View>
    )}
  </View>
);
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  routeInfoPill: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    zIndex: 10,
  },
  routeInfoText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  draggableHintPill: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    zIndex: 10,
  },
  draggableHintText: {
    color: '#334155',
    fontSize: 10,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    zIndex: 10,
  },
  loadingText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1E293B',
  },
});

export default RouteMapView;

