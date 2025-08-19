import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
// import "@/app/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Acorn Admin Template",
  description: "Page",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />

        {/* ===================== Favicons ===================== */}
        <link rel="apple-touch-icon" sizes="57x57" href="/assets/img/favicon/apple-touch-icon-57x57.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/assets/img/favicon/apple-touch-icon-114x114.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/assets/img/favicon/apple-touch-icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/assets/img/favicon/apple-touch-icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/assets/img/favicon/apple-touch-icon-60x60.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/assets/img/favicon/apple-touch-icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/assets/img/favicon/apple-touch-icon-76x76.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/assets/img/favicon/apple-touch-icon-152x152.png" />
        <link rel="icon" type="image/png" sizes="196x196" href="/assets/img/favicon/favicon-196x196.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/assets/img/favicon/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/assets/img/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/assets/img/favicon/favicon-16x16.png" />

        {/* ===================== Fonts ===================== */}
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@300;400;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;700&display=swap"
          rel="stylesheet"
        />

        {/* ===================== Vendor CSS ===================== */}
        <link rel="stylesheet" href="/assets/css/vendor/bootstrap.min.css" />
        <link rel="stylesheet" href="/assets/css/vendor/OverlayScrollbars.min.css" />

        {/* ===================== Template CSS ===================== */}
        <link rel="stylesheet" href="/assets/css/styles.css" />
        <link rel="stylesheet" href="/assets/css/main.css" />
        {/* <link rel="stylesheet" href="/assets/font/CS-Interface/style.css" /> */}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}  

        {/* ===================== Vendor Scripts ===================== */}
        <Script src="/assets/js/vendor/jquery-3.5.1.min.js" strategy="beforeInteractive" />
        <Script src="/assets/js/vendor/bootstrap.bundle.min.js" strategy="beforeInteractive" />
        <Script src="/assets/js/vendor/OverlayScrollbars.min.js" strategy="beforeInteractive" />
        <Script src="/assets/js/vendor/autoComplete.min.js" strategy="afterInteractive" />
        <Script src="/assets/js/vendor/clamp.min.js" strategy="afterInteractive" />

        {/* ===================== Template Scripts ===================== */}
        <Script src="/assets/font/CS-Line/csicons.min.js" strategy="afterInteractive" />
        <Script src="/assets/js/base/helpers.js" strategy="afterInteractive" />
        <Script src="/assets/js/base/globals.js" strategy="afterInteractive" />
        <Script src="/assets/js/base/nav.js" strategy="afterInteractive" />
        <Script src="/assets/js/base/search.js" strategy="afterInteractive" />
        <Script src="/assets/js/base/settings.js" strategy="afterInteractive" />
        <Script src="/assets/js/base/init.js" strategy="afterInteractive" />

        {/* ===================== Page Scripts ===================== */}
        <Script src="/assets/js/common.js" strategy="afterInteractive" />
        <Script src="/assets/js/scripts.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
