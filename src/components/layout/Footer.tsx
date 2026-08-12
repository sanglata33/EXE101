import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import logoImg from '../../assets/logo.png';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-blue-50/50 border-t border-blue-100 pt-16 pb-8 text-slate-600">
      <div className="max-w-7xl 2xl:max-w-[1536px] 4xl:max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <img
                src={logoImg}
                alt="Skill Up Logo"
                className="h-10 w-10 object-contain drop-shadow-sm"
              />
              <span className="font-display font-bold text-xl tracking-tight text-[#1E4DB7]">
                Skill <span className="text-[#2E62D4]">Up</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-600">
              Dịch vụ giặt sấy giao nhận tận nơi hàng đầu TP.HCM. Tiết kiệm thời gian, chăm sóc tỉ mỉ từng sợi vải của bạn.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="https://www.facebook.com/giatoitvn" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-blue-100/70 hover:bg-[#1E4DB7] hover:text-white text-[#1E4DB7] flex items-center justify-center transition-all duration-300">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="https://www.instagram.com/giatoi.vn" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-blue-100/70 hover:bg-[#1E4DB7] hover:text-white text-[#1E4DB7] flex items-center justify-center transition-all duration-300">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-slate-900 font-bold text-base mb-6">Đường Dẫn Nhanh</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/" className="hover:text-[#1E4DB7] transition-colors duration-200">Trang chủ</Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-[#1E4DB7] transition-colors duration-200">Dịch vụ & Sản phẩm</Link>
              </li>
              <li>
                <Link to="/tracking" className="hover:text-[#1E4DB7] transition-colors duration-200">Tra cứu đơn hàng</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-[#1E4DB7] transition-colors duration-200">Đăng nhập tài khoản</Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-slate-900 font-bold text-base mb-6">Dịch Vụ Chính</h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li>Giặt sấy lấy ngay</li>
              <li>Giặt hấp đồ cao cấp</li>
              <li>Giặt khô chuyên sâu</li>
              <li>Ủi phẳng & Khử mùi thơm</li>
              <li>Vệ sinh sofa, nệm tại nhà</li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="text-slate-900 font-bold text-base mb-6">Thông Tin Liên Hệ</h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#1E4DB7] mt-0.5 flex-shrink-0" />
                <span>Thành phố Hồ Chí Minh, Việt Nam</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#1E4DB7] flex-shrink-0" />
                <span>+84 397 544 696</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#1E4DB7] flex-shrink-0" />
                <span>hello@giatoi.vn</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-blue-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© 2026 Skill Up. Tất cả các quyền được bảo lưu.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-900 transition-colors">Điều khoản dịch vụ</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Chính sách bảo mật</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
