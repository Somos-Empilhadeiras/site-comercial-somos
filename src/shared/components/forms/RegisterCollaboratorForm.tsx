'use client';

import React, { useState } from 'react';
import { UserPlus, User, Lock, CheckCircle, AlertCircle } from 'lucide-react';

export default function RegisterCollaboratorForm({ onUserCreated }: { onUserCreated: () => void }) {
    const [formData, setFormData] = useState({
        name: '',
        login: '',
        password: '',
        role: 'employee',
        state: 'go'
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Função para sugerir o login baseado no nome (mantendo espaços e maiúsculas)
    const handleNameChange = (name: string) => {
        setFormData({
            ...formData,
            name,
            login: name // O login segue o nome exatamente como solicitado
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // CORREÇÃO AQUI: Apontar para o endpoint correto
            const res = await fetch('/api/collaborators', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    activeCards: ['card-comercial', 'card-comissao']
                }),
            });

            if (!res.ok) throw new Error('Falha ao registar. Verifique se o login já existe.');

            setMessage({ type: 'success', text: 'Colaborador registado com sucesso!' });
            setFormData({ name: '', login: '', password: '', role: 'employee', state: 'go' });
            onUserCreated();
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl bg-white p-8 rounded-3xl shadow-lg border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <UserPlus className="text-green-600" /> Cadastro de Consultor
            </h2>

            {message.text && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-gray-700 uppercase">Nome Completo</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                            placeholder="Ex: Khryss Mylla"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 uppercase">Login de Acesso</label>
                    <input
                        type="text"
                        required
                        value={formData.login}
                        onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-semibold text-green-800"
                        placeholder="Ex: Khryss Mylla"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 uppercase">Senha Inicial</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 uppercase">Unidade</label>
                    <select
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                    >
                        <option value="go">Goiânia - GO</option>
                        <option value="df">Brasília - DF</option>
                        <option value="to">Palmas - TO</option>
                        <option value="ba">LEM - BA</option>
                        <option value="pe">Recife - PE</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 uppercase">Permissão</label>
                    <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                    >
                        <option value="employee">Consultor(a)</option>
                        <option value="admin">Administrador</option>
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="md:col-span-2 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-slate-900/20 disabled:opacity-70 flex justify-center items-center gap-2 mt-4"
                >
                    {loading ? 'Salvando...' : 'Cadastrar agora'}
                </button>
            </form>
        </div>
    );
}