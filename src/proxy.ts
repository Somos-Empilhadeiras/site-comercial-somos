import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get('auth-session')?.value;
  const { pathname } = request.nextUrl;

  // 1. Definições de Rotas e Exceções
  const isApi = pathname.startsWith('/api');
  const isLogin = pathname === '/login';
  
  // Lógica para detectar /[state]/[collaborator]
  // Dividimos a URL: ["", "go", "khryss-mylla"]
  const pathParts = pathname.split('/').filter(Boolean);
  const isCollaboratorPage = pathParts.length === 2 && !isApi && !isLogin;

  // 2. Bloqueio para usuários NÃO logados
  if (!sessionCookie) {
    // Protege a rota de Admin e a página individual do Colaborador
    if (pathname.startsWith('/admin') || isCollaboratorPage) {
      const loginUrl = new URL('/login', request.url);
      // Guarda para onde o usuário queria ir (ex: /go/khryss-mylla)
      loginUrl.searchParams.set('callbackUrl', pathname); 
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Verificação de permissões para usuários LOGADOS
  if (sessionCookie) {
    try {
      // Decodifica o cookie para ler o cargo (role)
      const user = JSON.parse(decodeURIComponent(sessionCookie));

      // Se for um funcionário comum tentando entrar no /admin, volta para a Home
      if (pathname.startsWith('/admin') && user.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }

      // Se já estiver logado e tentar ir para o /login, manda para a Home ou para o seu Dashboard
      if (isLogin) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (e) {
      // Se o cookie estiver corrompido, limpa e vai para o login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth-session');
      return response;
    }
  }

  return NextResponse.next();
}

// Configura o Next.js para rodar esse código em todas as rotas, 
// exceto arquivos estáticos e imagens.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};