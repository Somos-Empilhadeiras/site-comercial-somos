import { NextResponse } from "next/server";
import { cardService } from "../../../../../services/cardService";
import dbConnect from "../../../../../lib/mongodb";
import AuditLog from "../../../../../models/AuditLog";

export async function POST(request: Request) {
  try {
    await dbConnect();

    // 1. Validação do Body
    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });

    const { collaboratorId, cardId } = body;
    if (!collaboratorId || !cardId) {
      return NextResponse.json({ error: 'Dados insuficientes' }, { status: 400 });
    }

    // 2. Execução do Serviço (Lógica de Negócio)
    const success = await cardService.toggleVisibility(collaboratorId, cardId);

    if (!success) {
       // Aqui pode ser um 404 se o card não existir, ou 400
       return NextResponse.json({ error: 'Permissão não alterada' }, { status: 400 });
    }

    // 3. Persistência de Auditoria (Side Effect)
    // Se o log de auditoria não for crítico para a resposta, 
    // você pode até disparar sem o await se quiser performance, 
    // mas para garantir integridade, mantenha o await.
    await AuditLog.create({
      action: 'access_change',
      entity: 'collaborator',
      description: `Permissões alteradas para o card ${cardId}`,
      targetName: collaboratorId 
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    // Log detalhado para o desenvolvedor
    console.error("--- DEBUG 500 ---");
    console.error("Stack:", error.stack); 
    
    return NextResponse.json(
      { error: 'Erro interno no servidor', details: error.message },
      { status: 500 }
    );
  }
}