'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, ArrowRight, ShieldCheck, Map } from 'lucide-react';
import InfoCard from '../shared/components/StatesCard';
import { Unit } from '../types';

export default function HomePage() {
    const [showUnidades, setShowUnidades] = useState(false);
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Busca as unidades configuradas no MongoDB Atlas
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
        <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-zinc-50 font-sans">

            {/* Identificação de Acesso Restrito */}
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-1.5 rounded-full mb-6 border border-green-100 animate-in fade-in slide-in-from-top-4 duration-700">
                <ShieldCheck size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Acesso Restrito - Somos Empilhadeiras</span>
            </div>

            {/* Apresentação do Portal */}
            <div className="text-center max-w-2xl mb-12 px-4">
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
                    Portal de Unidades e <br />
                    <span className="text-green-600">Módulos Comerciais</span>
                </h1>
                <p className="text-lg text-slate-600 leading-relaxed font-medium">
                    Selecione uma unidade abaixo para acessar o catálogo de relatórios,
                    comissões e ferramentas operacionais.
                </p>
            </div>

            {/* Ações Principais */}
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center mb-20 px-4">
                <button
                    onClick={() => {
                        setShowUnidades(!showUnidades);
                        setTimeout(() => {
                            const element = document.getElementById('unidades');
                            if (element) {
                                element.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'center'
                                });
                            }
                        }, 300);
                    }}
                    className="group flex items-center gap-3 bg-green-700 hover:bg-green-800 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl hover:-translate-y-1 w-full sm:w-auto justify-center cursor-pointer"
                >
                    <MapPin size={22} className={showUnidades ? "" : "group-hover:animate-bounce"} />
                    {showUnidades ? "Fechar Lista" : "Explorar Unidades"}
                    <ArrowRight size={20} className={`transition-transform duration-300 ${showUnidades ? "rotate-180" : "group-hover:translate-x-1"}`} />
                </button>

                <a
                    href="https://wa.me/5562995610693"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-8 py-4 rounded-2xl font-bold text-lg transition-all w-full sm:w-auto justify-center"
                >
                    Suporte TI
                </a>
            </div>

            {/* Renderização das Unidades */}
            <div id="unidades" className="w-full max-w-6xl flex items-center justify-center px-4">
                {showUnidades ? (
                    loading ? (
                        <div className="flex items-center justify-center h-64 text-green-700 font-black animate-pulse uppercase tracking-widest">
                            Sincronizando unidades...
                        </div>
                    ) : (
                        // O gap-8 (ou gap-6) aqui é o único responsável por desgrudar os cards
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full animate-in fade-in zoom-in-95 duration-500">

                            {/* Card Dinâmico: Todas as Unidades (Admin) */}
                            <div className="flex justify-center items-center w-full">
                                <InfoCard
                                    state="TODAS"
                                    address="Visão consolidada de todas as operações"
                                    link="/admin"
                                    mapState="TODAS"
                                />
                            </div>

                            {/* Unidades do Banco de Dados */}
                            {units.map((unit, index) => (
                                <div
                                    key={unit.id}
                                    // ✨ CORREÇÃO: Removemos o 'mx-8' e o 'gap-8' daqui. Adicionamos 'w-full'.
                                    className="flex justify-center items-center w-full"
                                    style={{
                                        animationDelay: `${(index + 1) * 0.1}s`,
                                    }}
                                >
                                    <InfoCard
                                        state={unit.name}
                                        address={unit.address}
                                        link={`/${unit.id}`} // Rota direta para o estado
                                        mapState={unit.id.toUpperCase()}
                                    />
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    <div className="flex flex-col items-center text-slate-300 opacity-60">
                        <Map size={80} strokeWidth={1} className="mb-4" />
                        <p className="font-bold tracking-wide italic">Aguardando seleção de unidade comercial...</p>
                    </div>
                )}
            </div>
        </div>
    );
}