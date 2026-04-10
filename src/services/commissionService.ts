import dbConnect from "../lib/mongodb";
import Commission from "../models/Commission";

export const commissionService = {
  // Busca todos os lançamentos
  async getAll() {
    await dbConnect();
    return await Commission.find().lean();
  },

  // Busca lançamentos específicos de um consultor
  async getByCollaborator(collaboratorId: string) {
    await dbConnect();
    return await Commission.find({ collaboratorId }).lean();
  },

  // Resumo para os Cards Coloridos do Dashboard do Funcionário
  async getSummary(collaboratorId: string) {
    await dbConnect();
    const commissions = await Commission.find({ collaboratorId });
    
    // CORREÇÃO: Usar valorComissao em vez do "value" fantasma
    const vendas = commissions
        .filter(c => (c.type || 'venda') === 'venda')
        .reduce((acc, c) => acc + (c.valorComissao || 0), 0);
        
    const locacao = commissions
        .filter(c => c.type === 'locacao')
        .reduce((acc, c) => acc + (c.valorComissao || 0), 0);

    return {
      totalVendas: vendas,
      totalLocacao: locacao,
      totalGeral: vendas + locacao
    };
  },

  // Dados para o Gráfico de Barras do Dashboard do Funcionário
  async getEvolutionData(collaboratorId: string) {
    await dbConnect();
    const commissions = await Commission.find({ collaboratorId });

    const grouped = commissions.reduce((acc: any, curr) => {
      const month = curr.monthYear;
      if (!acc[month]) acc[month] = { month, vendas: 0, locacao: 0 };
      
      // CORREÇÃO: Usar valorComissao em vez do "value" fantasma
      if ((curr.type || 'venda') === 'venda') {
          acc[month].vendas += (curr.valorComissao || 0);
      } else {
          acc[month].locacao += (curr.valorComissao || 0);
      }
      return acc;
    }, {});

    return Object.values(grouped).sort((a: any, b: any) => a.month.localeCompare(b.month));
  },

  async update(id: string, updateData: any) {
    await dbConnect();
    return await Commission.findByIdAndUpdate(id, updateData, { new: true }).lean();
  },

  async delete(id: string) {
    await dbConnect();
    return await Commission.findByIdAndDelete(id).lean();
  }
};