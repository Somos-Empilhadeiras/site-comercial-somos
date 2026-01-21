'use client';

import React from 'react';
import Link from 'next/link';
import { Search, ArrowLeft, MessageSquare } from 'lucide-react';

export default function NotFound() {

    // FUNÇÃO DE RETORNO À PÁGINA ANTERIOR
    function goBack() {
        window.history.back();
    }

    return (
        <div className="min-h-[65vh] flex flex-col items-center justify-center px-4 bg-[#f8fafc]">
            <div className="text-center max-w-2xl">
                {/* Ícone com as cores da marca */}
                <div className="relative inline-block mb-10">
                    <div className="bg-white p-6 rounded-full shadow-sm border border-gray-100">
                        <Search size={80} className="text-[#007d32]" strokeWidth={1.5} />
                    </div>
                    <span className="absolute -top-2 -right-2 bg-[#007d32] text-white font-bold px-4 py-1 text-xl rounded-full shadow-lg">
                        404
                    </span>
                </div>

                {/* Títulos baseados na tipografia do site */}
                <h1 className="text-4xl md:text-5xl font-bold text-[#0f172a] mb-6 tracking-tight">
                    Página não encontrada
                </h1>

                <p className="text-lg text-slate-600 mb-12 leading-relaxed">
                    O conteúdo que você busca não está disponível nesta unidade ou o endereço foi digitado incorretamente.
                    Como podemos te ajudar agora?
                </p>

                {/* Botões seguindo o padrão das imagens enviadas */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                        onClick={() => goBack()}
                        className="flex items-center justify-center gap-2 bg-[#007d32] hover:bg-[#006428] text-white font-semibold py-3 px-10 rounded-lg transition-all duration-200 shadow-md w-full sm:w-auto"
                    >
                        <ArrowLeft size={18} />
                        Voltar
                    </button>
                    <Link
                        href="/contato"
                        className="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-[#0f172a] font-semibold py-3 px-10 rounded-lg transition-all duration-200 w-full sm:w-auto"
                    >
                        <MessageSquare size={18} />
                        Suporte Técnico
                    </Link>
                </div>

            </div>
        </div>
    );
}