import StatesCard from "@/shared/components/StatesCard";


export default function UnidadesPage() {
    const STATES_INFO = [
        {state: 'LEM - BA', endereco: "Av. Luís Eduardo Magalhães, QD 02 - LT 26, LEM - BA", link: "/unidades/ba" },
        {state: 'GOIANIA - GO', endereco: "Av. Caiapó, 1190, Goiania - Goiás", link: "/unidades/go" },
        {state: 'BRASILIA - DF', endereco: "SCIA, Lote", link: "/unidades/df" },
        {state: 'TOCANTINS - DF', endereco: "TOCANTINS", link: "/unidades/to" },
        {state: 'RECIFE - PE', endereco: "SCIA, Lote", link: "/unidades/pe" },
    ]
    return (
        <div className="flex flex-col gap-12 items-center justify-center bg-zinc-50 font-sans">
            <h1 className="font-bold text-3xl text-center text-green-900">NAVEGUE PELA SUA UNIDADE PARA ENCONTRAR RELATORIOS, FORMULARIOS E TUDO O QUE VOCÊ PRECISA PARA O SEU DIA A DIA</h1>

            <div className="grid grid-cols-3 gap-x-40 justify-between ">
                    {STATES_INFO.map((info, index) => (
                        <StatesCard key={index} state={info.state} address={info.endereco} link={info.link} />
                    ))}
            </div>
        </div>
    );
}