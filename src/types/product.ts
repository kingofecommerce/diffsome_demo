export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parent_id: number | null;
  sort_order: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  short_description: string | null;
  description: string;
  thumbnail: string;
  images: string[];
  price: number;
  compare_price: number | null;
  discount_percentage: number | null;
  sku: string | null;
  stock_quantity: number;
  in_stock: boolean;
  is_low_stock: boolean | null;
  track_inventory: boolean;
  has_options: boolean;
  is_featured: boolean;
  weight: number | null;
  shipping_info: string | null;
  meta_title: string | null;
  meta_description: string | null;
  category: ProductCategory;
  variants: unknown[];
  view_count: number | null;
  created_at: string;
}

export interface ProductListResponse {
  success: boolean;
  data: Product[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
