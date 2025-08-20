import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function middleware(request: NextRequest) {
  const cookieStore = await cookies(); // ✅ sekarang memang async
  const token = cookieStore.get("token")?.value;

  const url = request.nextUrl;

  // Redirect jika sudah login
  if ((url.pathname === "/login" || url.pathname === "/register") && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirect ke login jika belum login
  const protectedPages = ["/", "/dashboard"];
  if (protectedPages.includes(url.pathname) && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard", "/login", "/register"],
};
