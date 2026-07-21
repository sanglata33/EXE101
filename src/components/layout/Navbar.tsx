import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, X, Wind, User, LogOut, Shield } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { cartCount, clearCart } = useCart();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      clearCart(); // Xóa giỏ hàng khi đăng xuất
      navigate('/', { replace: true }); // Về trang chủ
    } catch (err) {
      console.error('Logout failed:', err);
      navigate('/', { replace: true }); // Vẫn về trang chủ dù lỗi
    }
  };

  const navLinks = [
    { path: '/', label: 'Trang Chủ' },
    { path: '/products', label: 'Dịch Vụ & Sản Phẩm' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-cyan-100/80 shadow-xs transition-all duration-300">
      <div className="max-w-7xl 2xl:max-w-[1536px] 4xl:max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-amber-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300">
              <Wind className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-slate-800">
              Fresh<span className="text-cyan-600">Wash</span>
            </span>
          </Link>

          {/* Desktop Nav Links - Centered between Logo and Actions */}
          <div className="hidden md:flex items-center justify-center gap-8 flex-1 mx-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative font-medium text-sm transition-colors duration-300 py-2 ${
                    isActive ? 'text-cyan-600' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4 flex-shrink-0">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-600 flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {user?.name || 'Khách hàng'}
                </span>
                {(user?.role === 'admin' || user?.role === 'staff') && (
                  <Link
                    to="/admin"
                    className="p-2 text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-xl transition-all duration-300"
                    title="Vào trang quản lý"
                  >
                    <Shield className="w-4 h-4" />
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="p-2.5 text-slate-500 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-300 cursor-pointer"
                  title="Đăng xuất"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-xl font-semibold text-sm shadow-md shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300"
              >
                <User className="w-4 h-4" />
                Đăng Nhập
              </Link>
            )}

            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative p-2.5 bg-slate-50 border border-slate-200 hover:border-cyan-400 hover:bg-cyan-50 text-slate-700 rounded-xl transition-all duration-300 group"
            >
              <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-extrabold flex items-center justify-center rounded-full shadow-lg shadow-amber-500/20"
                >
                  {cartCount}
                </motion.span>
              )}
            </Link>
          </div>

          {/* Mobile Menu & Cart Buttons */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/cart"
              className="relative p-2 text-slate-700 bg-slate-50 border border-slate-200 rounded-lg"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200 rounded-lg"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-xl border-b border-cyan-100"
          >
            <div className="px-4 pt-2 pb-6 space-y-3">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-base font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-50 to-cyan-100/50 text-cyan-600 border-l-2 border-cyan-500'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <div className="pt-4 border-t border-slate-100 space-y-3">
                {isAuthenticated && (user?.role === 'admin' || user?.role === 'staff') && (
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex w-full items-center justify-center gap-2 px-4 py-3 bg-violet-50 hover:bg-violet-100 text-violet-600 rounded-xl font-medium transition-all"
                  >
                    <Shield className="w-5 h-5" />
                    Trang Quản Trị
                  </Link>
                )}
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="flex w-full items-center justify-center gap-2 px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-xl font-medium transition-all duration-300 cursor-pointer"
                  >
                    <LogOut className="w-5 h-5" />
                    Đăng Xuất
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl font-bold transition-all duration-300"
                  >
                    <User className="w-5 h-5" />
                    Đăng Nhập
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
