import { NextResponse } from "next/server";
import { cookies } from "next/headers"; // ✅ gunakan ini

export async function GET() {
  const token = (await cookies()).get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch("http://localhost:8080/api/user", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "cedda26683fec3a6c46fbf647946e666",
      "Authorization": `Bearer ${token}`,
    },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
