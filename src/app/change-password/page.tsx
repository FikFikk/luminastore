import { buildPageMetadata } from "@/services/metadataHelper";
import ChangePasswordClient from "@/app/components/ChangePasswordClient";

export async function generateMetadata() {
  return buildPageMetadata("Change Password");
}

export default function CheckoutPage() {
  return <ChangePasswordClient />;
}
