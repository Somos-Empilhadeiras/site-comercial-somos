'use client';

import CollaboratorsCard from '@/shared/components/CollaboratorsCard';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React from 'react'

export const COLLABORATORS = {
  khryss: { name: "KHRYSS MYLLA", role: "ANALISTA COMERCIAL", email: "heli@somosempilhadeiras.com.br", state: "go", photoUrl: "/images/joao.jpg", link: "go/khryss-mylla" },
  lais: { name: "LAIS TOLEDO", role: "CONSULTOR(A) COMERCIAL", email: "lais@somosempilhadeiras.com.br", state: "go", photoUrl: "/images/maria.jpg", link: "go/lais-toledo" },
  aguinaldo: { name: "AGUINALDO LEMES", role: "CONSULTOR(A) COMERCIAL", email: "aguinaldo@somosempilhadeiras.com.br", state: "go", photoUrl: "/images/carlos.jpg", link: "go/aguinaldo-lemes" },
  ezequiel: { name: "EZEQUIEL", role: "CONSULTOR(A) COMERCIAL", email: "ezequiel@somosempilhadeiras.com.br", state: "df", photoUrl: "/images/carlos.jpg", link: "df/ezequiel" },
  tiagoFreua: { name: "TIAGO FREUA", role: "CONSULTOR(A) COMERCIAL", email: "tiago@somosempilhadeiras.com.br", state: "to", photoUrl: "/images/carlos.jpg", link: "to/tiago-freua" },
  rafaelGomes: { name: "RAFAEL GOMES", role: "CONSULTOR(A) DE NEGOCIOS", email:"raael@somosempilhadeiras.com.br", state:"ba" , photoUrl:"/images/carlos.jpg" , link:"ba/rafael-gomes"},
  joseHenrique: { name:"JOSÉ HENRIQUE" , role:"CONSULTOR(A) DE NEGOCIOS" , email:"josehenrique@somosempilhadeiras.com.br", state:"pe" , photoUrl:"/images/carlos.jpg" , link:"pe/jose-henrique"},
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
      <div className="flex mb-3 items-center">

        <Link
          href={`/`}
          className="p-2 flex items-center gap-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-green-700 transition-colors cursor-pointer"
          title="Voltar para a Unidade"
        >
          <ArrowLeft size={20} />
            <p>Voltar</p>
        </Link>

      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-12 w-full'>

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
            <p>Nenhum colaborador encontrado para esta unidade.</p>
          ))}

      </div>
    </div>
  )
}