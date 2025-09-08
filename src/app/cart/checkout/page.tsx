import { buildPageMetadata } from "@/services/metadataHelper";
import CheckoutClient from "@/app/components/CheckoutClient";

export async function generateMetadata() {
  return buildPageMetadata("Checkout");
}

export default function CheckoutPage() {
  return <CheckoutClient />;
}
