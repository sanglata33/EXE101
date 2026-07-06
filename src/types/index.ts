export interface Product {
  id: string;
  name: string;
  category: 'laundry' | 'dryclean' | 'ironing' | 'special';
  categoryLabel: string;
  price: number;
  unit: string;
  timeEstimate: string;
  description: string;
  image: string;
  rating: number;
  reviewsCount: number;
  features: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}
