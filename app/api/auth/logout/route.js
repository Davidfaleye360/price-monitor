import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST() {
  const cookie = serialize('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // expire immediately
    path: '/'
  });

  const response = NextResponse.json({ message: 'Logged out successfully' });
  response.headers.set('Set-Cookie', cookie);
  return response;
}
export async function GET() {
  // Support GET logout just in case
  const cookie = serialize('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  });

  const response = NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
  response.headers.set('Set-Cookie', cookie);
  return response;
}
