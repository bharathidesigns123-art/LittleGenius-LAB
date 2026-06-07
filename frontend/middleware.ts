import { NextRequest, NextResponse } from "next/server";

const maintenanceMode =
  process.env.MAINTENANCE_MODE === "1" ||
  process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "1";

export function middleware(request: NextRequest) {
  if (!maintenanceMode) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const isMaintenancePage = pathname === "/maintenance";
  const isAllowedAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/site.webmanifest" ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".webmanifest") ||
    pathname.endsWith(".json");

  if (isMaintenancePage || isAllowedAsset) {
    return NextResponse.next();
  }

  const maintenanceUrl = request.nextUrl.clone();
  maintenanceUrl.pathname = "/maintenance";
  maintenanceUrl.search = "";
  return NextResponse.redirect(maintenanceUrl);
}

export const config = {
  matcher: [
    "/((?!_next|static|api|favicon.ico|robots.txt|sitemap.xml|site.webmanifest).*)",
  ],
};
