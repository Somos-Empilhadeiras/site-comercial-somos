'use client';

import { useState } from 'react';
import { MapPin, ArrowRight, ShieldCheck, Map } from 'lucide-react';
import InfoCard from '@/shared/components/StatesCard';

export default function HomePage() {
	const [showUnidades, setShowUnidades] = useState(false);

	const STATES_INFO = [
		{ state: 'TODOS', endereco: "Acesse as informações de todas as unidades", link: "/todos", uf: 'todos' },
		{ state: 'GOIANIA - GO', endereco: "Av. Caiapó, 1190, Goiania - Goiás", link: "/go", uf: 'go' },
		{ state: 'BRASILIA - DF', endereco: "SCIA, Lote", link: "/df", uf: 'df' },
		{ state: 'PALMAS - TO', endereco: "Área Industrial, Palmas - TO", link: "/to", uf: 'to' },
		{ state: 'LEM - BA', endereco: "Av. Luís Eduardo Magalhães, QD 02 - LT 26, LEM - BA", link: "/ba", uf: 'ba' },
		{ state: 'RECIFE - PE', endereco: "Área Portuária, Recife - PE", link: "/pe", uf: 'pe' },
	];
	return (
		<div className="flex flex-col items-center justify-center min-h-full py-12 ">

			{/* Identificação */}
			<div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-1.5 rounded-full mb-6 border border-green-100">
				<ShieldCheck size={16} />
				<span className="text-xs font-bold uppercase tracking-wider">Acesso Restrito - Comercial</span>
			</div>

			{/* Apresentação */}
			<div className="text-center max-w-2xl mb-12">
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
			<div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center mb-20">
				<button
					onClick={() => {
						setShowUnidades(!showUnidades);

						setTimeout(() => {
							const element = document.getElementById('unidades');
							if (element) {
								element.scrollIntoView({
									behavior: 'smooth',
									block: 'center', // Tente trocar por 'center' se quiser que fique no meio da tela
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
					className="flex items-center gap-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-8 py-4 rounded-2xl font-bold text-lg transition-all w-full sm:w-auto justify-center"
				>
					Suporte Técnico
				</a>
			</div>

			{/* Conteúdo com a nova animação */}
			<div id="unidades" className="w-full flex items-center justify-center">
				{showUnidades ? (
					<div className="grid grid-cols-1 md:grid-cols-3 gap-1 w-full">
						{STATES_INFO.map((info, index) => (
							<div
								key={index}
								className="flex justify-center items-center animate-slide-right opacity-0"
								style={{
									animationDelay: `${index * 0.07}s`,
									animationFillMode: 'forwards'
								}}
							>
								{/* Passando o mapState com a UF */}
								<InfoCard
									state={info.state}
									address={info.endereco}
									link={info.link}
									mapState={info.uf} // Passando a UF para o mapa pintar
								/>
							</div>
						))}
					</div>
				) : (
					<div className="flex flex-col items-center text-slate-300 transition-opacity duration-500 opacity-100">
						<Map size={80} strokeWidth={1} className="mb-4 opacity-60" />
						<p className="font-medium tracking-wide italic">Aguardando seleção de unidade...</p>
					</div>
				)}
			</div>
		</div>
	);
}