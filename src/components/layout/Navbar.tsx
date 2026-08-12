import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, X, User, LogOut, Shield, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import logoImg from '../../assets/logo.png';
import { CareLabelScannerModal } from '../ui/CareLabelScannerModal';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const { cartCount, clearCart } = useCart();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      clearCart();
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Logout failed:', err);
      navigate('/', { replace: true });
    }
  };

  const handleSelectPackageFromScanner = (_packageName: string, _adviceText: string) => {
    navigate('/');
    setTimeout(() => {
      const elem = document.getElementById('quick-booking');
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  const navLinks = [
    { path: '/', label: 'Trang Chủ' },
    { path: '/products', label: 'Dịch Vụ & Sản Phẩm' },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-blue-100 shadow-sm transition-all duration-300">
        <div className="max-w-7xl 2xl:max-w-[1536px] 4xl:max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Left Section: Logo + Nav Links */}
            <div className="flex items-center gap-10">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
                <img
                  src={logoImg}
                  alt="Skill Up Logo"
                  className="h-12 w-12 object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-sm"
                />
                <span className="font-display font-bold text-2xl tracking-tight text-[#1E4DB7]">
                  Skill <span className="text-[#2E62D4]">Up</span>
                </span>
              </Link>

              {/* Desktop Nav Links */}
              <div className="hidden md:flex items-center gap-8">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`relative font-medium text-sm transition-colors duration-300 py-2 ${
                        isActive ? 'text-[#1E4DB7] font-bold' : 'text-slate-600 hover:text-[#1E4DB7]'
                      }`}
                    >
                      {link.label}
                      {isActive && (
                        <motion.div
                          layoutId="activeNav"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#1E4DB7] to-[#2E62D4] rounded-full"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right Section: Actions */}
            <div className="hidden md:flex items-center gap-3.5 flex-shrink-0">
              {/* AI Care Label Scanner Button */}
              <button
                onClick={() => setIsScannerOpen(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 hover:border-[#1E4DB7] text-[#1E4DB7] text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 hover:shadow-sm"
                title="Quét nhãn mác quần áo bằng AI"
              >
                <Sparkles className="w-4 h-4 text-[#1E4DB7] animate-pulse" />
                <span>AI Quét Nhãn Mác</span>
              </button>

              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <Link
                    to="/profile"
                    className="text-sm text-[#1A42A0] hover:text-[#1E4DB7] flex items-center gap-1.5 font-semibold transition-colors duration-200"
                    title="Xem hồ sơ cá nhân"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    {user?.name || 'Khách hàng'}
                  </Link>
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
                    className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-300 cursor-pointer"
                    title="Đăng xuất"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#1A42A0] to-[#1E4DB7] hover:from-[#1E4DB7] hover:to-[#2E62D4] text-white rounded-xl font-semibold text-sm shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300"
                >
                  <User className="w-4 h-4" />
                  Đăng Nhập
                </Link>
              )}

              {/* Cart Button */}
              <Link
                to="/cart"
                className="relative p-2.5 bg-blue-50 border border-blue-100 hover:border-[#1E4DB7] hover:bg-blue-100 text-blue-700 rounded-xl transition-all duration-300 group"
              >
                <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gradient-to-r from-[#1E4DB7] to-[#2E62D4] text-white text-[10px] font-extrabold flex items-center justify-center rounded-full shadow-lg shadow-blue-500/20"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </Link>
            </div>

            {/* Mobile Menu & Cart Buttons */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setIsScannerOpen(true)}
                className="p-2 text-[#1E4DB7] bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-1 text-xs font-bold"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI</span>
              </button>

              <Link
                to="/cart"
                className="relative p-2 text-blue-700 bg-blue-50 border border-blue-100 rounded-lg"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#1E4DB7] text-white text-[9px] font-bold flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-blue-700 hover:text-blue-900 bg-blue-50 border border-blue-100 rounded-lg"
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
              className="md:hidden bg-white/95 backdrop-blur-xl border-b border-blue-100"
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
                          ? 'bg-gradient-to-r from-[#F0F6FF] to-[#E0EDFF]/50 text-[#1E4DB7] border-l-2 border-[#1E4DB7]'
                          : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}

                <div className="pt-4 border-t border-blue-50 space-y-3">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setIsScannerOpen(true);
                    }}
                    className="flex w-full items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-[#1E4DB7] rounded-xl font-bold border border-blue-200"
                  >
                    <Sparkles className="w-5 h-5 text-[#1E4DB7]" />
                    AI Quét Nhãn Mác Quần Áo
                  </button>

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
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#1A42A0] to-[#1E4DB7] text-white rounded-xl font-bold transition-all duration-300"
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

      {/* Modal Scanner AI */}
      <CareLabelScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSelectPackage={handleSelectPackageFromScanner}
      />
    </>
  );
};
