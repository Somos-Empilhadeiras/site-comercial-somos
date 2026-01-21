import ComissaoForm from '@/shared/components/forms/ComissaoForm'
import React from 'react'

function page() {
  return (
    <main>
      <div className="flex flex-col text-center gap-2 px-4">
        <h1 className="text-3xl md:text-4xl font-black text-green-900 uppercase leading-tight">
          <span className="text-3xl">Bem-vindo à pagina de comissões</span>
        </h1>
        <h2 className="text-lg md:text-xl text-green-700 font-medium uppercase tracking-wide">
          Visualize suas comissões por data. Selecione o mês desejado: 
        </h2>
      </div>

    </main>
  )
}

export default page