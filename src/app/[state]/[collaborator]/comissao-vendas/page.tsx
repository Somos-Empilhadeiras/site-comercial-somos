'use client';

import React, { useState, useEffect, use } from 'react';
import { AlertCircle, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import CommissionDashboard from '../../../../shared/components/CommissionsDashboard';

export default function ComissaoVendasPage({ params }: { params: Promise<{ state: string, collaborator: string }> }) {
    const router = useRouter();
    // CORREÇÃO: Desembrulha os parâmetros de forma assíncrona (Padrão Next.js 15)
    const resolvedParams = use(params);
    const collaboratorSlug = decodeURIComponent(resolvedParams.collaborator || '');

    const [commissions, setCommissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // 1. Busca colaborador
                const collabRes = await fetch('/api/collaborators');
                if (!collabRes.ok) throw new Error("Erro ao acessar API de colaboradores");

                const collabs = await collabRes.json();

                // CORREÇÃO AQUI: Busca pelo 'name' OU pelo 'login', convertendo tudo para minúsculo
                const user = collabs.find((c: any) =>
                    c.name?.toLowerCase() === collaboratorSlug.toLowerCase() ||
                    c.login?.toLowerCase() === collaboratorSlug.toLowerCase()
                );

                if (user) {
                    // 2. Busca comissões
                    const commRes = await fetch('/api/commissions', { cache: 'no-store' });
                    if (commRes.ok && commRes.headers.get('content-type')?.includes('application/json')) {
                        const allData = await commRes.json();
                        const myComms = allData.filter((c: any) => String(c.collaboratorId) === String(user._id));
                        setCommissions(myComms);
                    } else {
                        throw new Error("API de comissões retornou formato inválido (HTML em vez de JSON)");
                    }
                } else {
                    throw new Error("Consultor não localizado no banco de dados");
                }
            } catch (err: any) {
                console.error("Erro na carga:", err.message);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (collaboratorSlug) fetchData();
    }, [collaboratorSlug]);

    if (loading) return <div className="p-10 text-center font-bold text-green-700 animate-pulse">Sincronizando dados...</div>;

    if (error) return (
        <div className="p-10 text-center flex flex-col items-center gap-4">
            <AlertCircle className="text-red-500" size={48} />
            <p className="text-slate-800 font-bold">{error}</p>
            <button onClick={() => router.back()} className="text-green-700 underline">Voltar</button>
        </div>
    );

    console.log("DADOS DA MYLLA: ", commissions);

    return (
        <div className="w-full max-w-[1400px] mx-auto p-4 md:p-8">
            <header className="mb-10">
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 uppercase">Comissões e Rendimentos</h1>
                <p className="text-slate-500 font-bold mt-2 italic">Desempenho de {collaboratorSlug}</p>
            </header>

            <CommissionDashboard commissions={commissions} />
        </div>
    );
}