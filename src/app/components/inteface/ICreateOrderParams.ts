export interface ICreateOrderParams {
  cart_ids: number[];
  address_id: number;
  payment_method: string;
  courier: string;
  service: string;
  notes?: string;
}
