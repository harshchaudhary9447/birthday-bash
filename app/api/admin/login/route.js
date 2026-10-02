import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { password } = body;
    const adminPassword = process.env.ADMIN_PASSWORD || 'harsh2026';

    if (password && password === adminPassword) {
      const response = NextResponse.json({
        success: true,
        token: adminPassword,
      });

      // Set HTTP-only secure cookie
      response.cookies.set('admin_token', adminPassword, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      { error: 'Incorrect admin password.' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Authentication service error.' },
      { status: 500 }
    );
  }
}
