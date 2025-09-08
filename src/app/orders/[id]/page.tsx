import { buildPageMetadata } from "@/services/metadataHelper";
import OrderDetailClient from "@/app/components/OrderDetailClient"; 

export async function generateMetadata() {
  return buildPageMetadata("Detail");
}

export default function OrderDetailPage() {
  return <OrderDetailClient />;
}
