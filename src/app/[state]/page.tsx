'use client';

import React, { useEffect, useState } from 'react';
import CollaboratorsCard from '@/shared/components/CollaboratorsCard';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import NotFound from '../not-found';

// Tipagem limpa, sem dependências do backend!
interface CollaboratorData {
  _id?: string;
  id?: string;
  name: string;
  login: string;
  role: string;
  state: string;
}

export default function ComercialPage() {
  const params = useParams();
  const stateParam = (params.state as string) || '';

  const [collaborators, setCollaborators] = useState<CollaboratorData[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const sessionRes = await fetch('/api/auth/me');
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          setCurrentUser(sessionData.user);
        }

        const url = stateParam === 'todos' ? '/api/collaborators' : `/api/collaborators?state=${stateParam}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Falha ao buscar colaboradores');

        const data = await response.json();
        setCollaborators(data);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    }

    if (stateParam) fetchData();
  }, [stateParam]);

  return (
    <div className="py-10 min-h-screen bg-zinc-50">
      <div className="max-w-6xl mx-auto px-4">

        <div className="flex mb-6 items-center justify-between">
          <Link href={`/`} className="p-2 flex items-center gap-2 rounded-full hover:bg-gray-200 text-gray-500 hover:text-green-700 transition-colors font-bold w-fit">
            <ArrowLeft size={20} />
            <p>Voltar</p>
          </Link>

          {currentUser?.role === 'admin' && (
            <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-1.5 rounded-full border border-amber-100 shadow-sm animate-in fade-in zoom-in">
              <ShieldCheck size={16} />
              <span className="text-xs font-black uppercase tracking-wider">Modo Administrador Ativo</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64 text-green-700 font-bold animate-pulse">
            Carregando consultores...
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full'>
            {collaborators.length > 0 ? (
              collaborators.map((collab) => {
                // Prevenção: Pega o _id do Mongo ou o id genérico
                const safeId = collab._id || collab.id;

                if (collab.role !== 'admin') {
                  return (
                    <CollaboratorsCard
                      key={safeId}
                      name={collab.name}
                      role={collab.role === 'admin' ? 'ADMINISTRADOR' : 'CONSULTOR(A)'}
                      state={collab.state}
                      photoUrl="/favicon.ico"
                      link={`/${collab.state}/${collab.login}`}
                    />
                  )
                }
              })
            ) : (
              <div className='col-span-1 md:col-span-2 lg:col-span-3'>
                <NotFound />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}