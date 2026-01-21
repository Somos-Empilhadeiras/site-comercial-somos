'use client'

import React, { useEffect } from 'react'; // Adicionado useEffect
import InfoCard from "@/shared/components/StatesCard";
import { Receipt, Briefcase, Truck, Megaphone, ArrowLeft, HandCoins, ListCheck, ClipboardEditIcon, FileSignature, FileKey2Icon, BadgeCheckIcon } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation"; // Adicionado useRouter
import { COLLABORATORS } from "../page"; // Certifique-se que o caminho está correto

const STATE_CONFIG: Record<string, { name: string }> = {
    go: { name: 'GOIÁS' },
    ba: { name: 'BAHIA' },
    df: { name: 'DISTRITO FEDERAL' },
    to: { name: 'TOCANTINS' },
    pe: { name: 'PERNAMBUCO' },
};

export default function UnidadesIdPage() {
    const params = useParams();
    const router = useRouter(); // Hook para navegação
    
    const currentStateKey = (params.state as string) || '';
    const collaboratorSlug = (params.collaborator as string) || '';
    
    const currentData = STATE_CONFIG[currentStateKey];

    // 1. LÓGICA DE FILTRAGEM:
    // Procuramos se existe algum colaborador cujo link contenha o slug da URL
    const currentCollaborator = Object.values(COLLABORATORS).find((c) => 
        c.link.includes(collaboratorSlug) && c.state === currentStateKey
    );

    // 2. REDIRECIONAMENTO (Efeito colateral):
    useEffect(() => {
        if (!currentCollaborator) {
            // Se não existir, volta para a página do estado
            router.push(`/${currentStateKey}`);
        }
    }, [currentCollaborator, router, currentStateKey]);

    // Enquanto o redirecionamento não acontece, não renderizamos nada (ou um loader)
    if (!currentCollaborator) return null;

    const TYPES_INFO = [
        {
            type: 'ACERTO DE DESPESAS',
            description: "Acesse relatórios detalhados.",
            icon: Receipt,
            link: `/${currentStateKey}/${collaboratorSlug}/acerto-despesas`
        },
        {
            type: 'COMERCIAL',
            description: "Propostas e formulários.",
            icon: Briefcase,
            link: `/${currentStateKey}/${collaboratorSlug}/comercial`
        },
        {
            type: 'LOCAÇÃO',
            description: "Empilhadeiras disponíveis.",
            icon: Truck,
            link: `https://somosempilhadeiras.com/empilhadeiras`
        },
        {
            type: 'MARKETING',
            description: "Materiais e logotipos.",
            icon: Megaphone,
            link: `/${currentStateKey}/${collaboratorSlug}/marketing`
        },
        {
            type: 'SOLICITAÇÃO DE PROPOSTAS',
            description: "Materiais e logotipos.",
            icon: FileSignature,
            link: `/${currentStateKey}/${collaboratorSlug}/solicitacao-propostas`
        },
        {
            type: 'COMISSÃO DE VENDAS',
            description: "Materiais e logotipos.",
            icon: HandCoins,
            link: `/${currentStateKey}/${collaboratorSlug}/comissao-vendas`
        },
        {
            type: 'CHECKLIST DE VEÍCULOS',
            description: "Materiais e logotipos.",
            icon: ListCheck,
            link: `/${currentStateKey}/${collaboratorSlug}/checklist-veiculos`
        },
        {
            type: 'COMISSÃO DE LOCAÇÃO',
            description: "Materiais e logotipos.",
            icon: HandCoins,
            link: `/${currentStateKey}/${collaboratorSlug}/comissao-locacao`
        },
        {
            type: 'SOLICITAÇÃO DE PROPOSTAS DE VENDAS',
            description: "Materiais e logotipos.",
            icon: ClipboardEditIcon,
            link: `/${currentStateKey}/${collaboratorSlug}/solicitacao-propostas-vendas`
        },
        {
            type: 'SOLICITAÇÃO DE PROPOSTAS DE LOCAÇÃO',
            description: "Materiais e logotipos.",
            icon: ClipboardEditIcon,
            link: `/${currentStateKey}/${collaboratorSlug}/solicitacao-propostas-locacao`
        },
        {
            type: 'PROPOSTAS DE LOCAÇÃO',
            description: "Materiais e logotipos.",
            icon: FileKey2Icon,
            link: `/${currentStateKey}/${collaboratorSlug}/propostas-locacao`
        },
        {
            type: 'SEMINOVOS',
            description: "Materiais e logotipos.",
            icon: BadgeCheckIcon,
            link: `/${currentStateKey}/${collaboratorSlug}/seminovos`
        },
    ];

    return (
        <div className="flex flex-col gap-12 items-center justify-center bg-zinc-50 font-sans py-10 min-h-screen">
            {/* CABEÇALHO */}
            <div className="flex flex-col text-center gap-2 px-4">
                <h1 className="text-3xl md:text-4xl font-black text-green-900 uppercase leading-tight">
                    Olá, {currentCollaborator.name}! <br/>
                    <span className="text-2xl">Bem-vindo à unidade de {currentData.name}</span>
                </h1>
                <h2 className="text-lg md:text-xl text-green-700 font-medium uppercase tracking-wide">
                    Selecione a opção desejada abaixo
                </h2>
            </div>

            {/* BOTÃO VOLTAR */}
            <div className="flex w-full px-4">
                <Link
                    href={`/${currentStateKey}`}
                    className="p-2 flex items-center gap-2 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-green-700 transition-colors cursor-pointer font-bold"
                >
                    <ArrowLeft size={20} />
                    Voltar
                </Link>
            </div>

            {/* GRID DE CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full px-4">
                {TYPES_INFO.map((info, index) => (
                    <InfoCard
                        key={index}
                        state={info.type}
                        address={info.description}
                        link={info.link}
                        iconElem={info.icon}
                    />
                ))}
            </div>
        </div>
    );
}   