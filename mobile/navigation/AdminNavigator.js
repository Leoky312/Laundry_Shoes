import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';

import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import ManageOrdersScreen from '../screens/ManageOrdersScreen';
import ManageServicesScreen from '../screens/ManageServicesScreen';
import ReportScreen from '../screens/ReportScreen';
import ProfileScreen from '../screens/ProfileScreen';

import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

const AdminNavigator = () => {
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom || 0;
  const barHeight = Platform.select({
    ios: bottomInset > 0 ? 58 + bottomInset : 68,
    android: 68 + bottomInset,
    default: 68,
  });
  const bottomPadding = bottomInset > 0 ? bottomInset + 2 : 10;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: '#E5E7EB',
          borderTopWidth: 1,
          height: barHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.03,
          shadowRadius: 6,
          elevation: 8,
        },
        tabBarItemStyle: {
          paddingBottom: 2,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'file-tray-full' : 'file-tray-full-outline';
          } else if (route.name === 'Services') {
            iconName = focused ? 'sparkles' : 'sparkles-outline';
          } else if (route.name === 'Reports') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={AdminDashboardScreen}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen
        name="Orders"
        component={ManageOrdersScreen}
        options={{ tabBarLabel: 'Pesanan' }}
      />
      <Tab.Screen
        name="Services"
        component={ManageServicesScreen}
        options={{ tabBarLabel: 'Layanan' }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportScreen}
        options={{ tabBarLabel: 'Laporan' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profil' }}
      />
    </Tab.Navigator>
  );
};

export default AdminNavigator;
