import { NextResponse } from 'next/server';
import { commissionService } from '@/services/commissionService';

// 1. LISTAR (GET) - Útil para carregar a tabela
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collaboratorId = searchParams.get('collaboratorId');
    
    const data = collaboratorId 
      ? await commissionService.getByCollaborator(collaboratorId)
      : await commissionService.getAll();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
  }
}

// 2. CRIAR (POST) - Com sanitização de valores
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rawText, collaboratorId, mapping } = body;

    if (!rawText || !collaboratorId || !mapping) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    // O Service processa. DICA: Verifique a lógica de parse no commissionService.ts
    const newCommissions = await commissionService.processExcelPaste(rawText, collaboratorId, mapping);

    return NextResponse.json({ success: true, count: newCommissions.length });
  } catch (error) {
    console.error("Erro no upload:", error);
    return NextResponse.json({ error: 'Erro ao processar planilha' }, { status: 500 });
  }
}

// 3. EDITAR (PUT) - Para ajustes manuais em lançamentos específicos
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, updateData } = body; // id da comissão no MongoDB

    if (!id || !updateData) {
      return NextResponse.json({ error: 'ID ou dados ausentes' }, { status: 400 });
    }

    const updated = await commissionService.update(id, updateData);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao editar lançamento' }, { status: 500 });
  }
}

// 4. DELETAR (DELETE) - Para remover erros de importação
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID não fornecido' }, { status: 400 });
    }

    await commissionService.delete(id);
    return NextResponse.json({ success: true, message: 'Lançamento removido' });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao deletar' }, { status: 500 });
  }
}