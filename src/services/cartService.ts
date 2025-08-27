import Cookies from "js-cookie";

const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE!}/cart`;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY!;

const getAuthHeaders = () => {
  const token = Cookies.get("token"); 
  return {
    "x-api-key": API_KEY,
    "Authorization": token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  };
};

export interface CartItem {
  id: number;
  product_id: number;
  product_title: string;
  variant_id: number;
  variant_title: string;
  quantity: number;
  price: number;
  total_price: number;
  weight?: number;
  total_weight?: number;
  available_stock?: number;
  insufficient_stock?: boolean;
}

export interface CartSummary {
  total_items: number;
  total_price: number;
  total_weight: number;
  items_count: number;
}

export interface Cart {
  items: CartItem[];
  summary: CartSummary;
}

export interface AddToCartParams {
  product_id: number;
  variant_id?: number;
  quantity: number;
}

export interface UpdateCartParams {
  quantity: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  cart_item?: CartItem;
  items?: CartItem[];
  summary?: CartSummary;
}

/**
 * Add item to cart
 */
export const addToCart = async (params: AddToCartParams): Promise<CartItem> => {
  try {
    const response = await fetch(`${API_BASE}/add_to_cart`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(params),
      mode: 'cors',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const result: ApiResponse<CartItem> = await response.json();
    console.log("Add to cart result:", result);

    if (result.success && result.cart_item) {
      return result.cart_item;
    } else {
      throw new Error(result.error || result.message || 'Failed to add item to cart');
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
};

/**
 * Get cart items
 */
export const getCart = async (): Promise<Cart> => {
  try {
    const response = await fetch(`${API_BASE}/get_cart`, {
      method: "GET",
      headers: getAuthHeaders(),
      mode: 'cors',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const result: ApiResponse<Cart> = await response.json();
    console.log("Get cart result:", result);

    if (result.success) {
      return {
        items: result.items ?? [],
        summary: result.summary ?? {
          total_items: 0,
          total_price: 0,
          total_weight: 0,
          items_count: 0
        }
      };
    } else {
      throw new Error(result.error || result.message || 'Failed to get cart');
    }
  } catch (error) {
    console.error("Error getting cart:", error);
    throw error;
  }
};

/**
 * Update cart item quantity
 */
export const updateCartItem = async (cartId: number, params: UpdateCartParams): Promise<CartItem> => {
  try {
    const response = await fetch(`${API_BASE}/update_cart_item/${cartId}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(params),
      mode: 'cors',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const result: ApiResponse<CartItem> = await response.json();
    console.log("Update cart item result:", result);

    if (result.success && result.cart_item) {
      return result.cart_item;
    } else {
      throw new Error(result.error || result.message || 'Failed to update cart item');
    }
  } catch (error) {
    console.error("Error updating cart item:", error);
    throw error;
  }
};

/**
 * Remove item from cart
 */
export const removeCartItem = async (cartId: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE}/remove_cart_item/${cartId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      mode: 'cors',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const result: ApiResponse<void> = await response.json();
    console.log("Remove cart item result:", result);

    if (!result.success) {
      throw new Error(result.error || result.message || 'Failed to remove cart item');
    }
  } catch (error) {
    console.error("Error removing cart item:", error);
    throw error;
  }
};

/**
 * Clear all cart items
 */
export const clearCart = async (): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE}/clear_cart`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      mode: 'cors',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const result: ApiResponse<void> = await response.json();
    console.log("Clear cart result:", result);

    if (!result.success) {
      throw new Error(result.error || result.message || 'Failed to clear cart');
    }
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw error;
  }
};

/**
 * Format price to Indonesian Rupiah
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};