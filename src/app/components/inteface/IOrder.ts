export interface IOrder {
  id: number;
  reference: string;
  payment_status: string;
  shipping_status: string;
  created_at: string;
  updated_at: string;
  courier: string;
  service: string;
  etd: string | null;
  estimated_delivery: string | null;
  estimated_delivery_formatted: string | null;
  is_delivery_overdue: boolean;
  payment_url: string | null;
  payment_method_code: string;
  fee: number;
  fee_formatted: string;
  total_items: number;
  total_quantity: number;
  can_cancel: boolean;
  can_pay: boolean;
  is_paid: boolean;
  is_delivered: boolean;
  tracking_number: string | null;
  expired_at: string | null;
  is_expired: boolean;
}