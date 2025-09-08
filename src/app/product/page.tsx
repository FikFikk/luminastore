import { buildPageMetadata } from "@/services/metadataHelper";
import ProductClient from "@/app/components/ProductClient"; 

export async function generateMetadata() {
  return buildPageMetadata("Product");
}

export default function ProductPage() {
  return <ProductClient />;
}
