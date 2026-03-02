import React, { useState } from 'react';

export default function PermissionsManager({ collaborators, cards, onUpdate }: any) {
    const [permSelectedCollab, setPermSelectedCollab] = useState('');

    const handleToggleCard = async (collabId: string, cardId: string) => {
        try {
            const res = await fetch('/api/collaborators/cards/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ collaboratorId: String(collabId), cardId })
            });
            if (res.ok) onUpdate(); // Recarrega os dados globais
        } catch (error) { console.error("Erro ao alterar acesso", error); }
    };

    return (
        <div className="w-full max-w-4xl mx-auto bg-white p-8 rounded-3xl shadow-lg border border-gray-100 animate-in fade-in">
            <select value={permSelectedCollab} onChange={(e) => setPermSelectedCollab(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-xl font-bold text-slate-700 mb-8 outline-none">
                <option value="">Selecione um consultor...</option>
                {collaborators.map((c: any) => <option key={String(c._id)} value={String(c._id)}>{c.name}</option>)}
            </select>

            {permSelectedCollab && (() => {
                const user = collaborators.find((c: any) => String(c._id) === String(permSelectedCollab));
                if (!user) return <p className="text-center py-10 text-gray-400">Consultor não encontrado na lista.</p>;

                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                        {cards.length === 0 && <p className="col-span-2 text-center text-gray-400 italic">Nenhum card cadastrado.</p>}
                        {cards.map((card: any) => {
                            const isEnabled = user?.activeCards?.includes(card.id);
                            return (
                                <div key={String(card._id)} className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${isEnabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                                    <div>
                                        <p className={`font-bold text-sm ${isEnabled ? 'text-green-900' : 'text-gray-500'}`}>{card.title}</p>
                                        <p className="text-[10px] text-gray-400 uppercase">{card.description}</p>
                                    </div>
                                    <button onClick={() => handleToggleCard(user._id, card.id)} className={`h-6 w-11 rounded-full relative transition-colors ${isEnabled ? 'bg-green-600' : 'bg-gray-300'}`}>
                                        <span className={`absolute top-1 left-1 h-4 w-4 bg-white rounded-full transition-transform ${isEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                );
            })()}
        </div>
    );
}