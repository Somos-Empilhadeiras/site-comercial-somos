import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import { commissionService } from '../../../services/commissionService';
import AuditLog from '../../../models/AuditLog';



// 1. LISTAR (GET)
export async function GET(request: Request) {
  try {
    await dbConnect(); // CORREÇÃO: Necessário conectar ao banco antes de buscar
    
    const { searchParams } = new URL(request.url);
    const collaboratorId = searchParams.get('collaboratorId');
    
    const data = collaboratorId 
      ? await commissionService.getByCollaborator(collaboratorId)
      : await commissionService.getAll();

    // DICA: Evite registrar 'read' no AuditLog para não sobrecarregar o banco, 
    // ou adicione 'read' ao enum do seu Model AuditLog.ts
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro no GET Commissions:", error);
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
  }
}

// 2. CRIAR (POST)
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { rawText, collaboratorId, mapping } = body;

    if (!rawText || !collaboratorId || !mapping) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    const newCommissions = await commissionService.processExcelPaste(rawText, collaboratorId, mapping);

    await AuditLog.create({
        action: 'create', // CORREÇÃO: Era 'delete'
        entity: 'commission',
        description: `Importação de ${newCommissions.length} lançamentos via planilha`,
        targetName: collaboratorId
    });

    return NextResponse.json({ success: true, count: newCommissions.length });
  } catch (error) {
    console.error("Erro no upload:", error);
    return NextResponse.json({ error: 'Erro ao processar planilha' }, { status: 500 });
  }
}

// 3. EDITAR (PUT)
export async function PUT(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { id, updateData } = body;

    if (!id || !updateData) {
      return NextResponse.json({ error: 'ID ou dados ausentes' }, { status: 400 });
    }

    const updated = await commissionService.update(id, updateData);

    await AuditLog.create({
        action: 'update', // CORREÇÃO: Era 'delete'
        entity: 'commission',
        description: `Edição manual de lançamento`,
        targetName: updated?.cliente || 'ID: ' + id // Ajustado para 'cliente' pois comissão não tem 'name'
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao editar lançamento' }, { status: 500 });
  }
}

// Função DELETE para exclusão permanente de um lançamento, sem marcar como 'deleted' (hard delete)
export async function DELETE(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID não fornecido' }, { status: 400 });

    // delete já retorna o documento removido, sem query extra
    const deleted = await commissionService.delete(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Lançamento não encontrado' }, { status: 404 });
    }

    await AuditLog.create({
      action: 'delete',
      entity: 'commission',
      description: `Exclusão permanente de lançamento`,
      targetName: (deleted as any).description || 'ID: ' + id,
    });

    return NextResponse.json({ success: true, message: 'Lançamento removido' });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao deletar' }, { status: 500 });
  }
}