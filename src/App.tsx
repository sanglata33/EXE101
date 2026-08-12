import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import { ShipperDashboard } from './pages/ShipperDashboard';
import { OrderTracking } from './pages/OrderTracking';
import { Profile } from './pages/Profile';
import { Orders } from './pages/Orders';

// ─── Scroll to top on route change ──────────────────────────────────────────
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
};

// ─── Route guard: Chỉ admin/staff được vào /admin ───────────────────────────
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (user?.role !== 'admin' && user?.role !== 'staff') {
    // Customer không có quyền vào admin → về trang chủ
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

// ─── Route guard: Shipper/Staff/Admin được vào /shipper ────────────────────
const ShipperRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (user?.role !== 'admin' && user?.role !== 'staff' && user?.role !== 'shipper') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

// ─── Route: Nếu đã login thì redirect, không cho vào /login nữa ─────────────
const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated && user) {
    if (user.role === 'shipper') {
      return <Navigate to="/shipper" replace />;
    }
    // Admin/Staff → dashboard
    if (user.role === 'admin' || user.role === 'staff') {
      return <Navigate to="/admin" replace />;
    }
    // Customer → trang chủ
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

// ─── Layout: Navbar + Footer cho trang public ────────────────────────────────
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <Navbar />
    <main className="flex-grow pt-20">{children}</main>
    <Footer />
  </>
);

// ─── App ─────────────────────────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <div className="flex flex-col min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900 font-sans antialiased">
            <Routes>

              {/* Admin Dashboard — bảo vệ bởi AdminRoute */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />

              {/* Shipper Portal — bảo vệ bởi ShipperRoute */}
              <Route
                path="/shipper"
                element={
                  <ShipperRoute>
                    <ShipperDashboard />
                  </ShipperRoute>
                }
              />

              {/* Public routes — có Navbar & Footer */}
              <Route
                path="/*"
                element={
                  <MainLayout>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/products/:id" element={<ProductDetail />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/tracking" element={<OrderTracking />} />
                      <Route path="/tracking/:id" element={<OrderTracking />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/orders" element={<Orders />} />

                      {/* Login: nếu đã đăng nhập thì redirect theo role */}
                      <Route
                        path="/login"
                        element={
                          <PublicOnlyRoute>
                            <Login />
                          </PublicOnlyRoute>
                        }
                      />
                    </Routes>
                  </MainLayout>
                }
              />

            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
