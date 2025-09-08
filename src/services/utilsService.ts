import { IImage } from "@/app/components/inteface/IImage";
import Cookies from "js-cookie";

const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE!}/utils`;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY!;

const getAuthHeaders = () => {
  const token = Cookies.get("token"); 
  return {
    "x-api-key": API_KEY,
    "Authorization": token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  };
};

// Types
export interface CarouselSlide {
  id: number;
  title: string;
  description: string;
  button_text: string;
  button_link: string;
  sort_order: number;
  image: IImage;
  created_at: string;
  updated_at: string;
}

export interface CarouselSlidesResponse {
  slides: CarouselSlide[];
  total_slides: number;
}

export interface Product {
  id: number;
  title: string;
  slug: string;
  description: string;
  rating: number;
  weight: number;
  created_at: string;
  updated_at: string;
  image: {
    small: string;
    medium: string;
    large: string;
    original: string;
  } | null;
  price_range: {
    min: number | null;
    max: number | null;
    min_formatted: string | null;
    max_formatted: string | null;
    display: string | null;
  };
  has_stock: boolean;
  variants_count: number;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  total_sold?: number; // Only available in popular products
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    current_page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
    next_page: number | null;
    prev_page: number | null;
  };
}

export interface SiteConfig {
  site_name: string;
  tagline: string;
  about: {
    title: string;
    content: string;
    image: IImage | null;
  };
  favicon: IImage | null;
}

// Services
export const utilsService = {
  /**
   * Get site configuration
   */
  async getSiteConfig(): Promise<SiteConfig> {
    const response = await fetch(`${API_BASE}/site-config`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch site configuration");
    }

    const data: SiteConfig = await response.json();
    return data;
  },

  /**
   * Get carousel slides
   */
  async getCarouselSlides(): Promise<CarouselSlidesResponse> {
    const response = await fetch(`${API_BASE}/carousel-slides`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch carousel slides");
    }

    return response.json();
  },

  /**
   * Get latest products
   */
  async getLatestProducts(page: number = 1, limit: number = 10): Promise<ProductsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(`${API_BASE}/latest-products?${params}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch latest products");
    }

    return response.json();
  },

  /**
   * Get popular products based on sales
   */
  async getPopularProducts(page: number = 1, limit: number = 10): Promise<ProductsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(`${API_BASE}/popular-products?${params}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch popular products");
    }

    return response.json();
  },
};

export default utilsService;