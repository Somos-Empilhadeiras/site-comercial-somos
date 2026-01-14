'use client'

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

interface Collaborator {
    name: string;
    role: string;
    state: string;
    photoUrl: string
    link: string;
}

export default function CollaboratorsCard({ name, role, state, photoUrl, link }: Collaborator) {

    const formataEstado = state == 'go' ? 'GOIÁS' : state == 'ba' ? 'BAHIA' : state == 'df' ? 'DISTRITO FEDERAL' : state == 'to' ? 'TOCANTINS' : state == 'pe' ? 'PERNAMBUCO' : '';

    return (
        <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-md">
            <Image
                width={16}
                height={16}
                src={photoUrl}
                alt={`${name}'s photo`}
                className="w-16 h-16 rounded-full object-cover"
            />
            <div className="grid grid-rows-3 w-full">
                <h3 className="text-lg font-semibold">{name}</h3>
                <p className="text-gray-500">{role}</p>
                <p className="text-gray-500">{formataEstado}</p>
                <div className="z-10 w-[60%]">
                    <a
                        href={link}
                        className="bg-white hover:bg-gray-50 transition-all rounded-full pl-4 pr-1 py-1 justify-around flex items-center gap-3 shadow-lg group cursor-pointer"
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