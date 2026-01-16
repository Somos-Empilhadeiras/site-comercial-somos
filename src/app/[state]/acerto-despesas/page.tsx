'use client'

import Link from 'next/link'
import { ArrowLeft, FileText, Printer } from 'lucide-react'
import DespesasForm from '@/shared/components/DespesasForm'
import { useParams } from 'next/navigation';

export default function AcertoDespesasPage() {

  const params = useParams();
  const state = params.state || '/';

  return (
    <main className="min-h-screen bg-gray-50">

      {/* --- CABEÇALHO FIXO (Sticky Header) --- */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Lado Esquerdo: Voltar + Título */}
            <div className="flex items-center gap-4">
              <Link
                href={`/${state}`}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-green-700 transition-colors cursor-pointer"
                title="Voltar para a Unidade"
              >
                <ArrowLeft size={20} />
              </Link>

              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FileText size={18} className="text-green-700" />
                  Acerto de Despesas
                </h1>
                <span className="text-xs text-gray-500">Geração de Relatório de Reembolso</span>
              </div>
            </div>

            {/* Lado Direito: Ação Secundária (Visual apenas) */}
            <div className="hidden md:flex items-center gap-2 text-xs text-gray-400 font-medium bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
              <Printer size={14} />
              <span>Pronto para Impressão</span>
            </div>

          </div>
        </div>
      </header>

      {/* --- ÁREA DO CONTEÚDO --- */}
      {/* Nota: O componente DespesasForm já possui padding e background.
         Aqui nós apenas o renderizamos. Se o background do Form for diferente
         do 'bg-gray-50' desta página, você pode ajustar aqui.
      */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <DespesasForm />
      </div>

    </main>
  )
}