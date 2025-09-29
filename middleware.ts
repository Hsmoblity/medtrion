import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Block access to mock/debug endpoints in production
  if (process.env.NODE_ENV === 'production') {
    // Block mock GraphQL API
    if (pathname === '/api/graphql') {
      return new NextResponse(
        JSON.stringify({
          error: 'Mock endpoint disabled in production',
          message: 'This mock endpoint is only available in development mode',
          timestamp: new Date().toISOString()
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Block debug endpoints
    if (pathname.startsWith('/api/debug/')) {
      return new NextResponse(
        JSON.stringify({
          error: 'Debug endpoint disabled in production',
          message: 'Debug endpoints are only available in development mode',
          timestamp: new Date().toISOString()
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/graphql',
    '/api/debug/:path*'
  ]
};