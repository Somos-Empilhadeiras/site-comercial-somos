'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { HandCoins, TrendingUp, Key, ShoppingCart, Calendar, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

interface Commission {
  _id?: string;
  id?: string;
  date: string; // Formato esperado: YYYY-MM-DD
  description: string;
  type: 'venda' | 'locacao';
  value: number;
  monthYear: string;
}

const PIE_COLORS = ['#15803d', '#3b82f6'];

export default function CommissionDashboard({ commissions }: { commissions: Commission[] }) {
  
  // ==========================================
  // 1. ESTADOS DE FILTRO E PAGINAÇÃO
  // ==========================================
  const [filterOption, setFilterOption] = useState<string>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Quantidade de itens por página

  // Resetar a página para 1 sempre que o filtro mudar
  useEffect(() => {
    setCurrentPage(1);
  }, [filterOption, customStart, customEnd]);

  // ==========================================
  // 2. LÓGICA DE FILTRAGEM DE DATAS
  // ==========================================
  const filteredCommissions = useMemo(() => {
    if (filterOption === 'all') return commissions;

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    const limitDate = new Date();

    if (filterOption !== 'custom') {
      // Subtrai os dias selecionados
      limitDate.setDate(today.getDate() - parseInt(filterOption));
      limitDate.setHours(0, 0, 0, 0);
    }

    return commissions.filter(c => {
      // Garante que o parse da data (YYYY-MM-DD) ignore o fuso horário problemático
      const cDate = new Date(c.date + 'T12:00:00'); 
      
      if (filterOption === 'custom') {
        const start = customStart ? new Date(customStart + 'T00:00:00') : null;
        const end = customEnd ? new Date(customEnd + 'T23:59:59') : null;
        
        if (start && cDate < start) return false;
        if (end && cDate > end) return false;
        return true;
      }
      
      return cDate >= limitDate && cDate <= today;
    });
  }, [commissions, filterOption, customStart, customEnd]);


  // ==========================================
  // 3. CÁLCULOS (Baseados nos dados filtrados)
  // ==========================================
  const totals = useMemo(() => {
    const total = filteredCommissions.reduce((sum, item) => sum + item.value, 0);
    const vendas = filteredCommissions.filter(c => c.type === 'venda').reduce((sum, item) => sum + item.value, 0);
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
    { name: 'Vendas', value: totals.vendas },
    { name: 'Locação', value: totals.locacao }
  ].filter(item => item.value > 0); 


  // ==========================================
  // 4. LÓGICA DE PAGINAÇÃO DA TABELA
  // ==========================================
  const totalPages = Math.ceil(filteredCommissions.length / itemsPerPage) || 1;
  const currentTableData = filteredCommissions.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full max-w-[1400px] mx-auto">
      
      {/* BARRA DE FILTROS SUPERIOR */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="flex items-center gap-2 text-slate-700 font-bold">
            <Filter size={20} className="text-green-600"/>
            <span>Filtrar Período:</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
            <select 
                value={filterOption} 
                onChange={(e) => setFilterOption(e.target.value)}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-green-500 text-sm cursor-pointer"
            >
                <option value="all">Todo o Período</option>
                <option value="1">Hoje (Últimas 24h)</option>
                <option value="7">Últimos 7 dias</option>
                <option value="14">Últimos 14 dias</option>
                <option value="30">Últimos 30 dias</option>
                <option value="custom">Personalizado...</option>
            </select>

            {filterOption === 'custom' && (
                <div className="flex items-center gap-2 animate-in slide-in-from-left-2">
                    <input 
                        type="date" 
                        value={customStart}
                        onChange={(e) => setCustomStart(e.target.value)}
                        className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <span className="text-slate-400 font-bold">até</span>
                    <input 
                        type="date" 
                        value={customEnd}
                        onChange={(e) => setCustomEnd(e.target.value)}
                        className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>
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
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider truncate">Ganhos Totais</p>
            <p className="text-2xl font-black text-slate-800 truncate">{formatCurrency(totals.total)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="h-14 w-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
            <ShoppingCart size={28} />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider truncate">Total de Vendas</p>
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
        {/* Gráfico de Barras - Evolução */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
          <h3 className="text-sm font-bold text-slate-800 uppercase mb-6 flex items-center gap-2">
            <TrendingUp size={16} className="text-green-600" /> Evolução de Comissões
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} dy={10} />
                <YAxis tickFormatter={(val) => `R$ ${val}`} axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <RechartsTooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(val: number) => formatCurrency(val)}
                />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '20px' }} />
                <Bar dataKey="vendas" name="Vendas" fill="#15803d" radius={[4, 4, 0, 0]} />
                <Bar dataKey="locacao" name="Locação" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Pizza - Proporção */}
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 uppercase mb-6 flex items-center gap-2">
            <HandCoins size={16} className="text-blue-600" /> Origem da Receita
          </h3>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieChartData} innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(val: number) => formatCurrency(val)} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* EXTRATO DE COMISSÕES (COM PAGINAÇÃO) */}
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
                <th className="p-5 border-b border-gray-50">Descrição</th>
                <th className="p-5 border-b border-gray-50 text-center">Tipo</th>
                <th className="p-5 border-b border-gray-50 text-right">Valor Creditado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentTableData.length > 0 ? currentTableData.map((com, index) => (
                <tr key={com._id || com.id || index} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-5 text-sm font-medium text-slate-500 whitespace-nowrap">
                    {com.date.split('-').reverse().join('/')} {/* Formata YYYY-MM-DD para DD/MM/YYYY */}
                  </td>
                  <td className="p-5 text-sm font-bold text-slate-700 w-full">{com.description}</td>
                  <td className="p-5 text-center">
                    <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase whitespace-nowrap ${
                        com.type === 'venda' 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                        {com.type}
                    </span>
                  </td>
                  <td className="p-5 text-right font-black text-slate-800 whitespace-nowrap">
                    {formatCurrency(com.value)}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="p-20 text-center text-gray-400 italic font-medium">
                    Nenhuma comissão registrada para o período selecionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* CONTROLES DE PAGINAÇÃO */}
        {totalPages > 1 && (
            <div className="p-5 border-t border-gray-100 flex items-center justify-between bg-white">
                <p className="text-xs font-bold text-slate-400">
                    Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, filteredCommissions.length)} de {filteredCommissions.length}
                </p>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <span className="text-sm font-bold text-slate-700 px-4">
                        Página {currentPage} de {totalPages}
                    </span>
                    <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}