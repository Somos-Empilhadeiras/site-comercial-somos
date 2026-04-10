'use client';

import React, { useEffect, useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, User as UserIcon, Shield, Menu, X, Bell } from 'lucide-react';

export default function NavBar() {
    const router = useRouter();
    const pathname = usePathname(); 
    const [user, setUser] = useState<any>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        async function checkSession() {
            try {
                const res = await fetch('/api/auth/me', { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                }
            } catch (err) { setUser(null); }
        }
        checkSession();
        setIsMenuOpen(false);
    }, [pathname]);

    const handleLogout = async () => {
        const res = await fetch('/api/auth/logout', { method: 'POST' });
        if (res.ok) {
            setUser(null);
            router.push('/login');
            router.refresh();
        }
    };

    const isActive = (path: string) => pathname === path;

    return (
        <div className='sticky top-0 z-[100] w-full'>
            <nav className="bg-white border-b-4 border-[#005831] shadow-md h-20 flex items-center">
                <div className="container mx-auto px-6 w-full flex justify-between items-center">

                    {/* LOGO */}
                    <Link href="/" className="shrink-0">
                        <Image src="/logo.png" alt="Logo Somos" width={140} height={45} className="object-contain" />
                    </Link>

                    {/* DESKTOP NAVIGATION */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/" className={`text-sm font-bold transition-all ${isActive('/') ? 'text-green-700' : 'text-slate-600 hover:text-green-700'}`}>
                            Início
                        </Link>

                        {user?.role === 'admin' && (
                            <Link href="/admin" className={`text-sm font-bold transition-all ${isActive('/admin') ? 'text-green-700' : 'text-slate-600 hover:text-green-700'}`}>
                                Painel Admin
                            </Link>
                        )}

                        {user && user?.role !== 'admin' && (
                            <Link 
                                href={`/${user.state || 'go'}/${encodeURIComponent(user.name || user.login)}/comissao-vendas`} 
                                className={`text-sm font-bold transition-all ${pathname.includes('comissao-vendas') ? 'text-green-700' : 'text-slate-600 hover:text-green-700'}`}
                            >
                                Minhas Comissões
                            </Link>
                        )}
                    </div>

                    {/* USER AREA & MOBILE TOGGLE */}
                    <div className="flex items-center gap-3">
                        {user ? (
                            <>
                                <div className="hidden sm:flex items-center gap-3 bg-slate-50 border border-slate-100 px-4 py-1.5 rounded-full">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-green-700 uppercase leading-none">{user.role === 'admin' ? 'Gestor' : 'Consultor'}</p>
                                        <p className="text-sm font-bold text-slate-800 leading-tight">{user.name?.split(' ')[0]}</p>
                                    </div>
                                    <div className="h-8 w-8 bg-green-700 rounded-full flex items-center justify-center text-white">
                                        {user.role === 'admin' ? <Shield size={16} /> : <UserIcon size={16} />}
                                    </div>
                                    <button onClick={handleLogout} className="text-slate-400 hover:text-red-600 transition-colors p-1" title="Sair">
                                        <LogOut size={18} />
                                    </button>
                                </div>
                                
                                {/* Botão Menu Mobile */}
                                <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                                </button>
                            </>
                        ) : (
                            <Link href="/login" className="bg-green-700 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-green-800 transition-all shadow-sm">
                                Entrar
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* MOBILE MENU DROPDOWN */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-b border-slate-200 shadow-xl animate-in slide-in-from-top duration-300">
                    <div className="flex flex-col p-4 gap-4">
                        <Link href="/" className="font-bold text-slate-700 p-2">Início</Link>
                        {user?.role === 'admin' && <Link href="/admin" className="font-bold text-slate-700 p-2">Painel Admin</Link>}
                        {user && user?.role !== 'admin' && (
                            <Link href={`/${user.state}/${encodeURIComponent(user.name)}/comissao-vendas`} className="font-bold text-slate-700 p-2">Minhas Comissões</Link>
                        )}
                        <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 font-bold p-2 border-t mt-2">
                            <LogOut size={18} /> Sair da Conta
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}