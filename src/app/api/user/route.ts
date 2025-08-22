import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  console.log("🔍 API /api/user dipanggil");
  
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    console.log("🍪 Token dari cookies:", token ? `${token.substring(0, 20)}...` : "tidak ada");

    if (!token) {
      console.log("❌ Token tidak ditemukan");
      return NextResponse.json({ error: "Token tidak ditemukan" }, { status: 401 });
    }

    console.log("🔄 Mengirim request ke backend untuk mendapatkan user data...");

    const res = await fetch("http://localhost:8080/api/user", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "x-api-key": process.env.API_KEY || "cedda26683fec3a6c46fbf647946e666",
        "Authorization": `Bearer ${token}`,
      },
    });

    console.log("📡 Backend response status:", res.status);

    // Cek apakah response adalah JSON
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await res.text();
      console.error("❌ Non-JSON response dari backend:", text.substring(0, 200));
      return NextResponse.json({ error: "Backend error" }, { status: 502 });
    }

    const data = await res.json();
    console.log("📦 User data dari backend:", data);

    return NextResponse.json(data, { status: res.status });
    
  } catch (error) {
    console.error("💥 Error di API user:", error);
    return NextResponse.json(
      { error: "Server error" }, 
      { status: 500 }
    );
  }
}