import { MeshGradient, PulsingBorder } from "@paper-design/shaders-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function ShaderHero() {
  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[#FCFBF9]"
      style={{ isolation: "isolate" }}
    >
      {/* ── SVG Filters & Gradients ───────────────────── */}
      <svg className="absolute inset-0 w-0 h-0 pointer-events-none">
        <defs>
          <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0.02
                      0 1 0 0 0.02
                      0 0 1 0 0.05
                      0 0 0 0.9 0"
              result="tint"
            />
          </filter>
          <filter id="gooey-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
          <filter id="logo-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="text-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C5A880" />
            <stop offset="50%" stopColor="#2A2520" />
            <stop offset="100%" stopColor="#D4AF37" />
          </linearGradient>
        </defs>
      </svg>

      {/* ── Mesh Gradient Background ──────────────────── */}
      <MeshGradient
        className="absolute inset-0 w-full h-full"
        colors={["#FCFBF9", "#FAF6F0", "#F3EEE6", "#EBE3D5", "#C5A880"]}
        speed={0.15}
      />
      {/* Wireframe overlay layer */}
      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-20"
        colors={["#ffffff", "#FCFBF9", "#C5A880", "#D4AF37"]}
        speed={0.10}
      />
      {/* Dark overlay to ensure readability */}
      <div className="absolute inset-0 bg-white/10" />

      {/* ── Centered Container for absolute positioned elements on wide screens ── */}
      <div className="absolute inset-0 w-full max-w-7xl 2xl:max-w-[1536px] 4xl:max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pointer-events-none z-20">
        <div className="relative w-full h-full">
          {/* ── Main hero content — bottom left ──────────── */}
          <main className="absolute bottom-10 left-0 pointer-events-auto max-w-2xl">
            {/* Badge */}
            <motion.div
              className="inline-flex items-center px-4 py-2 rounded-full bg-[#C5A880]/10 backdrop-blur-sm mb-7 relative border border-[#C5A880]/20"
              style={{ filter: "url(#glass-effect)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="absolute top-0 left-2 right-2 h-px bg-gradient-to-r from-transparent via-[#C5A880]/30 to-transparent rounded-full" />
              <span className="text-[#4E453E] text-xs sm:text-sm font-medium tracking-wide">
                ✨ Dịch vụ giặt ủi premium — TP.HCM
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#2A2520] mb-6 leading-none tracking-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <motion.span
                className="block font-light text-3xl sm:text-4xl mb-2 tracking-wider"
                style={{
                  background: "linear-gradient(135deg, #2A2520 0%, #BCA374 50%, #D4AF37 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter: "url(#text-glow)",
                }}
              >
                Sạch sẽ · Tiện lợi
              </motion.span>
              <span className="block font-black text-[#2A2520] drop-shadow-sm">
                Skill-<span style={{
                  background: "linear-gradient(90deg,#C5A880,#D4AF37)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>Up</span>
              </span>
              <span className="block font-light text-[#756458] italic text-3xl sm:text-4xl mt-1">
                Tận tâm chăm sóc
              </span>
            </motion.h1>

            {/* Sub-description */}
            <motion.p
              className="text-sm sm:text-base font-light text-[#5A4B40] mb-8 leading-relaxed max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              Giặt riêng từng khách · Nước giặt hữu cơ nhập khẩu · Diệt khuẩn chuyên sâu
              <br />
              <span className="text-[#8F7E71] text-xs">Giao nhận tận nhà · 4 giờ hoặc 24 giờ</span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex items-center gap-4 flex-wrap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <a href="#quick-booking">
                <motion.button
                  className="px-8 py-3.5 rounded-full bg-[#C5A880]/15 backdrop-blur-sm border border-[#C5A880]/30 text-[#2A2520] font-medium text-sm transition-all duration-300 hover:bg-[#C5A880]/25 hover:border-[#D4AF37] cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Đặt Lịch Ngay
                </motion.button>
              </a>
              <Link to="/products">
                <motion.button
                  className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#BCA374] to-[#D4AF37] text-white font-semibold text-sm transition-all duration-300 hover:from-[#C5A880] hover:to-[#D4AF37] cursor-pointer shadow-lg shadow-gold-500/10 hover:shadow-xl hover:shadow-gold-500/20 flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Xem Dịch Vụ
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
            </motion.div>
          </main>

          {/* ── Pulsing border widget — bottom right ─────── */}
          <div className="absolute bottom-8 right-0 pointer-events-auto">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <PulsingBorder
                colors={["#C5A880", "#BCA374", "#D4AF37", "#EBE3D5", "#ffffff"]}
                colorBack="#00000000"
                speed={1.5}
                roundness={1}
                thickness={0.1}
                softness={0.2}
                intensity={5}
                spots={5}
                spotSize={0.1}
                pulse={0.1}
                smoke={0.5}
                smokeSize={4}
                scale={0.65}
                rotation={0}
                frame={9161408}
                style={{ width: "60px", height: "60px", borderRadius: "50%" }}
              />
              {/* Rotating circular text — Skill-Up branding */}
              <motion.svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 100 100"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                style={{ transform: "scale(1.6)" }}
              >
                <defs>
                  <path id="fw-circle" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
                </defs>
                <text className="text-sm fill-[#5A4B40]/70 font-medium" fontSize="9">
                  <textPath href="#fw-circle" startOffset="0%">
                    Skill-Up • Giặt Sấy Tiện Lợi • Tận Tâm Chăm Sóc •
                  </textPath>
                </text>
              </motion.svg>
            </div>
          </div>
        </div>
      </div>

      {/* ── Scroll hint ───────────────────────────────── */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <span className="text-[#2A2520]/40 text-[10px] uppercase tracking-widest font-semibold">Cuộn xuống</span>
        <motion.div
          className="w-px h-10 bg-gradient-to-b from-[#2A2520]/40 to-transparent"
          animate={{ scaleY: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </div>
  );
}
