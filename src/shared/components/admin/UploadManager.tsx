import React, { useState } from 'react';

export default function UploadManager({ collaborators, onUploadSuccess }: any) {
    const [selectedCollab, setSelectedCollab] = useState('');
    const [excelData, setExcelData] = useState('');
    const [uploadMessage, setUploadMessage] = useState({ type: '', text: '' });
    const [isUploading, setIsUploading] = useState(false);

    const handleProcessExcel = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true); setUploadMessage({ type: '', text: '' });
        try {
            if (!selectedCollab) throw new Error('Selecione um colaborador.');
            // Altere apenas o objeto mapping dentro da função handleProcessExcel:
            const res = await fetch('/api/commissions/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rawText: excelData,
                    collaboratorId: selectedCollab,
                    // Mapping de 6 colunas. Se a col 0 não for data, o back-end ignora.
                    mapping: {
                        date: 0,
                        cliente: 1,
                        modelo: 2,
                        quantidade: 3,
                        valorVenda: 4,
                        valorComissao: 5
                    }
                }),
            });
            if (!res.ok) throw new Error('Falha no processamento.');
            setUploadMessage({ type: 'success', text: 'Importado com sucesso!' });
            setExcelData('');
            onUploadSuccess();
        } catch (err: any) { setUploadMessage({ type: 'error', text: err.message }); }
        finally { setIsUploading(false); }
    };

    return (
        <div className="w-full max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
            {uploadMessage.text && <div className={`mb-6 p-4 rounded-xl ${uploadMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{uploadMessage.text}</div>}
            <form onSubmit={handleProcessExcel} className="space-y-6">
                <select value={selectedCollab} onChange={(e) => setSelectedCollab(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-xl font-bold" required>
                    <option value="">Escolha o Consultor</option>
                    {collaborators.map((c: any) => <option key={String(c._id)} value={String(c._id)}>{c.name}</option>)}
                </select>
                <textarea value={excelData} onChange={(e) => setExcelData(e.target.value)} className="w-full h-48 p-4 bg-slate-50 border rounded-xl font-mono" placeholder="Cole os dados aqui..." required />
                <button type="submit" disabled={isUploading} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl">{isUploading ? 'Processando...' : 'Importar Dados'}</button>
            </form>
        </div>
    );
}