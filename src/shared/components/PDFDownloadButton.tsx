'use client';

import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { Download } from 'lucide-react'; // Ícone do lucide
import BaseDocument, { BaseDocumentProps } from './BaseDocument';

interface PDFDownloadButtonProps {
    documentProps: BaseDocumentProps;
    fileName: string;
    buttonText?: string;
}

export default function PDFDownloadButton({ documentProps, fileName, buttonText = "Baixar PDF" }: PDFDownloadButtonProps) {
    const [isGenerating, setIsGenerating] = React.useState(false);

    const handleDownload = async () => {
        try {
            setIsGenerating(true);
            
            // 1. Gera o blob do PDF em tempo real no navegador
            const blob = await pdf(<BaseDocument {...documentProps} />).toBlob();
            
            // 2. Cria um link falso para forçar o download
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
            document.body.appendChild(link);
            link.click();
            
            // 3. Limpeza de memória
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
            alert("Não foi possível gerar o arquivo PDF.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <button 
            onClick={handleDownload}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors border border-slate-300 disabled:opacity-50"
        >
            <Download size={18} />
            {isGenerating ? "Gerando..." : buttonText}
        </button>
    );
}