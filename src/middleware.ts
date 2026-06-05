import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Content Security Policy - Previene XSS e injection attacks
  // NOTE: cdn.jsdelivr.net is allowed because the preview iframe (srcDoc)
  // needs to load Bootstrap CSS/JS and Bootstrap Icons from CDN.
  // Without this, the preview would render without any Bootstrap styles.
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https:; font-src 'self' https://cdn.jsdelivr.net; connect-src 'self'; frame-ancestors 'self' http: https:; base-uri 'self'; form-action 'self';"
  );

  // X-Frame-Options - Allow sandbox preview iframe while protecting against clickjacking
  response.headers.set("X-Frame-Options", "SAMEORIGIN");

  // X-Content-Type-Options - MIME sniffing prevention
  response.headers.set("X-Content-Type-Options", "nosniff");

  // X-XSS-Protection - Legacy XSS filter
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Referrer-Policy - Privacy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions-Policy (Feature-Policy) - Feature access control
  response.headers.set(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=(), payment=(), usb=()"
  );

  // CORS - Explicit origin whitelist
  const origin = request.headers.get("origin");
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    process.env.NEXT_PUBLIC_API_URL,
  ].filter(Boolean);

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  // HSTS - Force HTTPS in production
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  return response;
}

// Configure which routes should use this middleware
export const config = {
  matcher: [
    // Match all paths except static files
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
