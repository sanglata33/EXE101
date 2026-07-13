import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Clock, ArrowLeft, Plus, Minus, ShoppingCart, Sparkles } from 'lucide-react';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ProductCard } from '../components/ui/ProductCard';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  // Find current product
  const product = useMemo(() => {
    return products.find((p) => p.id === id);
  }, [id]);

  // Find related products
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 3);
  }, [product]);

  const handleIncrement = () => setQuantity((q) => q + 1);
  const handleDecrement = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center pt-24 px-4 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Dịch vụ không tồn tại</h2>
        <p className="text-slate-500 mb-6">Xin lỗi, dịch vụ giặt ủi này không nằm trong hệ thống của chúng tôi.</p>
        <Link to="/products">
          <Button variant="primary">Quay Lại Dịch Vụ</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-24">
      <div className="w-full max-w-none px-4 sm:px-12 lg:px-16">
        
        {/* Back Link */}
        <Link to="/products" className="inline-flex items-center gap-2 text-slate-500 hover:text-cyan-600 transition-colors mb-8 text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại tất cả dịch vụ</span>
        </Link>

        {/* Main Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          
          {/* Left Column: Big Image & Badge */}
          <div className="lg:col-span-6 space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative aspect-video lg:aspect-square w-full rounded-3xl overflow-hidden border border-slate-200 shadow-2xl"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent"></div>
            </motion.div>
          </div>

          {/* Right Column: Descriptions & Purchase Box */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <Badge variant="cyan">{product.categoryLabel}</Badge>
              <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 leading-tight">
                {product.name}
              </h1>

              {/* Rating + Time */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <div className="flex items-center gap-1.5 text-amber-500 text-sm">
                  <Star className="w-4.5 h-4.5 fill-current" />
                  <span className="font-bold">{product.rating.toFixed(1)}</span>
                  <span className="text-slate-550">({product.reviewsCount} đánh giá)</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700 text-sm bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-sm">
                  <Clock className="w-4 h-4 text-cyan-600" />
                  <span>Xử lý: {product.timeEstimate}</span>
                </div>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-6 rounded-2xl bg-cyan-50/50 border border-cyan-100 space-y-2 shadow-sm">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Mức giá niêm yết</span>
              <div className="flex items-baseline gap-2">
                <span className="font-display font-black text-3xl sm:text-4xl text-cyan-600">
                  {formatPrice(product.price)}
                </span>
                <span className="text-slate-500 text-sm font-semibold">/ {product.unit}</span>
              </div>
            </div>

            {/* Service details description */}
            <div className="space-y-2">
              <h3 className="text-slate-800 font-bold text-base">Mô Tả Chi Tiết</h3>
              <p className="text-slate-650 text-sm sm:text-base leading-relaxed font-light">
                {product.description}
              </p>
            </div>

            {/* Features checkmarks */}
            <div className="space-y-3">
              <h3 className="text-slate-800 font-bold text-sm">Dịch vụ bao gồm:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-slate-750 text-sm">
                    <Sparkles className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quantity and CTA Add to Cart Row */}
            <div className="pt-6 border-t border-slate-200 flex flex-wrap gap-4 items-center">
              {/* Quantity Select */}
              <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1.5 shadow-sm">
                <button
                  onClick={handleDecrement}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-slate-800 font-bold text-sm select-none">
                  {quantity}
                </span>
                <button
                  onClick={handleIncrement}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart CTA */}
              <Button
                onClick={() => {
                  addToCart(product, quantity);
                  alert(`Đã thêm ${quantity} ${product.unit} ${product.name} vào giỏ hàng!`);
                }}
                variant="primary"
                size="lg"
                className="gap-2 flex-grow sm:flex-grow-0 text-white bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400"
              >
                <ShoppingCart className="w-5 h-5" />
                Thêm Vào Giỏ Hàng
              </Button>
            </div>

          </div>
        </div>

        {/* Related Services */}
        {relatedProducts.length > 0 && (
          <div className="space-y-8 pt-12 border-t border-slate-200">
            <h2 className="font-display font-extrabold text-2xl text-slate-900">Dịch vụ tương tự</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
