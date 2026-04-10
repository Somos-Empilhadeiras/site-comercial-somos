import dbConnect from "../lib/mongodb";
import Commission from "../models/Commission";
import Meta from "../models/Meta";
import Proposal from "../models/Proposal";

export const commissionService = {
  // Busca todos os lançamentos (Útil para o AdminGlobal)
  async getAll() {
    await dbConnect();
    return await Commission.find().lean();
  },

  // NOVO: Busca lançamentos específicos de um consultor
  async getByCollaborator(collaboratorId: string) {
    await dbConnect();
    return await Commission.find({ collaboratorId }).lean();
  },

  // NOVO: Busca um lançamento pelo ID
  async getById(id: string) {
    await dbConnect();
    return await Commission.findById(id).lean();
  },

  // ✅ FUNÇÃO ATUALIZADA: Resumo para os Cards Coloridos do Dashboard
  async getSummary(collaboratorId: string) {
    await dbConnect();

    // 1. Dados Financeiros (Comissões)
    const commissions = await Commission.find({ collaboratorId });

    const vendas = commissions.filter(c => c.type === 'venda').reduce((acc, c) => acc + (c.valorComissao || c.value || 0), 0);
    const locacao = commissions.filter(c => c.type === 'locacao').reduce((acc, c) => acc + (c.valorComissao || c.value || 0), 0);

    // Quantidade absoluta de vendas fechadas para basear a conversão
    const vendasRealizadas = commissions.filter(c => c.type === 'venda').length;

    // 2. Dados de Esforço (Nova Tabela de Propostas)
    const totalPropostas = await Proposal.countDocuments({ collaboratorId });

    // 3. Inteligência de Negócio (Conversão)
    const taxaConversao = totalPropostas > 0
      ? ((vendasRealizadas / totalPropostas) * 100).toFixed(1)
      : 0;

    // Retorna tudo envelopado para o frontend consumir
    return {
      totalVendas: vendas,
      totalLocacao: locacao,
      comissaoGeral: vendas + locacao,
      totalPropostas,      // Novo indicador enviado para a tela
      taxaConversao,       // Novo indicador enviado para a tela
      vendasRealizadas
    };
  },

  // Dados para o Gráfico de Barras
  async getEvolutionData(collaboratorId: string) {
    await dbConnect();
    const commissions = await Commission.find({ collaboratorId });

    const grouped = commissions.reduce((acc: any, curr) => {
      const month = curr.monthYear;
      if (!acc[month]) acc[month] = { month, vendas: 0, locacao: 0 };
      if (curr.type === 'venda') acc[month].vendas += curr.value;
      else acc[month].locacao += curr.value;
      return acc;
    }, {});

    return Object.values(grouped).sort((a: any, b: any) => a.month.localeCompare(b.month));
  },

  // NOVO: Atualizar um lançamento existente
  async update(id: string, updateData: any) {
    await dbConnect();
    return await Commission.findByIdAndUpdate(id, updateData, { new: true }).lean();
  },

  // NOVO: Deletar um lançamento (Excluir linha importada errada)
  async delete(id: string) {
    await dbConnect();
    return await Commission.findByIdAndDelete(id).lean();
  },

  // Processamento do Excel (Upload)
  async processExcelPaste(rawText: string, collaboratorId: string, mapping: any) {
    await dbConnect();
    const lines = rawText.trim().split('\n').filter(l => l.trim() !== '');

    const entries = lines.map(line => {
      // Aceita tanto TAB quanto múltiplos espaços como separador
      const columns = line.includes('\t') ? line.split('\t') : line.split(/\s{2,}/);

      const dateRaw = columns[mapping.date]?.trim() || '';
      const rawValue = columns[mapping.value] || '0';

      // Limpeza de moeda BR: Remove 'R$', espaços, pontos de milhar e troca vírgula por ponto decimal
      const numericValue = parseFloat(rawValue.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;

      // Determina o tipo verificando a string (fallback para locação)
      const rawType = (columns[mapping.type] || '').trim().toLowerCase();
      const finalType = rawType.includes('venda') ? 'venda' : 'locacao';

      return {
        collaboratorId,
        date: dateRaw,
        monthYear: dateRaw.substring(0, 7), // Ex: "2024-03" -> Usado pelo gráfico de barras
        value: numericValue,
        description: columns[mapping.description]?.trim() || '',
        type: finalType
      };
    });

    return await Commission.insertMany(entries);
  },

  // Dados para o Mix Bar Chart horizontal (Venda vs Locação vs Meta)
  async getChartData(collaboratorId: string) {
    await dbConnect();

    const [commissions, metas] = await Promise.all([
      Commission.find({ collaboratorId }).lean(),
      Meta.find({ collaboratorId }).lean(),
    ]);

    // Agrupa comissões por mês
    const grouped = commissions.reduce((acc: any, curr: any) => {
      const month = curr.monthYear;
      if (!acc[month]) acc[month] = { month, vendas: 0, locacao: 0, propostas: 0 };

      if (curr.type === 'venda') acc[month].vendas += curr.valorVenda;
      else acc[month].locacao += curr.valorVenda;

      acc[month].propostas += curr.quantidadePropostas ?? 0;
      return acc;
    }, {});

    // Mescla com as metas e calcula taxa de conversão
    const metaMap = metas.reduce((acc: any, m: any) => {
      acc[m.monthYear] = m;
      return acc;
    }, {});

    return Object.values(grouped)
      .map((item: any) => {
        const meta = metaMap[item.month];
        const totalVendas = item.vendas + item.locacao;
        return {
          month: item.month,
          vendas: item.vendas,
          locacao: item.locacao,
          metaVendas: meta?.metaVendas ?? 0,
          metaLocacao: meta?.metaLocacao ?? 0,
          taxaConversao: item.propostas > 0
            ? Math.round((totalVendas / item.propostas) * 100)
            : 0,
          totalPropostas: item.propostas,
        };
      })
      .sort((a: any, b: any) => a.month.localeCompare(b.month));
  },
};