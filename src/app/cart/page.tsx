import { buildPageMetadata } from "@/services/metadataHelper";
import CartClient from "@/app/components/CartClient"; 

export async function generateMetadata() {
  return buildPageMetadata("Cart");
}

export default function CartPage() {
  return <CartClient />;
}
