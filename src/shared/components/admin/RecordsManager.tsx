import React, { useState, useMemo } from 'react';
import { Edit, Trash2, X, Search, ChevronLeft, ChevronRight, SlidersHorizontal, ClipboardPaste } from 'lucide-react';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;

const UFs = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

export default function RecordsManager({ commissions, collaborators, onUpdate }: any) {
    const [editingCommission, setEditingCommission] = useState<any>(null);

    // ── Filtros ─────────────────────────────────────────────────────────────
    const [search, setSearch]           = useState('');
    const [filterType, setFilterType]   = useState('');
    const [filterCollab, setFilterCollab] = useState('');
    const [filterUF, setFilterUF]       = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // ── Paginação ────────────────────────────────────────────────────────────
    const [currentPage, setCurrentPage] = useState(1);

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    // ── Dados filtrados ──────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return commissions.filter((com: any) => {
            const col = collaborators.find((c: any) => String(c._id) === String(com.collaboratorId));
            const matchSearch =
                !q ||
                com.cliente?.toLowerCase().includes(q) ||
                com.modelo?.toLowerCase().includes(q) ||
                col?.name?.toLowerCase().includes(q);
            const matchType   = !filterType   || com.type   === filterType;
            const matchCollab = !filterCollab || String(com.collaboratorId) === filterCollab;
            const matchUF     = !filterUF     || com.estado === filterUF;
            return matchSearch && matchType && matchCollab && matchUF;
        });
    }, [commissions, collaborators, search, filterType, filterCollab, filterUF]);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    // Reseta página ao filtrar
    const handleFilterChange = (fn: () => void) => { fn(); setCurrentPage(1); };

    const activeFilters = [filterType, filterCollab, filterUF].filter(Boolean).length;

    // ── Ações ────────────────────────────────────────────────────────────────
    const handleDelete = async (id: string) => {
        if (!window.confirm('Atenção: Tem certeza que deseja excluir este lançamento permanentemente?')) return;
        try {
            const res = await fetch(`/api/commissions?id=${id}`, { method: 'DELETE' });
            if (res.ok) { toast.success('Removido!'); onUpdate(); }
        } catch { toast.error('Não foi possível excluir.'); }
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
                        type:          editingCommission.type,
                        estado:        editingCommission.estado,
                    }
                })
            });
            if (res.ok) { setEditingCommission(null); onUpdate(); toast.success('Atualizado!'); }
        } catch { toast.error('Não foi possível atualizar.'); }
    };

    // ── Importação via Colagem (Paste) ───────────────────────────────────────
    const handlePasteImport = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        e.preventDefault(); // Impede que o texto sujo seja colado visualmente
        const text = e.clipboardData.getData('Text');
        if (!text) return;

        // Divide pelas tabulações do Excel/Sheets
        const columns = text.split('\t').map(c => c.trim());

        // Verifica se copiou dados suficientes (ajuste o número se sua planilha for diferente)
        if (columns.length >= 5) {
            setEditingCommission((prev: any) => ({
                ...prev,
                // Mapeamento das colunas (0 = Consultor, 1 = Cliente, 2 = Equipamento, etc.)
                cliente: columns[1] || prev.cliente,
                modelo: columns[2] || prev.modelo,
                type: columns[3]?.toLowerCase().includes('loca') ? 'locacao' : 'venda',
                estado: columns[4] || prev.estado,
                quantidade: Number(columns[5]) || prev.quantidade,
                // Remove R$, pontos de milhar e troca vírgula por ponto para conversão correta
                valorVenda: Number(columns[6]?.replace(/[^\d,.-]/g, '').replace(',', '.')) || prev.valorVenda,
                valorComissao: Number(columns[7]?.replace(/[^\d,.-]/g, '').replace(',', '.')) || prev.valorComissao,
            }));
            toast.success('Campos preenchidos com os dados da planilha!');
        } else {
            toast.error('Formato inválido. Copie a linha completa da planilha.');
        }
    };

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in">

            {/* ── Barra de ferramentas ── */}
            <div className="p-5 border-b border-gray-100 space-y-3">

                {/* Linha 1: busca + botão filtros */}
                <div className="flex gap-3 items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                        <input
                            type="text"
                            placeholder="Buscar por consultor, cliente ou equipamento..."
                            value={search}
                            onChange={e => handleFilterChange(() => setSearch(e.target.value))}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-green-500 transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(v => !v)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-bold text-sm transition-all ${
                            showFilters || activeFilters > 0
                                ? 'bg-green-700 text-white border-green-700'
                                : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'
                        }`}
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                        Filtros
                        {activeFilters > 0 && (
                            <span className="bg-white text-green-700 text-xs font-black rounded-full w-5 h-5 flex items-center justify-center">
                                {activeFilters}
                            </span>
                        )}
                    </button>
                </div>

                {/* Linha 2: filtros expansíveis */}
                {showFilters && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in slide-in-from-top-2 duration-200">
                        <select
                            value={filterCollab}
                            onChange={e => handleFilterChange(() => setFilterCollab(e.target.value))}
                            className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">Todos os Consultores</option>
                            {collaborators.map((c: any) => (
                                <option key={String(c._id)} value={String(c._id)}>{c.name}</option>
                            ))}
                        </select>

                        <select
                            value={filterType}
                            onChange={e => handleFilterChange(() => setFilterType(e.target.value))}
                            className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">Todos os Tipos</option>
                            <option value="venda">Venda</option>
                            <option value="locacao">Locação</option>
                        </select>

                        <select
                            value={filterUF}
                            onChange={e => handleFilterChange(() => setFilterUF(e.target.value))}
                            className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">Todos os Estados</option>
                            {UFs.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                        </select>
                    </div>
                )}

                {/* Contador de resultados + limpar filtros */}
                <div className="flex items-center justify-between text-xs font-bold text-gray-400">
                    <span>{filtered.length} registro{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</span>
                    {(search || activeFilters > 0) && (
                        <button
                            onClick={() => { setSearch(''); setFilterType(''); setFilterCollab(''); setFilterUF(''); setCurrentPage(1); }}
                            className="text-red-400 hover:text-red-600 transition-colors"
                        >
                            Limpar filtros
                        </button>
                    )}
                </div>
            </div>

            {/* ── Tabela ── */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-[10px] uppercase font-black text-gray-400">
                        <tr>
                            <th className="px-5 py-4 border-b border-gray-100">Consultor</th>
                            <th className="px-5 py-4 border-b border-gray-100">Cliente</th>
                            <th className="px-5 py-4 border-b border-gray-100">Equipamento</th>
                            <th className="px-5 py-4 border-b border-gray-100 text-center">Tipo</th>
                            <th className="px-5 py-4 border-b border-gray-100 text-center">UF</th>
                            <th className="px-5 py-4 border-b border-gray-100 text-center">Qtd</th>
                            <th className="px-5 py-4 border-b border-gray-100 text-right">Venda/Locação</th>
                            <th className="px-5 py-4 border-b border-gray-100 text-right">Comissão</th>
                            <th className="px-5 py-4 border-b border-gray-100 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {paginated.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="text-center py-16 text-gray-300 font-bold text-sm">
                                    Nenhum registro encontrado para os filtros aplicados.
                                </td>
                            </tr>
                        ) : paginated.map((com: any) => {
                            const col = collaborators.find((c: any) => String(c._id) === String(com.collaboratorId));
                            const isVenda = (com.type || 'venda') === 'venda';
                            return (
                                <tr key={com._id} className="hover:bg-slate-50/70 transition-colors group">
                                    <td className="px-5 py-4 text-sm font-bold text-slate-700">{col?.name || 'Desconhecido'}</td>
                                    <td className="px-5 py-4 text-sm text-gray-600">{com.cliente}</td>
                                    <td className="px-5 py-4 text-sm font-medium text-slate-500">{com.modelo}</td>
                                    <td className="px-5 py-4 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                            isVenda
                                                ? 'bg-green-50 text-green-700'
                                                : 'bg-blue-50 text-blue-700'
                                        }`}>
                                            {com.type || 'Venda'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-center text-slate-400 font-bold">{com.estado || '–'}</td>
                                    <td className="px-5 py-4 text-sm text-center font-bold text-slate-600">{com.quantidade}</td>
                                    <td className="px-5 py-4 text-right text-sm font-medium text-slate-500">{formatCurrency(com.valorVenda)}</td>
                                    <td className="px-5 py-4 text-right font-black text-green-700">{formatCurrency(com.valorComissao)}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => setEditingCommission({
                                                    ...com,
                                                    date:          com.date          ?? '',
                                                    cliente:       com.cliente       ?? '',
                                                    modelo:        com.modelo        ?? '',
                                                    quantidade:    com.quantidade    ?? 1,
                                                    valorVenda:    com.valorVenda    ?? 0,
                                                    valorComissao: com.valorComissao ?? 0,
                                                    type:          com.type          ?? 'venda',
                                                    estado:        com.estado        ?? 'GO',
                                                })}
                                                className="p-2 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                                            >
                                                <Edit size={15} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(com._id)}
                                                className="p-2 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* ── Paginação ── */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
                    <span className="text-xs font-bold text-gray-400">
                        Página {currentPage} de {totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-xl border border-gray-100 text-gray-400 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                            .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                                if (idx > 0 && typeof arr[idx - 1] === 'number' && (p as number) - (arr[idx - 1] as number) > 1) {
                                    acc.push('...');
                                }
                                acc.push(p);
                                return acc;
                            }, [])
                            .map((p, i) =>
                                p === '...' ? (
                                    <span key={`dots-${i}`} className="text-gray-300 font-bold text-sm px-1">...</span>
                                ) : (
                                    <button
                                        key={p}
                                        onClick={() => setCurrentPage(p as number)}
                                        className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                                            currentPage === p
                                                ? 'bg-green-700 text-white shadow-sm'
                                                : 'border border-gray-100 text-gray-400 hover:bg-slate-50'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                )
                            )
                        }

                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-xl border border-gray-100 text-gray-400 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* ── Modal de Edição ── */}
            {editingCommission && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">

                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h3 className="font-black text-slate-800 uppercase text-sm tracking-wider">Editar Lançamento</h3>
                                <p className="text-xs text-gray-400 mt-0.5">{editingCommission.cliente}</p>
                            </div>
                            <button
                                onClick={() => setEditingCommission(null)}
                                className="p-2 rounded-xl text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
                            
                            {/* Área de Colagem Inteligente */}
                            <div className="p-4 bg-green-50 border border-green-100 rounded-xl flex flex-col gap-2">
                                <label className="flex items-center gap-2 text-xs font-black text-green-700 uppercase tracking-wider">
                                    <ClipboardPaste size={14} />
                                    Importação Rápida
                                </label>
                                <textarea
                                    onPaste={handlePasteImport}
                                    placeholder="Clique aqui e aperte Ctrl+V para colar a linha inteira da planilha..."
                                    className="w-full bg-white border border-green-200 rounded-lg p-3 text-xs text-gray-600 outline-none focus:ring-2 focus:ring-green-500 resize-none h-16 transition-shadow shadow-sm"
                                    title="Cole os dados copiados do Excel ou Sheets aqui"
                                />
                            </div>

                            <hr className="border-gray-100 my-2" />

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Tipo</label>
                                    <select
                                        value={editingCommission.type}
                                        onChange={e => setEditingCommission({ ...editingCommission, type: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-medium text-sm outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="venda">Venda</option>
                                        <option value="locacao">Locação</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Estado (UF)</label>
                                    <select
                                        value={editingCommission.estado}
                                        onChange={e => setEditingCommission({ ...editingCommission, estado: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-medium text-sm outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="">Selecione...</option>
                                        {UFs.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                                    </select>
                                </div>
                            </div>

                            {[
                                { label: 'Data', key: 'date', type: 'text' },
                                { label: 'Cliente', key: 'cliente', type: 'text' },
                                { label: 'Equipamento', key: 'modelo', type: 'text' },
                            ].map(({ label, key, type }) => (
                                <div key={key} className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{label}</label>
                                    <input
                                        type={type}
                                        value={editingCommission[key]}
                                        onChange={e => setEditingCommission({ ...editingCommission, [key]: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-medium text-sm outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                            ))}

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Qtd</label>
                                    <input
                                        type="number"
                                        value={editingCommission.quantidade}
                                        onChange={e => setEditingCommission({ ...editingCommission, quantidade: Number(e.target.value) })}
                                        className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-medium text-sm outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                <div className="col-span-2 space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Valor (R$)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={editingCommission.valorVenda}
                                        onChange={e => setEditingCommission({ ...editingCommission, valorVenda: Number(e.target.value) })}
                                        className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-medium text-sm outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Comissão (R$)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={editingCommission.valorComissao}
                                    onChange={e => setEditingCommission({ ...editingCommission, valorComissao: Number(e.target.value) })}
                                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-medium text-sm outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-4 rounded-xl transition-colors mt-2"
                            >
                                Salvar Alterações
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}