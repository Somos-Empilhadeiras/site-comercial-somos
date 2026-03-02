import { NextResponse } from 'next/server';
import { unitService } from '@/services/unitService';

// GET: Lista as unidades (Você já tem isso)
export async function GET() {
  try {
    const units = await unitService.getAll();
    return NextResponse.json(units);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao carregar unidades' }, { status: 500 });
  }
}

// POST: Rota nova para o Admin cadastrar
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validação básica
    if (!body.id || !body.name || !body.address) {
      return NextResponse.json({ error: 'Preencha todos os campos da unidade.' }, { status: 400 });
    }

    const newUnit = await unitService.create(body);
    
    return NextResponse.json(newUnit, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}