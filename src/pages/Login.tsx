import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Wind, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ── Password input with show/hide toggle ─────────────────────────── */
const PasswordInput: React.FC<{
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}> = ({ placeholder, value, onChange, disabled }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative flex items-center border-b border-white/25 focus-within:border-cyan-400 transition-colors duration-200 pb-2 group">
      <Lock className="w-4 h-4 text-white/40 group-focus-within:text-cyan-400 transition-colors mr-3 flex-shrink-0" />
      <input
        required
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className="flex-1 bg-transparent text-white placeholder:text-white/40 text-sm outline-none disabled:opacity-50 min-w-0"
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        className="text-white/30 hover:text-white/60 transition-colors ml-2 flex-shrink-0 cursor-pointer"
        tabIndex={-1}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
};

/* ── Text/Email input ────────────────────────────────────────────── */
const TextInput: React.FC<{
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  icon: React.ReactNode;
  disabled?: boolean;
}> = ({ type = 'text', placeholder, value, onChange, icon, disabled }) => (
  <div className="flex items-center border-b border-white/25 focus-within:border-cyan-400 transition-colors duration-200 pb-2 group">
    <span className="text-white/40 group-focus-within:text-cyan-400 transition-colors mr-3 flex-shrink-0">
      {icon}
    </span>
    <input
      required
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      className="flex-1 bg-transparent text-white placeholder:text-white/40 text-sm outline-none disabled:opacity-50 min-w-0"
    />
  </div>
);

/* ── Main Login Page ─────────────────────────────────────────────── */
export const Login: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { login, register } = useAuth();

  const switchMode = (next: 'login' | 'register') => { setMode(next); setError(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (mode === 'register' && password !== confirmPwd) {
      setError('Mật khẩu nhập lại không khớp!');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        const loggedUser = await login({ email, password });
        // Redirect theo role: admin/staff → dashboard, customer → trang chủ
        if (loggedUser.role === 'admin' || loggedUser.role === 'staff') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        await register({ name, email, password });
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#060c18]">

      {/* ── Background blobs ─────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-600/20 filter blur-[120px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-800/25 filter blur-[100px]" />
        <div className="absolute top-[40%] left-[55%] w-[300px] h-[300px] rounded-full bg-amber-500/8 filter blur-[90px]" />
      </div>

      {/* ── Card ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-sm mx-4"
      >

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-amber-500 flex items-center justify-center shadow-lg shadow-cyan-500/30 mb-4">
            <Wind className="w-6 h-6 text-white stroke-[2.5]" />
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="text-center"
            >
              <h1 className="text-3xl font-bold text-white tracking-tight">
                {mode === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản'}
              </h1>
              <p className="text-white/45 text-sm mt-2">
                {mode === 'login'
                  ? 'Đăng nhập để tiếp tục'
                  : 'Đăng ký miễn phí, dùng ngay'}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-white/5 rounded-xl p-1 mb-7 border border-white/10">
          {(['login', 'register'] as const).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              disabled={loading}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${mode === m
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                  : 'text-white/40 hover:text-white/70'
                }`}
            >
              {m === 'login' ? 'Đăng Nhập' : 'Đăng Ký'}
            </button>
          ))}
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 px-4 py-3 rounded-xl bg-rose-500/15 border border-rose-500/25 text-rose-300 text-xs font-medium leading-relaxed"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              <motion.div
                key="login-fields"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.22 }}
                className="space-y-6"
              >
                <TextInput
                  type="email" placeholder="Địa chỉ Email"
                  value={email} onChange={setEmail}
                  icon={<Mail className="w-4 h-4" />}
                  disabled={loading}
                />
                <PasswordInput
                  placeholder="Mật khẩu"
                  value={password} onChange={setPassword}
                  disabled={loading}
                />
                <div className="flex justify-end">
                  <a href="#" className="text-xs text-white/40 hover:text-cyan-400 transition-colors">
                    Quên mật khẩu?
                  </a>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="register-fields"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.22 }}
                className="space-y-6"
              >
                <TextInput
                  placeholder="Họ và tên"
                  value={name} onChange={setName}
                  icon={<User className="w-4 h-4" />}
                  disabled={loading}
                />
                <TextInput
                  type="email" placeholder="Địa chỉ Email"
                  value={email} onChange={setEmail}
                  icon={<Mail className="w-4 h-4" />}
                  disabled={loading}
                />
                <PasswordInput
                  placeholder="Mật khẩu (tối thiểu 6 ký tự)"
                  value={password} onChange={setPassword}
                  disabled={loading}
                />
                <PasswordInput
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPwd} onChange={setConfirmPwd}
                  disabled={loading}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="mt-8 w-full h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...</>
              : <>{mode === 'login' ? 'Đăng Nhập' : 'Tạo Tài Khoản'} <ArrowRight className="w-4 h-4" /></>
            }
          </motion.button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/25 text-[11px] uppercase tracking-widest font-medium">Hoặc tiếp tục với</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Google button */}
        <button
          type="button"
          disabled={loading}
          className="w-full h-12 rounded-2xl bg-white hover:bg-white/90 text-slate-800 font-semibold text-sm flex items-center justify-center gap-3 transition-all duration-200 cursor-pointer disabled:opacity-50 shadow-lg shadow-black/20"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Đăng nhập với Google
        </button>

        {/* Switch mode */}
        <p className="text-center text-xs text-white/35 mt-6">
          {mode === 'login' ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
          <button
            type="button"
            onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
            className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer transition-colors"
          >
            {mode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};
