'use client'

import { ArrowUpRight, MapPin } from "lucide-react";
import Image from "next/image";

interface Collaborator {
    name: string;
    role: string;
    state: string;
    photoUrl: string
    link: string;
}

export default function CollaboratorsCard({ name, role, state, photoUrl, link }: Collaborator) {

    const stateNames: Record<string, string> = {
        go: 'GOIANIA / GOIÁS',
        ba: 'LUES EDUARDO MAGALHÃES / BAHIA',
        df: 'BRASÍLIA / DISTRITO FEDERAL',
        to: 'PALMAS / TOCANTINS',
        pe: 'RECIFE / PERNAMBUCO'
    };
    
    const formataEstado = stateNames[state.toLowerCase()] || state.toUpperCase();

    return (
        <div className="flex items-center justify-center p-4">
            {/* CONTAINER: Exatamente as mesmas classes do InfoCard para manter consistência total */}
            <div className="relative bg-linear-to-br from-green-700 to-green-900 rounded-3xl p-8 w-96 min-h-56 shadow-2xl flex flex-col justify-between overflow-visible group/card transition-all hover:-translate-y-1">

                {/* LADO ESQUERDO: INFORMAÇÕES */}
                <div className="z-10 pr-24 relative">
                    {/* Cargo (como se fosse o endereço no outro card) */}
                    <p className="text-green-300 text-xs font-bold tracking-wider mb-1 uppercase">
                        {role}
                    </p>
                    
                    {/* Nome (como se fosse o título) */}
                    <h2 className="text-[#F0F0F0] mb-3 text-xl tracking-wide font-extrabold uppercase leading-tight">
                        {name}
                    </h2>

                    {/* Localização */}
                    <div className="flex items-center gap-2 text-[#F0F0F0]/80">
                        <MapPin size={14} />
                        <span className="text-xs font-medium">{formataEstado}</span>
                    </div>
                </div>

                {/* LADO DIREITO: FOTO (Substituindo o Mapa/Ícone) */}
                {/* Posicionada 'absolute' na direita para criar o mesmo peso visual do mapa */}
                <div className="absolute -right-6 top-1/2 -translate-y-1/2">
                    <div className="relative w-32 h-32 group-hover/card:scale-110 transition-transform duration-500">
                        {/* Círculo decorativo atrás da foto (sutil) */}
                        <div className="absolute inset-0 bg-white/10 rounded-full blur-sm transform translate-x-1 translate-y-2"></div>
                        
                        {/* A Foto em si */}
                        <Image
                            width={128}
                            height={128}
                            src={photoUrl}
                            alt={name}
                            className="w-32 h-32 rounded-full object-cover border-4 border-[#005831] shadow-lg relative z-10"
                        />
                    </div>
                </div>

                {/* RODAPÉ: BOTÃO (Idêntico ao InfoCard) */}
                <div className="mt-6 z-10 w-fit">
                    <a
                        href={link}
                        className="bg-white hover:bg-gray-50 transition-all rounded-full pl-4 pr-1 py-1 flex items-center gap-3 shadow-lg group cursor-pointer"
                    >
                        <span className="text-green-900 font-bold text-sm uppercase">Consultar</span>
                        <div className="w-8 h-8 bg-green-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ArrowUpRight className="w-4 h-4 text-white" />
                        </div>
                    </a>
                </div>

            </div>
        </div>
    );
}