import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './layouts/AppLayout';
import { SplashScreen } from './pages/SplashScreen';
import { LoginScreen } from './pages/LoginScreen';
import { RegisterScreen } from './pages/RegisterScreen';
import { DashboardScreen } from './pages/DashboardScreen';
import { DetailServiceScreen } from './pages/DetailServiceScreen';
import { CartScreen } from './pages/CartScreen';
import { CheckoutScreen } from './pages/CheckoutScreen';
import { OrderTrackingScreen } from './pages/OrderTrackingScreen';
import { HistoryScreen } from './pages/HistoryScreen';
import { ProfileScreen } from './pages/ProfileScreen';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Standalone Screens */}
          <Route path="/" element={<SplashScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegisterScreen />} />

          {/* Main App Layout */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardScreen />} />
            <Route path="/service/:id" element={<DetailServiceScreen />} />
            <Route path="/cart" element={<CartScreen />} />
            <Route path="/checkout" element={<CheckoutScreen />} />
            <Route path="/tracking" element={<OrderTrackingScreen />} />
            <Route path="/tracking/:id" element={<OrderTrackingScreen />} />
            <Route path="/history" element={<HistoryScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
