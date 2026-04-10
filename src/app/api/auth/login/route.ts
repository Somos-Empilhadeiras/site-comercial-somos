import { NextResponse } from 'next/server';
import { collaboratorService } from '../../../../services/collaboratorService';
import AuditLog from '../../../../models/AuditLog';


export async function POST(request: Request) {
  try {
    const { login, password } = await request.json();

    const user = await collaboratorService.authenticate(login, password);

    if (!user) {
      return NextResponse.json({ error: 'Usuário ou senha incorretos' }, { status: 401 });
    }

    const response = NextResponse.json(user);

    // Cookie seguro: HttpOnly impede acesso via JS
    response.cookies.set({
      name: 'auth-session',
      value: JSON.stringify(user),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 4 // 4 horas
    });

    await AuditLog.create({
        action: 'login',
        entity: 'collaborator',
        description: `Consultor logado no sistema`,
        targetName: user.name || 'ID: ' + user.id
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Falha na autenticação' }, { status: 500 });
  }
}