import { NextResponse } from 'next/server'

export function ensureMockApiEnabled() {
  if (process.env.NODE_ENV === 'development') {
    return null
  }

  return NextResponse.json(
    { message: 'Cette API de mock est désactivée hors développement.' },
    { status: 404 }
  )
}
