import { IApiResponse } from "@/app/components/inteface/IApiResponse";
import { ICreateOrderParams } from "@/app/components/inteface/ICreateOrderParams";
import { IOrder } from "@/app/components/inteface/IOrder";
import { IOrderDetailResponse } from "@/app/components/inteface/IOrderDetailResponse";
import { IOrderListResponse } from "@/app/components/inteface/IOrderListResponse";
import { IOrderListParams } from "@/app/components/inteface/IOrderParams";
import { IPaymentResponse } from "@/app/components/inteface/IPaymentResponse";
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

/**
 * Create new order
 */
export const createOrder = async (params: ICreateOrderParams): Promise<IPaymentResponse> => {
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

    const result: IPaymentResponse = await response.json();
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
export const getOrderList = async (params?: IOrderListParams): Promise<IOrderListResponse> => {
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

    const result: IOrderListResponse = await response.json();
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
export const getOrderById = async (orderId: number): Promise<IOrderDetailResponse> => {
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
      return result as IOrderDetailResponse;
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
export const updateOrderStatus = async (orderId: number, status: string): Promise<IOrder> => {
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

    const result: IApiResponse<IOrder> = await response.json();
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

    const result: IApiResponse<void> = await response.json();
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