export interface IShippingAddress {
  id: number;
  recipient_name: string;
  phone_number: string | null;
  address_line: string;
  postal_code: string;
  province: string;
  city: string;
  district: string;
  sub_district: string | null;
  full_address: string;
}