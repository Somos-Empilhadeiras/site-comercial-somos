import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const session = request.cookies.get('auth-session');

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const userData = JSON.parse(session.value);
    return NextResponse.json({ authenticated: true, user: userData });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}