// File: app/api/auth/forgot-password/route.ts
// PERHATIAN: Gunakan forgot-password (dengan dash), bukan forgot_password (dengan underscore)

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log("API Route POST called"); // Debug log
  
  try {
    const body = await req.json();
    console.log("Request body:", body); // Debug log

    // Validasi input
    if (!body.Email) {
      return NextResponse.json(
        { message: "Email harus diisi" },
        { status: 400 }
      );
    }

    // Validasi email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.Email)) {
      return NextResponse.json(
        { message: "Format email tidak valid" },
        { status: 400 }
      );
    }

    const backendUrl = "http://localhost:8080/api/auth/forgot_password";
    console.log("Calling backend:", backendUrl); // Debug log

    const res = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "x-api-key": process.env.API_KEY || "cedda26683fec3a6c46fbf647946e666",
      },
      body: JSON.stringify(body),
    });

    console.log("Backend response status:", res.status); // Debug log

    // Cek apakah backend server bisa diakses
    if (!res.ok && res.status >= 500) {
      return NextResponse.json(
        { message: "Server sedang dalam pemeliharaan. Silakan coba lagi nanti." },
        { status: 503 }
      );
    }

    // Cek apakah response adalah JSON
    const contentType = res.headers.get("content-type");
    console.log("Backend content-type:", contentType); // Debug log
    
    if (!contentType || !contentType.includes("application/json")) {
      const textResponse = await res.text();
      console.log("Non-JSON response:", textResponse); // Debug log
      
      return NextResponse.json(
        { message: "Terjadi kesalahan pada server. Silakan coba lagi." },
        { status: 502 }
      );
    }

    const data = await res.json();
    console.log("Backend response data:", data); // Debug log

    // Handle specific error messages dari backend
    if (!res.ok) {
      let errorMessage = data.message || "Gagal mengirim email reset";
      
      // Customize error messages for better UX
      if (errorMessage.includes("User not found")) {
        errorMessage = "Email tidak ditemukan dalam sistem kami. Periksa kembali email Anda.";
      } else if (errorMessage.includes("API Client not found")) {
        errorMessage = "Terjadi kesalahan konfigurasi sistem. Hubungi administrator.";
      }
      
      return NextResponse.json(
        { message: errorMessage },
        { status: res.status }
      );
    }

    // Success response - customize message
    const successMessage = data.message || "Email reset password telah dikirim";
    
    return NextResponse.json(
      { 
        message: successMessage,
        status: "success"
      }, 
      { status: 200 }
    );
    
  } catch (error) {
    console.error('API Route error:', error); // Debug log
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        { message: "Tidak dapat terhubung ke server backend. Pastikan backend sedang berjalan di localhost:8080." },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { message: "Terjadi kesalahan internal. Silakan coba lagi." },
      { status: 500 }
    );
  }
}

export async function GET() {
  console.log("API Route GET called"); // Debug log
  return NextResponse.json({ 
    message: "Forgot Password API is running", 
    timestamp: new Date().toISOString(),
    route: "forgot-password"
  });
}