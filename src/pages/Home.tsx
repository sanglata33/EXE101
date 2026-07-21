import React from 'react';
import { HeroBanner } from '../components/home/HeroBanner';
import { FeaturesSection } from '../components/home/FeaturesSection';
import { PricingSection } from '../components/home/PricingSection';
import { HowItWorksSection } from '../components/home/HowItWorksSection';
import { BookingFormSection } from '../components/home/BookingFormSection';
import { FloatingContact } from '../components/home/FloatingContact';

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen">

      {/* ── Hero ────────────────────────────────────── */}
      <HeroBanner />

      {/* ── Quy trình 4 bước ─────────────────────── */}
      <HowItWorksSection />

      {/* ── Bảng giá từ API ──────────────────────── */}
      <PricingSection />

      {/* ── Tại sao chọn FreshWash ───────────────── */}
      <FeaturesSection />

      {/* ── Booking CTA Form với Zod Validation ────── */}
      <BookingFormSection />

      {/* ── Floating contact buttons ───────────────── */}
      <FloatingContact />

    </div>
  );
};
