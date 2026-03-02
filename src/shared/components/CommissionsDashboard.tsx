'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { HandCoins, TrendingUp, Key, ShoppingCart, Calendar, ChevronLeft, ChevronRight, Filter, Mail } from 'lucide-react';
import PDFDownloadButton from './PDFDownloadButton'; 

interface Commission {
  _id?: string;
  id?: string;
  cliente?: string;
  equipamento?: string;
  venda?: string | number;
  comissao?: string | number;
  date?: string;
  description?: string;
  type?: string;
  value?: number;
  monthYear?: string;
  [key: string]: any;
}

const PIE_COLORS = ['#15803d', '#3b82f6'];

export default function CommissionDashboard({ commissions }: { commissions: Commission[] }) {

  // ==========================================
  // 0. NORMALIZAÇÃO DE DADOS
  // ==========================================
  const normalizedCommissions = useMemo(() => {
    if (!commissions || !Array.isArray(commissions)) return [];

    return commissions.map(c => {
      const parseCurrency = (val: any) => {
        if (!val) return 0;
        if (typeof val === 'string') {
          let cleanString = val.replace(/[^\d,.-]/g, '');
          if (cleanString.includes('.') && cleanString.includes(',')) cleanString = cleanString.replace(/\./g, '');
          return parseFloat(cleanString.replace(',', '.')) || 0;
        }
        return Number(val) || 0;
      };

      let rawDate = c.date || c.createdAt || new Date();
      let dataStr = new Date(rawDate).toISOString().split('T')[0];

      return {
        ...c,
        value: parseCurrency(c.valorComissao ?? c.comissao ?? c.value),
        valorVenda: parseCurrency(c.valorVenda ?? c.venda),
        quantidade: c.quantidade ?? c.qtd ?? 1,
        cliente: c.cliente ?? 'Cliente não informado',
        equipamento: c.modelo ?? c.equipamento ?? '-',
        date: dataStr, 
        type: (c.type ?? c.tipo ?? 'venda').toLowerCase(),
        monthYear: dataStr.slice(0, 7)
      };
    });
  }, [commissions]);

  // ==========================================
  // 1. ESTADOS
  // ==========================================
  const [filterOption, setFilterOption] = useState<string>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isSending, setIsSending] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => { setCurrentPage(1); }, [filterOption, customStart, customEnd]);

  // ==========================================
  // 2. LÓGICA DE FILTRAGEM
  // ==========================================
  const filteredCommissions = useMemo(() => {
    if (filterOption === 'all') return normalizedCommissions;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    return normalizedCommissions.filter(c => {
      const [year, month, day] = c.date.split('-').map(Number);
      const commissionDate = new Date(year, month - 1, day);

      if (filterOption === 'custom') {
        const start = customStart ? new Date(customStart + 'T00:00:00') : null;
        const end = customEnd ? new Date(customEnd + 'T23:59:59') : null;
        if (start && commissionDate < start) return false;
        if (end && commissionDate > end) return false;
        return true;
      }

      const daysToSubtract = parseInt(filterOption);
      const limitDate = new Date();
      limitDate.setDate(today.getDate() - (daysToSubtract - 1));
      limitDate.setHours(0, 0, 0, 0);

      if (filterOption === "1") return commissionDate.getTime() === today.getTime();
      return commissionDate >= limitDate && commissionDate <= endOfToday;
    });
  }, [normalizedCommissions, filterOption, customStart, customEnd]);

  // ==========================================
  // 3. CÁLCULOS E GRÁFICOS
  // ==========================================
  const totals = useMemo(() => {
    const total = filteredCommissions.reduce((sum, item) => sum + item.value, 0);
    const vendas = filteredCommissions.reduce((sum, item) => sum + item.valorVenda, 0);
    const locacao = filteredCommissions.filter(c => c.type === 'locacao').reduce((sum, item) => sum + item.value, 0);
    return { total, vendas, locacao };
  }, [filteredCommissions]);

  const barChartData = useMemo(() => {
    const groups = filteredCommissions.reduce((acc: any, curr) => {
      const key = curr.monthYear;
      if (!acc[key]) acc[key] = { month: key, vendas: 0, locacao: 0 };
      if (curr.type === 'venda') acc[key].vendas += curr.value;
      else acc[key].locacao += curr.value;
      return acc;
    }, {});
    return Object.values(groups).sort((a: any, b: any) => a.month.localeCompare(b.month));
  }, [filteredCommissions]);

  const pieChartData = [
    { name: 'Vendas', value: totals.total - totals.locacao },
    { name: 'Locação', value: totals.locacao }
  ].filter(item => item.value > 0);

  const formatCurrency = (val: number) => isNaN(val) ? 'R$ 0,00' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  const formatMonth = (monthStr: string) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace('.', '');
  };

  // ==========================================
  // 4. LÓGICA DE EXPORTAÇÃO (IMAGENS + PDF)
  // ==========================================
  
  // Função blindada para gerar URL do QuickChart
  const getChartImageUrl = (config: any) => {
    const jsonString = JSON.stringify(config).replace(/"/g, "'");
    return `https://quickchart.io/chart?c=${encodeURIComponent(jsonString)}&w=500&h=300&bkg=white&f=png`;
  };

  // Gráfico de Barras com Cores em RGB (Impede falhas na URL)
  const barChartUrl = barChartData.length > 0 ? getChartImageUrl({
    type: 'bar',
    data: {
      labels: barChartData.map((d: any) => formatMonth(d.month)),
      datasets: [
        { label: 'Vendas', data: barChartData.map((d: any) => d.vendas), backgroundColor: 'rgb(21, 128, 61)' },
        { label: 'Locação', data: barChartData.map((d: any) => d.locacao), backgroundColor: 'rgb(59, 130, 246)' }
      ]
    },
    options: { plugins: { legend: { position: 'bottom' } } }
  }) : '';

  // Gráfico de Pizza com Cores em RGB
  const pieChartUrl = pieChartData.length > 0 ? getChartImageUrl({
    type: 'doughnut',
    data: {
      labels: pieChartData.map((d: any) => d.name),
      datasets: [{ data: pieChartData.map((d: any) => d.value), backgroundColor: ['rgb(21, 128, 61)', 'rgb(59, 130, 246)'] }]
    },
    options: { plugins: { legend: { position: 'right' } } }
  }) : '';

  // OBJETO CENTRALIZADO: Passa as imagens e as tabelas para o PDF e E-mail
  const reportProps = {
    documentTitle: "Extrato de Comissões",
    subTitle: `Período: ${filterOption === 'all' ? 'Completo' : filterOption} - Emissão: ${new Date().toLocaleDateString('pt-BR')}`,
    charts: [barChartUrl, pieChartUrl].filter(Boolean), 
    sections: [
      {
        title: "Resumo de Desempenho",
        fields: [
          { label: "Total em Vendas", value: formatCurrency(totals.vendas) },
          { label: "Total em Locação", value: formatCurrency(totals.locacao) },
          { label: "Qtd. de Operações", value: filteredCommissions.length }
        ]
      }
    ],
    tableData: {
      headers: ["Data", "Cliente", "Equipamento", "Qtd", "Comissão (R$)"],
      rows: filteredCommissions.map(c => [
        c.date.split('-').reverse().join('/'),
        c.cliente,
        c.equipamento,
        c.quantidade,
        formatCurrency(c.value) 
      ])
    },
    highlightTotal: {
      label: "COMISSÃO LÍQUIDA A RECEBER",
      value: formatCurrency(totals.total)
    }
  };

  // Disparo de E-mail
  const handleSendReportEmail = async () => {
    try {
      setIsSending(true);
      const periodLabel = filterOption === 'all' ? 'Todo o período' : filterOption === 'custom' ? `de ${customStart} até ${customEnd}` : `últimos ${filterOption} dias`;

      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collaboratorIds: [commissions[0]?.collaboratorId],
          subject: `Relatório de Performance - ${periodLabel}`,
          title: "Resumo de Comissões Disponível",
          paragraphs: [
            `Olá, o seu relatório referente ao período (${periodLabel}) foi gerado com sucesso.`,
            "Abaixo você confere os números consolidados de suas vendas e locações. O extrato completo segue em anexo (PDF)."
          ],
          summaryData: [
            { label: "Vendas Realizadas", value: formatCurrency(totals.vendas) },
            { label: "Total em Locações", value: formatCurrency(totals.locacao) },
            { label: "Comissão Total", value: formatCurrency(totals.total), isHighlight: true }
          ],
          // O SEGREDO: Enviamos as propriedades do PDF completas para a Rota gerar o anexo!
          documentProps: reportProps
        })
      });

      if (response.ok) alert("E-mail enviado com sucesso!");
      else throw new Error("Falha ao enviar e-mail.");
    } catch (error) {
      console.error(error);
      alert("Erro ao disparar e-mail.");
    } finally {
      setIsSending(false);
    }
  };

  const totalPages = Math.ceil(filteredCommissions.length / itemsPerPage) || 1;
  const currentTableData = filteredCommissions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full max-w-[1400px] mx-auto">

      {/* BARRA DE FILTROS SUPERIOR */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-4 justify-between">
        
        {/* Lado Esquerdo */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-slate-700 font-bold">
            <Filter size={20} className="text-green-600" />
            <span>Filtrar Período:</span>
          </div>

          <select value={filterOption} onChange={(e) => setFilterOption(e.target.value)} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-green-500 text-sm cursor-pointer">
            <option value="all">Todo o Período</option>
            <option value="1">Hoje (Últimas 24h)</option>
            <option value="7">Últimos 7 dias</option>
            <option value="14">Últimos 14 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="custom">Personalizado...</option>
          </select>

          {filterOption === 'custom' && (
            <div className="flex items-center gap-2 animate-in slide-in-from-left-2">
              <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500" />
              <span className="text-slate-400 font-bold">até</span>
              <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          )}
        </div>

        {/* Lado Direito: Botões de E-mail e PDF */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSendReportEmail}
            disabled={isSending || filteredCommissions.length === 0}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            {isSending ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Mail size={18} />}
            {isSending ? 'Enviando...' : 'Enviar por E-mail'}
          </button>

          {/* O BOTÃO DO PDF USANDO A CONSTANTE CENTRALIZADA */}
          {filteredCommissions.length > 0 && (
            <PDFDownloadButton
              buttonText="Exportar Extrato (PDF)"
              fileName={`Extrato_Comissoes_${new Date().getTime()}`}
              documentProps={reportProps}
            />
          )}
        </div>
      </div>

      {/* INDICADORES DE DESEMPENHO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="h-14 w-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 shrink-0">
            <HandCoins size={28} />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider truncate">Ganhos Totais (Comissão)</p>
            <p className="text-2xl font-black text-slate-800 truncate">{formatCurrency(totals.total)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="h-14 w-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
            <ShoppingCart size={28} />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider truncate">Volume de Vendas</p>
            <p className="text-2xl font-black text-emerald-600 truncate">{formatCurrency(totals.vendas)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
            <Key size={28} />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider truncate">Total de Locação</p>
            <p className="text-2xl font-black text-blue-600 truncate">{formatCurrency(totals.locacao)}</p>
          </div>
        </div>
      </div>

      {/* GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
          <h3 className="text-sm font-bold text-slate-800 uppercase mb-6 flex items-center gap-2">
            <TrendingUp size={16} className="text-green-600" /> Evolução de Comissões
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tickFormatter={formatMonth} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <YAxis tickFormatter={(val) => `R$ ${val}`} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} formatter={(val: number) => formatCurrency(val)} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '20px' }} />
                <Bar dataKey="vendas" name="Vendas" fill="#15803d" radius={[4, 4, 0, 0]} />
                <Bar dataKey="locacao" name="Locação" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 uppercase mb-6 flex items-center gap-2">
            <HandCoins size={16} className="text-blue-600" /> Origem da Receita
          </h3>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieChartData} innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                  {pieChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                </Pie>
                <RechartsTooltip formatter={(val: number) => formatCurrency(val)} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* EXTRATO DETALHADO */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 bg-slate-50 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
            <Calendar size={18} className="text-slate-400" />
            Extrato Detalhado
          </h3>
          <span className="text-xs font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200">
            {filteredCommissions.length} registro(s)
          </span>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white text-[10px] uppercase font-black text-gray-400">
              <tr>
                <th className="p-5 border-b border-gray-50">Data</th>
                <th className="p-5 border-b border-gray-50">Cliente</th>
                <th className="p-5 border-b border-gray-50">Equipamento</th>
                <th className="p-5 border-b border-gray-50 text-center">Qtd</th>
                <th className="p-5 border-b border-gray-50 text-right">Valor Venda</th>
                <th className="p-5 border-b border-gray-50 text-right text-green-700">Comissão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentTableData.length > 0 ? currentTableData.map((com, index) => (
                <tr key={com._id || com.id || index} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-5 text-sm font-medium text-slate-500 whitespace-nowrap">{com.date.split('-').reverse().join('/')}</td>
                  <td className="p-5 text-sm font-bold text-slate-700 whitespace-nowrap">{com.cliente}</td>
                  <td className="p-5 text-sm font-medium text-slate-600 whitespace-nowrap">{com.equipamento}</td>
                  <td className="p-5 text-sm font-bold text-slate-700 text-center">{com.quantidade}</td>
                  <td className="p-5 text-right font-medium text-slate-500 whitespace-nowrap">{formatCurrency(com.valorVenda)}</td>
                  <td className="p-5 text-right font-black text-green-600 whitespace-nowrap">{formatCurrency(com.value)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="p-20 text-center text-gray-400 italic font-medium">
                    Nenhuma comissão registrada para o período selecionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINAÇÃO */}
        {totalPages > 1 && (
          <div className="p-5 border-t border-gray-100 flex items-center justify-between bg-white">
            <p className="text-xs font-bold text-slate-400">
              Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, filteredCommissions.length)} de {filteredCommissions.length}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"><ChevronLeft size={18} /></button>
              <span className="text-sm font-bold text-slate-700 px-4">Página {currentPage} de {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"><ChevronRight size={18} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}