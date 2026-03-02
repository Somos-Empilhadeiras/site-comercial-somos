import { NextResponse } from 'next/server';
import { commissionService } from '../../../../services/commissionService';
import AuditLog from '../../../../models/AuditLog';


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário não fornecido' }, { status: 400 });
    }

    // Fazemos as duas buscas no banco em paralelo para ser mais rápido
    const [summary, evolution] = await Promise.all([
      commissionService.getSummary(userId),
      commissionService.getEvolutionData(userId)
    ]);

    await AuditLog.create({
        action: 'read',
        entity: 'dashboard',
        description: `Estatísticas do usuário ${userId} visualizadas`,
        targetName: userId
    });

    return NextResponse.json({ summary, evolution });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao gerar estatísticas' }, { status: 500 });
  }
}