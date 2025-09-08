import { buildPageMetadata } from "@/services/metadataHelper";
import AboutClient from "@/app/components/AboutClient";

export async function generateMetadata() {
  return buildPageMetadata("About");
}

export default function CheckoutPage() {
  return <AboutClient />;
}
