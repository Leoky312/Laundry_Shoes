import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

interface NetworkContextType {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  connectionType: string;
  isOffline: boolean;
  checkConnection: () => Promise<boolean>;
}

const NetworkContext = createContext<NetworkContextType>({
  isConnected: true,
  isInternetReachable: true,
  connectionType: 'unknown',
  isOffline: false,
  checkConnection: async () => true,
});

export const NetworkProvider = ({ children }: { children: React.ReactNode }) => {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(true);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  const updateNetworkState = (state: NetInfoState) => {
    const connected = state.isConnected ?? true;
    const reachable = state.isInternetReachable;

    setIsConnected(connected);
    setIsInternetReachable(reachable);
    setConnectionType(state.type || 'unknown');
  };

  const checkConnection = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
        const online = navigator.onLine;
        setIsConnected(online);
        return online;
      }
      const state = await NetInfo.fetch();
      updateNetworkState(state);
      return state.isConnected ?? true;
    } catch (e) {
      return true;
    }
  };

  useEffect(() => {
    // 1. Initial check
    checkConnection();

    // 2. NetInfo listener for Native and supported Web
    const unsubscribe = NetInfo.addEventListener((state) => {
      updateNetworkState(state);
    });

    // 3. Web native event fallback
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handleOnline = () => {
        setIsConnected(true);
        setIsInternetReachable(true);
      };
      const handleOffline = () => {
        setIsConnected(false);
        setIsInternetReachable(false);
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        unsubscribe();
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }

    return () => {
      unsubscribe();
    };
  }, []);

  const isOffline = !isConnected || isInternetReachable === false;

  return (
    <NetworkContext.Provider
      value={{
        isConnected,
        isInternetReachable,
        connectionType,
        isOffline,
        checkConnection,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => useContext(NetworkContext);

export default NetworkContext;
