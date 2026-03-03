'use client';

import React, { useState, useEffect } from 'react';
import {
    UserPlus, CheckCircle, AlertCircle, List, Edit, Trash2, X, Shield, MapPin, Key
} from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterCollaboratorForm({ onUserCreated }: { onUserCreated?: () => void }) {
    // ESTADOS DE DADOS
    const [users, setUsers] = useState<any[]>([]);
    const [units, setUnits] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // ESTADOS DE FORMULÁRIO
    const [userForm, setUserForm] = useState({ name: '', login: '', password: '', state: '', role: 'employee' });
    const [editingUser, setEditingUser] = useState<any>(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    // Busca os dados iniciais (Usuários e Unidades para o Select)
    const fetchData = async () => {
        setIsLoadingData(true);
        try {
            const [usersRes, unitsRes] = await Promise.all([
                fetch('/api/collaborators'),
                fetch('/api/units')
            ]);

            if (usersRes.ok) setUsers(await usersRes.json());
            if (unitsRes.ok) setUnits(await unitsRes.json());
        } catch (error) {
            console.error("Erro ao buscar dados", error);
        } finally {
            setIsLoadingData(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- AÇÕES DE CRUD ---

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setMessage({ type: '', text: '' });
        try {
            const res = await fetch('/api/collaborators', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userForm),
            });

            if (!res.ok) throw new Error((await res.json()).error || 'Falha ao cadastrar consultor.');

            setMessage({ type: 'success', text: 'Consultor cadastrado com sucesso!' });
            setUserForm({ name: '', login: '', password: '', state: '', role: 'user' });
            fetchData();
            if (onUserCreated) onUserCreated();
        } catch (err: any) { setMessage({ type: 'error', text: err.message }); }
        finally { setLoading(false); }
    };

    const handleDeleteUser = async (id: string) => {
        if (!window.confirm("Atenção: Tem certeza que deseja excluir este usuário permanentemente?")) return;
        try {
            const res = await fetch(`/api/collaborators?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchData();
                if (onUserCreated) { onUserCreated(); toast.success("Usuário excluído com sucesso!"); }
            } else throw new Error("Erro ao excluir");
        } catch (error) { toast.error("Não foi possível excluir o usuário."); }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/collaborators', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingUser)
            });
            if (res.ok) {
                setEditingUser(null);
                fetchData();
                if (onUserCreated) onUserCreated();
                toast.success("Consultor atualizado com sucesso!");
            } else throw new Error("Erro ao atualizar");
        } catch (error) { toast.error("Não foi possível atualizar o consultor."); }
    };

    return (
        <div className="space-y-10 w-full animate-in slide-in-from-bottom-4 duration-500">

            {/* 1. TABELA DE USUÁRIOS CADASTRADOS */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                        <List size={18} className="text-emerald-600" />
                        Equipe e Acessos
                    </h3>
                    <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                        {users.length} usuário(s)
                    </span>
                </div>
                <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
                    {isLoadingData ? (
                        <div className="p-10 text-center text-slate-400 font-bold animate-pulse">Carregando equipe...</div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-white text-[10px] uppercase font-black text-slate-400 sticky top-0 shadow-sm z-10">
                                <tr>
                                    <th className="p-5 border-b border-slate-100">Consultor</th>
                                    <th className="p-5 border-b border-slate-100 text-center">Unidade</th>
                                    <th className="p-5 border-b border-slate-100 text-center">Permissão</th>
                                    <th className="p-5 border-b border-slate-100 text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.map((user) => (
                                    <tr key={user._id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="p-5">
                                            <p className="font-bold text-sm text-slate-800">{user.name}</p>
                                            {user.name !== 'Admin Master' &&
                                                (
                                                    <p className="text-xs text-slate-500 font-mono mt-0.5">Login: {user.login}</p>
                                                )
                                            }
                                        </td>
                                        <td className="p-5 text-center">
                                            <span className="text-xs font-black text-slate-600 bg-slate-100 px-3 py-1 rounded-lg uppercase border border-slate-200">
                                                {user.state || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="p-5 text-center">
                                            <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase ${user.role === 'admin' ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                                                {user.role === 'admin' ? 'Administrador' : 'Consultor'}
                                            </span>
                                        </td>
                                        <td className="p-5 text-center flex justify-center gap-4 mt-2">
                                            {user.name !== 'Admin Master' && (
                                                <>
                                                    <button onClick={() => setEditingUser(user)} className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors" title="Editar">
                                                        <Edit size={16} />
                                                    </button>

                                                    <button onClick={() => handleDeleteUser(user._id)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors" title="Excluir">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* 2. FORMULÁRIO DE CRIAÇÃO */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                    <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                        <UserPlus size={20} />
                    </div>
                    Cadastrar Novo Consultor
                </h2>

                {message.text && (
                    <div className={`mb-8 p-4 rounded-xl flex items-center gap-3 font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleCreateSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase">Nome Completo</label>
                        <input
                            type="text" required
                            value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800"
                            placeholder="Ex: João da Silva"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase">Login de Acesso</label>
                            <input
                                type="email"
                                required
                                value={userForm.login} onChange={(e) => setUserForm({ ...userForm, login: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm text-slate-700"
                                placeholder="Ex: joao.silva@somosempilhadeiras.com.br"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase">Senha Inicial</label>
                            <input
                                type="text" required
                                value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm text-slate-700"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-2"><MapPin size={14} /> Unidade Vinculada</label>
                            <select
                                required value={userForm.state} onChange={(e) => setUserForm({ ...userForm, state: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-slate-700"
                            >
                                <option value="">-- Selecione a Unidade --</option>
                                {units.map(u => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-2"><Shield size={14} /> Nível de Permissão</label>
                            <select
                                required value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-slate-700"
                            >
                                <option value="employee">Consultor(a) - Padrão</option>
                                <option value="admin">Administrador - Acesso Total</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-xl shadow-lg hover:shadow-slate-900/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 mt-4 uppercase tracking-widest text-sm">
                        {loading ? 'Processando...' : 'Cadastrar Consultor'}
                    </button>
                </form>
            </div>

            {/* 3. MODAL DE EDIÇÃO */}
            {editingUser && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95">
                        <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="font-black text-slate-800 uppercase flex items-center gap-2">
                                <Edit size={18} className="text-blue-500" /> Editando Consultor
                            </h3>
                            <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-red-500 bg-white p-1 rounded-lg border border-slate-200 shadow-sm"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
                                <input
                                    type="text" required
                                    value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                                    className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Login de Acesso</label>
                                    <input
                                        type="text" required
                                        value={editingUser.login} onChange={e => setEditingUser({ ...editingUser, login: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Key size={14} /> Nova Senha</label>
                                    <input
                                        type="text"
                                        value={editingUser.password || ''} onChange={e => setEditingUser({ ...editingUser, password: e.target.value })}
                                        className="w-full p-3 bg-white border border-slate-200 rounded-xl font-mono text-sm outline-none focus:border-blue-500 placeholder:text-slate-300"
                                        placeholder="Deixe em branco para não alterar"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Unidade</label>
                                    <select
                                        required value={editingUser.state} onChange={e => setEditingUser({ ...editingUser, state: e.target.value })}
                                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-500"
                                    >
                                        <option value="">Selecione...</option>
                                        {units.map(u => <option key={`edit-unit-${u.id}`} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Permissão</label>
                                    <select
                                        required value={editingUser.role} onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-500"
                                    >
                                        <option value="employee">Consultor(a) - Padrão</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-blue-900/20">
                                Salvar Alterações do Consultor
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}