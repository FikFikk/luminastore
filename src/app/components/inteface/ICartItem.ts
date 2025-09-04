export interface ICartItem {
  id: number;
  product_id: number;
  product_title: string;
  variant_id: number;
  variant_title: string;
  quantity: number;
  price: number;
  total_price: number;
  sub_total: number;
  weight?: number;
  total_weight?: number;
  available_stock?: number;
  insufficient_stock?: boolean;
}