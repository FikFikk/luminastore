"use client";

import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
  backgroundGradient?: string;
}

export default function AuthLayout({ 
  children, 
  backgroundGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
}: AuthLayoutProps) {
  return (
    <div 
      className="min-vh-100 d-flex align-items-center justify-content-center py-5" 
      style={{
        background: backgroundGradient,
        fontFamily: 'var(--font-geist-sans)'
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6 col-xl-5">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}