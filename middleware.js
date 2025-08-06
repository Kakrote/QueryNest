import { NextResponse } from 'next/server';
import { CSP_HEADERS } from './utils/sanitize';

export function middleware(request) {
  try {
    // Clone the response
    const response = NextResponse.next();

    // Add Content Security Policy headers
    Object.entries(CSP_HEADERS).forEach(([header, value]) => {
      response.headers.set(header, value);
    });

    // Add additional security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    // Return a basic response if middleware fails
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
