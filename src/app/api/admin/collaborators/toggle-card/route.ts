import { NextResponse } from 'next/server';
import { cardService } from '../../../../../services/cardService';
import AuditLog from '../../../../../models/AuditLog';


export async function POST(request: Request) {
  try {
    const { collaboratorId, cardId } = await request.json();

    if (!collaboratorId || !cardId) {
      return NextResponse.json({ error: 'ID do colaborador ou do card ausente' }, { status: 400 });
    }

    const success = await cardService.toggleVisibility(collaboratorId, cardId);

    if (!success) {
      return NextResponse.json({ error: 'Erro ao atualizar visibilidade no banco' }, { status: 500 });
    }

    await AuditLog.create({
        action: 'toggle',
        entity: 'collaborator-card',
        description: `Visibilidade do card alterada`,
        targetName: `${collaboratorId}-${cardId}`
    });

    return NextResponse.json({ message: 'Visibilidade atualizada com sucesso!' });
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}