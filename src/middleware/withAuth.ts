import { getToken } from "next-auth/jwt";
import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from "next/server";

const onlyAdmin = ["/admin"];

export default function withAuth(
  middleware: NextMiddleware,
  requireAuth: string[] = [],
) {
  return async (req: NextRequest, next: NextFetchEvent) => {
    const pathname = req.nextUrl.pathname;

    const isRequireAuth = requireAuth.some((route) =>
      pathname.startsWith(route),
    );

    if (isRequireAuth) {
      const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
      });

      if (!token) {
        const url = new URL("/auth/login", req.url);
        url.searchParams.set("callbackUrl", encodeURI(req.url));
        return NextResponse.redirect(url);
      }

      const isAdminRoute = onlyAdmin.some((route) =>
        pathname.startsWith(route),
      );
      if (token.role !== "admin" && isAdminRoute) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return middleware(req, next);
  };
}
