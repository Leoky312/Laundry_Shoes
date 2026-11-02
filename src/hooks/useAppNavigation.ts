import { useRouter } from 'expo-router';

export function useAppNavigation() {
  const router = useRouter();

  const getRouteConfig = (screenName: string, params?: Record<string, any>) => {
    switch (screenName) {
      case 'Login':
        return { pathname: '/(auth)/login' as const, params };
      case 'Register':
        return { pathname: '/(auth)/register' as const, params };
      case 'HomeTab':
        return { pathname: '/(customer)/(tabs)' as const, params };
      case 'HistoryTab':
        return { pathname: '/(customer)/(tabs)/history' as const, params };
      case 'ProfileTab':
      case 'Profile':
        return { pathname: '/(customer)/(tabs)/profile' as const, params };
      case 'Cart':
        return { pathname: '/(customer)/cart' as const, params };
      case 'Booking':
        return { pathname: '/(customer)/booking' as const, params };
      case 'DetailService':
        return { pathname: '/(customer)/detail-service' as const, params: params || {} };
      case 'OrderTracking':
        return { pathname: '/(customer)/order-tracking' as const, params: params || {} };
      case 'MainTabs':
        if (params?.screen === 'HistoryTab') return { pathname: '/(customer)/(tabs)/history' as const };
        if (params?.screen === 'ProfileTab') return { pathname: '/(customer)/(tabs)/profile' as const };
        return { pathname: '/(customer)/(tabs)' as const };
      case 'Dashboard':
      case 'AdminDashboard':
        return { pathname: '/(admin)/(tabs)' as const, params };
      case 'Orders':
      case 'ManageOrders':
        return { pathname: '/(admin)/(tabs)/orders' as const, params: params || {} };
      case 'Services':
      case 'ManageServices':
        return { pathname: '/(admin)/(tabs)/services' as const, params };
      case 'Reports':
      case 'Report':
        return { pathname: '/(admin)/(tabs)/reports' as const, params };
      default:
        return { pathname: screenName as any, params };
    }
  };

  const navigate = (screenName: string, params?: Record<string, any>) => {
    const config = getRouteConfig(screenName, params);
    if (config.params && Object.keys(config.params).length > 0) {
      router.push({ pathname: config.pathname as any, params: config.params });
    } else {
      router.push(config.pathname as any);
    }
  };

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(customer)/(tabs)');
    }
  };

  const replace = (screenName: string, params?: Record<string, any>) => {
    const config = getRouteConfig(screenName, params);
    if (config.params && Object.keys(config.params).length > 0) {
      router.replace({ pathname: config.pathname as any, params: config.params });
    } else {
      router.replace(config.pathname as any);
    }
  };

  return {
    navigate,
    goBack,
    replace,
    push: (path: any) => router.push(path),
    back: goBack,
  };
}

export default useAppNavigation;
