'use client'

import InfoCard from "@/shared/components/StatesCard";
import { useParams } from "next/navigation";

export default function UnidadesIdPage() {
    
    const estadoParam = useParams().state;
    
    const formataEstado = estadoParam == 'go' ? 'GOIÁS' : estadoParam == 'ba' ? 'BAHIA' : estadoParam == 'df' ? 'DISTRITO FEDERAL' : estadoParam == 'to' ? 'TOCANTINS' : estadoParam == 'pe' ? 'PERNAMBUCO' : '';
    const estado = estadoParam == 'go' ? 'go' : estadoParam == 'ba' ? 'ba' : estadoParam == 'df' ? 'df' : estadoParam == 'to' ? 'to' : estadoParam == 'pe' ? 'pe' : '';
    
const TYPES_INFO = [
        { 
            type: 'ACERTO DE DESPESAS', 
            description: "Acesse relatórios detalhados sobre cada colaborador.", 
            link: `${estado}/acerto-despesas` 
        },
        { 
            type: 'COMERCIAL', 
            description: "Gerencie propostas e formulários de vendas da unidade.", 
            link: `${estado}/comercial` 
        },
        { 
            type: 'LOCAÇÃO', 
            description: "Visualize contratos, manuais e termos de locação ativos.", 
            link: `${estado}/locacao` 
        },
        { 
            type: 'MARKETING', 
            description: "Baixe materiais de suporte, logotipos e mídias sociais.", 
            link: `/${estado}/marketing` 
        },
    ]

    return (
        <div className="flex flex-col gap-12 items-center justify-center bg-zinc-50 font-sans">
            {/* CABEÇALHO */}
            <div className="font-bold gap-4 flex flex-col text-center text-green-900">
                <h1 className="text-3xl">VOCÊ ESTÁ NA PÁGINA DE RELATÓRIOS E INFORMAÇÕES DA UNIDADE DE {formataEstado}</h1>
                <h1 className="uppercase text-2xl">selecione a opção desejada abaixo</h1>
            </div>

            {/* CARDS DE TIPOS DE INFORMAÇÕES */}
            <div className="grid grid-cols-3 gap-x-40 justify-between ">
                {TYPES_INFO.map((info, index) => (
                    <InfoCard key={index} state={info.type} address={info.description} link={info.link} />
                ))}
            </div>
        </div>

    );
}