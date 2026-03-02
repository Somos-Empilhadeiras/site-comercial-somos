'use client';

import React, { useState } from 'react';
import {
    LayoutTemplate, CheckCircle, AlertCircle, Lock, Unlock, Map, List, Edit, Trash2, X,
    Briefcase, HandCoins, Receipt, Package, Truck,
    Users, BarChart3, Calculator, Wrench, MapPin,
    FileText, Headset, Calendar, ShieldCheck, Link2, Eye
} from 'lucide-react';
import { toast } from 'sonner';

const AVAILABLE_ICONS = [
    { id: 'Briefcase', label: 'Comercial', icon: Briefcase },
    { id: 'HandCoins', label: 'Comissões', icon: HandCoins },
    { id: 'Receipt', label: 'Despesas', icon: Receipt },
    { id: 'Package', label: 'Logística', icon: Package },
    { id: 'Truck', label: 'Transporte', icon: Truck },
    { id: 'Wrench', label: 'Manutenção', icon: Wrench },
    { id: 'Users', label: 'Equipe/RH', icon: Users },
    { id: 'BarChart3', label: 'Métricas', icon: BarChart3 },
    { id: 'Calculator', label: 'Financeiro', icon: Calculator },
    { id: 'FileText', label: 'Relatórios', icon: FileText },
    { id: 'Calendar', label: 'Agenda', icon: Calendar },
    { id: 'Headset', label: 'Suporte', icon: Headset },
    { id: 'MapPin', label: 'Rotas', icon: MapPin },
    { id: 'ShieldCheck', label: 'Auditoria', icon: ShieldCheck },
];

const AVAILABLE_UNITS = [
    { id: 'all', name: 'Global (Todas)' },
    { id: 'go', name: 'Goiás (GO)' },
    { id: 'ba', name: 'Bahia (BA)' },
    { id: 'df', name: 'Distrito Federal (DF)' },
    { id: 'to', name: 'Tocantins (TO)' },
    { id: 'pe', name: 'Pernambuco (PE)' },
];

