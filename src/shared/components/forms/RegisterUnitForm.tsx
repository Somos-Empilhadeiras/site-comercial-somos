'use client';

import React, { useState } from 'react';
import { MapPin, CheckCircle, AlertCircle } from 'lucide-react';

export default function RegisterUnitForm({ onUnitCreated }: { onUnitCreated?: () => void }) {
  const [unitForm, setUnitForm] = useState({ id: '', name: '', address: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(unitForm),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Falha ao cadastrar unidade.');
      }

      setMessage({ type: 'success', text: 'Nova unidade cadastrada com sucesso!' });
      setUnitForm({ id: '', name: '', address: '' }); // Limpa o formulário
      
      // Se a página pai enviou a função, nós a chamamos para recarregar dados
      if (onUnitCreated) onUnitCreated(); 
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-lg border border-gray-100 animate-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <MapPin className="text-green-600" /> Cadastrar Nova Unidade / Filial
      </h2>

      {message.text && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase">Sigla do Estado (ID)</label>
            <input 
              type="text" 
              required 
              maxLength={2} 
              value={unitForm.id} 
              onChange={(e) => setUnitForm({...unitForm, id: e.target.value})} 
              className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 uppercase font-bold text-slate-700" 
              placeholder="Ex: SP" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase">Nome da Unidade</label>
            <input 
              type="text" 
              required 
              value={unitForm.name} 
              onChange={(e) => setUnitForm({...unitForm, name: e.target.value})} 
              className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-bold text-slate-700" 
              placeholder="Ex: SÃO PAULO - SP" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 uppercase">Endereço Completo</label>
          <textarea 
            required 
            value={unitForm.address} 
            onChange={(e) => setUnitForm({...unitForm, address: e.target.value})} 
            className="w-full h-24 p-4 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm font-medium text-slate-700" 
            placeholder="Ex: Av. Paulista, 1000, Bela Vista..." 
          />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? 'Salvando no banco...' : 'Registrar Unidade'}
        </button>
      </form>
    </div>
  );
}