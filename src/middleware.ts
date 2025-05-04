// File: middleware.ts (atau middleware.js) di root project (sibling dari folder pages/app)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // Daftar halaman yang boleh diakses tanpa auth
  const publicPaths = [
    "/login",
    "/register",
    "/api/auth/login",
    "/api/auth/register",
    "/api/testdb"

  ];

  // Cek jika path saat ini adalah public path
  const isPublicPath = publicPaths.some((path) => 
    pathname.startsWith(path)
  );
  if (!token && !isPublicPath) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }
  

  // Jika mencoba mengakses protected path tanpa token
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Jika sudah login tapi mencoba mengakses login/register
  if (token && (pathname.startsWith("/login") || pathname.startsWith("/register"))) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth (auth API routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};