"use client";

import Link from "next/link";
import ProfileForm from "@/app/components/ProfileForm";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function ProfilePage() {
  const { isAuthenticated } = useAuthGuard();

  if (!isAuthenticated) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-vh-100 py-5"
      style={{
        background: "linear-gradient(135deg, #3b5d50 0%, #2d4a42 100%)",
        fontFamily: "var(--font-geist-sans)"
      }}
    >
      <ProfileForm />
    </div>
  );
}