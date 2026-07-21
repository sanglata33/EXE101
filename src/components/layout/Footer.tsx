import React from 'react';
import { Link } from 'react-router-dom';
import { Wind, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-800 border-t border-slate-700 pt-16 pb-8 text-slate-300">
      <div className="max-w-7xl 2xl:max-w-[1536px] 4xl:max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-amber-500 flex items-center justify-center">
                <Wind className="w-4 h-4 text-white stroke-[2.5]" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-white">
                Fresh<span className="text-cyan-400">Wash</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Giải pháp giặt ủi và chăm sóc quần áo thông minh hàng đầu. Tiết kiệm thời gian của bạn, nâng niu từng sợi vải.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-700 hover:bg-cyan-500/20 hover:text-cyan-400 text-slate-400 flex items-center justify-center transition-all duration-300">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-700 hover:bg-cyan-500/20 hover:text-cyan-400 text-slate-400 flex items-center justify-center transition-all duration-300">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-700 hover:bg-cyan-500/20 hover:text-cyan-400 text-slate-400 flex items-center justify-center transition-all duration-300">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-base mb-6">Đường Dẫn Nhanh</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/" className="hover:text-cyan-400 transition-colors duration-200">Trang chủ</Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-cyan-400 transition-colors duration-200">Dịch vụ & Sản phẩm</Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-cyan-400 transition-colors duration-200">Giỏ hàng của bạn</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-cyan-400 transition-colors duration-200">Đăng nhập tài khoản</Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-bold text-base mb-6">Dịch Vụ Chính</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>Giặt sấy lấy ngay</li>
              <li>Giặt hấp đồ cao cấp</li>
              <li>Giặt khô chuyên sâu</li>
              <li>Ủi phẳng & Khử mùi thơm</li>
              <li>Vệ sinh sofa, nệm tại nhà</li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-base mb-6">Thông Tin Liên Hệ</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                <span>123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>1900 8888 (7:00 - 21:00)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>support@freshwash.vn</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© 2026 FreshWash Laundry. Tất cả các quyền được bảo lưu.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-300">Điều khoản dịch vụ</a>
            <a href="#" className="hover:text-slate-300">Chính sách bảo mật</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
