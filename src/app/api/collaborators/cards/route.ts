import { NextResponse } from 'next/server';
import { cardService } from '../../../../services/cardService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 });
    }

    const cards = await cardService.getForCollaborator(userId);
    return NextResponse.json(cards);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar permissões' }, { status: 500 });
  }
}