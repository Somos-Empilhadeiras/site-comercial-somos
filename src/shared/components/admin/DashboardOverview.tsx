'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
    Users, MapPin, LayoutTemplate, TrendingUp, Lock, Unlock, Map,
    History, Clock, HandCoins
} from 'lucide-react';
import MiniBrazilMap from '../MiniBrazilMap';

export default function DashboardOverview({ commissions, collaborators, cards }: any) {
    const [units, setUnits] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/units')
            .then(res => res.json())
            .then(data => {
                // CORREÇÃO: Verifica se o que chegou é um Array antes de salvar
                if (Array.isArray(data)) {
                    setUnits(data);
                } else {
                    console.error("API de Unidades não retornou um array:", data);
                    setUnits([]);
                }
            })
            .catch(err => {
                console.error("Erro na busca de unidades:", err);
                setUnits([]);
            });
    }, []);

    // --- CÁLCULOS E FORMATAÇÃO ---
    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    // Formatador de Tempo (Ex: "há 2h", "há 5 dias")
    const formatTimeAgo = (dateInput: string | Date) => {
        if (!dateInput) return '';
        const date = new Date(dateInput);
        if (isNaN(date.getTime())) return '';
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'agora mesmo';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `há ${minutes} min`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `há ${hours}h`;
        const days = Math.floor(hours / 24);
        return `há ${days} dias`;
    };

    // NOVOS CÁLCULOS: Usando valorVenda e valorComissao
    const totalRevenue = commissions?.reduce((sum: number, curr: any) => sum + (curr.valorVenda || 0), 0) || 0;
    const lockedCards = cards?.filter((c: any) => c.isLocked).length || 0;
    const freeCards = (cards?.length || 0) - lockedCards;

    // NOVO GRÁFICO: Cruzando Faturamento (Vendas) vs Comissões Pagas
    const globalChartData = Object.values((commissions || []).reduce((acc: any, curr: any) => {
        const key = curr.monthYear || 'Geral';
        if (!acc[key]) acc[key] = { month: key, vendas: 0, comissoes: 0 };

        acc[key].vendas += (curr.valorVenda || 0);
        acc[key].comissoes += (curr.valorComissao || 0);

        return acc;
    }, {})).sort((a: any, b: any) => a.month.localeCompare(b.month));

    // NOVO RANKING: Baseado no volume de vendas (valorVenda) gerado por cada consultor
    const collabTotals = (collaborators || []).map((c: any) => {
        const total = commissions?.filter((com: any) => String(com.collaboratorId) === String(c._id))
            .reduce((sum: number, com: any) => sum + (com.valorVenda || 0), 0) || 0;
        return { ...c, total };
    }).sort((a: any, b: any) => b.total - a.total).slice(0, 4);

    const activeStates = Array.isArray(units) ? units.map(u => u.id.toLowerCase()) : [];

    // --- CONSTRUÇÃO DO LOG DE ATIVIDADES ---
    const buildActivityLog = () => {
        const logs: any[] = [];

        // Adiciona Comissões (Agora usando Cliente e Valor da Venda)
        commissions?.forEach((c: any) => {
            if (c.createdAt) {
                const col = collaborators?.find((user: any) => String(user._id) === String(c.collaboratorId));
                logs.push({
                    id: `com-${c._id}`,
                    title: `Nova Venda`, // Removido o c.type, agora é tudo venda
                    desc: `${col ? col.name : 'Consultor'} (Cli: ${c.cliente})`, // Mostrando o cliente no log
                    value: formatCurrency(c.valorVenda),
                    date: new Date(c.createdAt),
                    icon: HandCoins,
                    color: 'text-green-600',
                    bg: 'bg-green-50'
                });
            }
        });

        // Adiciona Módulos
        cards?.forEach((c: any) => {
            if (c.createdAt) {
                logs.push({
                    id: `card-${c._id}`,
                    title: 'Módulo Criado',
                    desc: c.title,
                    value: c.isLocked ? 'Restrito' : 'Público',
                    date: new Date(c.createdAt),
                    icon: LayoutTemplate,
                    color: 'text-orange-600',
                    bg: 'bg-orange-50'
                });
            }
        });

        // Adiciona Unidades
        units?.forEach((u: any) => {
            if (u.createdAt) {
                logs.push({
                    id: `unit-${u._id}`,
                    title: 'Unidade Aberta',
                    desc: u.name,
                    value: u.id.toUpperCase(),
                    date: new Date(u.createdAt),
                    icon: MapPin,
                    color: 'text-purple-600',
                    bg: 'bg-purple-50'
                });
            }
        });

        // Ordena pela data mais recente e pega os 5 últimos
        return logs.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);
    };

    const recentLogs = buildActivityLog();

    return (
        <div className="space-y-8 animate-in fade-in duration-500 w-full pb-10">

            {/* 1. LINHA DE KPIS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-4 group hover:shadow-md transition-shadow">
                    <div className="h-14 w-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Faturamento Geral</p>
                        <h3 className="text-2xl font-black text-slate-800">{formatCurrency(totalRevenue)}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-4 group hover:shadow-md transition-shadow">
                    <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Consultores Ativos</p>
                        <h3 className="text-2xl font-black text-slate-800">{collaborators.length}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-4 group hover:shadow-md transition-shadow">
                    <div className="h-14 w-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                        <MapPin size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Unidades Comerciais</p>
                        <h3 className="text-2xl font-black text-slate-800">{units.length}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-4 group hover:shadow-md transition-shadow">
                    <div className="h-14 w-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                        <LayoutTemplate size={24} />
                    </div>
                    <div className="w-full">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Módulos (Cards)</p>
                        <div className="flex items-end justify-between w-full">
                            <h3 className="text-2xl font-black text-slate-800">{cards?.length || 0}</h3>
                            <div className="flex gap-2 text-[10px] font-bold">
                                <span className="flex items-center text-red-500 bg-red-50 px-1.5 py-0.5 rounded"><Lock size={10} className="mr-1" /> {lockedCards}</span>
                                <span className="flex items-center text-green-500 bg-green-50 px-1.5 py-0.5 rounded"><Unlock size={10} className="mr-1" /> {freeCards}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. LINHA CENTRAL */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col">
                    <div className="mb-6 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp size={18} className="text-green-600" /> Evolução de Receita
                        </h3>
                    </div>
                    <div className="h-[300px] w-full flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={globalChartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis tickFormatter={(val) => `R$ ${val}`} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip
                                    formatter={(val) => formatCurrency(Number(val))}
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                {/* NOVAS BARRAS DO GRÁFICO: Vendas em Verde, Comissões em Laranja */}
                                <Bar dataKey="vendas" name="Faturamento (Vendas)" fill="#16a34a" radius={[4, 4, 0, 0]} barSize={40} />
                                <Bar dataKey="comissoes" name="Comissões Pagas" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col">
                    <div className="mb-6">
                        <h3 className="font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                            <Map size={18} className="text-blue-600" /> Presença Nacional
                        </h3>
                    </div>
                    <div className="flex-1 bg-slate-50 rounded-2xl flex items-center justify-center p-4 border border-slate-100">
                        <MiniBrazilMap activeStates={activeStates} />
                    </div>
                </div>
            </div>

            {/* 3. LINHA INFERIOR (Top Ranking + Logs) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                {/* Ranking */}
                <div className="lg:col-span-2 flex flex-col">
                    <h3 className="font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-4 px-2">
                        Top Consultores (Performance em Vendas)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {collabTotals.map((c: any, index: number) => (
                            <div key={String(c._id)} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-slate-100 text-slate-400 font-black text-xs px-3 py-1 rounded-bl-xl">
                                    #{index + 1}
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{c.state || 'Sem Unidade'}</span>
                                <h4 className="font-black text-slate-800 truncate mt-1 text-lg">{c.name}</h4>
                                <div className="text-xl font-black text-green-600 mt-3">{formatCurrency(c.total)}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Histórico / Logs */}
                <div className="lg:col-span-1 flex flex-col">
                    <h3 className="font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-4 px-2">
                        <History size={18} className="text-slate-400" /> Últimas Atividades
                    </h3>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                        {recentLogs.length > 0 ? (
                            <div className="space-y-5">
                                {recentLogs.map((log: any) => {
                                    const Icon = log.icon;
                                    return (
                                        <div key={log.id} className="flex items-start gap-4 border-b border-slate-50 last:border-0 pb-5 last:pb-0">
                                            <div className={`mt-1 h-10 w-10 ${log.bg} ${log.color} rounded-xl flex items-center justify-center shrink-0`}>
                                                <Icon size={18} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-0.5">
                                                    <p className="text-xs font-bold text-slate-800 uppercase truncate pr-2">{log.title}</p>
                                                    <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1 whitespace-nowrap">
                                                        <Clock size={10} /> {formatTimeAgo(log.date)}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-medium text-slate-600 truncate">{log.desc}</p>
                                                <p className="text-[10px] font-bold text-slate-400 mt-1">{log.value}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="py-10 text-center text-slate-400">
                                <History size={32} className="mx-auto mb-3 opacity-20" />
                                <p className="text-sm font-medium">Nenhum registro encontrado ainda.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}