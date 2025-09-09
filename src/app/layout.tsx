// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ClientLayout from "./ClientLayout";
import { Providers } from '@/store/providers';
import AuthProvider from "@/store/AuthProvider";
import { utilsService } from "@/services/utilsService";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await utilsService.getSiteConfig();

  const metadata: Metadata = {
    title: siteConfig?.site_name,
    description: siteConfig?.tagline,
  };

  // hanya tambah icons kalau ada favicon
  if (siteConfig?.favicon?.original) {
    metadata.icons = {
      icon: [
        {
          url: siteConfig.favicon.original,
        },
      ],
    };
  }

  return metadata;
}


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteConfig = await utilsService.getSiteConfig();

  return (
    <html lang="en">
      <head>
		{/* Dynamic title & description */}
		<title>{siteConfig?.site_name || "My Website"}</title>
        <meta
          name="description"
          content={siteConfig?.tagline || "Welcome to my site"}
        />

        {/* Dynamic favicon */}
        {siteConfig?.favicon?.original && (
          <link rel="icon" href={siteConfig.favicon.original} sizes="any" />
        )}

        {/* Bootstrap */}
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC"
          crossOrigin="anonymous"
        />

        {/* Font Awesome */}
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
          rel="stylesheet"
        />

        {/* Local CSS */}
        <link href="/assets/css/bootstrap.min.css" rel="stylesheet" />
        <link href="/assets/css/tiny-slider.css" rel="stylesheet" />
        <link href="/assets/css/style.css" rel="stylesheet" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>
          <AuthProvider>
            <ClientLayout>{children}</ClientLayout>
          </AuthProvider>
        </Providers>

        {/* JS Bootstrap bundle */}
        <Script
          src="/assets/js/bootstrap.bundle.min.js"
          strategy="beforeInteractive"
        />
        <Script src="/assets/js/tiny-slider.js" strategy="afterInteractive" />
        <Script src="/assets/js/custom.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
