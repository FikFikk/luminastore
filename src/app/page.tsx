import { buildPageMetadata } from "@/services/metadataHelper";
import Home from "@/app/components/HomeClient";

export async function generateMetadata() {
  return buildPageMetadata("Home");
}

export default function HomePage() {
  return <Home />;
}
