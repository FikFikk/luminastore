import { buildPageMetadata } from "@/services/metadataHelper";
import ProfileClient from "@/app/components/ProfileClient";

export async function generateMetadata() {
  return buildPageMetadata("Profile");
}

export default function CheckoutPage() {
  return <ProfileClient />;
}