export default function RegisterCardForm({ onCardCreated, allCards = [] }: { onCardCreated?: () => void, allCards?: any[] }) {
    const [linkType, setLinkType] = useState<'external' | 'internal'>('external');

    const [cardForm, setCardForm] = useState({
        id: '', title: '', description: '', icon: 'Briefcase', url: '', isLocked: true, units: ['all']
    });

    const [editingCard, setEditingCard] = useState<any>(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    // Toggle de Unidades estilo "Tag"
    const handleUnitToggle = (unitId: string, isEditing: boolean = false) => {
        const targetState = isEditing ? editingCard : cardForm;
        const setTargetState = isEditing ? setEditingCard : setCardForm;

        // 1. BLINDAGEM: Se o card for antigo e não tiver 'units', assumimos ['all'] como padrão
        const safeUnits = targetState.units || ['all'];

        let newUnits = [...safeUnits];

        if (unitId === 'all') {
            // 2. Usamos o 'safeUnits' em vez de targetState.units diretamente
            newUnits = safeUnits.includes('all') ? [] : ['all'];
        } else {
            newUnits = newUnits.filter((u: string) => u !== 'all');
            if (newUnits.includes(unitId)) {
                newUnits = newUnits.filter((u: string) => u !== unitId);
            } else {
                newUnits.push(unitId);
            }
            if (newUnits.length === 0) newUnits = ['all'];
        }

        setTargetState({ ...targetState, units: newUnits });
    };

    // --- AÇÕES DE CRUD ---
    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setMessage({ type: '', text: '' });
        try {
            const res = await fetch('/api/cards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cardForm),
            });
            if (!res.ok) throw new Error((await res.json()).error || 'Falha ao cadastrar módulo.');
            setMessage({ type: 'success', text: 'Novo módulo cadastrado com sucesso!' });
            setCardForm({ id: '', title: '', description: '', icon: 'Briefcase', url: '', isLocked: true, units: ['all'] });
            setLinkType('external');
            if (onCardCreated) onCardCreated();
        } catch (err: any) { setMessage({ type: 'error', text: err.message }); }
        finally { setLoading(false); }
    };

    const handleDeleteCard = async (id: string) => {
        if (!window.confirm("Atenção: Excluir este módulo removerá o acesso em todas as unidades. Confirmar?")) return;
        try {
            const res = await fetch(`/api/cards?id=${id}`, { method: 'DELETE' });
            if (res.ok && onCardCreated) { onCardCreated(); toast.success("Módulo excluído com sucesso!"); }
            else throw new Error("Erro ao excluir");
        } catch (error) { toast.error("Não foi possível excluir o módulo."); }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/cards', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingCard)
            });
            if (res.ok) {
                setEditingCard(null);
                if (onCardCreated) onCardCreated();
                toast.success("Módulo atualizado com sucesso!");
            } else throw new Error("Erro ao atualizar");
        } catch (error) { toast.error("Não foi possível atualizar o módulo."); }
    };

    return (
        <div className="space-y-10 w-full animate-in slide-in-from-bottom-4 duration-500">

            {/* 1. TABELA DE MÓDULOS CADASTRADOS */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                        <List size={18} className="text-green-600" />
                        Módulos Ativos no Sistema
                    </h3>
                    <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                        {allCards.length} registro(s)
                    </span>
                </div>
                <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-white text-[10px] uppercase font-black text-slate-400 sticky top-0 shadow-sm z-10">
                            <tr>
                                <th className="p-5 border-b border-slate-100">Configuração do Módulo</th>
                                <th className="p-5 border-b border-slate-100 text-center">Visibilidade e Acesso</th>
                                <th className="p-5 border-b border-slate-100 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {allCards.map((card) => (
                                <tr key={card._id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="p-5">
                                        <p className="font-bold text-sm text-slate-800">{card.title}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase">ID: {card.id}</span>
                                            <span className="text-xs text-slate-500 truncate max-w-[200px]">{card.url}</span>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase ${card.isLocked ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                                                {card.isLocked ? 'Trancado (Requer Permissão)' : 'Livre (Público)'}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">
                                                Unidades: {card.units?.includes('all') ? 'Global' : card.units?.join(', ')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-5 text-center flex justify-center gap-4 mt-2">
                                        <button onClick={() => setEditingCard(card)} className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors" title="Editar">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => handleDeleteCard(card._id)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors" title="Excluir">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {allCards.length === 0 && (
                                <tr><td colSpan={3} className="p-10 text-center text-slate-400">Nenhum módulo cadastrado ainda.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 2. FORMULÁRIO DE CRIAÇÃO OTIMIZADO */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                    <div className="h-10 w-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                        <LayoutTemplate size={20} />
                    </div>
                    Criar Novo Módulo
                </h2>

                {message.text && (
                    <div className={`mb-8 p-4 rounded-xl flex items-center gap-3 font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleCreateSubmit} className="space-y-8">

                    {/* BLOCO 1: Informações Básicas */}
                    <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                            <FileText size={16} className="text-slate-400" />
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Informações Básicas</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase">ID do Módulo (slug exclusivo)</label>
                                <input type="text" required value={cardForm.id} onChange={(e) => setCardForm({ ...cardForm, id: e.target.value.replace(/\s+/g, '-').toLowerCase() })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm text-slate-700" placeholder="ex: relatorio-vendas" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase">Título de Exibição</label>
                                <input type="text" required value={cardForm.title} onChange={(e) => setCardForm({ ...cardForm, title: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-bold text-slate-800 uppercase" placeholder="ex: RELATÓRIO DE VENDAS" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase">Descrição Auxiliar</label>
                            <input type="text" required value={cardForm.description} onChange={(e) => setCardForm({ ...cardForm, description: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 text-sm text-slate-600" placeholder="Uma frase curta sobre a utilidade do módulo." />
                        </div>
                    </div>

                    {/* BLOCO 2: Segurança e Visibilidade */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Cadeado */}
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck size={16} className="text-slate-400" />
                                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Regra de Acesso</h3>
                                    </div>
                                    {cardForm.isLocked ? <Lock size={18} className="text-red-500" /> : <Unlock size={18} className="text-green-500" />}
                                </div>
                                <p className="text-xs text-slate-500 mb-6 min-h-[40px]">
                                    {cardForm.isLocked
                                        ? "Trancado. Apenas usuários logados que receberem permissão na aba 'Gestão de Acessos' poderão entrar."
                                        : "Livre. Qualquer pessoa que navegar na unidade verá e poderá acessar o link imediatamente."}
                                </p>
                            </div>
                            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200">
                                <button type="button" onClick={() => setCardForm({ ...cardForm, isLocked: !cardForm.isLocked })} className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none shadow-inner ${cardForm.isLocked ? 'bg-red-500' : 'bg-green-500'}`}>
                                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${cardForm.isLocked ? 'translate-x-7' : 'translate-x-1'}`} />
                                </button>
                                <span className="text-sm font-black text-slate-700 uppercase">
                                    {cardForm.isLocked ? 'Acesso Restrito' : 'Acesso Público'}
                                </span>
                            </div>
                        </div>

                        {/* Unidades */}
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col h-full">
                            <div className="flex items-center gap-2 mb-4">
                                <Map size={16} className="text-slate-400" />
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Visibilidade (Unidades)</h3>
                            </div>
                            <p className="text-xs text-slate-500 mb-4">Selecione em quais praças este card deve aparecer.</p>

                            <div className="flex-1 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar bg-white p-3 rounded-xl border border-slate-200">
                                <div className="flex flex-wrap gap-2">
                                    {AVAILABLE_UNITS.map(unit => {
                                        const isSelected = cardForm.units.includes(unit.id);
                                        return (
                                            <button
                                                key={unit.id}
                                                type="button"
                                                onClick={() => handleUnitToggle(unit.id)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${isSelected
                                                    ? 'bg-green-50 border-green-200 text-green-700'
                                                    : 'bg-white border-slate-200 text-slate-500 hover:border-green-300 hover:text-green-600'
                                                    }`}
                                            >
                                                {unit.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BLOCO 3: Link e Ícone */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* URL */}
                        <div className="lg:col-span-1 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-2 mb-6">
                                <Link2 size={16} className="text-slate-400" />
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Destino do Link</h3>
                            </div>
                            <div className="flex bg-white rounded-lg p-1 border border-slate-200 mb-4">
                                <button type="button" onClick={() => { setLinkType('external'); setCardForm({ ...cardForm, url: '' }) }} className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${linkType === 'external' ? 'bg-slate-100 text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                    Externo
                                </button>
                                <button type="button" onClick={() => { setLinkType('internal'); setCardForm({ ...cardForm, url: '' }) }} className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${linkType === 'internal' ? 'bg-slate-100 text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                    Sistema
                                </button>
                            </div>
                            {linkType === 'external' ? (
                                <input type="url" required value={cardForm.url} onChange={(e) => setCardForm({ ...cardForm, url: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 text-sm text-slate-700" placeholder="https://..." />
                            ) : (
                                <select required value={cardForm.url} onChange={(e) => setCardForm({ ...cardForm, url: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium text-slate-700">
                                    <option value="">-- Selecione a Rota --</option>
                                    <option value="/acerto-despesas">Acerto de Despesas</option>
                                    <option value="/comercial">Portal Comercial</option>
                                    <option value="/comissao-vendas">Comissão de Vendas</option>
                                </select>
                            )}
                        </div>

                        {/* Ícones */}
                        <div className="lg:col-span-2 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-2 mb-4 justify-between">
                                <div className="flex items-center gap-2">
                                    <Eye size={16} className="text-slate-400" />
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Identidade Visual</h3>
                                </div>
                                <span className="text-[10px] bg-white px-2 py-1 rounded text-slate-400 border border-slate-200">Escolha o ícone do módulo</span>
                            </div>

                            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2">
                                {AVAILABLE_ICONS.map((item) => {
                                    const IconComp = item.icon;
                                    const isSelected = cardForm.icon === item.id;
                                    return (
                                        <button
                                            key={item.id} type="button" onClick={() => setCardForm({ ...cardForm, icon: item.id })}
                                            className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-200 ${isSelected
                                                ? 'border-green-500 bg-green-50 text-green-700 shadow-md scale-105'
                                                : 'border-slate-200 bg-white text-slate-400 hover:border-green-300 hover:bg-green-50 hover:text-green-600'
                                                }`}
                                        >
                                            <IconComp size={20} className="mb-1" />
                                            <span className="text-[8px] font-black uppercase tracking-tighter text-center leading-none">
                                                {item.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-green-700 hover:bg-green-800 text-white font-black py-4 rounded-xl shadow-lg hover:shadow-green-900/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 mt-4 uppercase tracking-widest text-sm">
                        {loading ? 'Processando e Salvando...' : 'Finalizar Cadastro do Módulo'}
                    </button>
                </form>
            </div>

            {/* 3. MODAL DE EDIÇÃO */}
            {editingCard && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95">
                        <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="font-black text-slate-800 uppercase flex items-center gap-2">
                                <Edit size={18} className="text-blue-500" /> Editando Módulo: {editingCard.title}
                            </h3>
                            <button onClick={() => setEditingCard(null)} className="text-slate-400 hover:text-red-500 bg-white p-1 rounded-lg border border-slate-200 shadow-sm"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Título Exibido</label>
                                    <input type="text" value={editingCard.title} onChange={e => setEditingCard({ ...editingCard, title: e.target.value })} className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-500" required />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Destino (URL / Rota)</label>
                                    <input type="text" value={editingCard.url} onChange={e => setEditingCard({ ...editingCard, url: e.target.value })} className="w-full p-3 bg-white border border-slate-200 rounded-xl font-mono text-sm outline-none focus:border-blue-500" required />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Descrição Curta</label>
                                <input type="text" value={editingCard.description} onChange={e => setEditingCard({ ...editingCard, description: e.target.value })} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" required />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">

                                {/* CONTROLE DE ACESSO (Com lógica invertida para UX) */}
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">Controle de Acesso</label>
                                    <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
                                        <input
                                            type="checkbox"
                                            checked={!editingCard.isLocked}
                                            onChange={e => setEditingCard({ ...editingCard, isLocked: !e.target.checked })}
                                            className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                                            id="edit-lock"
                                        />
                                        <label htmlFor="edit-lock" className="text-sm font-bold text-slate-700 cursor-pointer">
                                            Livre (Público)
                                        </label>
                                    </div>
                                </div>

                                {/* VISIBILIDADE (UNIDADES) */}
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">Visibilidade (Unidades)</label>
                                    <div className="flex flex-wrap gap-2 bg-white p-3 rounded-xl border border-slate-200 max-h-[100px] overflow-y-auto custom-scrollbar">
                                        {AVAILABLE_UNITS.map(unit => {
                                            const isSelected = editingCard.units?.includes(unit.id);
                                            return (
                                                <button
                                                    key={`edit-${unit.id}`}
                                                    type="button"
                                                    onClick={() => handleUnitToggle(unit.id, true)}
                                                    className={`px-2 py-1 rounded text-[10px] font-bold transition-all border ${isSelected
                                                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                                                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600'
                                                        }`}
                                                >
                                                    {unit.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-blue-900/20">
                                Salvar Alterações do Módulo
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}