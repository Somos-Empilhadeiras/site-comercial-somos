import { NextResponse } from 'next/server';
import { cardService } from '@/services/cardService';

export async function POST(request: Request) {
  try {
    const { collaboratorId, cardId } = await request.json();
    
    // Inverte o status do card no array activeCards do documento no MongoDB
    const success = await cardService.toggleVisibility(collaboratorId, cardId);
    
    if (!success) {
      return NextResponse.json({ error: 'Não foi possível alterar a permissão' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}