import { IImage } from "./IImage";
import { IOrder } from "./IOrder";

export interface IOrderListItem extends IOrder {
  total_price: number;
  total_price_formatted: string;
  shipping_cost: number;
  shipping_cost_formatted: string;

  first_product: {
    id: number | null;
    title: string;
    slug: string | null;
    image: IImage | null;
  };

  has_tracking: boolean;
}