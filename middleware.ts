import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname;
  
  // Check if the path is public (login, register, etc.)
  const isPublicPath = path === "/login" || 
                       path === "/register" || 
                       path === "/forgot-password" ||
                       path === "/reset-password";
  
  // Get the token from the cookies
  const token = request.cookies.get("authToken")?.value || "";
  
  // If the user is on a public path and has a token, redirect to home
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  
  // If the user is not on a public path and doesn't have a token, redirect to login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  return NextResponse.next();
}

// Only run middleware on specific paths
export const config = {
  matcher: [
    // Protected routes
    '/',
    '/tasks/:path*',
    '/settings',
    '/profile',
    // Public routes for auth checking
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ],
};