import { NextResponse } from 'next/server';
import { collaboratorService } from '@/services/collaboratorService';

export async function POST(request: Request) {
  try {
    const userData = await request.json();

    // O Service agora salvará direto no MongoDB
    const result = await collaboratorService.create(userData);

    return NextResponse.json({ 
      message: 'Colaborador cadastrado com sucesso!', 
      user: result 
    }, { status: 201 });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao cadastrar' }, { status: 400 });
  }
}