import { useRouter } from 'expo-router';

export function useAppNavigation() {
  const router = useRouter();

  const navigate = (screenName: string, params?: Record<string, any>) => {
    switch (screenName) {
      case 'Login':
        router.push('/(auth)/login');
        break;
      case 'Register':
        router.push('/(auth)/register');
        break;
      case 'HomeTab':
        router.push('/(customer)/(tabs)');
        break;
      case 'HistoryTab':
        router.push('/(customer)/(tabs)/history');
        break;
      case 'ProfileTab':
      case 'Profile':
        router.push('/(customer)/(tabs)/profile');
        break;
      case 'Cart':
        router.push('/(customer)/cart');
        break;
      case 'Booking':
        router.push('/(customer)/booking');
        break;
      case 'DetailService':
        router.push({
          pathname: '/(customer)/detail-service',
          params: params || {},
        });
        break;
      case 'OrderTracking':
        router.push({
          pathname: '/(customer)/order-tracking',
          params: params || {},
        });
        break;
      case 'MainTabs':
        if (params?.screen === 'HistoryTab') {
          router.push('/(customer)/(tabs)/history');
        } else if (params?.screen === 'ProfileTab') {
          router.push('/(customer)/(tabs)/profile');
        } else {
          router.push('/(customer)/(tabs)');
        }
        break;
      case 'Dashboard':
      case 'AdminDashboard':
        router.push('/(admin)/(tabs)');
        break;
      case 'Orders':
      case 'ManageOrders':
        router.push({
          pathname: '/(admin)/(tabs)/orders',
          params: params || {},
        });
        break;
      case 'Services':
      case 'ManageServices':
        router.push('/(admin)/(tabs)/services');
        break;
      case 'Reports':
      case 'Report':
        router.push('/(admin)/(tabs)/reports');
        break;
      default:
        console.warn(`[useAppNavigation] Unknown route name: ${screenName}`);
        try {
          router.push(screenName as any);
        } catch (e) {
          // ignore
        }
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
    navigate(screenName, params);
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
