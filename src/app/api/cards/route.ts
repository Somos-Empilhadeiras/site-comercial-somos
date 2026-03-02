import { NextResponse } from 'next/server';
import { cardService } from '@/services/cardService';

export async function GET() {
  try {
    const cards = await cardService.getAll();
    return NextResponse.json(cards);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao carregar cards' }, { status: 500 });
  }
}

// NOVA ROTA POST
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.id || !body.title || !body.url) {
      return NextResponse.json({ error: 'Preencha os campos obrigatórios.' }, { status: 400 });
    }

    const newCard = await cardService.create(body);
    return NextResponse.json(newCard, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}