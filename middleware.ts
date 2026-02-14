import { NextRequest, NextResponse } from "next/server";

const decodeJwtPayload = (token: string): Record<string, any> | null => {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized);
    const json = decodeURIComponent(
      decoded
        .split("")
        .map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join(""),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("accessToken")?.value;
  const payload = token ? decodeJwtPayload(token) : null;
  const memberType = payload?.memberType;

  const isDoctorRoute = pathname.startsWith("/_doctor");
  const isAdminRoute = pathname.startsWith("/_admin");
  const isMemberPrivateRoute = pathname.startsWith("/mypage");
  const isHomeRoute = pathname === "/";

  if (isHomeRoute && token) {
    if (memberType === "DOCTOR") {
      return NextResponse.redirect(new URL("/_doctor", req.url));
    }
    if (memberType === "ADMIN") {
      return NextResponse.redirect(new URL("/_admin", req.url));
    }
  }

  if (isMemberPrivateRoute && !token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (isDoctorRoute) {
    if (!token || memberType !== "DOCTOR") {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  if (isAdminRoute) {
    if (!token || memberType !== "ADMIN") {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/_doctor/:path*", "/_admin/:path*", "/mypage", "/mypage/:path*"],
};
