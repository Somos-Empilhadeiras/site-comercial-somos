'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { DollarSign, TrendingUp, Package, BarChart3, AlertCircle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface DashboardData {
  summary: {
    totalVendas: number;
    totalLocacao: number;
    totalGeral: number;
    quantidadeRegistros: number;
  };
  evolution: Array<{
    month: string;
    vendas: number;
    locacao: number;
  }>;
}

export default function ComissaoForm() {
  const params = useParams();
  const stateKey = params.state as string;
  const collaboratorSlug = params.collaborator as string;

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);

        // CORREÇÃO AQUI: Apontar para a rota correta do backend
        const collabRes = await fetch(`/api/collaborators?state=${stateKey}`);
        const collabs = await collabRes.json();

        // Procura o colaborador pelo slug da URL
        const user = collabs.find((c: any) => c.login === collaboratorSlug);

        if (!user) {
          throw new Error('Colaborador não encontrado.');
        }

        // 2. Buscamos as estatísticas financeiras dele
        const statsRes = await fetch(`/api/dashboard/stats?userId=${user.id}`, { cache: 'no-store' });

        if (!statsRes.ok) {
          throw new Error('Falha ao carregar os dados financeiros.');
        }

        const statsData = await statsRes.json();
        setData(statsData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (stateKey && collaboratorSlug) {
      loadDashboard();
    }
  }, [stateKey, collaboratorSlug]);

  // Formatar moeda para o padrão brasileiro
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Formatar o mês no gráfico (de "2026-03" para "Mar/2026")
  const formatMonth = (monthStr: string) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace('.', '');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-green-700 animate-pulse font-bold">
        <BarChart3 className="mr-3 h-6 w-6 animate-bounce" />
        Processando dados financeiros...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-600 bg-red-50 rounded-2xl border border-red-200 p-6">
        <AlertCircle className="h-10 w-10 mb-2" />
        <p className="font-bold">{error}</p>
      </div>
    );
  }

  if (!data || data.evolution.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
        <Package className="h-16 w-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-bold text-gray-700 mb-2">Nenhum dado encontrado</h3>
        <p className="text-gray-500">Ainda não existem comissões processadas no sistema para este perfil.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* 1. CARDS DE RESUMO (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 flex items-center justify-between border-l-4 border-l-green-500 hover:-translate-y-1 transition-transform">
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Vendas</p>
            <h3 className="text-2xl font-black text-green-900">{formatCurrency(data.summary.totalVendas)}</h3>
          </div>
          <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center">
            <TrendingUp className="text-green-600 h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 flex items-center justify-between border-l-4 border-l-blue-500 hover:-translate-y-1 transition-transform">
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Locação</p>
            <h3 className="text-2xl font-black text-blue-900">{formatCurrency(data.summary.totalLocacao)}</h3>
          </div>
          <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
            <Package className="text-blue-600 h-6 w-6" />
          </div>
        </div>

        <div className="bg-linear-to-br from-green-700 to-green-900 p-6 rounded-3xl shadow-lg flex items-center justify-between hover:-translate-y-1 transition-transform">
          <div>
            <p className="text-sm font-bold text-green-300 uppercase tracking-wider mb-1">Comissão Geral</p>
            <h3 className="text-3xl font-black text-white">{formatCurrency(data.summary.totalGeral)}</h3>
          </div>
          <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <DollarSign className="text-white h-6 w-6" />
          </div>
        </div>

      </div>

      {/* 2. GRÁFICO DE EVOLUÇÃO */}
      <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 w-full">
        <h3 className="text-lg font-bold text-green-900 uppercase tracking-wider mb-6 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Evolução de Comissões
        </h3>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.evolution}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0fdf4" />
              <XAxis
                dataKey="month"
                tickFormatter={formatMonth}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                dy={10}
              />
              <YAxis
                tickFormatter={(value: any) => `R$ ${value}`}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                dx={-10}
              />
              <Tooltip
                formatter={(value: any) => formatCurrency(Number(value) || 0)}
                labelFormatter={(label: any) => `Mês: ${formatMonth(label)}`}
                cursor={{ fill: '#f0fdf4' }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="vendas" name="Vendas" fill="#15803d" radius={[6, 6, 0, 0]} maxBarSize={60} />
              <Bar dataKey="locacao" name="Locação" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}