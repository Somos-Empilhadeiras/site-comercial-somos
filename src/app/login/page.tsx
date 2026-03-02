'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password }),
      });

      if (!res.ok) {
        throw new Error('Credenciais inválidas. Tente novamente.');
      }

      const user = await res.json();

      // Redirecionamento Inteligente baseado no Cargo (Role)
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push(`/${user.state}/${user.login}`);
      }
      
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4">
      
      {/* Container do Formulario */}
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Cabeçalho do Login */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="h-8 w-8 text-green-700" />
          </div>
          <h1 className="text-2xl font-black text-green-900 uppercase tracking-wide">Acesso Restrito</h1>
          <p className="text-gray-500 text-sm mt-2 text-center">
            Insira suas credenciais para acessar seus relatórios e comissões.
          </p>
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <div className="mb-6 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 text-sm font-medium">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Usuário</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-zinc-50 focus:bg-white"
                placeholder="Ex: khryss-mylla"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Senha</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-zinc-50 focus:bg-white"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-green-900/20 disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            {loading ? 'Autenticando...' : 'Entrar no Portal'}
            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

      </div>
    </main>
  );
}