import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validasi input
    if (!body.Email || !body.Password) {
      return NextResponse.json(
        { message: "Email dan password harus diisi" },
        { status: 400 }
      );
    }

    const backendUrl = "http://localhost:8080/api/auth/login";

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
    message: "Login API is running", 
    timestamp: new Date().toISOString() 
  });
}