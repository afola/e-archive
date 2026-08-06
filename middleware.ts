import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next()
  }

  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json(
      { message: 'Les routes API mock Next.js sont désactivées hors développement.' },
      { status: 404 }
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api', '/api/:path*'],
}
