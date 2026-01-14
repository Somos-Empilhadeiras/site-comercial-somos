'use client';

import CollaboratorsCard from '@/shared/components/CollaboratorsCard';
import { useParams } from 'next/navigation';
import React from 'react'

// Movi a constante para fora do componente. 
// Boa prática: dados estáticos não precisam ser recriados a cada renderização.
const COLLABORATORS = [
    { name: "KHRYSS MYLLA", role: "ANALISTA COMERCIAL", state: "go", photoUrl: "/images/joao.jpg", link: "/images/joao.jpg" },
    { name: "LAIS TOLEDO", role: "CONSULTOR(A) COMERCIAL", state: "go", photoUrl: "/images/maria.jpg", link: "/images/maria.jpg" },
    { name: "AGUINALDO LEMES", role: "CONSULTOR(A) COMERCIAL", state: "go", photoUrl: "/images/carlos.jpg", link: "/images/carlos.jpg" },
    { name: "EZEQUIEL", role: "CONSULTOR(A) COMERCIAL", state: "df", photoUrl: "/images/carlos.jpg", link: "/images/carlos.jpg" },
    { name: "TIAGO FREUA", role: "CONSULTOR(A) COMERCIAL", state: "to", photoUrl: "/images/carlos.jpg", link: "/images/carlos.jpg" },
    { name: "RAFAEL GOMES", role: "CONSULTOR(A) DE NEGOCIOS", state: "ba", photoUrl: "/images/carlos.jpg", link: "/images/carlos.jpg" },
    { name: "JOSÉ HENRIQUE", role: "CONSULTOR(A) DE NEGOCIOS", state: "pe", photoUrl: "/images/carlos.jpg", link: "/images/carlos.jpg" }, // Corrigi 're' para 'pe' (Pernambuco?)
];

export default function ComercialPage() {
  const params = useParams();
  
  const currentCollaborators = COLLABORATORS.filter(
    (collab) => collab.state === params.state
  );

  return (
    <div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-12 w-full'>
        
        {/* 2. MAPEAR: Renderizamos um card para cada item da lista filtrada */}
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
            <p>Nenhum colaborador encontrado para esta unidade.</p>
        )}

      </div>
    </div>
  )
}