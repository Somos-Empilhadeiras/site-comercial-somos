import React, { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ParsedRow {
    values: string[];
    valid: boolean;
}

// ─── LÓGICA DE PARSE ─────────────────────────────────────────────────────────
// Aceita células coladas do Excel (tab), ponto e vírgula (;) e vírgula (,)
// Tudo misturado funciona — cada linha pode ter um separador diferente.
function parseExcelInput(raw: string): ParsedRow[] {
    if (!raw.trim()) return [];

    return raw
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
            let values: string[];
            if (line.includes('\t')) {
                values = line.split('\t');
            } else if (line.includes(';')) {
                values = line.split(';');
            } else {
                values = line.split(',');
            }
            values = values.map(v => v.trim()).filter(v => v.length > 0);
            return { values, valid: values.length >= 6 }; // mínimo: 6 colunas esperadas
        });
}
// ─────────────────────────────────────────────────────────────────────────────

export default function UploadManager({ collaborators, onUploadSuccess }: any) {
    const [mode, setMode] = useState<'manual' | 'lote'>('manual');

    const [selectedCollab, setSelectedCollab] = useState('');
    const [uploadType, setUploadType] = useState('venda');
    const [uploadState, setUploadState] = useState('GO');

    const [excelData, setExcelData] = useState('');
    const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);

    const [manualForm, setManualForm] = useState({
        date: '', cliente: '', modelo: '', quantidade: 1, valorVenda: '', valorComissao: '', quantidadePropostas: ''
    });

    const [uploadMessage, setUploadMessage] = useState({ type: '', text: '' });
    const [isUploading, setIsUploading] = useState(false);

    const UFs = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

    // ── Handler do textarea de lote ─────────────────────────────────────────
    function handleExcelChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        const value = e.target.value;
        setExcelData(value);
        setParsedRows(parseExcelInput(value));
        setUploadMessage({ type: '', text: '' });
    }
    // ────────────────────────────────────────────────────────────────────────

    const handleProcess = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);
        setUploadMessage({ type: '', text: '' });

        try {
            if (!selectedCollab) throw new Error('Selecione um consultor.');

            let textToProcess = '';

            if (mode === 'lote') {
                if (!excelData.trim()) throw new Error('Cole os dados do Excel na área de texto.');

                const validRows = parsedRows.filter(r => r.valid);
                if (validRows.length === 0) throw new Error('Nenhuma linha válida encontrada. Verifique se há ao menos 6 colunas por linha.');

                // Reconstrói como TSV normalizado para a API
                textToProcess = validRows.map(r => r.values.join('\t')).join('\n');
            } else {
                const { date, cliente, modelo, quantidade, valorVenda, valorComissao } = manualForm;
                if (!date || !cliente || !modelo || !valorVenda || !valorComissao) {
                    throw new Error('Preencha todos os campos obrigatórios do formulário.');
                }
                textToProcess = `${date}\t${cliente}\t${modelo}\t${quantidade}\t${valorVenda}\t${valorComissao}`;
            }

            const res = await fetch('/api/commissions/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rawText: textToProcess,
                    collaboratorId: selectedCollab,
                    tipoLancamento: uploadType,
                    estadoLancamento: uploadState,
                    quantidadePropostas: mode === 'manual' ? Number(manualForm.quantidadePropostas) : 0,
                    mapping: { date: 0, cliente: 1, modelo: 2, quantidade: 3, valorVenda: 4, valorComissao: 5 }
                }),
            });

            if (!res.ok) throw new Error('Falha no processamento. Verifique os dados inseridos.');

            setUploadMessage({
                type: 'success',
                text: mode === 'lote' ? 'Lote importado com sucesso!' : 'Lançamento salvo com sucesso!'
            });

            setExcelData('');
            setParsedRows([]);
            setManualForm({ date: '', cliente: '', modelo: '', quantidade: 1, valorVenda: '', valorComissao: '', quantidadePropostas: '' });
            onUploadSuccess();

        } catch (err: any) {
            setUploadMessage({ type: 'error', text: err.message });
        } finally {
            setIsUploading(false);
        }
    };

    const validCount   = parsedRows.filter(r => r.valid).length;
    const invalidCount = parsedRows.filter(r => !r.valid).length;

    return (
        <div className="w-full max-w-4xl mx-auto bg-white p-8 rounded-3xl shadow-lg border border-gray-100 animate-in fade-in">

            <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
                <button
                    onClick={() => { setMode('manual'); setUploadMessage({ type: '', text: '' }); }}
                    className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${mode === 'manual' ? 'bg-white shadow-sm text-green-700' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Lançamento Manual (1 a 1)
                </button>
                <button
                    onClick={() => { setMode('lote'); setUploadMessage({ type: '', text: '' }); }}
                    className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${mode === 'lote' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Importação em Lote (Excel)
                </button>
            </div>

            {uploadMessage.text && (
                <div className={`mb-6 p-4 rounded-xl font-bold border ${uploadMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {uploadMessage.text}
                </div>
            )}

            <form onSubmit={handleProcess} className="space-y-6">

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Identificação</h3>
                    <select value={selectedCollab} onChange={(e) => setSelectedCollab(e.target.value)} className="w-full p-4 bg-white border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-green-500">
                        <option value="">Selecione o Consultor...</option>
                        {collaborators.map((c: any) => <option key={String(c._id)} value={String(c._id)}>{c.name}</option>)}
                    </select>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Dados da Operação</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <select value={uploadType} onChange={(e) => setUploadType(e.target.value)} className="w-full p-4 bg-white border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-green-500">
                            <option value="venda">Tipo: Venda</option>
                            <option value="locacao">Tipo: Locação</option>
                        </select>
                        <select value={uploadState} onChange={(e) => setUploadState(e.target.value)} className="w-full p-4 bg-white border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-green-500">
                            <option value="">Estado da Operação (UF)</option>
                            {UFs.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                        </select>
                    </div>

                    {mode === 'manual' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-bottom-2">
                            <input type="date" value={manualForm.date} onChange={e => setManualForm({ ...manualForm, date: e.target.value })} className="p-4 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500" required />
                            <input type="text" placeholder="Nome do Cliente" value={manualForm.cliente} onChange={e => setManualForm({ ...manualForm, cliente: e.target.value })} className="p-4 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500" required />
                            <input type="text" placeholder="Equipamento/Modelo" value={manualForm.modelo} onChange={e => setManualForm({ ...manualForm, modelo: e.target.value })} className="p-4 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500" required />
                            <input type="number" placeholder="Quantidade Máquinas" min="1" value={manualForm.quantidade} onChange={e => setManualForm({ ...manualForm, quantidade: Number(e.target.value) })} className="p-4 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500" required />
                            <input type="text" placeholder="Valor da Venda/Locação (R$)" value={manualForm.valorVenda} onChange={e => setManualForm({ ...manualForm, valorVenda: e.target.value })} className="p-4 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500" required />
                            <input type="text" placeholder="Valor da Comissão (R$)" value={manualForm.valorComissao} onChange={e => setManualForm({ ...manualForm, valorComissao: e.target.value })} className="p-4 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500" required />
                        </div>
                    )}

                    {mode === 'lote' && (
                        <div className="animate-in slide-in-from-bottom-2 space-y-3">
                            <textarea
                                value={excelData}
                                onChange={handleExcelChange}
                                className="w-full h-48 p-4 bg-white border border-slate-200 rounded-xl font-mono text-sm outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400 resize-y"
                                placeholder={
                                    'Cole do Excel ou separe por ; ou ,\n' +
                                    'Ordem esperada: Data | Cliente | Modelo | Qtd | Valor Venda | Comissão\n\n' +
                                    'Ex. Excel:  01/04/2026\tJoão\tReach Truck\t2\t50000\t1500\n' +
                                    'Ex. ;       01/04/2026;Maria;Empilhadeira;1;30000;900'
                                }
                            />

                            {/* Preview das linhas parseadas */}
                            {parsedRows.length > 0 && (
                                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                                    {parsedRows.map((row, i) => (
                                        <div
                                            key={i}
                                            className={`flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-mono ${
                                                row.valid
                                                    ? 'bg-green-50 border border-green-100 text-green-800'
                                                    : 'bg-red-50 border border-red-100 text-red-700'
                                            }`}
                                        >
                                            {row.valid
                                                ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />
                                                : <XCircle className="h-3.5 w-3.5 shrink-0 text-red-400" />
                                            }
                                            <span className="truncate">{row.values.join('  |  ')}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Contadores */}
                            {parsedRows.length > 0 && (
                                <div className="flex gap-4 text-xs font-bold pt-1">
                                    <span className="text-green-600">{validCount} linha{validCount !== 1 ? 's' : ''} válida{validCount !== 1 ? 's' : ''}</span>
                                    {invalidCount > 0 && (
                                        <span className="text-red-500">{invalidCount} inválida{invalidCount !== 1 ? 's' : ''} (menos de 6 colunas)</span>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isUploading || (mode === 'lote' && validCount === 0 && excelData.trim().length > 0)}
                    className={`w-full text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-40 ${mode === 'manual' ? 'bg-green-700 hover:bg-green-800' : 'bg-blue-700 hover:bg-blue-800'}`}
                >
                    {isUploading
                        ? 'Processando...'
                        : mode === 'manual'
                            ? 'Salvar Lançamento'
                            : `Importar Lote${validCount > 0 ? ` (${validCount} linha${validCount !== 1 ? 's' : ''})` : ''}`
                    }
                </button>
            </form>
        </div>
    );
}