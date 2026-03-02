import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { collaboratorService } from '../../../services/collaboratorService';
import AuditLog from '../../../models/AuditLog';

// 1. BUSCAR TODOS OS CONSULTORES (Era isso que estava faltando!)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state');
    const collaborators = await collaboratorService.getAll(state || undefined);
    return NextResponse.json(collaborators);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao listar colaboradores' }, { status: 500 });
  }
}

// 2. CADASTRAR NOVO CONSULTOR
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newUser = await collaboratorService.create(body);
    await AuditLog.create({
      action: 'create',
      entity: 'collaborator',
      description: `Consultor cadastrado no sistema`,
      targetName: newUser?.name || 'ID: ' + newUser?.id
    });
    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// 3. EDITAR CONSULTOR
export async function PUT(request: Request) {
  try {
    const dbConnect = (await import('../../../lib/mongodb')).default;
    await dbConnect();
    const Model = mongoose.models.User || mongoose.models.Collaborator || mongoose.models.Consultor;

    const body = await request.json();
    const { _id, password, ...updateData } = body;

    if (!_id) return new Response(JSON.stringify({ error: 'ID ausente' }), { status: 400 });

    if (password && password.trim() !== '') {
      updateData.password = password;
    }

    const updatedUser = await Model.findByIdAndUpdate(_id, updateData, { new: true });

    await AuditLog.create({
        action: 'update',
        entity: 'collaborator',
        description: `Consultor atualizado no sistema`,
        targetName: updatedUser?.name || 'ID: ' + updatedUser?.id
    });

    return new Response(JSON.stringify({ success: true, data: updatedUser }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Falha ao atualizar consultor' }), { status: 500 });
  }
}

// 4. DELETAR CONSULTOR
export async function DELETE(request: Request) {
  try {
    const dbConnect = (await import('../../../lib/mongodb')).default;
    await dbConnect();
    const Model = mongoose.models.User || mongoose.models.Collaborator || mongoose.models.Consultor;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userToDelete = await Model.findById(id);

    if (!id) return new Response(JSON.stringify({ error: 'ID ausente' }), { status: 400 });

    await AuditLog.create({
        action: 'delete',
        entity: 'collaborator',
        description: `Consultor removido do sistema`,
        targetName: userToDelete?.name || 'ID: ' + id
    });

    await Model.findByIdAndDelete(id);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Falha ao deletar consultor' }), { status: 500 });
  }
}