import { ArrowUpRight } from 'lucide-react';
import { ElementType } from 'react';
import MiniBrazilMap from './MiniBrazilMap';

interface InfoCardProps {
  state: string;
  address: string;
  link: string;
  iconElem?: ElementType | string;
  mapState?: string;
}

export default function InfoCard({ state, address, link, iconElem, mapState }: InfoCardProps) {
  const Icon = iconElem as ElementType;

  return (
    <div className="flex items-center justify-center p-4">
      {/* 1. VISUAL RESTAURADO: rounded-3xl, gradient original, shadows */}
      <div className="relative bg-linear-to-br from-green-700 to-green-900 rounded-3xl p-8 w-96 min-h-56 shadow-2xl flex flex-col justify-between overflow-hidden group/card transition-all hover:-translate-y-1">

        {/* LADO ESQUERDO: TEXTOS (Mantido) */}
        <div className="z-10 pr-16 relative">
          <h2 className="text-[#F0F0F0] mb-2 text-xl tracking-wide font-extrabold uppercase">
            {state}
          </h2>
          <p className="text-[#F0F0F0]/90 text-sm leading-relaxed font-medium">
            {address}
          </p>
        </div>

        {/* LADO DIREITO: O ÍCONE OU MAPA */}
        {/* Posicionado com absolute para ficar no fundo, sem interferir no texto */}
        <div className="absolute -right-8 top-1/2 -translate-y-1/2 pointer-events-none">
            
            {Icon ? (
                <Icon 
                    strokeWidth={1} 
                    className="w-48 h-48 text-white opacity-10 group-hover/card:opacity-20 transition-all duration-500" 
                />
            ) : mapState ? (
                // LÓGICA DO MAPA (Mantida porque você gostou)
                <div className="w-56 h-56 opacity-60 group-hover/card:scale-105 transition-all duration-700 mr-4">
                    <MiniBrazilMap activeState={mapState} />
                </div>
            ) : null}

        </div>

        {/* RODAPÉ: BOTÃO ORIGINAL (Mantido o botão branco arredondado) */}
        <div className="mt-6 z-10 w-fit">
          <a
            href={link}
            className="bg-white hover:bg-gray-50 transition-all rounded-full pl-4 pr-1 py-1 flex items-center gap-3 shadow-lg group cursor-pointer"
          >
            <span className="text-green-900 font-bold text-sm uppercase">Acessar</span>
            <div className="w-8 h-8 bg-green-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowUpRight className="w-4 h-4 text-white" />
            </div>
          </a>
        </div>

      </div>
    </div>
  );
}