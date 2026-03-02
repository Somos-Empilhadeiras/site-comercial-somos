import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import AuditLog from '../../../models/AuditLog';

export async function GET() {
    try {
        await dbConnect();
        // Busca os logs mais recentes primeiro
        const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100).lean();
        return NextResponse.json(logs);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao buscar logs' }, { status: 500 });
    }
}