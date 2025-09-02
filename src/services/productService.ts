import { IImage } from "@/app/components/inteface/IImage";
import Cookies from "js-cookie";

const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE!}/products`;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY!;

const getAuthHeaders = () => {
  const token = Cookies.get("token"); 
  return {
    "x-api-key": API_KEY,
    "Authorization": token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  };
};

export interface ProductVariant {
  id: number;
  title: string;
  sku: string;
  price: number;
  stock: number;
  image: IImage | null;
}

export interface Product {
  id: number;
  title: string;
  slug: string;
  deskripsi: string;
  rating: number;
  price: number;
  image: IImage | null;
  images: IImage[];
  categories: string[];
  variants?: ProductVariant[];
}

export interface Category {
  id: number;
  title: string;
}

export interface ProductListParams {
  title?: string;
  deskripsi?: string;
  category?: string;
  variant?: string;
  rating?: number;
  sort_field?: 'Title' | 'Price' | 'Rating';
  sort_dir?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export interface ProductListResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  total?: number;
  page?: number;
  limit?: number;
}

/**
 * Get list of categories
 */
export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await fetch(`${API_BASE}/categories`, {
      method: "GET",
      headers: getAuthHeaders(),
      mode: 'cors',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Categories response error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("Categories API result:", result);

    // Case 1: API returns { success: true, data: [...] }
    if (result.success !== undefined) {
      if (result.success) {
        return result.data ?? [];
      } else {
        throw new Error(result.error || result.message || 'Unknown API error');
      }
    }

    // Case 2: API directly returns array
    if (Array.isArray(result)) {
      return result;
    }

    // Case 3: API returns {data: [...]}
    if (result.data && Array.isArray(result.data)) {
      return result.data;
    }

    throw new Error("Unexpected API response structure for categories");
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

/**
 * Get list of products with filtering, sorting, and pagination
 */
export const getProducts = async (params?: ProductListParams): Promise<ProductListResponse> => {
  try {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
      mode: 'cors',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("API result:", result); // <-- debug dulu

    // Normalisasi hasil supaya fleksibel
    if (result.success !== undefined) {
      if (result.success) {
        return {
          data: result.data ?? [],
          total: result.total ?? result.data?.length ?? 0,
          page: result.page ?? 1,
          limit: result.limit ?? params?.limit ?? 10,
        };
      } else {
        throw new Error(result.error || result.message || 'Unknown API error');
      }
    }

    // Jika API langsung balikin array
    if (Array.isArray(result)) {
      return {
        data: result,
        total: result.length,
        page: 1,
        limit: result.length,
      };
    }

    // Jika struktur lain (misal {data: [...], meta: {...}})
    if (result.data && Array.isArray(result.data)) {
      return {
        data: result.data,
        total: result.total ?? result.meta?.total ?? result.data.length,
        page: result.page ?? result.meta?.page ?? 1,
        limit: result.limit ?? result.meta?.limit ?? result.data.length,
      };
    }

    throw new Error("Unexpected API response structure");
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

/**
 * Get single product by slug
 */
export const getProductBySlug = async (slug: string): Promise<Product> => {
  try {
    const response = await fetch(`${API_BASE}/show/${slug}`, {
      method: "GET",
      headers: getAuthHeaders(),
      mode: 'cors',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', response.status, errorText);
      if (response.status === 404) {
        throw new Error("Product not found");
      }
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("API single product result:", result); // <-- debug

    // Case 1: API balikin { success: true, data: {...} }
    if (result.success !== undefined) {
      if (result.success && result.data) {
        return result.data as Product;
      } else {
        throw new Error(result.error || result.message || 'Unknown API error');
      }
    }

    // Case 2: API langsung balikin object produk { id, title, ... }
    if (result.id && result.title) {
      return result as Product;
    }

    throw new Error("Unexpected API response structure");
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};

/**
 * Search products by title
 */
export const searchProducts = async (query: string, limit: number = 10): Promise<Product[]> => {
  try {
    const response = await getProducts({
      title: query,
      limit: limit
    });
    return response.data;
  } catch (error) {
    console.error("Error searching products:", error);
    throw error;
  }
};

/**
 * Get products by category
 */
export const getProductsByCategory = async (category: string, params?: Omit<ProductListParams, 'category'>): Promise<ProductListResponse> => {
  try {
    return await getProducts({
      ...params,
      category: category
    });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    throw error;
  }
};

/**
 * Get featured or top rated products
 */
export const getFeaturedProducts = async (limit: number = 8): Promise<Product[]> => {
  try {
    const response = await getProducts({
      sort_field: 'Rating',
      sort_dir: 'DESC',
      limit: limit
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching featured products:", error);
    throw error;
  }
};