import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import withAuth from "./middleware/withAuth";
import { getToken } from "next-auth/jwt";

export async function MainMiddleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // get token buat cek user udah login apa belum
    const token = await getToken({ 
        req: request, 
        secret: process.env.NEXTAUTH_SECRET 
    });

    // Jika user sudah ada token dan nyoba akses landing page (/) atau halaman auth
    if (token) {
        if (pathname.startsWith("/auth")) {
            // arahin ke dashboard
            if (token.role === "admin") {
                return NextResponse.redirect(new URL("/admin", request.url));
            } else {
                return NextResponse.redirect(new URL("/dashboard", request.url));
            }
        }

        if (token.role === "admin") {
            if (pathname.startsWith("/dashboard") || pathname.startsWith("/devices") || pathname.startsWith("/history")) {
                return NextResponse.redirect(new URL("/admin", request.url));
            }
        }
    }

    return NextResponse.next();
}

export default withAuth(MainMiddleware, [
  "/dashboard",
  "/devices",
  "/history",
  "/admin",
  "/admin/users",
  "/admin/devices"
]);

export const config = {
  matcher: [
     '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
