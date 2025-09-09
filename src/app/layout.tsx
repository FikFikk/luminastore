// app/layout.tsx - KODE FINAL
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

// Generate metadata dinamis
export async function generateMetadata(): Promise<Metadata> {
  try {
    const siteConfig = await utilsService.getSiteConfig();
    const faviconUrl = siteConfig?.favicon?.original;
    
    // Deteksi type favicon yang akurat
    let iconConfig = {};
    
    if (faviconUrl) {
      const url = faviconUrl.toLowerCase();
      
      if (url.endsWith('.png')) {
        iconConfig = {
          icon: [
            { url: faviconUrl, type: 'image/png', sizes: '32x32' },
            { url: faviconUrl, type: 'image/png', sizes: '16x16' },
          ],
          apple: { url: faviconUrl, sizes: '180x180' },
          shortcut: { url: faviconUrl, type: 'image/png' },
        };
      } else if (url.endsWith('.ico')) {
        iconConfig = {
          icon: { url: faviconUrl, type: 'image/x-icon' },
          shortcut: { url: faviconUrl, type: 'image/x-icon' },
        };
      } else if (url.endsWith('.svg')) {
        iconConfig = {
          icon: { url: faviconUrl, type: 'image/svg+xml' },
          shortcut: { url: faviconUrl, type: 'image/svg+xml' },
        };
      } else {
        iconConfig = { icon: faviconUrl };
      }
    }

    return {
      title: siteConfig?.site_name || "LuminaStore.",
      description: siteConfig?.tagline || "Your tagline here",
      icons: iconConfig,
      // keywords: siteConfig?.keywords || "ecommerce, online shop, store",
      authors: [{ name: siteConfig?.site_name || "LuminaStore" }],
      creator: siteConfig?.site_name || "LuminaStore",
      robots: {
        index: true,
        follow: true,
      },
      // Open Graph untuk social media
      openGraph: {
        title: siteConfig?.site_name || "LuminaStore.",
        description: siteConfig?.tagline || "Your tagline here",
        siteName: siteConfig?.site_name || "LuminaStore.",
        images: faviconUrl ? [
          {
            url: faviconUrl,
            width: 1200,
            height: 630,
            alt: siteConfig?.site_name || "LuminaStore.",
          }
        ] : [],
        locale: 'id_ID',
        type: 'website',
      },
      // Twitter Card
      twitter: {
        card: 'summary_large_image',
        title: siteConfig?.site_name || "LuminaStore.",
        description: siteConfig?.tagline || "Your tagline here",
        images: faviconUrl ? [faviconUrl] : [],
      },
      // Force no cache
      other: {
        'cache-control': 'no-cache, no-store, must-revalidate',
        'pragma': 'no-cache',
        'expires': '0'
      }
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: "LuminaStore.",
      description: "Your tagline here",
      icons: {
        icon: "/favicon.ico",
      }
    };
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Force no cache untuk metadata */}
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        
        {/* Viewport */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Bootstrap CDN */}
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

        {/* Bootstrap JS */}
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        {/* Local JS */}
        <Script src="/assets/js/bootstrap.bundle.min.js" strategy="beforeInteractive" />
        <Script src="/assets/js/tiny-slider.js" strategy="afterInteractive" />
        <Script src="/assets/js/custom.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}