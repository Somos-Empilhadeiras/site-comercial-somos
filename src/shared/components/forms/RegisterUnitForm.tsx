'use client';

import React, { useState, useEffect } from 'react';
import {
    MapPin, CheckCircle, AlertCircle, List, Edit, Trash2, X
} from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterUnitForm({ onUnitCreated }: { onUnitCreated?: () => void }) {
    // ESTADOS DE DADOS
    const [units, setUnits] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // ESTADO DO FORMULÁRIO DE CRIAÇÃO
    const [unitForm, setUnitForm] = useState({ id: '', name: '', address: '' });
    
    // ESTADO DO MODAL DE EDIÇÃO
    const [editingUnit, setEditingUnit] = useState<any>(null);

    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    // Busca as unidades assim que o componente monta
    const fetchUnits = async () => {
        setIsLoadingData(true);
        try {
            const res = await fetch('/api/units');
            if (res.ok) {
                const data = await res.json();
                setUnits(data);
            }
        } catch (error) {
            console.error("Erro ao buscar unidades", error);
        } finally {
            setIsLoadingData(false);
        }
    };

    useEffect(() => {
        fetchUnits();
    }, []);

    // --- AÇÕES DE CRUD ---

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setMessage({ type: '', text: '' });
        try {
            // Garante que a sigla (id) fique em minúsculo, ex: 'SP' -> 'sp'
            const payload = { ...unitForm, id: unitForm.id.toLowerCase() };

            const res = await fetch('/api/units', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error((await res.json()).error || 'Falha ao cadastrar unidade.');

            setMessage({ type: 'success', text: 'Unidade cadastrada com sucesso!' });
            setUnitForm({ id: '', name: '', address: '' });
            fetchUnits(); // Recarrega a tabela
            if (onUnitCreated) onUnitCreated(); 
        } catch (err: any) { setMessage({ type: 'error', text: err.message }); } 
        finally { setLoading(false); }
    };

    const handleDeleteUnit = async (id: string) => {
        if (!window.confirm("Atenção: Excluir esta unidade pode impactar os cards vinculados a ela. Deseja continuar?")) return;
        try {
            const res = await fetch(`/api/units?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchUnits();
                if (onUnitCreated) onUnitCreated();
                toast.success("Unidade excluída com sucesso!");
            } else throw new Error("Erro ao excluir");
        } catch (error) { toast.error("Não foi possível excluir a unidade."); }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Garante consistência na sigla
            const payload = { ...editingUnit, id: editingUnit.id.toLowerCase() };

            const res = await fetch('/api/units', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setEditingUnit(null);
                fetchUnits();
                if (onUnitCreated) onUnitCreated();
                toast.success("Unidade atualizada com sucesso!");
            } else throw new Error("Erro ao atualizar");
        } catch (error) { toast.error("Não foi possível atualizar a unidade."); }
    };

    return (
        <div className="space-y-10 w-full animate-in slide-in-from-bottom-4 duration-500">
            
            {/* 1. TABELA DE UNIDADES CADASTRADAS */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                        <List size={18} className="text-blue-600" />
                        Unidades e Filiais
                    </h3>
                    <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                        {units.length} registro(s)
                    </span>
                </div>
                <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
                    {isLoadingData ? (
                        <div className="p-10 text-center text-slate-400 font-bold animate-pulse">Carregando dados...</div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-white text-[10px] uppercase font-black text-slate-400 sticky top-0 shadow-sm z-10">
                                <tr>
                                    <th className="p-5 border-b border-slate-100">Sigla (ID)</th>
                                    <th className="p-5 border-b border-slate-100">Nome da Unidade</th>
                                    <th className="p-5 border-b border-slate-100">Endereço Completo</th>
                                    <th className="p-5 border-b border-slate-100 text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {units.map((unit) => (
                                    <tr key={unit._id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="p-5">
                                            <span className="text-xs font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-lg uppercase border border-blue-100">
                                                {unit.id}
                                            </span>
                                        </td>
                                        <td className="p-5 font-bold text-sm text-slate-800">{unit.name}</td>
                                        <td className="p-5 text-xs text-slate-500 truncate max-w-[250px]">{unit.address}</td>
                                        <td className="p-5 text-center flex justify-center gap-4">
                                            <button onClick={() => setEditingUnit(unit)} className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors" title="Editar">
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => handleDeleteUnit(unit._id)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors" title="Excluir">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {units.length === 0 && (
                                    <tr><td colSpan={4} className="p-10 text-center text-slate-400">Nenhuma unidade cadastrada.</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* 2. FORMULÁRIO DE CRIAÇÃO */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <MapPin size={20} />
                    </div>
                    Cadastrar Nova Unidade / Filial
                </h2>

                {message.text && (
                    <div className={`mb-8 p-4 rounded-xl flex items-center gap-3 font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleCreateSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase">Sigla do Estado (ID)</label>
                            <input 
                                type="text" required maxLength={3}
                                value={unitForm.id} 
                                onChange={(e) => setUnitForm({ ...unitForm, id: e.target.value })} 
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm text-slate-700 uppercase" 
                                placeholder="EX: SP" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase">Nome da Unidade</label>
                            <input 
                                type="text" required 
                                value={unitForm.name} 
                                onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })} 
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-800 uppercase" 
                                placeholder="EX: SÃO PAULO - SP" 
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase">Endereço Completo</label>
                        <textarea 
                            required rows={3}
                            value={unitForm.address} 
                            onChange={(e) => setUnitForm({ ...unitForm, address: e.target.value })} 
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-600 resize-none custom-scrollbar" 
                            placeholder="Ex: Av. Paulista, 1000, Bela Vista..." 
                        />
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-xl shadow-lg hover:shadow-slate-900/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 mt-4 uppercase tracking-widest text-sm">
                        {loading ? 'Processando e Salvando...' : 'Registrar Unidade'}
                    </button>
                </form>
            </div>

            {/* 3. MODAL DE EDIÇÃO */}
            {editingUnit && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95">
                        <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="font-black text-slate-800 uppercase flex items-center gap-2">
                                <Edit size={18} className="text-blue-500"/> Editando Unidade: {editingUnit.id.toUpperCase()}
                            </h3>
                            <button onClick={() => setEditingUnit(null)} className="text-slate-400 hover:text-red-500 bg-white p-1 rounded-lg border border-slate-200 shadow-sm"><X size={20} /></button>
                        </div>
                        
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Sigla do Estado (ID)</label>
                                    <input 
                                        type="text" required maxLength={3}
                                        value={editingUnit.id} 
                                        onChange={e => setEditingUnit({...editingUnit, id: e.target.value})} 
                                        className="w-full p-3 bg-white border border-slate-200 rounded-xl font-mono font-bold text-slate-800 uppercase outline-none focus:border-blue-500" 
                                    />
                                    <p className="text-[10px] text-red-500 mt-1 font-medium">Cuidado ao alterar, afetará as rotas.</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Nome da Unidade</label>
                                    <input 
                                        type="text" required 
                                        value={editingUnit.name} 
                                        onChange={e => setEditingUnit({...editingUnit, name: e.target.value})} 
                                        className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-500" 
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Endereço Completo</label>
                                <textarea 
                                    required rows={3}
                                    value={editingUnit.address} 
                                    onChange={e => setEditingUnit({...editingUnit, address: e.target.value})} 
                                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 resize-none custom-scrollbar" 
                                />
                            </div>

                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-blue-900/20">
                                Salvar Alterações da Unidade
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}