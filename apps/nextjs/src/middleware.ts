import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

const middleware = withAuth((req) => {
  if (req.nextUrl.pathname === "/") {
    return NextResponse.redirect(`${req.nextUrl.origin}/home`);
  }
});

export const config = {
  matcher: ["/", "/home", "/post", "/account"],
};

export default middleware;
