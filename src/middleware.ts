import { supabase } from './lib/supabase';

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export interface MiddlewareResult {
  redirect?: string;
  authorized: boolean;
}

/**
 * Middleware logic for route guarding.
 * Checks for authentication session and profile presence via cookies.
 */
export async function checkAuthAndProfile(fullPath: string): Promise<MiddlewareResult> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const pathname = fullPath.split('?')[0];

    // 1. If NOT logged in -> redirect to /login
    if (!session) {
      if (pathname !== '/login' && pathname !== '/signin' && pathname !== '/signup') {
        return { redirect: '/login', authorized: false };
      }
      return { authorized: true };
    }

    // 2. If logged in but on auth pages -> redirect to browse
    if (pathname === '/login' || pathname === '/signin' || pathname === '/signup' || pathname === '/profiles') {
      return { redirect: '/browse', authorized: false };
    }
    
    // 3. If logged in -> authorized
    return { authorized: true };
  } catch (error) {
    console.error("Auth middleware error:", error);
    const pathname = fullPath.split('?')[0];
    const publicPaths = ['/login', '/signin', '/signup', '/about', '/support', '/developers'];
    if (publicPaths.includes(pathname)) {
      return { authorized: true };
    }
    return { redirect: '/login', authorized: false };
  }
}
