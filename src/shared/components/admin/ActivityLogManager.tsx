'use client';

import React, { useState, useEffect } from 'react';
import { 
    Search, Clock, HandCoins, LayoutTemplate, 
    Calendar, CheckCircle2, Users, History, 
    ChevronLeft, ChevronRight, X,
    MapPin, Settings2, ShieldAlert, Trash2, Edit3, PlusCircle,
    LayoutGrid
} from 'lucide-react';

export default function ActivityLogManager({ logs = [], collaborators = [] }: any) {
    const [searchTerm, setSearchTerm] = useState('');
    // Estado para permitir junção de filtros (Multi-select)
    const [selectedFilters, setSelectedFilters] = useState<string[]>(['all']);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Mapeamento visual dinâmico para os tipos de ação
    const actionStyles: any = {
        create: { icon: PlusCircle, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Criação' },
        update: { icon: Edit3, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Edição' },
        delete: { icon: Trash2, color: 'text-red-600', bg: 'bg-red-50', label: 'Remoção' },
        access_change: { icon: ShieldAlert, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Permissão' },
    };

    // Lógica de Filtro e Busca
    const filteredLogs = logs.filter((log: any) => {
        const matchesSearch = 
            log.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
            log.targetName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.user?.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Verifica se "Tudo" está ativo ou se a entidade do log está nos filtros selecionados
        const matchesFilter = selectedFilters.includes('all') || selectedFilters.includes(log.entity);
        
        return matchesSearch && matchesFilter;
    });

    // Cálculos de Paginação
    const totalItems = filteredLogs.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const currentLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Gerenciador de Seleção de Filtros (Toggle)
    const toggleFilter = (filter: string) => {
        if (filter === 'all') {
            setSelectedFilters(['all']);
            return;
        }

        setSelectedFilters(prev => {
            const withoutAll = prev.filter(f => f !== 'all');
            let next;
            if (withoutAll.includes(filter)) {
                next = withoutAll.filter(f => f !== filter);
            } else {
                next = [...withoutAll, filter];
            }
            return next.length === 0 ? ['all'] : next;
        });
    };

    // Resetar para a primeira página quando os filtros mudarem
    useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedFilters, itemsPerPage]);

    return (
        <div className="flex flex-col xl:flex-row gap-8 animate-in fade-in duration-500 pb-10">
            
            {/* 1. CAIXA DE FILTROS (Lateral) */}
            <aside className="w-full xl:w-80 shrink-0 space-y-6">
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50">
                        <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                            <Settings2 size={16} />
                        </div>
                        <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Filtrar Atividade</h3>
                    </div>

                    <div className="space-y-1">
                        <FilterCheckbox 
                            label="Todas Atividades" 
                            active={selectedFilters.includes('all')} 
                            onClick={() => toggleFilter('all')} 
                            icon={History}
                        />
                        <FilterCheckbox 
                            label="Vendas & Comissões" 
                            active={selectedFilters.includes('commission')} 
                            onClick={() => toggleFilter('commission')} 
                            icon={HandCoins}
                        />
                        <FilterCheckbox 
                            label="Gestão de Equipe" 
                            active={selectedFilters.includes('collaborator')} 
                            onClick={() => toggleFilter('collaborator')} 
                            icon={Users}
                        />
                        <FilterCheckbox 
                            label="Unidades Comerciais" 
                            active={selectedFilters.includes('unit')} 
                            onClick={() => toggleFilter('unit')} 
                            icon={MapPin}
                        />
                        <FilterCheckbox 
                            label="Configuração de Módulos" 
                            active={selectedFilters.includes('card')} 
                            onClick={() => toggleFilter('card')} 
                            icon={LayoutTemplate}
                        />
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-50">
                        <button 
                            onClick={() => {setSearchTerm(''); setSelectedFilters(['all']);}}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-100 text-xs font-bold text-slate-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
                        >
                            <X size={14} /> Limpar Filtros
                        </button>
                    </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-[2rem] text-white shadow-xl">
                    <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-2">Logs Processados</p>
                    <h4 className="text-3xl font-black">{totalItems}</h4>
                    <p className="text-[10px] mt-4 opacity-60 leading-relaxed font-medium">Histórico permanente de ações administrativas registradas no banco de dados.</p>
                </div>
            </aside>

            {/* 2. CONTEÚDO (Busca + Listagem) */}
            <div className="flex-1 space-y-6 min-w-0">
                <div className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-500 transition-colors" size={22} />
                    <input 
                        type="text" 
                        placeholder="Buscar por cliente, consultor ou descrição da ação..." 
                        className="w-full pl-14 pr-6 py-5 bg-white shadow-sm border border-slate-200 rounded-3xl outline-none focus:ring-4 focus:ring-green-500/5 focus:border-green-500 transition-all text-lg font-medium text-slate-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                    <div className="divide-y divide-slate-50">
                        {currentLogs.length > 0 ? currentLogs.map((log: any) => {
                            const style = actionStyles[log.action] || actionStyles.update;
                            const ActionIcon = style.icon;
                            return (
                                <div key={log._id || log.id} className="p-8 flex flex-col md:flex-row md:items-center gap-8 hover:bg-slate-50/50 transition-colors group">
                                    <div className={`h-14 w-14 ${style.bg} ${style.color} rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:rotate-6 transition-transform`}>
                                        <ActionIcon size={24} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1.5">
                                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${style.bg} ${style.color}`}>
                                                {style.label}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{log.entity}</span>
                                        </div>
                                        <h4 className="text-slate-800 font-black text-xl leading-tight truncate">{log.targetName}</h4>
                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2">
                                            <span className="text-xs font-bold text-slate-500 flex items-center gap-2">
                                                <div className="h-6 w-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px]"><Users size={12}/></div>
                                                {log.user || 'Admin Master'}
                                            </span>
                                            <p className="text-sm text-slate-400 font-medium italic">{log.description}</p>
                                        </div>
                                    </div>
                                    <div className="md:text-right shrink-0 border-l border-slate-100 md:pl-8">
                                        <div className="text-sm font-black text-slate-800 flex items-center md:justify-end gap-2">
                                            <Calendar size={14} className="text-slate-400" />
                                            {new Date(log.createdAt).toLocaleDateString('pt-BR')}
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center md:justify-end gap-1.5">
                                            <Clock size={12} /> {new Date(log.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="p-24 text-center text-slate-400">
                                <History size={64} className="mx-auto mb-6 opacity-10" />
                                <p className="text-lg font-medium italic">Nenhum registro encontrado para estes filtros.</p>
                            </div>
                        )}
                    </div>

                    {/* 3. RODAPÉ DE PAGINAÇÃO */}
                    {totalItems > 0 && (
                        <div className="px-8 py-8 bg-slate-50 border-t border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-8">
                            <div className="flex items-center gap-8">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Exibir</span>
                                    <select 
                                        value={itemsPerPage} 
                                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                        className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-black text-slate-900 outline-none focus:ring-2 focus:ring-green-500 cursor-pointer shadow-sm"
                                    >
                                        <option value={10}>10 linhas</option>
                                        <option value={20}>20 linhas</option>
                                        <option value={50}>50 linhas</option>
                                    </select>
                                </div>
                                <div className="h-6 w-[1px] bg-slate-200 hidden sm:block" />
                                <p className="text-xs font-bold text-slate-500">
                                    Mostrando <span className="text-slate-900 font-black">{((currentPage - 1) * itemsPerPage) + 1}</span> - <span className="text-slate-900 font-black">{Math.min(currentPage * itemsPerPage, totalItems)}</span> de {totalItems}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="w-11 h-11 rounded-2xl bg-white border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-100 transition-all shadow-sm flex items-center justify-center"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                
                                <div className="flex gap-1.5 px-2">
                                    {[...Array(totalPages)].map((_, i) => {
                                        const p = i + 1;
                                        if (totalPages > 5 && Math.abs(p - currentPage) > 1 && p !== 1 && p !== totalPages) return null;
                                        return (
                                            <button
                                                key={p}
                                                onClick={() => setCurrentPage(p)}
                                                className={`w-11 h-11 rounded-2xl text-sm font-black transition-all ${
                                                    currentPage === p ? 'bg-slate-900 text-white shadow-xl scale-110' : 'bg-white border border-slate-200 text-slate-400 hover:text-slate-900 shadow-sm'
                                                }`}
                                            >
                                                {p}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button 
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="w-11 h-11 rounded-2xl bg-white border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-100 transition-all shadow-sm flex items-center justify-center"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Componente Interno: Item de Filtro Estilo Checkbox
function FilterCheckbox({ label, active, onClick, icon: Icon }: any) {
    return (
        <button 
            onClick={onClick}
            className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                active ? 'bg-slate-900 text-white shadow-lg' : 'hover:bg-slate-50 text-slate-500'
            }`}
        >
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-colors ${active ? 'bg-slate-800' : 'bg-slate-100 group-hover:bg-white'}`}>
                    <Icon size={16} className={active ? 'text-green-400' : 'text-slate-400'} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
            </div>
            <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                active ? 'border-green-400 bg-green-400' : 'border-slate-200 bg-white'
            }`}>
                {active && <CheckCircle2 size={12} className="text-slate-900" />}
            </div>
        </button>
    );
}