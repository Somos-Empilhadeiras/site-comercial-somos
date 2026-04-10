import React, { useState } from 'react';

export default function UploadManager({ collaborators, onUploadSuccess }: any) {
    // Aba ativa: 'manual' ou 'lote'
    const [mode, setMode] = useState<'manual' | 'lote'>('manual');
    
    // Estados Globais (Usados em ambos os modos)
    const [selectedCollab, setSelectedCollab] = useState('');
    const [uploadType, setUploadType] = useState('venda');
    const [uploadState, setUploadState] = useState('GO');
    
    // Estado do Modo Lote
    const [excelData, setExcelData] = useState('');
    
    // Estado do Modo Manual
    const [manualForm, setManualForm] = useState({
        date: '', cliente: '', modelo: '', quantidade: 1, valorVenda: '', valorComissao: ''
    });

    const [uploadMessage, setUploadMessage] = useState({ type: '', text: '' });
    const [isUploading, setIsUploading] = useState(false);

    const UFs = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

    const handleProcess = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true); 
        setUploadMessage({ type: '', text: '' });

        try {
            if (!selectedCollab) throw new Error('Selecione um consultor.');

            let textToProcess = '';

            if (mode === 'lote') {
                if (!excelData.trim()) throw new Error('Cole os dados do Excel na área de texto.');
                textToProcess = excelData;
            } else {
                // MODO MANUAL: Transforma o formulário em uma "linha de Excel" com TABs (\t) 
                // Isso permite reaproveitar o exato mesmo backend sem precisar de rotas novas!
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
                    mapping: { date: 0, cliente: 1, modelo: 2, quantidade: 3, valorVenda: 4, valorComissao: 5 }
                }),
            });

            if (!res.ok) throw new Error('Falha no processamento. Verifique os dados inseridos.');
            
            setUploadMessage({ type: 'success', text: mode === 'lote' ? 'Lote importado com sucesso!' : 'Lançamento salvo com sucesso!' });
            
            // Limpa os formulários após o sucesso
            setExcelData('');
            setManualForm({ date: '', cliente: '', modelo: '', quantidade: 1, valorVenda: '', valorComissao: '' });
            onUploadSuccess();

        } catch (err: any) { 
            setUploadMessage({ type: 'error', text: err.message }); 
        } finally { 
            setIsUploading(false); 
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto bg-white p-8 rounded-3xl shadow-lg border border-gray-100 animate-in fade-in">
            
            {/* ABAS DE NAVEGAÇÃO */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
                <button 
                    onClick={() => { setMode('manual'); setUploadMessage({type:'', text:''}); }}
                    className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${mode === 'manual' ? 'bg-white shadow-sm text-green-700' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Lançamento Manual (1 a 1)
                </button>
                <button 
                    onClick={() => { setMode('lote'); setUploadMessage({type:'', text:''}); }}
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
                
                {/* 1. SELEÇÃO DE CONSULTOR (Comum aos dois modos) */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Identificação</h3>
                    <select value={selectedCollab} onChange={(e) => setSelectedCollab(e.target.value)} className="w-full p-4 bg-white border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-green-500">
                        <option value="">Selecione o Consultor...</option>
                        {collaborators.map((c: any) => <option key={String(c._id)} value={String(c._id)}>{c.name}</option>)}
                    </select>
                </div>

                {/* 2. DADOS DO LANÇAMENTO */}
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

                    {/* MODO: MANUAL */}
                    {mode === 'manual' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-bottom-2">
                            <input type="date" value={manualForm.date} onChange={e => setManualForm({...manualForm, date: e.target.value})} className="p-4 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500" required />
                            <input type="text" placeholder="Nome do Cliente" value={manualForm.cliente} onChange={e => setManualForm({...manualForm, cliente: e.target.value})} className="p-4 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500" required />
                            <input type="text" placeholder="Equipamento/Modelo" value={manualForm.modelo} onChange={e => setManualForm({...manualForm, modelo: e.target.value})} className="p-4 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500" required />
                            <input type="number" placeholder="Quantidade" min="1" value={manualForm.quantidade} onChange={e => setManualForm({...manualForm, quantidade: Number(e.target.value)})} className="p-4 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500" required />
                            <input type="text" placeholder="Valor da Venda/Locação (Ex: 150000,00)" value={manualForm.valorVenda} onChange={e => setManualForm({...manualForm, valorVenda: e.target.value})} className="p-4 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500" required />
                            <input type="text" placeholder="Valor da Comissão (Ex: 1500,00)" value={manualForm.valorComissao} onChange={e => setManualForm({...manualForm, valorComissao: e.target.value})} className="p-4 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500" required />
                        </div>
                    )}

                    {/* MODO: LOTE (TEXTAREA) */}
                    {mode === 'lote' && (
                        <div className="animate-in slide-in-from-bottom-2">
                            <textarea 
                                value={excelData} 
                                onChange={(e) => setExcelData(e.target.value)} 
                                className="w-full h-48 p-4 bg-white border border-slate-200 rounded-xl font-mono text-sm outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400" 
                                placeholder="Copie do Excel e cole aqui: [Data] [Cliente] [Modelo] [Qtd] [Valor Venda] [Comissão]" 
                            />
                        </div>
                    )}
                </div>
                
                <button type="submit" disabled={isUploading} className={`w-full text-white font-bold py-4 rounded-xl transition-colors ${mode === 'manual' ? 'bg-green-700 hover:bg-green-800' : 'bg-blue-700 hover:bg-blue-800'}`}>
                    {isUploading ? 'Processando...' : mode === 'manual' ? 'Salvar Lançamento' : 'Importar Lote de Dados'}
                </button>
            </form>
        </div>
    );
}