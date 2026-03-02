'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, ArrowRight, ShieldCheck, Map } from 'lucide-react';
import InfoCard from '@/shared/components/StatesCard';
import { Unit } from '@/types'; // Certifique-se de que o type Unit está exportado no seu types/index.ts

export default function HomePage() {
    // Seus estados visuais
    const [showUnidades, setShowUnidades] = useState(false);
    
    // Nossos estados de dados da API
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Busca as unidades da nossa API
        async function fetchUnits() {
            try {
                const response = await fetch('/api/units');
                if (!response.ok) throw new Error('Falha ao buscar unidades');
                
                const data = await response.json();
                setUnits(data);
            } catch (error) {
                console.error('Erro ao carregar as unidades:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchUnits();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-full py-12 bg-zinc-50">

            {/* Identificação */}
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-1.5 rounded-full mb-6 border border-green-100">
                <ShieldCheck size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Acesso Restrito - Comercial</span>
            </div>

            {/* Apresentação */}
            <div className="text-center max-w-2xl mb-12 px-4">
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
                    Portal de Unidades e <br />
                    <span className="text-green-600">Relatórios Comerciais</span>
                </h1>
                <p className="text-lg text-slate-600 leading-relaxed">
                    Bem-vindo ao centro de recursos da <strong>Somos Empilhadeiras</strong>.
                    Selecione uma unidade abaixo para gerenciar seus relatórios e formulários.
                </p>
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center mb-20 px-4">
                <button
                    onClick={() => {
                        setShowUnidades(!showUnidades);

                        // O seu scroll suave
                        setTimeout(() => {
                            const element = document.getElementById('unidades');
                            if (element) {
                                element.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'center',
                                    inline: 'nearest'
                                });
                            }
                        }, 300);
                    }}
                    className="group flex items-center gap-3 bg-green-700 hover:bg-green-800 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl hover:shadow-green-900/20 hover:-translate-y-1 w-full sm:w-auto justify-center cursor-pointer"
                >
                    <MapPin size={22} className={showUnidades ? "" : "group-hover:animate-bounce"} />
                    {showUnidades ? "Fechar Mapa" : "Selecionar Unidade"}
                    <ArrowRight size={20} className={`transition-transform duration-300 ${showUnidades ? "rotate-180" : "group-hover:translate-x-1"}`} />
                </button>

                <a
                    href="https://wa.me/5562995610693"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-8 py-4 rounded-2xl font-bold text-lg transition-all w-full sm:w-auto justify-center"
                >
                    Suporte Técnico
                </a>
            </div>

            {/* Conteúdo Renderizado Condicionalmente */}
            <div id="unidades" className="w-full max-w-6xl flex items-center justify-center px-4">
                {showUnidades ? (
                    loading ? (
                        // Mostra o loading enquanto a API responde
                        <div className="flex items-center justify-center h-64 text-green-700 font-bold animate-pulse">
                            Carregando unidades...
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
                            
                            {/* Card Fixo de "TODOS" com a sua animação (Índice 0) */}
                            <div
                                className="flex justify-center items-center animate-slide-right opacity-0"
                                style={{
                                    animationDelay: `0s`,
                                    animationFillMode: 'forwards'
                                }}
                            >
                                <InfoCard
                                    state="TODOS"
                                    address="Acesse as informações de todas as unidades"
                                    link="/todos"
                                    mapState="TODOS"
                                />
                            </div>

                            {/* Cards Dinâmicos vindos da API */}
                            {units.map((unit, index) => (
                                <div
                                    key={unit.id}
                                    className="flex justify-center items-center animate-slide-right opacity-0"
                                    style={{
                                        // index + 1 para o atraso (delay) contar após o card "TODOS"
                                        animationDelay: `${(index + 1) * 0.07}s`,
                                        animationFillMode: 'forwards'
                                    }}
                                >
                                    <InfoCard
                                        state={unit.name}
                                        address={unit.address}
                                        link={`/${unit.id}`}
                                        mapState={unit.id.toUpperCase()} 
                                    />
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    // A sua mensagem de "Aguardando"
                    <div className="flex flex-col items-center text-slate-300 transition-opacity duration-500 opacity-100">
                        <Map size={80} strokeWidth={1} className="mb-4 opacity-60" />
                        <p className="font-medium tracking-wide italic">Aguardando seleção de unidade...</p>
                    </div>
                )}
            </div>
        </div>
    );
}