'use client';

import CollaboratorsCard from '@/shared/components/CollaboratorsCard';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React from 'react'
import NotFound from '../not-found';

export const COLLABORATORS = {
  khryss: { name: "KHRYSS MYLLA", role: "ANALISTA COMERCIAL", email: "heli@somosempilhadeiras.com.br", state: "go", photoUrl: "/favicon.ico", link: "go/khryss-mylla" },
  lais: { name: "LAIS TOLEDO", role: "CONSULTOR(A) COMERCIAL", email: "lais@somosempilhadeiras.com.br", state: "go", photoUrl: "/favicon.ico", link: "go/lais-toledo" },
  aguinaldo: { name: "AGUINALDO LEMES", role: "CONSULTOR(A) COMERCIAL", email: "aguinaldo@somosempilhadeiras.com.br", state: "go", photoUrl: "/favicon.ico", link: "go/aguinaldo-lemes" },
  ezequiel: { name: "EZEQUIEL", role: "CONSULTOR(A) COMERCIAL", email: "ezequiel@somosempilhadeiras.com.br", state: "df", photoUrl: "/favicon.ico", link: "df/ezequiel" },
  tiagoFreua: { name: "TIAGO FREUA", role: "CONSULTOR(A) COMERCIAL", email: "tiago@somosempilhadeiras.com.br", state: "to", photoUrl: "/favicon.ico", link: "to/tiago-freua" },
  rafaelGomes: { name: "RAFAEL GOMES", role: "CONSULTOR(A) DE NEGOCIOS", email: "raael@somosempilhadeiras.com.br", state: "ba", photoUrl: "/favicon.ico", link: "ba/rafael-gomes" },
  joseHenrique: { name: "JOSÉ HENRIQUE", role: "CONSULTOR(A) DE NEGOCIOS", email: "josehenrique@somosempilhadeiras.com.br", state: "pe", photoUrl: "/favicon.ico", link: "pe/jose-henrique" },
};

export default function ComercialPage() {
  const params = useParams();
  const state = params.state || '/';

  const currentCollaborators = Object.values(COLLABORATORS).filter(
    (collab) => collab.state === params.state
  );

  return (
    <div>

      {/* 3. O LINK DINÂMICO */}
      {(currentCollaborators.length > 0 || params.state === 'todos') &&

        (<div className="flex mb-3 items-center">

          <Link
            href={`/`}
            className="p-2 flex items-center gap-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-green-700 transition-colors cursor-pointer"
            title="Voltar para a Unidade"
          >
            <ArrowLeft size={20} />
            <p>Voltar</p>
          </Link>
        </div>)
      }

      <div className='grid grid-cols-1 md:grid-cols-3 gap-8 w-full px-4'>

        {currentCollaborators.length > 0 ? (
          currentCollaborators.map((collab, index) => (
            <CollaboratorsCard
              key={index}
              name={collab.name}
              role={collab.role}
              state={collab.state}
              photoUrl={collab.photoUrl}
              link={collab.link}
            />
          ))
        ) : (
          params.state === 'todos' ? (
            Object.values(COLLABORATORS).map((collab, index) => (
              <CollaboratorsCard
                key={index}
                name={collab.name}
                role={collab.role}
                state={collab.state}
                photoUrl={collab.photoUrl}
                link={collab.link}
              />
            ))
          ) : (
            <div className='col-span-3'>
              <NotFound />
            </div>
          )
        )}
      </div>
    </div>
  )
}