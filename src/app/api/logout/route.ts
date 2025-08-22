import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Ambil token dari body request (atau bisa juga dari cookies)
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { message: "Missing access token" },
        { status: 401 }
      );
    }

    // Kirim request ke backend logout
    const res = await fetch("http://localhost:8080/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "cedda26683fec3a6c46fbf647946e666",
        "Authorization": `Bearer ${token}`,
      },
    });

    const data = await res.json();

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
