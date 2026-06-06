import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';
import { serialize } from 'cookie';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password || !email.includes('@') || password.length < 6) {
      return NextResponse.json(
        { error: 'Invalid email or password (must be at least 6 characters).' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists.' },
        { status: 409 }
      );
    }

    // Hash password & create user
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword
      }
    });

    // Create session token
    const token = signToken({ id: user.id, email: user.email });

    // Set cookie
    const cookie = serialize('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    const response = NextResponse.json({
      message: 'Registration successful',
      user: { id: user.id, email: user.email }
    });

    response.headers.set('Set-Cookie', cookie);
    return response;
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
