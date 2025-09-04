import { IImage } from "./IImage";

export interface IOrderItem {
  id: number;
  product_id: number;
  product_title: string;
  product_slug: string | null;
  product_image: IImage | null;
  variant_id: number | null;
  variant_title: string | null;
  quantity: number;
  price: number;
  weight: number;
  subtotal: number;
  price_formatted: string;
  subtotal_formatted: string;
}