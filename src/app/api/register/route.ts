import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validasi input
    if (!body.FirstName || !body.Surname || !body.Email || !body.Password) {
      return NextResponse.json(
        { message: "Nama depan, nama belakang, email, dan password harus diisi" },
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

    // Validasi password
    if (body.Password.length < 6) {
      return NextResponse.json(
        { message: "Password harus minimal 6 karakter" },
        { status: 400 }
      );
    }

    const backendUrl = "http://localhost:8080/api/auth/register";

    const res = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "x-api-key": process.env.API_KEY || "cedda26683fec3a6c46fbf647946e666",
      },
      body: JSON.stringify(body),
    });

    // Cek apakah backend server bisa diakses
    if (!res.ok && res.status >= 500) {
      return NextResponse.json(
        { message: "Server sedang dalam pemeliharaan. Silakan coba lagi nanti." },
        { status: 503 }
      );
    }

    // Cek apakah response adalah JSON
    const contentType = res.headers.get("content-type");
    
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json(
        { message: "Terjadi kesalahan pada server. Silakan coba lagi." },
        { status: 502 }
      );
    }

    const data = await res.json();

    // Handle specific error messages dari backend
    if (!res.ok) {
      let errorMessage = data.message || "Registrasi gagal";
      
      // Customize error messages for better UX
      if (errorMessage.includes("Email already registered")) {
        errorMessage = "Email sudah terdaftar. Silakan gunakan email lain atau login.";
      } else if (errorMessage.includes("Password cannot be the same")) {
        errorMessage = "Password tidak boleh sama dengan password sebelumnya.";
      }
      
      return NextResponse.json(
        { message: errorMessage },
        { status: res.status }
      );
    }
    
    return NextResponse.json(data, { status: res.status });
    
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        { message: "Tidak dapat terhubung ke server. Pastikan koneksi internet Anda stabil." },
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
  return NextResponse.json({ 
    message: "Register API is running", 
    timestamp: new Date().toISOString() 
  });
}