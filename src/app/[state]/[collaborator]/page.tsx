'use client'

import React, { useEffect, useState } from 'react';
import InfoCard from "@/shared/components/StatesCard";
import { ArrowLeft, Map, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import * as Icons from "lucide-react";

const STATE_CONFIG: Record<string, { name: string }> = {
    go: { name: 'GOIÁS' },
    ba: { name: 'BAHIA' },
    df: { name: 'DISTRITO FEDERAL' },
    to: { name: 'TOCANTINS' },
    pe: { name: 'PERNAMBUCO' },
};

export default function UnidadesIdPage() {
    const params = useParams();
    const router = useRouter();

    const currentStateKey = (params.state as string) || '';
    const collaboratorSlug = decodeURIComponent((params.collaborator as string) || '');
    const currentData = STATE_CONFIG[currentStateKey] || { name: currentStateKey.toUpperCase() };

    const [collaborator, setCollaborator] = useState<any>(null);
    const [currentUser, setCurrentUser] = useState<any>(null); // Quem está logado
    const [cards, setCards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                // 1. Busca Sessão
                const sessionRes = await fetch('/api/auth/me');
                if (sessionRes.ok) {
                    const sessionData = await sessionRes.json();
                    setCurrentUser(sessionData.user);
                }

                // 2. Busca o colaborador do Contexto (URL)
                const collabRes = await fetch(`/api/collaborators?state=${currentStateKey}`);

                // O Escudo de Proteção:
                if (!collabRes.ok) {
                    throw new Error('Falha na comunicação com o servidor de dados.');
                }

                const collabData = await collabRes.json();
                const contextUser = collabData.find((c: any) => c.login === collaboratorSlug);

                if (!contextUser) {
                    router.push(`/${currentStateKey}`);
                    return;
                }
                setCollaborator(contextUser);

                // CORREÇÃO: Pegar o _id (Mongo) ou id (Fallback) com segurança
                const safeUserId = contextUser._id || contextUser.id;

                // 3. Busca os cards do colaborador do Contexto usando o ID seguro
                const cardsRes = await fetch(`/api/collaborators/cards?userId=${safeUserId}`);
                if (cardsRes.ok) setCards(await cardsRes.json());

            } catch (error) {
                console.error("Erro ao carregar dados:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchDashboardData();
    }, [currentStateKey, collaboratorSlug, router]);

    if (loading || !collaborator) return <div className="min-h-screen flex items-center justify-center bg-zinc-50 text-green-700 animate-pulse font-bold">Carregando painel...</div>;

    // Se o colaborador for null, redireciona ou mostra erro amigável
    if (!collaborator) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 p-6">
                <Icons.AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-slate-800">Consultor não encontrado</h2>
                <p className="text-slate-500 mb-6 text-center">Não localizamos o perfil de "{collaboratorSlug}" nesta unidade.</p>
                <button onClick={() => router.back()} className="text-green-700 font-bold underline">Voltar para a lista</button>
            </div>
        );
    }
    return (
        <div className="flex flex-col gap-12 items-center justify-center bg-zinc-50 font-sans py-10 min-h-screen">

            {/* Cabeçalho do Contexto (Quem estamos vendo) */}
            <div className="flex flex-col text-center gap-2 px-4">
                <h1 className="text-3xl md:text-4xl font-black text-green-900 uppercase leading-tight">
                    Olá, {collaborator.name}! <br />
                    <span className="text-2xl">Bem-vindo à unidade de {currentData.name}</span>
                </h1>
            </div>

            <div className="flex w-full px-4 justify-between items-center max-w-6xl">
                <Link
                    href={`/${currentStateKey}`}
                    className="p-2 flex items-center gap-2 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-green-700 transition-colors font-bold"
                >
                    <ArrowLeft size={20} /> Voltar
                </Link>

                {/* Aviso de Visualização Admin */}
                {currentUser?.role === 'admin' && collaborator?.login !== currentUser?.login && (
                    <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl border border-blue-100 shadow-sm">
                        <ShieldAlert size={18} />
                        <p className="text-xs font-bold uppercase tracking-tight">
                            Você está visualizando o painel de outro colaborador.
                        </p>
                    </div>
                )}
            </div>

            {/* Grid de Cards (Contexto) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl px-4">
                {cards.length > 0 ? (
                    cards.map((card) => {
                        const IconComponent = (Icons as any)[card.icon] || Icons.Info;
                        return (
                            <InfoCard
                                key={card._id}
                                state={card.title}
                                address={card.description}
                                link={card.url.startsWith('http') ? card.url : `/${currentStateKey}/${collaboratorSlug}${card.url}`}
                                iconElem={IconComponent}
                            />
                        );
                    })
                ) : (
                    <div className="col-span-1 md:col-span-3 text-center text-gray-400 py-10 flex flex-col items-center">
                        <Map size={48} className="mb-4 opacity-50" />
                        <p className="font-medium italic">Nenhum card liberado para este perfil.</p>
                    </div>
                )}
            </div>
        </div>
    );
}