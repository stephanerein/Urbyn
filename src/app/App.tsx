import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ChatWidget } from './components/ChatWidget';
import { ScrollToTop } from './components/ScrollToTop';
import { CartSidebar } from './components/CartSidebar';
import { AppRoutes } from './routes';
import { Toaster } from 'sonner';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ApiBootstrap } from './components/auth/ApiBootstrap';
import { SEOMeta, ORG_SCHEMA } from './components/SEOMeta';
import { useLocation } from 'react-router-dom';

function AppContent() {
  const { isSidebarOpen, closeSidebar } = useCart();
  const { isSupplier } = useAuth();
  const location = useLocation();
  const isPartnerSpace = location.pathname.startsWith('/fournisseur');
  const isAdminSpace = location.pathname.startsWith('/admin');

  if (isAdminSpace) {
    return (
      <div className="min-h-screen bg-white">
        <Toaster position="top-center" richColors />
        <AppRoutes />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SEOMeta jsonLd={ORG_SCHEMA} />
      <Toaster position="top-center" richColors />
      <Header />
      <div className={isPartnerSpace ? 'pt-24' : undefined}>
        <AppRoutes />
      </div>
      {!isPartnerSpace && !isSupplier ? <ChatWidget /> : null}
      {!isPartnerSpace ? <Footer /> : null}
      <CartSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
    </div>
  );
}

export * from './types';

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ApiBootstrap>
          <AuthProvider>
            <CartProvider>
              <ScrollToTop />
              <AppContent />
            </CartProvider>
          </AuthProvider>
        </ApiBootstrap>
      </BrowserRouter>
    </HelmetProvider>
  );
}
