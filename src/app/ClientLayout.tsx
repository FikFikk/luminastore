"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showHeader, setShowHeader] = useState(true);
  const [checkedAuth, setCheckedAuth] = useState(false); // 🔹 state untuk menunggu cek login

  useEffect(() => {
    const token = Cookies.get("token");

    if (pathname === "/auth/login" || pathname === "/auth/register" || pathname === "/auth/forgot-password") {
      setShowHeader(false);
      if (token) {
        router.replace("/"); // redirect jika sudah login
      } else {
        setCheckedAuth(true); // bisa render login/register
      }
    } else {
      setShowHeader(true);
      if (!token) {
        router.replace("/auth/login"); // redirect jika belum login
      } else {
        setCheckedAuth(true); // bisa render halaman private
      }
    }
  }, [pathname, router]);

  // 🔹 tampilkan loading sementara cek auth
  if (!checkedAuth) return <div className="min-vh-100 d-flex justify-content-center align-items-center">Loading...</div>;

  return (
    <>
      {showHeader && <Header />}
      {children}
      {showHeader && <Footer />}
    </>
  );
}
