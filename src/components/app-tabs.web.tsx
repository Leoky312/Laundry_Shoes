import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { useRouter, usePathname, Slot } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Slot />
      </View>
      <WebBottomTabs colors={colors} />
    </View>
  );
}

function WebBottomTabs({ colors }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  const customerTabs = [
    { name: 'index', label: 'Beranda', path: '/', icon: 'home' },
    { name: 'history', label: 'Pesanan', path: '/history', icon: 'clipboard' },
    { name: 'profile', label: 'Profil', path: '/profile', icon: 'person' },
  ];

  const adminTabs = [
    { name: 'dashboard', label: 'Dashboard', path: '/(admin)/dashboard', icon: 'grid' },
    { name: 'orders', label: 'Pesanan', path: '/(admin)/orders', icon: 'file-tray-full' },
    { name: 'services', label: 'Layanan', path: '/(admin)/services', icon: 'sparkles' },
    { name: 'report', label: 'Laporan', path: '/(admin)/report', icon: 'bar-chart' },
    { name: 'profile', label: 'Profil', path: '/profile', icon: 'person' },
  ];

  const tabs = isAdmin ? adminTabs : customerTabs;

  return (
    <View style={[styles.webTabBar, { backgroundColor: '#FFFFFF', borderTopColor: '#E5E7EB' }]}>
      {tabs.map((tab) => {
        // usePathname() strips out route groups like (admin), so we need to match accordingly
        const strippedTabPath = tab.path.replace(/\/\([^)]+\)/g, '');
        const isActive = pathname === strippedTabPath || (tab.path === '/' && pathname === '/index');
        
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.webTabItem}
            onPress={() => router.replace(tab.path)}
          >
            <Ionicons 
              name={isActive ? tab.icon : `${tab.icon}-outline`} 
              size={24} 
              color={isActive ? '#236B38' : '#6B7280'} 
            />
            <Text style={[styles.webTabLabel, { color: isActive ? '#236B38' : '#6B7280', fontWeight: isActive ? '700' : '500' }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  webTabBar: {
    flexDirection: 'row',
    height: 60,
    borderTopWidth: 1,
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 4,
  },
  webTabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  webTabLabel: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
  }
});
