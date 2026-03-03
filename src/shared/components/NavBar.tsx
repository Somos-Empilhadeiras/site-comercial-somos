'use client';

import React, { useEffect, useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, User as UserIcon, Shield } from 'lucide-react';

export default function NavBar() {
    const router = useRouter();
    const pathname = usePathname(); 
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        async function checkSession() {
            try {
                const res = await fetch('/api/auth/me', { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } catch (err) {
                setUser(null);
            }
        }
        checkSession();
    }, [pathname]);

    const handleLogout = async () => {
        try {
            const res = await fetch('/api/auth/logout', { method: 'POST' });

            if (res.ok) {
                setUser(null);
                router.refresh(); 
                router.push('/login');
            }
        } catch (err) {
            console.error("Erro ao sair:", err);
        }
    };

    return (
        <div className='sticky top-0 z-[100] w-full'>
            <nav className="bg-white border-b-4 border-[#005831] shadow-lg flex justify-center items-center h-20">
                <div className="container w-full max-w-[80%] flex justify-between items-center">

                    {/* LOGO */}
                    <Link href="/">
                        <Image src="/logo.png" alt="Logo" width={120} height={50} className="w-30 md:w-[150px] object-contain" />
                    </Link>

                    {/* LINKS DE NAVEGAÇÃO INTELIGENTES */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link href="/" className="text-sm font-bold text-gray-700 hover:text-green-700 transition-colors">
                            Início
                        </Link>

                        {/* Aparece só se for ADMIN */}
                        {user?.role === 'admin' && (
                            <Link href="/admin" className="text-sm font-bold text-gray-700 hover:text-green-700 transition-colors">
                                Painel Admin
                            </Link>
                        )}

                        {/* Aparece só se for CONSULTOR logado */}
                        {user && user?.role !== 'admin' && (
                            <Link 
                                // Monta a URL dinamicamente com o estado e nome do consultor
                                href={`/${user.state || 'go'}/${encodeURIComponent(user.name || user.login)}/comissao-vendas`} 
                                className="text-sm font-bold text-gray-700 hover:text-green-700 transition-colors"
                            >
                                Minhas Comissões
                            </Link>
                        )}

                        {/* SITE OFICIAL (Abrindo em nova aba para não tirar o usuário do sistema) */}
                        <Link 
                            href="https://somosempilhadeiras.com" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-sm font-bold text-gray-700 hover:text-green-700 transition-colors"
                        >
                            Site Institucional
                        </Link>
                    </div>

                    {/* ÁREA DO USUÁRIO */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-full border border-gray-100 shadow-sm animate-in fade-in duration-300">
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] font-black text-green-700 uppercase leading-none mb-0.5">
                                        {user.role === 'admin' ? 'Administrador' : 'Consultor(a)'}
                                    </span>
                                    <span className="text-sm font-bold text-slate-800 leading-none">{user.name}</span>
                                </div>
                                <div className="h-9 w-9 bg-green-700 rounded-full flex items-center justify-center text-white shadow-inner">
                                    {user.role === 'admin' ? <Shield size={18} /> : <UserIcon size={18} />}
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="ml-1 p-1.5 text-gray-400 hover:text-red-600 transition-colors cursor-pointer rounded-full hover:bg-red-50"
                                    title="Sair da conta"
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="bg-green-700 text-white px-8 py-2.5 rounded-full text-sm font-bold hover:bg-green-800 transition-all shadow-md active:scale-95"
                            >
                                Entrar
                            </Link>
                        )}
                    </div>
                </div>
            </nav>
        </div>
    );
}