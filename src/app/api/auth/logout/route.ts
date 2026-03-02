import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Sessão encerrada' });
  
  response.cookies.set('auth-session', '', {
    path: '/',
    expires: new Date(0), // Data no passado mata o cookie
    httpOnly: true
  });

  return response;
}