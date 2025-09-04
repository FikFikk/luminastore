export interface IPaymentResponse {
  success: boolean;
  order_id: number;
  total_amount: number;
  items_total: number;
  shipping_cost: number;
  total_weight: number;
  payment_fee: number;
  reference: string;
  paymentUrl?: string;
  message?: string;
  error?: string;
  qr_code?: string;
  va_number?: string;
  expired_date?: string;
}