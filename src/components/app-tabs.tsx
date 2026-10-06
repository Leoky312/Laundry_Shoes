import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme, Platform, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  
  if (Platform.OS === 'web') {
    return <WebBottomTabs colors={colors} />;
  }

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Beranda</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="history">
        <NativeTabs.Trigger.Label>Pesanan</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')} 
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Profil</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')} 
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function WebBottomTabs({ colors }) {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { name: 'index', label: 'Beranda', path: '/', icon: 'home' },
    { name: 'history', label: 'Pesanan', path: '/history', icon: 'clipboard' },
    { name: 'profile', label: 'Profil', path: '/profile', icon: 'person' },
  ];

  return (
    <View style={[styles.webTabBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.path || (tab.path === '/' && pathname === '/index');
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.webTabItem}
            onPress={() => router.replace(tab.path)}
          >
            <Ionicons 
              name={isActive ? tab.icon : `${tab.icon}-outline`} 
              size={24} 
              color={isActive ? colors.text : '#888'} 
            />
            <Text style={[styles.webTabLabel, { color: isActive ? colors.text : '#888' }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
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
