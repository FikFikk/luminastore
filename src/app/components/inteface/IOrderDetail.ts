import { IOrder } from "./IOrder";

export interface IOrderDetail extends IOrder {
  subtotal: number;
  shipping_cost: number;
  total_price: number;
  subtotal_formatted: string;
  shipping_cost_formatted: string;
  total_price_formatted: string;
}