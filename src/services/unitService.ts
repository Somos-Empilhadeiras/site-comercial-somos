import dbConnect from "../lib/mongodb";
import Unit from "../models/Unit";

export const unitService = {
  async getAll() {
    await dbConnect();
    return await Unit.find().lean();
  },
  
  async getById(id: string) {
    await dbConnect();
    return await Unit.findOne({ id: id.toLowerCase() }).lean();
  },

  // NOVA FUNÇÃO: Cadastrar nova unidade
  async create(data: { id: string; name: string; address: string }) {
    await dbConnect();
    
    // Verifica se a sigla já existe (para evitar duplicação, ex: dois 'GO')
    const existing = await Unit.findOne({ id: data.id.toLowerCase() });
    if (existing) {
      throw new Error('Já existe uma unidade cadastrada com esta sigla.');
    }

    const newUnit = await Unit.create({
      id: data.id.toLowerCase(), // Garante que a sigla fique minúscula (go, df, etc)
      name: data.name.toUpperCase(),
      address: data.address
    });

    return newUnit.toObject();
  }
};