
import dbConnect from '../lib/mongodb';
import Collaborator from '../models/Collaborator';
import { CollaboratorData } from '../types';

export const collaboratorService = {
    // 1. Autenticação (Busca no Banco)
    async authenticate(login: string, pass: string): Promise<CollaboratorData | null> {
        await dbConnect();
        // Busca o usuário e já converte o _id para id automaticamente
        const user = await (Collaborator as any).findOne({ login, password: pass }).lean();

        if (!user) return null;

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword as unknown as CollaboratorData;
    },

    // 2. Criação (Salvando no Atlas)
    async create(data: Partial<CollaboratorData>): Promise<CollaboratorData> {
        await dbConnect();

        // O Mongoose cuidará da validação do Schema
        const newCollaborator = await Collaborator.create({
            ...data,
            state: data.state?.toLowerCase(),
            activeCards: data.activeCards || ['card-comissao'] // Cards iniciais padrão
        });

        return newCollaborator.toObject();
    },

    // 3. Busca por Estado
    async getAll(state?: string): Promise<CollaboratorData[]> {
        await dbConnect();
        const query = state ? { state: state.toLowerCase() } : {};
        return await Collaborator.find(query).lean();
    }
};