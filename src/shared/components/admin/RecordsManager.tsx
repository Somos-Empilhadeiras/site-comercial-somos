import React, { useState } from 'react';
import { Edit, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function RecordsManager({ commissions, collaborators, onUpdate }: any) {
    const [editingCommission, setEditingCommission] = useState<any>(null);
    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    // Lista de UFs para o Select de Estado
    const UFs = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

    const handleDelete = async (id: string) => {
        if (!window.confirm("Atenção: Tem certeza que deseja excluir este lançamento permanentemente?")) return;
        try {
            const res = await fetch(`/api/commissions?id=${id}`, { method: 'DELETE' });
            if (res.ok) { toast.success("Removido!"); onUpdate(); }
        } catch (error) { toast.error("Não foi possível excluir."); }
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/commissions', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingCommission._id,
                    updateData: {
                        date:          editingCommission.date,
                        cliente:       editingCommission.cliente,
                        modelo:        editingCommission.modelo,
                        quantidade:    Number(editingCommission.quantidade),
                        valorVenda:    Number(editingCommission.valorVenda),
                        valorComissao: Number(editingCommission.valorComissao),
                        // ✅ NOVOS CAMPOS ENVIADOS PARA A API
                        type:          editingCommission.type,
                        estado:        editingCommission.estado,
                    }
                })
            });
            if (res.ok) { setEditingCommission(null); onUpdate(); toast.success("Atualizado!"); }
        } catch (error) { toast.error("Não foi possível atualizar."); }
    };

    return (
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-white text-[10px] uppercase font-black text-gray-400 sticky top-0 shadow-sm z-10">
                        <tr>
                            <th className="p-5 border-b border-gray-50">Consultor</th>
                            <th className="p-5 border-b border-gray-50">Cliente</th>
                            <th className="p-5 border-b border-gray-50">Equipamento</th>
                            <th className="p-5 border-b border-gray-50 text-center">Tipo</th>
                            <th className="p-5 border-b border-gray-50 text-center">UF</th>
                            <th className="p-5 border-b border-gray-50 text-center">Qtd</th>
                            <th className="p-5 border-b border-gray-50 text-right">Venda/Locação</th>
                            <th className="p-5 border-b border-gray-50 text-right">Comissão</th>
                            <th className="p-5 border-b border-gray-50 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {commissions.map((com: any) => {
                            const col = collaborators.find((c: any) => String(c._id) === String(com.collaboratorId));
                            return (
                                <tr key={com._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-5 text-sm font-bold text-slate-700">{col?.name || 'Desconhecido'}</td>
                                    <td className="p-5 text-sm text-gray-600">{com.cliente}</td>
                                    <td className="p-5 text-sm font-medium text-slate-500">{com.modelo}</td>
                                    <td className="p-5 text-sm text-center uppercase text-slate-400 font-bold">{com.type || 'Venda'}</td>
                                    <td className="p-5 text-sm text-center text-slate-500">{com.estado || '-'}</td>
                                    <td className="p-5 text-sm text-center font-bold">{com.quantidade}</td>
                                    <td className="p-5 text-right font-medium text-slate-500">{formatCurrency(com.valorVenda)}</td>
                                    <td className="p-5 text-right font-black text-green-700">{formatCurrency(com.valorComissao)}</td>
                                    <td className="p-5 text-center flex justify-center gap-3">
                                        <button onClick={() => setEditingCommission({
                                            ...com,
                                            date:          com.date          ?? '',
                                            cliente:       com.cliente       ?? '',
                                            modelo:        com.modelo        ?? '',
                                            quantidade:    com.quantidade    ?? 1,
                                            valorVenda:    com.valorVenda    ?? 0,
                                            valorComissao: com.valorComissao ?? 0,
                                            // ✅ PREENCHENDO O STATE COM OS NOVOS DADOS
                                            type:          com.type          ?? 'venda',
                                            estado:        com.estado        ?? 'GO',
                                        })} className="text-blue-500 hover:text-blue-700">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(com._id)} className="text-red-500 hover:text-red-700">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Modal de Edição */}
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
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Tipo</label>
                                    <select value={editingCommission.type}
                                        onChange={e => setEditingCommission({ ...editingCommission, type: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border rounded-xl font-medium outline-none">
                                        <option value="venda">Venda</option>
                                        <option value="locacao">Locação</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Estado (UF)</label>
                                    <select value={editingCommission.estado}
                                        onChange={e => setEditingCommission({ ...editingCommission, estado: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border rounded-xl font-medium outline-none">
                                        <option value="">Selecione...</option>
                                        {UFs.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase">Data</label>
                                <input type="text" value={editingCommission.date}
                                    onChange={e => setEditingCommission({ ...editingCommission, date: e.target.value })}
                                    className="w-full p-3 bg-slate-50 border rounded-xl font-medium outline-none" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase">Cliente</label>
                                <input type="text" value={editingCommission.cliente}
                                    onChange={e => setEditingCommission({ ...editingCommission, cliente: e.target.value })}
                                    className="w-full p-3 bg-slate-50 border rounded-xl font-medium outline-none" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase">Equipamento</label>
                                <input type="text" value={editingCommission.modelo}
                                    onChange={e => setEditingCommission({ ...editingCommission, modelo: e.target.value })}
                                    className="w-full p-3 bg-slate-50 border rounded-xl font-medium outline-none" />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Qtd</label>
                                    <input type="number" value={editingCommission.quantidade}
                                        onChange={e => setEditingCommission({ ...editingCommission, quantidade: Number(e.target.value) })}
                                        className="w-full p-3 bg-slate-50 border rounded-xl font-medium outline-none" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Valor (R$)</label>
                                    <input type="number" step="0.01" value={editingCommission.valorVenda}
                                        onChange={e => setEditingCommission({ ...editingCommission, valorVenda: Number(e.target.value) })}
                                        className="w-full p-3 bg-slate-50 border rounded-xl font-medium outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase">Comissão (R$)</label>
                                <input type="number" step="0.01" value={editingCommission.valorComissao}
                                    onChange={e => setEditingCommission({ ...editingCommission, valorComissao: Number(e.target.value) })}
                                    className="w-full p-3 bg-slate-50 border rounded-xl font-medium outline-none" />
                            </div>
                            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl mt-4">
                                Salvar Alterações
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}