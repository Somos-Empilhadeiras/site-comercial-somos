import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Unit from '../../../models/Unit';
import AuditLog from '../../../models/AuditLog';

export async function GET() {
  try {
    await dbConnect();
    const units = await Unit.find().sort({ name: 1 }).lean();
    
    // Removido AuditLog do GET para evitar sobrecarga de logs e erros de busca
    return NextResponse.json(units);
  } catch (error) {
    console.error("Erro GET Units:", error);
    return NextResponse.json([], { status: 500 }); // Retorna array vazio para não quebrar o front
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const newUnit = await Unit.create(body);
    
    // CORREÇÃO: Ação era 'delete' e entidade 'collaborator' no seu código
    await AuditLog.create({
        action: 'create',
        entity: 'unit',
        description: `Unidade comercial criada`,
        targetName: newUnit.name
    });
    
    return NextResponse.json({ success: true, data: newUnit }, { status: 201 });
  } catch (error: any) {
    console.error("Erro POST Units:", error);
    if (error.code === 11000) return NextResponse.json({ error: 'Sigla já existe' }, { status: 400 });
    return NextResponse.json({ error: 'Erro ao criar unidade' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id) return NextResponse.json({ error: 'ID ausente' }, { status: 400 });

    const updatedUnit = await Unit.findByIdAndUpdate(_id, updateData, { new: true });
    
    await AuditLog.create({
        action: 'update', // Corrigido de 'delete'
        entity: 'unit',
        description: `Unidade atualizada`,
        targetName: updatedUnit?.name || 'ID: ' + _id
    });
    
    return NextResponse.json({ success: true, data: updatedUnit });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar unidade' }, { status: 500 });
  }
}

// DELETAR UNIDADE (DELETE)
export async function DELETE(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID ausente' }, { status: 400 });

    await Unit.findByIdAndDelete(id);

    await AuditLog.create({
        action: 'delete',
        entity: 'unit',
        description: `Unidade removida do sistema`,
        targetName: id
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao deletar unidade' }, { status: 500 });
  }
}