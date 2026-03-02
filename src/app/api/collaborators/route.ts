import { NextResponse } from 'next/server';
import { collaboratorService } from '@/services/collaboratorService';

// LISTAR: Suporta ?state=go por exemplo
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state');
    
    // O service agora filtra direto na Query do MongoDB
    const collaborators = await collaboratorService.getAll(state || undefined);
    return NextResponse.json(collaborators);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao listar colaboradores' }, { status: 500 });
  }
}

// CADASTRAR: Cria o documento no MongoDB
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // O service agora lida com o insertMany ou create do Mongoose
    const newUser = await collaboratorService.create(body);
    
    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    // Retorna erro caso o Login já exista (Unique Index no MongoDB)
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}