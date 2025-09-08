import { buildPageMetadata } from "@/services/metadataHelper";
import ProductDetailClient from "@/app/components/ProductDetailClient"; 

export async function generateMetadata() {
  return buildPageMetadata("Detail");
}

export default function ProductDetailPage() {
  return <ProductDetailClient />;
}
