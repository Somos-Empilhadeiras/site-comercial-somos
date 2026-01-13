import { ArrowUpRight } from 'lucide-react';

interface InfoCardProps {
  state: string;
  address: string;
  link: string;
}

export default function InfoCard({ state, address, link }: InfoCardProps) {
  return (
    <div className="flex items-center justify-center p-4">

      <div className="relative bg-linear-to-br from-green-700 to-green-900 rounded-3xl p-8 w-92 min-h-48 shadow-2xl flex flex-col justify-between overflow-visible group/card">
        
        <div className="z-10 pr-24">
          <h2 className="text-[#F0F0F0] mb-2 text-xl tracking-wide font-extrabold">
            {state}
          </h2>
          <p className="text-[#F0F0F0]/90 text-sm leading-relaxed">
            {address}
          </p>
        </div>

        <div className="absolute -right-16 top-1/2 -translate-y-1/2 z-20">
          <button className="hover:-translate-y-1 transition-all cursor-pointer drop-shadow-lg">
            <img 
              src={'/favicon.ico'} 
              alt="Mapa do Brasil" 
              className="w-40 h-auto object-contain"
            />
          </button>
        </div>

        {/* BOTÃO (Agora faz parte do fluxo, ancorado no fundo pelo justify-between do pai) */}
        <div className="mt-6 z-10 w-fit">
          <a 
            href={link} 
            className="bg-white hover:bg-gray-50 transition-all rounded-full pl-4 pr-1 py-1 flex items-center gap-3 shadow-lg group cursor-pointer"
          >
            <span className="text-green-900 font-bold text-sm">Acessar</span>
            <div className="w-8 h-8 bg-green-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowUpRight className="w-4 h-4 text-white" />
            </div>
          </a>
        </div>

      </div>
    </div>
  );
}