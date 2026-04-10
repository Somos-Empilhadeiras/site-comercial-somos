'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    Users, MapPin, LayoutTemplate, TrendingUp, Lock, Unlock, Map,
    History, Clock, HandCoins, PieChart as PieChartIcon, Filter
} from 'lucide-react';
import MiniBrazilMap from '../MiniBrazilMap';
import Link from 'next/link';

const PIE_COLORS_INNER = ['#15803d', '#1d4ed8', '#b45309', '#7e22ce', '#be185d', '#0f766e'];
const PIE_COLORS_OUTER = ['#22c55e', '#3b82f6', '#f59e0b', '#a855f7', '#ec4899', '#14b8a6', '#4ade80', '#60a5fa', '#fbbf24'];

export default function DashboardOverview({ commissions, collaborators, cards }: any) {
    const [units, setUnits] = useState<any[]>([]);

    // ==========================================
    // 1. ESTADOS DO FILTRO DE PERÍODO
    // ==========================================
    const [filterOption, setFilterOption] = useState<string>('all');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

    useEffect(() => {
        fetch('/api/units')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setUnits(data);
                else setUnits([]);
            })
            .catch(() => setUnits([]));
    }, []);

    // --- CÁLCULOS BASE E FORMATAÇÃO ---
    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    const safeNumber = (val: any) => {
        if (!val) return 0;
        if (typeof val === 'number') return val;
        let clean = String(val).replace(/[^\d,.-]/g, '');
        if (clean.includes('.') && clean.includes(',')) clean = clean.replace(/\./g, '');
        clean = clean.replace(',', '.');
        const num = parseFloat(clean);
        return isNaN(num) ? 0 : num;
    };

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

    // ==========================================
    // 2. LÓGICA DE FILTRAGEM DE DATAS (CORRIGIDA)
    // ==========================================
    const filteredCommissions = useMemo(() => {
        if (!commissions) return [];
        if (filterOption === 'all') return commissions;

        const today = new Date();
        today.setHours(23, 59, 59, 999);
        const limitDate = new Date();

        if (filterOption !== 'custom') {
            if (filterOption === '90') {
                limitDate.setMonth(today.getMonth() - 3);
            } else {
                limitDate.setDate(today.getDate() - parseInt(filterOption));
            }
            limitDate.setHours(0, 0, 0, 0);
        }

        return commissions.filter((c: any) => {
            // CORREÇÃO AQUI: Prioriza a data informada no extrato (date/data) antes da data do sistema (createdAt)
            let dateStr = c.date || c.data || c.createdAt;
            if (!dateStr) return true;

            // Garante que o fuso horário não jogue a data para o dia anterior
            if (typeof dateStr === 'string' && dateStr.includes('T')) {
                dateStr = dateStr.split('T')[0];
            }
            const cDate = new Date(dateStr + 'T12:00:00');

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
    // 3. ATUALIZAÇÃO DOS CÁLCULOS
    // ==========================================

    const totalRevenue = filteredCommissions.reduce((sum: number, curr: any) => sum + safeNumber(curr.valorVenda), 0) || 0;
    const lockedCards = cards?.filter((c: any) => c.isLocked).length || 0;
    const freeCards = (cards?.length || 0) - lockedCards;

    // --- GRÁFICO 1: RANKING DE FATURAMENTO ---
    const performanceChartData = useMemo(() => {
        if (!collaborators || !filteredCommissions) return [];
        const data = collaborators.map((c: any) => {
            const totalVendas = filteredCommissions
                .filter((com: any) => String(com.collaboratorId) === String(c._id))
                .reduce((sum: number, com: any) => sum + safeNumber(com.valorVenda), 0);
            return {
                name: c.name.split(' ')[0],
                fullName: c.name,
                totalVendas: totalVendas
            };
        });
        return data.filter((d: any) => d.totalVendas > 0).sort((a: any, b: any) => b.totalVendas - a.totalVendas);
    }, [collaborators, filteredCommissions]);

    // --- GRÁFICO 2: PIZZA DUPLA ---
    const doublePieData = useMemo(() => {
        if (!collaborators || !filteredCommissions) return { states: [], collabs: [] };

        const statesMap: Record<string, number> = {};
        const collabList: any[] = [];

        collaborators.forEach((c: any) => {
            const vendas = filteredCommissions
                .filter((com: any) => String(com.collaboratorId) === String(c._id))
                .reduce((sum: number, com: any) => sum + safeNumber(com.valorVenda), 0);

            if (vendas > 0) {
                const state = (c.state || 'OUTROS').toUpperCase();

                if (!statesMap[state]) statesMap[state] = 0;
                statesMap[state] += vendas;

                collabList.push({
                    name: c.name.split(' ')[0],
                    state: state,
                    value: vendas
                });
            }
        });

        const states = Object.keys(statesMap).map(state => ({
            name: state,
            value: statesMap[state]
        })).sort((a, b) => a.name.localeCompare(b.name));

        collabList.sort((a, b) => a.state.localeCompare(b.state));

        return { states, collabs: collabList };
    }, [collaborators, filteredCommissions]);

    const collabTotals = (collaborators || []).map((c: any) => {
        const total = filteredCommissions.filter((com: any) => String(com.collaboratorId) === String(c._id))
            .reduce((sum: number, com: any) => sum + safeNumber(com.valorVenda), 0) || 0;
        return { ...c, total };
    }).sort((a: any, b: any) => b.total - a.total).slice(0, 4);

    const activeStates = [...new Set(
        collaborators
            .filter((c: any) => c.state)
            .map((c: any) => c.state.toUpperCase())
    )];

    // 2. Estados Azuis (Onde ocorreram comissões do tipo "locacao")
    const rentalStates = [...new Set(
        commissions
            .filter((c: any) => c.type === 'locacao' && c.estado)
            .map((c: any) => c.estado.toUpperCase())
    )];

    // --- LOG DE ATIVIDADES ---
    const buildActivityLog = () => {
        const logs: any[] = [];

        filteredCommissions.forEach((c: any) => {
            // CORREÇÃO: Usa a data real para o log também
            let logDateStr = c.date || c.data || c.createdAt;
            if (typeof logDateStr === 'string' && logDateStr.includes('T')) logDateStr = logDateStr.split('T')[0];
            const logDate = logDateStr ? new Date(logDateStr + 'T12:00:00') : new Date();

            const col = collaborators?.find((user: any) => String(user._id) === String(c.collaboratorId));
            logs.push({
                id: `com-${c._id || Math.random()}`,
                title: `Nova Venda`,
                desc: `${col ? col.name : 'Consultor'} (Cli: ${c.cliente})`,
                value: formatCurrency(safeNumber(c.valorVenda)),
                date: logDate,
                icon: HandCoins,
                color: 'text-green-600',
                bg: 'bg-green-50'
            });
        });

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
        return logs.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);
    };

    const recentLogs = buildActivityLog();

    return (
        <div className="space-y-8 animate-in fade-in duration-500 w-full pb-10">

            {/* ========================================== */}
            {/* BARRA DE FILTROS SUPERIOR */}
            {/* ========================================== */}
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-4 justify-between">
                <div className="flex items-center gap-2 text-slate-700 font-bold px-2">
                    <Filter size={20} className="text-green-600" />
                    <span>Período de Análise:</span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={filterOption}
                        onChange={(e) => setFilterOption(e.target.value)}
                        className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-green-500 text-sm cursor-pointer"
                    >
                        <option value="all">Todo o Período</option>
                        <option value="7">Últimos 7 dias</option>
                        <option value="14">Últimos 14 dias</option>
                        <option value="30">Últimos 30 dias</option>
                        <option value="90">Últimos 3 meses</option>
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

            {/* 1. LINHA DE KPIS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-4 group hover:shadow-md transition-shadow">
                    <div className="h-14 w-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Faturamento do Período</p>
                        <h3 className="text-2xl font-black text-slate-800">{formatCurrency(totalRevenue)}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-4 group hover:shadow-md transition-shadow">
                    <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Consultores Ativos</p>
                        <h3 className="text-2xl font-black text-slate-800">{collaborators?.length || 0}</h3>
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

            {/* 2. LINHA: RANKING DE BARRAS & MAPA */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col">
                    <div className="mb-6 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp size={18} className="text-green-600" /> Ranking de Faturamento
                        </h3>
                    </div>

                    <div style={{ width: '100%', height: 300 }}>
                        {performanceChartData.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-slate-400 italic font-medium">
                                Nenhuma venda registrada neste período.
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={performanceChartData}
                                    layout="vertical"
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                    <XAxis type="number" tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} width={80} />
                                    <Tooltip formatter={(val: number) => formatCurrency(val)} cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Bar dataKey="totalVendas" name="Faturamento" fill="#16a34a" radius={[0, 4, 4, 0]} barSize={28} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col">
                    <div className="mb-6">
                        <h3 className="font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                            <Map size={18} className="text-blue-600" /> Presença Nacional
                        </h3>
                    </div>
                    <div className="flex-1 bg-slate-50 rounded-2xl flex items-center justify-center p-4 border border-slate-100 min-h-80">
                        <div className="h-[300px] w-full">
                            <MiniBrazilMap
                                activeStates={activeStates}
                                rentalStates={rentalStates}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. LINHA INFERIOR (Top Consultores Expandido) */}
            <div className="w-full flex flex-col mt-4">
                <h3 className="font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-4 px-2">
                    Top Consultores (Performance em Vendas)
                </h3>
                {collabTotals.length === 0 ? (
                    <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200 text-center text-slate-400 italic font-medium">
                        Sem vendas neste período para montar o ranking.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {collabTotals.map((c: any, index: number) => (
                            <Link href={`/${c.state}/${encodeURIComponent(c.name)}/comissao-vendas`} key={String(c._id)} className="bg-white rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden hover:shadow-md transition-shadow hover:-translate-y-2 transition-transform">
                                <div className="p-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 bg-slate-100 text-slate-400 font-black text-xs px-3 py-1 rounded-bl-xl">
                                        #{index + 1}
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{c.state || 'Sem Unidade'}</span>
                                    <h4 className="font-black text-slate-800 truncate mt-1 text-lg">{c.name}</h4>
                                    <div className="text-xl font-black text-green-600 mt-3">{formatCurrency(c.total)}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* 3. LINHA: PIZZA DUPLA & LOGS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                {/* GRÁFICO DE PIZZA DUPLA */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col">
                    <div className="mb-4">
                        <h3 className="font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                            <PieChartIcon size={18} className="text-orange-600" /> Origem das Vendas (Estado vs Equipe)
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">O anel interno representa o Estado. O anel externo representa o volume de cada consultor.</p>
                    </div>

                    <div style={{ width: '100%', height: 400 }} className="flex justify-center items-center">
                        {doublePieData.states.length === 0 ? (
                            <div className="text-slate-400 italic font-medium">
                                Nenhum faturamento para gerar o gráfico neste período.
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Tooltip
                                        formatter={(val: number) => formatCurrency(val)}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />

                                    <Pie
                                        data={doublePieData.states}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius="50%"
                                        fill="#8884d8"
                                    >
                                        {doublePieData.states.map((entry, index) => (
                                            <Cell key={`cell-state-${index}`} fill={PIE_COLORS_INNER[index % PIE_COLORS_INNER.length]} />
                                        ))}
                                    </Pie>

                                    <Pie
                                        data={doublePieData.collabs}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius="60%"
                                        outerRadius="80%"
                                        fill="#82ca9d"
                                        // CORREÇÃO: Sem nenhuma condição if/else. O label vai forçar a aparecer para todos!
                                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                                    >
                                        {doublePieData.collabs.map((entry, index) => (
                                            <Cell key={`cell-collab-${index}`} fill={PIE_COLORS_OUTER[index % PIE_COLORS_OUTER.length]} />
                                        ))}
                                    </Pie>

                                    <Legend
                                        verticalAlign="bottom"
                                        content={() => (
                                            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 pt-6">
                                                {doublePieData.states.map((state, index) => (
                                                    <div key={`custom-legend-${index}`} className="flex items-center gap-2">
                                                        <span
                                                            className="w-3 h-3 rounded-full shadow-sm"
                                                            style={{ backgroundColor: PIE_COLORS_INNER[index % PIE_COLORS_INNER.length] }}
                                                        ></span>
                                                        <span className="text-xs font-bold text-slate-700">
                                                            {state.name} <span className="text-slate-400 font-medium">({formatCurrency(state.value)})</span>
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Histórico / Logs */}
                <div className="lg:col-span-1 flex flex-col">
                    <h3 className="font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-4 px-2">
                        <History size={18} className="text-slate-400" /> Últimas Atividades
                    </h3>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 min-h-[400px]">
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