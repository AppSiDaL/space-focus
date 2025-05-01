import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/auth/session';
import { cookies } from 'next/headers';

// 1. Specify protected and public routes
const protectedRoutes = ['/'];
const publicRoutes = ['/login', '/signup'];

export default async function middleware(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  // 3. Get the session cookie
  const sessionCookie = req.cookies.get('session')?.value;
  
  // Only attempt to decrypt if a session cookie exists
  const session = sessionCookie ? await decrypt(sessionCookie) : null;

  // 4. Redirect
  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  if (
    isPublicRoute &&
    session?.userId &&
    !req.nextUrl.pathname.startsWith('/')
  ) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  return NextResponse.next();
}