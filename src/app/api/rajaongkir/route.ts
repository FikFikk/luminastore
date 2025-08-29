// app/api/rajaongkir/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const limit = searchParams.get("limit") || "3";
  const offset = searchParams.get("offset") || "0";

  if (!search.trim()) {
    return NextResponse.json({ data: [] });
  }

  try {
    const response = await fetch(
      `https://rajaongkir.komerce.id/api/v1/destination/domestic-destination?search=${encodeURIComponent(
        search
      )}&limit=${limit}&offset=${offset}`,
      {
        headers: {
          key: process.env.NEXT_PUBLIC_RAJAONGKIR_API_KEY!,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("RajaOngkir API Response:", data); // Debug log
    
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("RajaOngkir API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}