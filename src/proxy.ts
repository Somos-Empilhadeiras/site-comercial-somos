import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get('auth-session')?.value;
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith('/admin');
  const isLoginRoute = pathname === '/login';

  // 1. Bloqueio total do Admin (e rotas privadas) para quem não está logado
  if (!sessionCookie) {
    if (isAdminRoute || pathname.split('/').length >= 3) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (sessionCookie) {
    try {
      const user = JSON.parse(decodeURIComponent(sessionCookie));
      const userHomeUrl = new URL(`/${user.state}/${encodeURIComponent(user.name)}/comissao-vendas`, request.url);

      // 2. Funcionário comum não entra no Admin Master
      if (isAdminRoute && user.role !== 'admin') {
        console.warn(`[SEGURANÇA] Bloqueio: Funcionário tentou acessar /admin.`);
        return NextResponse.redirect(userHomeUrl);
      }

      // 3. Logado não volta pro Login, vai direto pro seu painel
      if (isLoginRoute) {
        return NextResponse.redirect(user.role === 'admin' ? new URL('/admin', request.url) : userHomeUrl);
      }

      // 4. A TRAVA ANTI-ESPERTINHO (Bloqueio de IDOR)
      // Rotas protegidas têm o formato /[estado]/[nome-do-consultor]/...
      const pathParts = pathname.split('/');
      const reservedRoutes = ['admin', 'login', 'api', '_next', 'favicon.ico', ''];

      if (pathParts.length >= 3 && !reservedRoutes.includes(pathParts[1])) {
        // pathParts[1] é o estado, pathParts[2] é o nome na URL
        const urlCollaborator = decodeURIComponent(pathParts[2]);

        const isOwner = user.name === urlCollaborator;
        const isAdmin = user.role === 'admin';

        // Se o usuário tentar acessar um nome diferente do dele na URL E não for admin
        if (!isOwner && !isAdmin) {
          console.error(`[ALERTA DE SEGURANÇA] Tentativa de acesso indevido! ${user.name} tentou acessar a conta de ${urlCollaborator}.`);
          
          // Expulsa o usuário de volta para o dashboard dele imediatamente
          return NextResponse.redirect(userHomeUrl);
        }
      }

    } catch (e) {
      // Se o cookie foi corrompido ou modificado, deleta e manda logar de novo
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth-session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};