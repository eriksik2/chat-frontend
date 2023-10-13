import { NextURL } from 'next/dist/server/web/next-url';
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const url = request.nextUrl.clone();
    url.pathname = '/bots';
    return NextResponse.rewrite(url);
}

export const config = {
    matcher: '/',
}