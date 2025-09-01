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

// Updated interfaces to match backend response
export interface Order {
  id: number;
  reference: string;
  payment_status: string;
  shipping_status: string;
  created_at: string;
  updated_at: string;
  subtotal: number;
  shipping_cost: number;
  total_price: number;
  subtotal_formatted: string;
  shipping_cost_formatted: string;
  total_price_formatted: string;
  courier: string;
  service: string;
  etd: string | null;                    // ETD mentah dari RajaOngkir
  estimated_delivery: string | null;
  estimated_delivery_formatted: string | null;
  payment_url: string | null;
  payment_method_code: string;
  payment_method: string;
  fee: number;
  fee_formatted: number;
  total_items: number;
  total_quantity: number;
  can_cancel: boolean;
  can_pay: boolean;
  is_paid: boolean;
  is_delivered: boolean;
  is_delivery_overdue: boolean;
  tracking_number: string | null;
  has_tracking: boolean;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_title: string;
  product_slug: string | null;
  product_image: {
    small: string;
    medium: string;
    large?: string;
  } | null;
  variant_id: number | null;
  variant_title: string | null;
  quantity: number;
  price: number;
  weight: number;
  subtotal: number;
  price_formatted: string;
  subtotal_formatted: string;
}

export interface Customer {
  id: number;
  name: string;
  first_name: string;
  surname: string;
  email: string;
  phone: string | null;
}

export interface ShippingAddress {
  id: number;
  recipient_name: string;
  phone_number: string;
  address_line: string;
  postal_code: string;
  province: string;
  city: string;
  district: string;
  sub_district: string | null;
  full_address: string;
}

export interface OrderDetailResponse {
  order: Order;
  items: OrderItem[];
  customer: Customer;
  shipping_address: ShippingAddress | null;
}

// Interface for list orders (different structure)
export interface OrderListItem {
  id: number;
  reference: string;
  payment_status: string;
  shipping_status: string;
  created_at: string;
  updated_at: string;
  total_price: number;
  total_price_formatted: string;
  shipping_cost: number;
  shipping_cost_formatted: string;
  total_items: number;
  total_quantity: number;
  first_product: {
    id: number | null;
    title: string;
    slug: string | null;
    image: {
      small: string;
      medium: string;
    } | null;
  };
  courier: string;
  service: string;
  estimated_delivery: string | null;
  payment_method_code: string;
  payment_method: string;
  payment_url: string | null;
  can_cancel: boolean;
  can_pay: boolean;
  is_paid: boolean;
  is_delivered: boolean;
  tracking_number: string | null;
  has_tracking: boolean;
  status_label: string;
  status_color: string;
}

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
  limit?: number; // Changed from per_page to limit to match backend
  status?: string;
  payment_status?: string;
  shipping_status?: string;
}

export interface OrderListResponse {
  orders: OrderListItem[];
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
  order_id: number;
  total_amount: number;
  items_total: number;
  shipping_cost: number;
  total_weight: number;
  payment_fee: number;
  paymentUrl?: string;
  reference: string;
  message?: string;
  error?: string;
  qr_code?: string;
  va_number?: string;
  expired_date?: string;
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
    if (params?.limit) queryParams.append('limit', params.limit.toString()); // Changed from per_page
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
 * Get order by ID - Updated to match backend response structure
 */
export const getOrderById = async (orderId: number): Promise<OrderDetailResponse> => {
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

    const result = await response.json();
    console.log("Get order result:", result);

    // The backend returns the data directly, not wrapped in a data property
    if (result.order) {
      return result as OrderDetailResponse;
    } else {
      throw new Error('Invalid response format from server');
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
 * Format order status - Updated with Indonesian translations
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
 * Format payment status - Updated with Indonesian translations
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

/**
 * Format shipping status
 */
export const formatShippingStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'pending': 'Menunggu',
    'processing': 'Diproses',
    'shipped': 'Dikirim',
    'delivered': 'Terkirim'
  };
  
  return statusMap[status.toLowerCase()] || status;
};

/**
 * Get status badge class for styling
 */
export const getStatusBadgeClass = (status: string): string => {
  const statusClasses: Record<string, string> = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'paid': 'bg-blue-100 text-blue-800',
    'processing': 'bg-orange-100 text-orange-800',
    'shipped': 'bg-purple-100 text-purple-800',
    'delivered': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800',
    'refunded': 'bg-gray-100 text-gray-800',
    'failed': 'bg-red-100 text-red-800',
    'expired': 'bg-gray-100 text-gray-800'
  };
  return statusClasses[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

/**
 * Format currency to Indonesian Rupiah
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

/**
 * Format date to Indonesian locale
 */
export const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString));
};

/**
 * Check if order status can be updated
 */
export const canUpdateStatus = (currentStatus: string): boolean => {
  return !['delivered', 'cancelled', 'refunded'].includes(currentStatus.toLowerCase());
};

/**
 * Check if order can be cancelled
 */
export const canCancelOrder = (paymentStatus: string): boolean => {
  return ['pending'].includes(paymentStatus.toLowerCase());
};