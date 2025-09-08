import { buildPageMetadata } from "@/services/metadataHelper";
import OrderClient from "@/app/components/OrderClient"; 

export async function generateMetadata() {
  return buildPageMetadata("Order");
}

export default function OrderPage() {
  return <OrderClient />;
}
