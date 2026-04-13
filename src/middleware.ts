import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import withAuth from "./middleware/withAuth";

export function MainMiddleware(request: NextRequest) {
    return NextResponse.next();
}

export default withAuth(MainMiddleware, [
  "/dashboard",
  "/devices",
  "/history",
]);

export const config = {
  matcher: [
     '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
