import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Card from '../../../models/Card';
import AuditLog from '../../../models/AuditLog';

// 1. LISTAR CARDS (GET)
export async function GET(request: Request) {
    try {
        await dbConnect();
        
        const { searchParams } = new URL(request.url);
        const state = searchParams.get('state'); // Ex: 'go', 'ba'

        // Adicionamos ': any' para o TS não reclamar de tipos estritos no find()
        let query: any = {}; 

        // Filtra pela unidade se a sigla for fornecida
        if (state) {
            query = {
                units: { $in: [state.toLowerCase(), 'all'] }
            };
        }

        const cards = await Card.find(query).sort({ createdAt: -1 }).lean();
        return NextResponse.json(cards);
    } catch (error) {
        console.error("Erro ao buscar cards:", error);
        return NextResponse.json({ error: 'Falha ao carregar módulos' }, { status: 500 });
    }
}

// 2. CRIAR NOVO CARD (POST)
export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        
        const { id, title, description, icon, url, isLocked, units } = body;

        // Validação básica
        if (!id || !title || !url) {
            return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 });
        }

        const newCard = await Card.create({
            id,
            title,
            description,
            icon,
            url,
            isLocked: isLocked ?? true,
            units: units && units.length > 0 ? units : ['all']
        });

        // REGISTRO DE AUDITORIA: Criação
        await AuditLog.create({
            action: 'create',
            entity: 'card',
            description: `Novo módulo comercial criado: ${title}`,
            targetName: title
        });

        return NextResponse.json({ success: true, data: newCard }, { status: 201 });
    } catch (error: any) {
        console.error("Erro ao criar card:", error);
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Já existe um módulo com este ID' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Erro interno ao salvar módulo' }, { status: 500 });
    }
}

// 3. EDITAR CARD (PUT)
export async function PUT(request: Request) {
    try {
        await dbConnect();
        
        const body = await request.json();
        const { _id, ...updateData } = body;

        if (!_id) {
            return NextResponse.json({ error: 'ID do card ausente' }, { status: 400 });
        }

        // Variável tipada como ': any' para o TS permitir acessar a propriedade .title
        const updatedCard: any = await Card.findByIdAndUpdate(_id, updateData, { new: true } as any);

        // REGISTRO DE AUDITORIA: Edição
        await AuditLog.create({
            action: 'update',
            entity: 'card',
            description: `Configurações do módulo alteradas`,
            targetName: updatedCard?.title || 'ID: ' + _id
        });

        return NextResponse.json({ success: true, data: updatedCard }, { status: 200 });
    } catch (error) {
        console.error("Erro ao atualizar card:", error);
        return NextResponse.json({ error: 'Falha ao atualizar módulo' }, { status: 500 });
    }
}

// 4. DELETAR CARD (DELETE)
export async function DELETE(request: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID do card ausente' }, { status: 400 });
        }

        // Variável tipada como ': any' para o TS permitir acessar a propriedade .title
        const cardToDelete: any = await Card.findById(id);
        const title = cardToDelete?.title || 'Módulo Desconhecido';

        await Card.findByIdAndDelete(id);

        // REGISTRO DE AUDITORIA: Remoção
        await AuditLog.create({
            action: 'delete',
            entity: 'card',
            description: `Módulo removido permanentemente do sistema`,
            targetName: title
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Erro ao deletar card:", error);
        return NextResponse.json({ error: 'Falha ao deletar módulo' }, { status: 500 });
    }
}