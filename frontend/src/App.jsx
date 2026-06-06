import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { LanguageProvider } from './contexts/LanguageContext';
import OwnerLayout from './components/OwnerLayout';
import ErrorBoundary from './components/ErrorBoundary';

// Code-splitting routes for faster initial page load
const RegisterLogin = React.lazy(() => import('./pages/RegisterLogin'));
const ShopDetails = React.lazy(() => import('./pages/ShopDetails'));
const QRCodeGeneration = React.lazy(() => import('./pages/QRCodeGeneration'));
const MenuBuilder = React.lazy(() => import('./pages/MenuBuilder'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const CustomerMenu = React.lazy(() => import('./pages/CustomerMenu'));
const Orders = React.lazy(() => import('./pages/Orders'));
const Settings = React.lazy(() => import('./pages/Settings'));
const BillHistory = React.lazy(() => import('./pages/BillHistory'));
const Feedback = React.lazy(() => import('./pages/Feedback'));

// Fast loading fallback
const Loader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--color-bg)' }}>
    <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid var(--color-surface)', borderTop: '4px solid var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
  </div>
);

function App() {
  useEffect(() => {
    // 1. Instantly apply locally saved theme or system default
    let localTheme = localStorage.getItem('themeColor');
    
    if (!localTheme) {
      const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
      localTheme = prefersLight ? 'light' : 'dark';
    }

    if (localTheme === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }

    // 2. Fetch from Supabase to sync across devices if logged in
    const syncTheme = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data: shops } = await supabase.from('shops').select('theme_color').eq('user_id', user.id).limit(1);
        if (shops && shops.length > 0) {
          if (shops[0].theme_color) {
            const theme = shops[0].theme_color;
            localStorage.setItem('themeColor', theme);
            
            if (theme === 'light') {
              document.documentElement.classList.add('light-mode');
            } else {
              document.documentElement.classList.remove('light-mode');
            }
          }
        }
      } catch (err) {
        console.error('Error syncing theme:', err);
      }
    };
    
    syncTheme();
  }, []);

  return (
    <ErrorBoundary>
      <LanguageProvider>
        <Router>
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/register" element={<RegisterLogin />} />
              <Route path="/shop-setup" element={<ShopDetails />} />
              <Route path="/menu/:shopId" element={<CustomerMenu />} />
              
              {/* Owner Layout Persistent Route Group */}
              <Route element={<OwnerLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/menu-builder" element={<MenuBuilder />} />
                <Route path="/qr-code" element={<QRCodeGeneration />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/history" element={<BillHistory />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/feedback" element={<Feedback />} />
              </Route>

              {/* Catch-all: redirect any unknown route to dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
