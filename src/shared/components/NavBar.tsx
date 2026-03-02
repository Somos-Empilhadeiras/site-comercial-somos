'use client';

import React, { useEffect, useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from 'next/navigation'; // Adicione usePathname aqui
import { LogOut, User as UserIcon, Shield } from 'lucide-react';

export default function NavBar() {
    const router = useRouter();
    const pathname = usePathname(); // Captura a rota atual
    const [user, setUser] = useState<any>(null);

    // Agora o NavBar verifica a sessão toda vez que o usuário muda de página
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
    }, [pathname]); // <--- A MÁGICA ESTÁ AQUI: o useEffect roda sempre que o pathname mudar

    const handleLogout = async () => {
        try {
            // Chama a API de logout no servidor
            const res = await fetch('/api/auth/logout', { method: 'POST' });

            if (res.ok) {
                setUser(null);
                router.refresh(); // Limpa o cache das rotas
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

                    <Link href="/">
                        <Image src="/logo.png" alt="Logo" width={120} height={50} className="w-30 md:w-[150px] object-contain" />
                    </Link>

                    <div className="hidden md:flex items-center gap-6">
                        <Link href="/" className="text-sm font-bold text-gray-700 hover:text-green-700 transition-colors">Início</Link>
                        <Link href="/unidades" className="text-sm font-bold text-gray-700 hover:text-green-700 transition-colors">Unidades</Link>
                        <Link href="https://somosempilhadeiras.com" className="text-sm font-bold text-gray-700 hover:text-green-700 transition-colors">Site</Link>
                    </div>

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