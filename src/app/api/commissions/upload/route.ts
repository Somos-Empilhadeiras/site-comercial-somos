import { NextResponse } from 'next/server';
import { commissionService } from '@/services/commissionService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rawText, collaboratorId, mapping } = body;

    if (!rawText || !collaboratorId || !mapping) {
      return NextResponse.json({ error: 'Dados incompletos para processamento' }, { status: 400 });
    }

    // O Service agora processa e salva direto no MongoDB Atlas
    const newCommissions = await commissionService.processExcelPaste(rawText, collaboratorId, mapping);

    return NextResponse.json({ 
      success: true, 
      count: newCommissions.length 
    });
  } catch (error) {
    console.error("Erro no upload:", error);
    return NextResponse.json({ error: 'Erro ao processar e salvar planilha' }, { status: 500 });
  }
}