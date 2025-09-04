import { ICustomer } from "@/services/ICustomer";
import { IShippingAddress } from "./IShippingAddress";
import { IOrderItem } from "./IOrderItem";
import { IOrderDetail } from "./IOrderDetail";

export interface IOrderDetailResponse {
  expired_at: string;
  is_expired: string;
  order: IOrderDetail;
  items: IOrderItem[];
  customer: ICustomer;
  shipping_address: IShippingAddress | null;

  can_cancel: boolean;
  can_pay: boolean;
  is_paid: boolean;
  is_delivered: boolean;
  tracking_number?: string | null;
  tracking_url?: string | null;
}