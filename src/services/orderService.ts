import Cookies from "js-cookie";

const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE!}/payment`;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY!;

const getAuthHeaders = () => {
  const token = Cookies.get("token");
  return {
    "x-api-key": API_KEY,
    "Authorization": token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  };
};

export interface Order {
  ID: number;
  OrderNumber: string;
  Status: string;
  PaymentStatus: string;
  ShippingStatus: string;
  TotalAmount: number;
  ShippingCost: number;
  Items: OrderItem[];
  ShippingAddress: OrderAddress;
  PaymentMethod: string;
  PaymentReference: string;
  CourierService: string;
  TrackingNumber?: string;
  Notes?: string;
  Created: string;
  LastEdited: string;
}

export interface OrderItem {
  ProductID: number;
  ProductTitle: string;
  VariantID?: number;
  VariantTitle?: string;
  Quantity: number;
  Price: number;
  TotalPrice: number;
}

export interface OrderAddress {
  Title: string;
  Alamat: string;
  KodePos: string;
  Kecamatan: string;
  Kota: string;
  Provinsi: string;
}

// Updated interface to match API structure
export interface CreateOrderParams {
  cart_ids: number[];
  address_id: number;
  payment_method: string;
  courier: string;
  service: string;
  notes?: string;
}

export interface OrderListParams {
  page?: number;
  per_page?: number;
  status?: string;
  payment_status?: string;
  shipping_status?: string;
}

export interface OrderListResponse {
  orders: Order[];
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
  statistics: {
    total_orders: number;
    pending_orders: number;
    paid_orders: number;
    delivered_orders: number;
  };
  filters: {
    status: string | null;
    payment_status: string | null;
    shipping_status: string | null;
  };
}

export interface PaymentResponse {
  success: boolean;
  message?: string;
  data?: {
    order_id: number;
    payment_url?: string;
    payment_reference?: string;
    qr_code?: string;
    va_number?: string;
    amount: number;
    expired_date?: string;
  };
  error?: string;
}

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
}

/**
 * Create new order
 */
export const createOrder = async (params: CreateOrderParams): Promise<PaymentResponse> => {
  try {
    console.log("Creating order with params:", params);
    
    const response = await fetch(`${API_BASE}/create_order`, {
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

    const result: PaymentResponse = await response.json();
    console.log("Create order result:", result);

    if (result.success) {
      return result;
    } else {
      throw new Error(result.error || result.message || 'Failed to create order');
    }
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

/**
 * Get order list
 */
export const getOrderList = async (params?: OrderListParams): Promise<OrderListResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.payment_status) queryParams.append('payment_status', params.payment_status);
    if (params?.shipping_status) queryParams.append('shipping_status', params.shipping_status);

    const url = `${API_BASE}/list_orders${queryParams.toString() ? `?${queryParams}` : ''}`;
    
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

    const result: OrderListResponse = await response.json();
    console.log("Get order list result:", result);

    return result;
  } catch (error) {
    console.error("Error getting order list:", error);
    throw error;
  }
};

/**
 * Get order by ID
 */
export const getOrderById = async (orderId: number): Promise<Order> => {
  try {
    const response = await fetch(`${API_BASE}/show_order/${orderId}`, {
      method: "GET",
      headers: getAuthHeaders(),
      mode: 'cors',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const result: ApiResponse<Order> = await response.json();
    console.log("Get order result:", result);

    if (result.data) {
      return result.data;
    } else {
      throw new Error(result.error || result.message || 'Failed to get order');
    }
  } catch (error) {
    console.error("Error getting order:", error);
    throw error;
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (orderId: number, status: string): Promise<Order> => {
  try {
    const response = await fetch(`${API_BASE}/update_order_status/${orderId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
      mode: 'cors',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const result: ApiResponse<Order> = await response.json();
    console.log("Update order status result:", result);

    if (result.data) {
      return result.data;
    } else {
      throw new Error(result.error || result.message || 'Failed to update order status');
    }
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

/**
 * Cancel order
 */
export const cancelOrder = async (orderId: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE}/cancel_order/${orderId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      mode: 'cors',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const result: ApiResponse<void> = await response.json();
    console.log("Cancel order result:", result);

    if (result.success === false) {
      throw new Error(result.error || result.message || 'Failed to cancel order');
    }
  } catch (error) {
    console.error("Error cancelling order:", error);
    throw error;
  }
};

/**
 * Format order status
 */
export const formatOrderStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'pending': 'Menunggu Pembayaran',
    'paid': 'Dibayar',
    'processing': 'Diproses',
    'shipped': 'Dikirim',
    'delivered': 'Terkirim',
    'cancelled': 'Dibatalkan',
    'refunded': 'Dikembalikan'
  };
  
  return statusMap[status.toLowerCase()] || status;
};

/**
 * Format payment status
 */
export const formatPaymentStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'pending': 'Menunggu',
    'paid': 'Lunas',
    'failed': 'Gagal',
    'expired': 'Kadaluarsa',
    'cancelled': 'Dibatalkan'
  };
  
  return statusMap[status.toLowerCase()] || status;
};