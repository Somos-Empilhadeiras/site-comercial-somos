import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import AuditLog from '../../../../models/AuditLog';
import Commission from '../../../../models/Commission';

export async function POST(request: Request) {
    try {
        await dbConnect();
        
        // 1. Extraímos os novos campos do formulário híbrido
        const { rawText, collaboratorId, tipoLancamento, estadoLancamento } = await request.json();

        const lines = rawText.split('\n').filter((l: string) => l.trim() !== '');

        const newCommissions = lines.map((line: string) => {
            // Limpa espaços duplos e garante a quebra por tabs ou múltiplos espaços
            const cols = line.trim().split(/\t| {2,}/); 
            
            // Se tiver 6 colunas, a primeira é data. Se tiver 5, começa do cliente.
            const hasDate = cols.length >= 6;
            const startIdx = hasDate ? 1 : 0;

            let finalDate = new Date();
            if (hasDate) {
                const parsed = new Date(cols[0].trim());
                if (!isNaN(parsed.getTime())) finalDate = parsed;
            }

            return {
                collaboratorId,
                cliente: cols[startIdx]?.trim() || 'Não informado',
                modelo: cols[startIdx + 1]?.trim() || 'Não informado',
                quantidade: Number(cols[startIdx + 2]) || 1,
                valorVenda: Number(cols[startIdx + 3]?.replace(/[^0-9,-]+/g,"").replace(',', '.')) || 0,
                valorComissao: Number(cols[startIdx + 4]?.replace(/[^0-9,-]+/g,"").replace(',', '.')) || 0,
                date: finalDate.toISOString(),
                monthYear: finalDate.toISOString().slice(0, 7),
                
                // 2. O ELO PERDIDO: Inserindo Tipo e Estado no Banco
                type: tipoLancamento || 'venda',
                estado: estadoLancamento || 'GO'
            };
        });

        await Commission.insertMany(newCommissions);

        // REGISTRO DE AUDITORIA
        try {
            await AuditLog.create({
                action: 'create',
                entity: 'commission',
                // Melhoramos a descrição para incluir o tipo e estado no log
                description: `Importação de ${newCommissions.length} itens (${tipoLancamento} em ${estadoLancamento}).`,
                targetName: `Lote Consultor: ${collaboratorId}`
            });
        } catch (e) { console.error("Erro ao salvar log:", e); }

        return NextResponse.json({ success: true, count: newCommissions.length });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}