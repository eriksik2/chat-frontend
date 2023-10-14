import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'



export async function middleware(request: NextRequest) {
    if (request.nextUrl.pathname === '/') {
        const url = request.nextUrl.clone();
        url.pathname = '/bots';
        return NextResponse.rewrite(url);
    }
}

export const config = {
    matcher: [
        '/',
    ],
}