'use client'

import React, { useEffect, useState, use } from 'react';
import { ArrowLeft, Lock, LockKeyhole, Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as Icons from "lucide-react";
import InfoCard from '../../shared/components/StatesCard';

const STATE_CONFIG: Record<string, { name: string }> = {
    go: { name: 'GOIÁS' },
    ba: { name: 'BAHIA' },
    df: { name: 'DISTRITO FEDERAL' },
    to: { name: 'TOCANTINS' },
    pe: { name: 'PERNAMBUCO' },
};

export default function UnidadesIdPage({ params }: { params: Promise<{ state: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();

    const currentStateKey = resolvedParams.state || '';
    const currentData = STATE_CONFIG[currentStateKey] || { name: currentStateKey.toUpperCase() };

    const [currentUser, setCurrentUser] = useState<any>(null);
    const [cards, setCards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStateData() {
            try {
                // 1. Busca quem está logado (para checar permissões)
                const sessionRes = await fetch('/api/auth/me');
                if (sessionRes.ok) {
                    const sessionData = await sessionRes.json();
                    setCurrentUser(sessionData.user);
                }

                // 2. Busca TODOS os cards cadastrados para esta unidade
                const cardsRes = await fetch(`/api/cards?state=${currentStateKey}`);
                if (cardsRes.ok) {
                    const data = await cardsRes.json();
                    setCards(data);
                }
            } catch (error) {
                console.error("Erro ao carregar unidade:", error);
            } finally {
                setLoading(false); 
            }
        }
        fetchStateData();
    }, [currentStateKey]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 text-green-700 animate-pulse font-bold">
            Sincronizando Módulos...
        </div>
    );

    return (
        <div className="flex flex-col gap-12 items-center justify-start bg-zinc-50 font-sans py-10 min-h-screen">
            
            {/* Cabeçalho */}
            <div className="flex flex-col text-center gap-2 px-4">
                <h1 className="text-3xl md:text-4xl font-black text-green-900 uppercase leading-tight">
                    Unidade {currentData.name} <br />
                    <span className="text-lg text-slate-500 font-bold">Selecione um serviço ou módulo</span>
                </h1>
            </div>

            <div className="flex w-full px-4 justify-start max-w-6xl">
                <Link href="/" className="p-2 flex items-center gap-2 rounded-lg hover:bg-gray-200 text-gray-500 font-bold transition-all">
                    <ArrowLeft size={20} /> Voltar para Unidades
                </Link>
            </div>

            {/* Grid de Cards com Lógica de Cadeado */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl px-4">
                {cards.map((card) => {
                    const IconComponent = (Icons as any)[card.icon] || Info;
                    
                    // Lógica de Bloqueio:
                    const isUnauthorized = card.isLocked && (!currentUser || !currentUser.activeCards?.includes(card.id));

                    // --- CORREÇÃO DA ROTA AQUI ---
                    // Tira a barra inicial do card.url (se existir) para não duplicar na URL final
                    const cleanUrl = card.url?.replace(/^\//, '') || '';
                    
                    // Pega o nome do colaborador (ou login) para montar a URL
                    const collaboratorParam = currentUser?.name || currentUser?.login || 'usuario';

                    // Monta o link correto dependendo se ele tem acesso ou não
                    const authorizedLink = `/${currentStateKey}/${collaboratorParam}/${cleanUrl}`;
                    const unauthorizedLink = `/login?callbackUrl=/${currentStateKey}/${cleanUrl}`;
                    // -----------------------------

                    return (
                        <div key={card._id} className="relative group">
                            <InfoCard
                                state={card.title}
                                address={card.description}
                                link={isUnauthorized ? unauthorizedLink : authorizedLink}
                                iconElem={isUnauthorized ? Lock : IconComponent}
                            />
                            
                            {isUnauthorized && (
                                <div className="absolute top-4 right-4 bg-red-500 text-white p-1.5 rounded-full shadow-lg">
                                    <LockKeyhole size={14} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}