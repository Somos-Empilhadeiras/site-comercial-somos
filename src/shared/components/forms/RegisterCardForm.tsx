'use client';

import React, { useState } from 'react';
import {
    LayoutTemplate, CheckCircle, AlertCircle,
    // Ícones do nosso seletor:
    Briefcase, HandCoins, Receipt, Package, Truck,
    Users, BarChart3, Calculator, Wrench, MapPin,
    FileText, Headset, Calendar, ShieldCheck
} from 'lucide-react';

// NOSSA LISTA PREDEFINIDA DE ÍCONES (Focada no seu negócio)
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

export default function RegisterCardForm({ onCardCreated }: { onCardCreated?: () => void }) {
    const [linkType, setLinkType] = useState<'external' | 'internal'>('external');
    const [cardForm, setCardForm] = useState({ id: '', title: '', description: '', icon: 'Briefcase', url: '', isGlobal: true }); const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await fetch('/api/cards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cardForm),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Falha ao cadastrar módulo.');
            }

            setMessage({ type: 'success', text: 'Novo módulo cadastrado com sucesso!' });
            setCardForm({ id: '', title: '', description: '', icon: 'Briefcase', url: '', isGlobal: true });

            if (onCardCreated) onCardCreated();
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-3xl bg-white p-8 rounded-3xl shadow-lg border border-gray-100 animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <LayoutTemplate className="text-green-600" /> Cadastrar Novo Módulo (Card)
            </h2>

            {message.text && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 uppercase">ID do Módulo (slug)</label>
                        <input type="text" required value={cardForm.id} onChange={(e) => setCardForm({ ...cardForm, id: e.target.value.replace(/\s+/g, '-').toLowerCase() })} className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-mono text-slate-700" placeholder="Ex: card-rh" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 uppercase">Título Exibido</label>
                        <input type="text" required value={cardForm.title} onChange={(e) => setCardForm({ ...cardForm, title: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-bold text-slate-700 uppercase" placeholder="Ex: RECURSOS HUMANOS" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 uppercase">Descrição Curta</label>
                    <input type="text" required value={cardForm.description} onChange={(e) => setCardForm({ ...cardForm, description: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 text-slate-700" placeholder="Ex: Acesse contracheques e avisos." />
                </div>

                <div className="space-y-4 md:col-span-2 p-4 bg-slate-50 rounded-xl border border-gray-200">
                    <label className="text-sm font-bold text-gray-700 uppercase">Configuração de Link</label>

                    <div className="flex gap-4 mb-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" checked={linkType === 'external'} onChange={() => { setLinkType('external'); setCardForm({ ...cardForm, url: '' }) }} className="accent-green-600" />
                            <span className="font-medium text-slate-700">Link Externo (Drive, PowerBI, Sites)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" checked={linkType === 'internal'} onChange={() => { setLinkType('internal'); setCardForm({ ...cardForm, url: '' }) }} className="accent-green-600" />
                            <span className="font-medium text-slate-700">Módulo do Sistema (Interno)</span>
                        </label>
                    </div>

                    {linkType === 'external' ? (
                        <input
                            type="url"
                            required
                            value={cardForm.url}
                            onChange={(e) => setCardForm({ ...cardForm, url: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-mono text-slate-700"
                            placeholder="https://drive.google.com/..."
                        />
                    ) : (
                        <select
                            required
                            value={cardForm.url}
                            onChange={(e) => setCardForm({ ...cardForm, url: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-mono text-slate-700"
                        >
                            <option value="">-- Selecione um módulo disponível --</option>
                            <option value="/acerto-despesas">Acerto de Despesas</option>
                            <option value="/comercial">Portal Comercial</option>
                            <option value="/comissao-vendas">Comissão de Vendas</option>
                            {/* Você adiciona novas options aqui conforme for programando novas telas */}
                        </select>
                    )}
                </div>

                {/* O NOVO GRID VISUAL DE ÍCONES */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                    <label className="text-sm font-bold text-gray-700 uppercase flex justify-between items-end">
                        <span>Selecione a Identidade Visual</span>
                        <span className="text-[10px] text-gray-400 font-medium normal-case">Clique para selecionar</span>
                    </label>

                    <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-3">
                        {AVAILABLE_ICONS.map((item) => {
                            const IconComp = item.icon;
                            const isSelected = cardForm.icon === item.id;

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setCardForm({ ...cardForm, icon: item.id })}
                                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-200 ${isSelected
                                        ? 'border-green-600 bg-green-50 text-green-700 shadow-md scale-105'
                                        : 'border-gray-100 bg-white text-gray-400 hover:border-green-200 hover:bg-green-50 hover:text-green-600'
                                        }`}
                                >
                                    <IconComp size={24} className="mb-2" />
                                    <span className="text-[9px] font-black uppercase tracking-tighter text-center leading-none">
                                        {item.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-xl transition-all disabled:opacity-50 mt-8">
                    {loading ? 'Salvando no banco...' : 'Registrar Novo Módulo'}
                </button>
            </form>
        </div>
    );
}