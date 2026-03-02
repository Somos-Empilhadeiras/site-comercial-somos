import dbConnect from '@/lib/mongodb';
import Card from '@/models/Card';
import Collaborator from '@/models/Collaborator';
import { Card as CardType } from '../types';

export const cardService = {
  async getAll(): Promise<CardType[]> {
    await dbConnect();
    return await Card.find({}).lean();
  },

  async getForCollaborator(collaboratorId: string): Promise<CardType[]> {
    await dbConnect();
    // Busca o usuário para ver quais IDs de cards ele tem liberados
    const user = await Collaborator.findById(collaboratorId).lean();
    if (!user || !user.activeCards) return [];

    // Busca no banco apenas os cards que estão na lista do usuário
    return await Card.find({ id: { $in: user.activeCards } }).lean();
  },

  async create(data: { id: string; title: string; description: string; icon: string; url: string; isGlobal: boolean }) {
    await dbConnect();
    
    const existing = await Card.findOne({ id: data.id.toLowerCase() });
    if (existing) {
      throw new Error('Já existe um módulo cadastrado com este ID.');
    }

    const newCard = await Card.create({
      ...data,
      id: data.id.toLowerCase(),
    });

    return newCard.toObject();
  },

  async toggleVisibility(collaboratorId: string, cardId: string): Promise<boolean> {
    await dbConnect();
    const user = await Collaborator.findById(collaboratorId);
    if (!user) return false;

    const cardIndex = user.activeCards.indexOf(cardId);

    if (cardIndex > -1) {
      user.activeCards.splice(cardIndex, 1); // Remove acesso
    } else {
      user.activeCards.push(cardId); // Adiciona acesso
    }

    await user.save();
    return true;
  }
};