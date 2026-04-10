import React, { useState, useEffect } from 'react';

export default function PermissionsManager({ collaborators: initialCollabs, cards, onUpdate }: any) {
    const [permSelectedCollab, setPermSelectedCollab] = useState('');
    // Criamos um estado local para os colaboradores para resposta instantânea
    const [localCollabs, setLocalCollabs] = useState(initialCollabs);

    // Sincroniza o estado local se as props mudarem (ex: após o onUpdate terminar)
    useEffect(() => {
        setLocalCollabs(initialCollabs);
    }, [initialCollabs]);

    const handleToggleCard = async (collabId: string, cardId: string) => {
        // --- PARTE OTIMISTA ---
        // Atualizamos a UI localmente antes mesmo do fetch terminar
        const updatedCollabs = localCollabs.map((c: any) => {
            if (String(c._id) === String(collabId)) {
                const hasCard = c.activeCards?.includes(cardId);
                const newActiveCards = hasCard 
                    ? c.activeCards.filter((id: string) => id !== cardId)
                    : [...(c.activeCards || []), cardId];
                return { ...c, activeCards: newActiveCards };
            }
            return c;
        });
        
        setLocalCollabs(updatedCollabs);

        try {
            const res = await fetch('/api/collaborators/cards/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ collaboratorId: String(collabId), cardId })
            });

            if (!res.ok) {
                // Se der erro, voltamos ao estado original (Rollback)
                setLocalCollabs(initialCollabs);
                alert("Erro ao salvar permissão.");
            } else {
                // Notifica o pai sem forçar um reload brusco
                onUpdate(); 
            }
        } catch (error) {
            setLocalCollabs(initialCollabs);
            console.error("Erro ao alterar acesso", error);
        }
    };

    // Buscamos o usuário no estado LOCAL
    const selectedUser = localCollabs.find((c: any) => String(c._id) === String(permSelectedCollab));

    return (
        <div className="w-full max-w-4xl mx-auto bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
            <select 
                value={permSelectedCollab} 
                onChange={(e) => setPermSelectedCollab(e.target.value)} 
                className="w-full p-4 bg-slate-50 border rounded-xl font-bold text-slate-700 mb-8 outline-none"
            >
                <option value="">Selecione um consultor...</option>
                {localCollabs.map((c: any) => (
                    <option key={String(c._id)} value={String(c._id)}>{c.name}</option>
                ))}
            </select>

            {selectedUser ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                    {cards.map((card: any) => {
                        const isEnabled = selectedUser.activeCards?.includes(card.id);
                        return (
                            <div key={String(card._id)} className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${isEnabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                                <div>
                                    <p className={`font-bold text-sm ${isEnabled ? 'text-green-900' : 'text-gray-500'}`}>{card.title}</p>
                                    <p className="text-[10px] text-gray-400 uppercase">{card.description}</p>
                                </div>
                                <button 
                                    onClick={() => handleToggleCard(selectedUser._id, card.id)} 
                                    className={`h-6 w-11 rounded-full relative transition-colors ${isEnabled ? 'bg-green-600' : 'bg-gray-300'}`}
                                >
                                    <span className={`absolute top-1 left-1 h-4 w-4 bg-white rounded-full transition-transform ${isEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            ) : permSelectedCollab && (
                <p className="text-center py-10 text-gray-400">Consultor não encontrado.</p>
            )}
        </div>
    );
}