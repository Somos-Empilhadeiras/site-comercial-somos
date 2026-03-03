import dbConnect from '../lib/mongodb';
import Card from '../models/Card';
import Collaborator from '../models/Collaborator';
import { Card as CardType } from '../types';

export const cardService = {
  async getAll(): Promise<CardType[]> {
    await dbConnect();
    // Adicionado "as any" para evitar conflitos de tipagem do mongoose com a interface CardType
    return (await Card.find().lean()) as any;
  },

  async getForCollaborator(collaboratorId: string): Promise<CardType[]> {
    await dbConnect();
    // Tipando 'user' como 'any' resolve o erro "not callable" do findById
    const user: any = await (Collaborator as any).findById(collaboratorId).lean();

    if (!user || !user.activeCards) return [];

    // Busca no banco apenas os cards que estão na lista do usuário
    // Adicionado ': any' no objeto de busca para contornar a validação estrita
    const query: any = { id: { $in: user.activeCards } };
    return (await Card.find(query).lean()) as any;
  },

  async create(data: { id: string; title: string; description: string; icon: string; url: string; isGlobal: boolean }) {
    await dbConnect();

    // Adicionado ': any' no objeto de busca
    const query: any = { id: data.id.toLowerCase() };
    const existing = await Card.findOne(query);

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

    // Tipando 'user' como 'any' para não dar erro no indexOf e push
    const user: any = await (Collaborator as any).findById(collaboratorId).lean();

    if (!user) return false;

    // Inicializa activeCards se estiver indefinido
    if (!user.activeCards) {
      user.activeCards = [];
    }

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