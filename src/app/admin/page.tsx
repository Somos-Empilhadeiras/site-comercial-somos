'use client';

import React, { useState, useEffect } from 'react';
import {
    ShieldCheck, FileSpreadsheet, CheckCircle, AlertCircle, LayoutTemplate,
    LogOut, LayoutDashboard, Users, UserPlus, MapPin, ChevronRight, Menu, 
    ChevronLeft, List, Edit, Trash2, X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import RegisterCollaboratorForm from '@/shared/components/forms/RegisterCollaboratorForm';
import RegisterUnitForm from '@/shared/components/forms/RegisterUnitForm';
import RegisterCardForm from '@/shared/components/forms/RegisterCardForm';

export default function AdminDashboard() {
    const router = useRouter();
    // NOVO: Adicionada a aba 'records'
    const [activeTab, setActiveTab] = useState<'dashboard' | 'records' | 'upload' | 'permissions' | 'register' | 'units' | 'cards'>('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Estados de Dados
    const [collaborators, setCollaborators] = useState<any[]>([]);
    const [allCommissions, setAllCommissions] = useState<any[]>([]);
    const [allCards, setAllCards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Estados do Upload
    const [selectedCollab, setSelectedCollab] = useState('');
    const [excelData, setExcelData] = useState('');
    const [uploadMessage, setUploadMessage] = useState({ type: '', text: '' });
    const [isUploading, setIsUploading] = useState(false);

    // Estados de Permissão
    const [permSelectedCollab, setPermSelectedCollab] = useState('');

    // NOVO: Estados para Edição e Deleção
    const [editingCommission, setEditingCommission] = useState<any>(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const [resCollabs, resComms, resCards] = await Promise.all([
                fetch('/api/collaborators', { cache: 'no-store' }),
                fetch('/api/commissions', { cache: 'no-store' }), // Usando a URL com dois 'm'
                fetch('/api/cards', { cache: 'no-store' })
            ]);

            if (resCollabs.ok && resCollabs.headers.get('content-type')?.includes('application/json')) {
                const data = await resCollabs.json();
                setCollaborators(data.filter((c: any) => c.role !== 'admin'));
            }

            if (resComms.ok && resComms.headers.get('content-type')?.includes('application/json')) {
                const data = await resComms.json();
                setAllCommissions(data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            }

            if (resCards.ok && resCards.headers.get('content-type')?.includes('application/json')) {
                const data = await resCards.json();
                setAllCards(data);
            }

        } catch (error) {
            console.error('Erro crítico no carregamento:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    };

    const handleProcessExcel = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);
        setUploadMessage({ type: '', text: '' });

        try {
            if (!selectedCollab) throw new Error('Selecione um colaborador.');
            const res = await fetch('/api/commissions/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rawText: excelData,
                    collaboratorId: selectedCollab,
                    mapping: { date: 0, description: 1, type: 2, value: 3 }
                }),
            });
            if (!res.ok) throw new Error('Falha no processamento.');
            setUploadMessage({ type: 'success', text: 'Importado com sucesso!' });
            setExcelData('');
            loadData();
        } catch (err: any) {
            setUploadMessage({ type: 'error', text: err.message });
        } finally {
            setIsUploading(false);
        }
    };

    // NOVO: Função para deletar lançamento
    const handleDeleteCommission = async (id: string) => {
        if (!window.confirm("Atenção: Tem certeza que deseja excluir este lançamento permanentemente?")) return;
        
        try {
            const res = await fetch(`/api/commissions?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert("Lançamento removido com sucesso!");
                loadData();
            } else {
                throw new Error("Erro ao excluir");
            }
        } catch (error) {
            console.error("Erro na deleção:", error);
            alert("Não foi possível excluir o lançamento.");
        }
    };

    // NOVO: Função para salvar a edição do lançamento
    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/commissions', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    id: editingCommission._id, 
                    updateData: {
                        date: editingCommission.date,
                        description: editingCommission.description,
                        type: editingCommission.type,
                        value: Number(editingCommission.value)
                    }
                })
            });

            if (res.ok) {
                setEditingCommission(null);
                loadData();
                alert("Lançamento atualizado com sucesso!");
            } else {
                throw new Error("Falha ao atualizar");
            }
        } catch (error) {
            console.error("Erro na edição:", error);
            alert("Não foi possível atualizar o lançamento.");
        }
    };

    const handleToggleCard = async (collabId: string, cardId: string) => {
        try {
            const res = await fetch('/api/collaborators/cards/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ collaboratorId: String(collabId), cardId })
            });

            if (res.ok) {
                setCollaborators(prev => prev.map(c => {
                    if (String(c._id) === String(collabId)) {
                        const isActive = c.activeCards?.includes(cardId);
                        return {
                            ...c,
                            activeCards: isActive
                                ? c.activeCards.filter((id: string) => id !== cardId)
                                : [...(c.activeCards || []), cardId]
                        };
                    }
                    return c;
                }));
            }
        } catch (error) {
            console.error("Erro ao alterar acesso:", error);
        }
    };

    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    const globalChartData = Object.values(allCommissions.reduce((acc: any, curr) => {
        const key = curr.monthYear;
        if (!acc[key]) acc[key] = { month: key, vendas: 0, locacao: 0 };
        if (curr.type === 'venda') acc[key].vendas += curr.value;
        else acc[key].locacao += curr.value;
        return acc;
    }, {})).sort((a: any, b: any) => a.month.localeCompare(b.month));

    const collabTotals = collaborators.map(c => {
        const total = allCommissions.filter(com => String(com.collaboratorId) === String(c._id)).reduce((sum, com) => sum + com.value, 0);
        return { ...c, total };
    }).sort((a, b) => b.total - a.total);

    const NavItem = ({ id, icon: Icon, label }: { id: typeof activeTab, icon: any, label: string }) => {
        const isActive = activeTab === id;
        return (
            <div className="relative group px-4">
                <button
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center ${isSidebarOpen ? 'justify-start px-4' : 'justify-center px-0'} py-4 font-bold transition-all duration-300 ${isActive
                        ? 'bg-slate-900 text-white shadow-lg rounded-2xl'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-xl hover:scale-[1.02]'
                    }`}
                >
                    <Icon size={20} className={`shrink-0 transition-transform duration-300 ${isActive ? 'text-green-400' : 'text-slate-400'}`} />
                    <span className={`ml-3 truncate transition-all duration-300 ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>{label}</span>
                    {isSidebarOpen && isActive && <ChevronRight size={16} className="ml-auto opacity-50" />}
                </button>
                {!isSidebarOpen && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-xl">
                        {label}
                        <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-slate-900 rotate-45 rounded-sm"></div>
                    </div>
                )}
            </div>
        );
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-green-700 font-bold animate-pulse">Sincronizando Painel Administrativo...</div>;

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* SIDEBAR */}
            <aside className={`bg-white border-r border-gray-100 shadow-sm flex flex-col fixed h-full z-50 transition-all duration-300 ${isSidebarOpen ? 'w-72' : 'w-24'}`}>
                <div className={`p-6 border-b border-gray-100 flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center flex-col gap-4'}`}>
                    <div className="flex items-center gap-4 overflow-hidden">
                        <div className="h-12 w-12 bg-slate-900 rounded-full flex items-center justify-center shrink-0 shadow-inner">
                            <ShieldCheck className="h-6 w-6 text-green-400" />
                        </div>
                        <div className={`transition-all duration-300 ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>
                            <h1 className="text-xl font-black text-slate-900 uppercase leading-tight">Gestão</h1>
                            <p className="text-green-700 text-[10px] uppercase font-bold tracking-widest">Master</p>
                        </div>
                    </div>
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                        {isSidebarOpen ? <ChevronLeft size={20} /> : <Menu size={24} />}
                    </button>
                </div>
                <nav className="flex-1 space-y-2 overflow-y-auto mt-6">
                    <NavItem id="dashboard" icon={LayoutDashboard} label="Visão Global" />
                    <NavItem id="records" icon={List} label="Extrato Geral" /> {/* NOVA ABA */}
                    <NavItem id="upload" icon={FileSpreadsheet} label="Importar Dados" />
                    <NavItem id="permissions" icon={Users} label="Gestão de Acessos" />
                    <NavItem id="register" icon={UserPlus} label="Novo Consultor" />
                    <NavItem id="units" icon={MapPin} label="Nova Unidade" />
                    <NavItem id="cards" icon={LayoutTemplate} label="Novo Módulo" />
                </nav>
                <div className="p-4 border-t border-gray-100 mb-4">
                    <button onClick={handleLogout} className={`flex items-center ${isSidebarOpen ? 'justify-center gap-3' : 'justify-center'} text-gray-400 hover:text-red-600 font-bold transition-all py-4 rounded-xl hover:bg-red-50 w-full`}>
                        <LogOut size={18} />
                        <span className={`transition-all duration-300 ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>Sair</span>
                    </button>
                </div>
            </aside>

            {/* CONTEÚDO */}
            <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-72' : 'ml-24'} p-10 overflow-y-auto w-full`}>
                <div className="max-w-[1400px] mx-auto w-full">
                    <header className="mb-10">
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight capitalize">
                            {activeTab === 'records' ? 'Extrato Geral e Edição' : activeTab}
                        </h2>
                        <p className="text-slate-500 font-medium mt-1">Gerencie indicadores, acessos e lançamentos.</p>
                    </header>

                    {activeTab === 'dashboard' && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
                                <div className="h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={globalChartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                            <YAxis tickFormatter={(val) => `R$ ${val}`} axisLine={false} tickLine={false} />
                                            <Tooltip formatter={(val) => formatCurrency(Number(val))} />
                                            <Bar dataKey="vendas" fill="#15803d" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="locacao" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {collabTotals.map(c => (
                                    <div key={String(c._id)} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">{c.state}</span>
                                        <h4 className="font-bold text-slate-800 truncate">{c.name}</h4>
                                        <div className="text-xl font-black text-green-700">{formatCurrency(c.total)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* NOVA ABA: EXTRATO E EDIÇÃO */}
                    {activeTab === 'records' && (
                        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in">
                            <div className="p-6 bg-slate-50 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Todos os Lançamentos</h3>
                            </div>
                            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-white text-[10px] uppercase font-black text-gray-400 sticky top-0 shadow-sm">
                                        <tr>
                                            <th className="p-5 border-b border-gray-50">Data</th>
                                            <th className="p-5 border-b border-gray-50">Consultor</th>
                                            <th className="p-5 border-b border-gray-50">Descrição</th>
                                            <th className="p-5 border-b border-gray-50 text-center">Tipo</th>
                                            <th className="p-5 border-b border-gray-50 text-right">Valor</th>
                                            <th className="p-5 border-b border-gray-50 text-center">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {allCommissions.map((com) => {
                                            const col = collaborators.find(c => String(c._id) === String(com.collaboratorId));
                                            return (
                                                <tr key={com._id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="p-5 text-sm font-medium text-slate-500">{com.date}</td>
                                                    <td className="p-5 text-sm font-bold text-slate-700">{col?.name || 'Desconhecido'}</td>
                                                    <td className="p-5 text-sm text-gray-600">{com.description}</td>
                                                    <td className="p-5 text-center">
                                                        <span className={`px-2 py-1 text-[10px] font-bold rounded-md uppercase ${com.type === 'venda' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                            {com.type}
                                                        </span>
                                                    </td>
                                                    <td className="p-5 text-right font-black text-slate-800">{formatCurrency(com.value)}</td>
                                                    <td className="p-5 text-center flex justify-center gap-3">
                                                        <button 
                                                            onClick={() => setEditingCommission(com)} 
                                                            className="text-blue-500 hover:text-blue-700 transition-colors"
                                                            title="Editar Lançamento"
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteCommission(com._id)} 
                                                            className="text-red-500 hover:text-red-700 transition-colors"
                                                            title="Excluir Lançamento"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {allCommissions.length === 0 && (
                                            <tr><td colSpan={6} className="p-10 text-center text-gray-400">Nenhum lançamento encontrado.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'upload' && (
                        <div className="w-full max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
                            {uploadMessage.text && <div className={`mb-6 p-4 rounded-xl ${uploadMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{uploadMessage.text}</div>}
                            <form onSubmit={handleProcessExcel} className="space-y-6">
                                <select value={selectedCollab} onChange={(e) => setSelectedCollab(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-xl font-bold" required>
                                    <option value="">Escolha o Consultor</option>
                                    {collaborators.map(c => <option key={String(c._id)} value={String(c._id)}>{c.name}</option>)}
                                </select>
                                <textarea value={excelData} onChange={(e) => setExcelData(e.target.value)} className="w-full h-48 p-4 bg-slate-50 border rounded-xl font-mono" placeholder="Cole os dados aqui..." required />
                                <button type="submit" disabled={isUploading} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl">{isUploading ? 'Processando...' : 'Importar'}</button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'permissions' && (
                        <div className="w-full max-w-4xl mx-auto bg-white p-8 rounded-3xl shadow-lg border border-gray-100 animate-in fade-in">
                            <select value={permSelectedCollab} onChange={(e) => setPermSelectedCollab(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-xl font-bold text-slate-700 mb-8 outline-none focus:ring-2 focus:ring-green-500">
                                <option value="">Selecione um consultor...</option>
                                {collaborators.map(c => <option key={String(c._id)} value={String(c._id)}>{c.name}</option>)}
                            </select>

                            {permSelectedCollab && (() => {
                                const user = collaborators.find(c => String(c._id) === String(permSelectedCollab));
                                if (!user) return <p className="text-center py-10 text-gray-400">Consultor não encontrado na lista.</p>;

                                return (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                                        {allCards.length === 0 && <p className="col-span-2 text-center text-gray-400 italic">Nenhum card cadastrado no banco.</p>}
                                        {allCards.map(card => {
                                            const isEnabled = user?.activeCards?.includes(card.id);
                                            return (
                                                <div key={String(card._id)} className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${isEnabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                                                    <div>
                                                        <p className={`font-bold text-sm ${isEnabled ? 'text-green-900' : 'text-gray-500'}`}>{card.title}</p>
                                                        <p className="text-[10px] text-gray-400 uppercase">{card.description}</p>
                                                    </div>
                                                    <button onClick={() => handleToggleCard(user._id, card.id)} className={`h-6 w-11 rounded-full relative transition-colors ${isEnabled ? 'bg-green-600' : 'bg-gray-300'}`}>
                                                        <span className={`absolute top-1 left-1 h-4 w-4 bg-white rounded-full transition-transform ${isEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {activeTab === 'register' && <div className="animate-in zoom-in-95"><RegisterCollaboratorForm onUserCreated={loadData} /></div>}
                    {activeTab === 'units' && <div className="animate-in zoom-in-95"><RegisterUnitForm onUnitCreated={loadData} /></div>}
                    {activeTab === 'cards' && <div className="animate-in zoom-in-95"><RegisterCardForm onCardCreated={loadData} /></div>}
                </div>
            </main>

            {/* MODAL DE EDIÇÃO */}
            {editingCommission && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
                        <div className="p-6 bg-slate-50 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-black text-slate-800 uppercase">Editar Lançamento</h3>
                            <button onClick={() => setEditingCommission(null)} className="text-gray-400 hover:text-red-500">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase">Data</label>
                                <input 
                                    type="text" 
                                    value={editingCommission.date}
                                    onChange={e => setEditingCommission({...editingCommission, date: e.target.value})}
                                    className="w-full p-3 bg-slate-50 border rounded-xl font-medium outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase">Descrição</label>
                                <input 
                                    type="text" 
                                    value={editingCommission.description}
                                    onChange={e => setEditingCommission({...editingCommission, description: e.target.value})}
                                    className="w-full p-3 bg-slate-50 border rounded-xl font-medium outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Tipo</label>
                                    <select 
                                        value={editingCommission.type}
                                        onChange={e => setEditingCommission({...editingCommission, type: e.target.value})}
                                        className="w-full p-3 bg-slate-50 border rounded-xl font-medium outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="venda">Venda</option>
                                        <option value="locacao">Locação</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Valor (R$)</label>
                                    <input 
                                        type="number" step="0.01"
                                        value={editingCommission.value}
                                        onChange={e => setEditingCommission({...editingCommission, value: e.target.value})}
                                        className="w-full p-3 bg-slate-50 border rounded-xl font-medium outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-colors mt-4">
                                Salvar Alterações
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}