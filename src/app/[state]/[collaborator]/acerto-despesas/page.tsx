'use client'

import Link from 'next/link'
import { ArrowLeft, FileText, Printer } from 'lucide-react'
import DespesasForm from '@/shared/components/DespesasForm'
import { useParams } from 'next/navigation';

// Mova isso para um arquivo de constantes ou mantenha aqui, 
// mas use as chaves como slugs (exatamente como aparecem na URL)
export const COLLABORATORS_DATA: Record<string, any> = {
  "khryss-mylla": { name: "KHRYSS MYLLA", email: "heli@somosempilhadeiras.com.br" },
  "lais-toledo": { name: "LAIS TOLEDO", email: "lais@somosempilhadeiras.com.br" },
  "aguinaldo-lemes": { name: "AGUINALDO LEMES", email: "aguinaldo@somosempilhadeiras.com.br" },
  "ezequiel": { name: "EZEQUIEL", email: "ezequiel@somosempilhadeiras.com.br" },
  "tiago-freua": { name: "TIAGO FREUA", email: "tiago@somosempilhadeiras.com.br" },
  "rafael-gomes": { name: "RAFAEL GOMES", email: "rafael@somosempilhadeiras.com.br" },
  "jose-henrique": { name: "JOSÉ HENRIQUE", email: "josehenrique@somosempilhadeiras.com.br" },
};

export default function AcertoDespesasPage() {
  const params = useParams();
  
  // Pegamos o slug puro da URL (ex: "khryss-mylla")
  const collaboratorSlug = params.collaborator as string;
  const state = params.state || 'go';

  // Buscamos os dados no objeto usando o slug
  const collaborator = COLLABORATORS_DATA[collaboratorSlug];

  // Se não encontrar o colaborador, podemos exibir um erro ou redirecionar
  if (!collaborator) {
    return <div className="p-10 text-center">Colaborador não encontrado.</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href={`/${state}`}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-green-700 transition-colors cursor-pointer"
              >
                <ArrowLeft size={20} />
              </Link>

              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FileText size={18} className="text-green-700" />
                  Acerto de Despesas
                </h1>
                <span className="text-xs text-gray-500">Geração de Relatório para {collaborator.name}</span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 text-xs text-gray-400 font-medium bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
              <Printer size={14} />
              <span>Pronto para Impressão</span>
            </div>
          </div>
        </div>
      </header>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Agora passamos os dados validados com segurança */}
        <DespesasForm name={collaborator.name} email={collaborator.email} />
      </div>
    </main>
  );
}