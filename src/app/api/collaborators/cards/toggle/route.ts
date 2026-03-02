import { NextResponse } from 'next/server';
import { cardService } from '../../../../../services/cardService';
import AuditLog from '../../../../../models/AuditLog';
import dbConnect from '../../../../../lib/mongodb';


export async function POST(request: Request) {
  try {
    await dbConnect(); // Conexão crucial para o ambiente Next.js

    const body = await request.json();
    const { collaboratorId, cardId } = body;

    if (!collaboratorId || !cardId) {
      return NextResponse.json({ error: 'Dados insuficientes' }, { status: 400 });
    }

    const success = await cardService.toggleVisibility(collaboratorId, cardId);

    if (!success) {
      return NextResponse.json({ error: 'Não foi possível alterar a permissão' }, { status: 400 });
    }

    // Buscamos o colaborador para ter o nome no log
    await AuditLog.create({
      action: 'access_change',
      entity: 'collaborator',
      description: `Permissões alteradas para o card ${cardId}`,
      targetName: collaboratorId // Salve apenas o ID do colaborador por enquanto
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("DETALHES DO ERRO 500:", error.message);
    return NextResponse.json(
      { error: 'Erro interno no servidor', details: error.message },
      { status: 500 }
    );
  }
}