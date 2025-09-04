import { IOrderListItem } from "./IOrderListItem";

export interface IOrderListResponse {
  orders: IOrderListItem[];
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