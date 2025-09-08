import { utilsService } from "./utilsService";

export async function buildPageMetadata(pageTitle: string) {
  const siteConfig = await utilsService.getSiteConfig();
  return {
    title: `${pageTitle} | ${siteConfig?.site_name || "My Website"}`,
    description: siteConfig?.tagline || "",
  };
}
