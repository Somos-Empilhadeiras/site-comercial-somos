'use client'

import InfoCard from "@/shared/components/StatesCard";
import { 
    Receipt,        // Despesas
    Briefcase,      // Comercial
    Truck,          // Locação
    Megaphone,      // Marketing
    LucideIcon 
} from "lucide-react";
import { useParams } from "next/navigation";

const STATE_CONFIG: Record<string, { name: string }> = {
    go: { name: 'GOIÁS' },
    ba: { name: 'BAHIA' },
    df: { name: 'DISTRITO FEDERAL' },
    to: { name: 'TOCANTINS' },
    pe: { name: 'PERNAMBUCO' },
};

export default function UnidadesIdPage() {
    const params = useParams();
    const currentStateKey = (params.state as string) || '';
    const currentData = STATE_CONFIG[currentStateKey] || { name: 'UNIDADE' };

    const TYPES_INFO = [
        {
            type: 'ACERTO DE DESPESAS',
            description: "Acesse relatórios detalhados.",
            icon: Receipt,
            link: `/${currentStateKey}/acerto-despesas`
        },
        {
            type: 'COMERCIAL',
            description: "Propostas e formulários.",
            icon: Briefcase, // <--- Ícone
            link: `/${currentStateKey}/comercial`
        },
        {
            type: 'LOCAÇÃO',
            description: "Empilhadeiras disponíveis.",
            icon: Truck, // <--- Ícone
            link: `https://somosempilhadeiras.com/empilhadeiras`
        },
        {
            type: 'MARKETING',
            description: "Materiais e logotipos.",
            icon: Megaphone, // <--- Ícone
            link: `/${currentStateKey}/marketing`
        },
    ];


    return (
        <div className="flex flex-col gap-12 items-center justify-center bg-zinc-50 font-sans">
            {/* Cabeçalho mantido igual */}
            <div className="flex flex-col text-center gap-2 max-w-4xl">
                <h1 className="text-3xl md:text-4xl font-black text-green-900 uppercase leading-tight">
                    Unidade {currentData.name}
                </h1>
                <h2 className="text-lg md:text-xl text-green-700 font-medium uppercase tracking-wide">
                    Selecione a opção desejada abaixo
                </h2>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8 w-full max-w-5xl">
                {TYPES_INFO.map((info, index) => (
                    <InfoCard
                        key={index}
                        state={info.type}
                        address={info.description}
                        link={info.link}
                        // MODO ÍCONE ATIVADO: Passamos iconElem
                        iconElem={info.icon} 
                        // mapState={undefined} // Não passamos mapa aqui!
                    />
                ))}
            </div>
        </div>
    );
}