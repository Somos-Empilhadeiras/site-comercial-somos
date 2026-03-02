import dbConnect from './mongodb';
import Unit from '@/models/Unit';
import Card from '@/models/Card';
import Collaborator from '@/models/Collaborator';

export async function seedDatabase() {
  await dbConnect();

  // 1. Migra Unidades
  const countUnits = await Unit.countDocuments();
  if (countUnits === 0) {
    await Unit.insertMany(mockUnits);
    console.log('✅ Unidades migradas para o MongoDB');
  }

  // 2. Migra Cards
  const countCards = await Card.countDocuments();
  if (countCards === 0) {
    await Card.insertMany(mockCards);
    console.log('✅ Cards migrados para o MongoDB');
  }

  // 3. Migra Colaboradores (Admin e Mylla)
  const countUsers = await Collaborator.countDocuments();
  if (countUsers === 0) {
    await Collaborator.insertMany(mockCollaborators);
    console.log('✅ Colaboradores iniciais migrados');
  }
}