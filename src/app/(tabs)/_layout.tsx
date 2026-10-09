import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Theme from '../../constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Theme.colors.primary,
        tabBarInactiveTintColor: Theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Theme.colors.white,
          borderTopColor: Theme.colors.border,
          borderTopWidth: 1,
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
          position: 'absolute',
          ...Theme.shadow.tabBar,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Pesanan',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
          ),
        }}
      />
      {/* Hidden legacy history route for backward compatibility */}
      <Tabs.Screen
        name="history"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
