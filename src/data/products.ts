import type { Product } from '../types';

/**
 * Danh sách sản phẩm FE — khớp 1:1 với 3 service trong backend DB
 *
 * DB services:
 *  1. "Giặt sấy sấy tiêu chuẩn"  → per_kg,   25.000đ/kg
 *  2. "Giặt hấp áo vest"          → per_item, 80.000đ/món
 *  3. "Giặt giày sneaker"         → per_item, 50.000đ/đôi
 */
export const products: Product[] = [
  {
    id: 'giat-say-tieu-chuan',
    name: 'Giặt Sấy Tiêu Chuẩn',
    category: 'laundry',
    categoryLabel: 'Giặt Sấy',
    price: 25000,
    unit: 'kg',
    timeEstimate: '24 giờ',
    description: 'Dịch vụ giặt sấy tiêu chuẩn sử dụng nước giặt hữu cơ, sấy nhiệt độ phù hợp giúp bảo vệ sợi vải. Phù hợp cho quần áo hàng ngày.',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviewsCount: 124,
    features: ['Sử dụng nước giặt sinh học', 'Sấy khô hoàn toàn', 'Gấp xếp gọn gàng', 'Diệt khuẩn bằng tia UV']
  },
  {
    id: 'giat-hap-ao-vest',
    name: 'Giặt Hấp Áo Vest / Suit',
    category: 'dryclean',
    categoryLabel: 'Giặt Hấp (Khô)',
    price: 80000,
    unit: 'món',
    timeEstimate: '48 giờ',
    description: 'Quy trình giặt hấp cao cấp cho áo vest nam/nữ. Giữ form dáng nguyên bản, bảo vệ chất liệu vải cao cấp.',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
    rating: 5.0,
    reviewsCount: 56,
    features: ['Giữ form dáng nguyên bản', 'Dung môi an toàn', 'Xử lý vết bẩn thủ công', 'Treo bao nilon chuyên dụng']
  },
  {
    id: 'giat-giay-sneaker',
    name: 'Spa & Giặt Giày Sneaker',
    category: 'special',
    categoryLabel: 'Chăm Sóc Đặc Biệt',
    price: 50000,
    unit: 'đôi',
    timeEstimate: '36 giờ',
    description: 'Làm sạch sâu từ trong ra ngoài bằng tay với các dung dịch chuyên dụng. Khử mùi và sấy khô bằng tia cực tím.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewsCount: 142,
    features: ['Vệ sinh thủ công 100%', 'Dung dịch làm sạch cao cấp', 'Khử trùng UV & diệt nấm', 'Dưỡng da/vải giày']
  },
];
