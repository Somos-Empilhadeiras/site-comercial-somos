'use client';

import React from 'react';
import { 
    ShieldCheck, FileSpreadsheet, LayoutTemplate, LogOut, LayoutDashboard, 
    Users, UserPlus, MapPin, ChevronRight, Menu, ChevronLeft, List, History 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminSidebar({ activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen }: any) {
    const router = useRouter();

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    };

    const NavItem = ({ id, icon: Icon, label }: any) => {
        const isActive = activeTab === id;
        return (
            <div className="relative group px-4">
                <button onClick={() => setActiveTab(id)} className={`w-full flex items-center ${isSidebarOpen ? 'justify-start px-4' : 'justify-center px-0'} py-4 font-bold transition-all duration-300 ${isActive ? 'bg-slate-900 text-white shadow-lg rounded-2xl' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-xl hover:scale-[1.02]'}`}>
                    <Icon size={20} className={`shrink-0 transition-transform duration-300 ${isActive ? 'text-green-400' : 'text-slate-400'}`} />
                    <span className={`ml-3 truncate transition-all duration-300 ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>{label}</span>
                    {isSidebarOpen && isActive && <ChevronRight size={16} className="ml-auto opacity-50" />}
                </button>
            </div>
        );
    };

    return (
        <aside className={`bg-white border-r border-gray-100 shadow-sm flex flex-col fixed h-full z-50 transition-all duration-300 ${isSidebarOpen ? 'w-72' : 'w-24'}`}>
            <div className={`p-6 border-b border-gray-100 flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center flex-col gap-4'}`}>
                <div className="flex items-center gap-4 overflow-hidden">
                    <div className="h-12 w-12 bg-slate-900 rounded-full flex items-center justify-center shrink-0 shadow-inner">
                        <ShieldCheck className="h-6 w-6 text-green-400" />
                    </div>
                    <div className={`transition-all duration-300 ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>
                        <h1 className="text-xl font-black text-slate-900 uppercase leading-tight">Gestão</h1>
                        <p className="text-green-700 text-[10px] uppercase font-bold tracking-widest">Master</p>
                    </div>
                </div>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                    {isSidebarOpen ? <ChevronLeft size={20} /> : <Menu size={24} />}
                </button>
            </div>
            <nav className="flex-1 space-y-2 overflow-y-auto mt-6">
                <NavItem id="dashboard" icon={LayoutDashboard} label="Visão Global" />
                <NavItem id="activity" icon={History} label="Histórico de Ações" />
                <NavItem id="records" icon={List} label="Extrato Geral" />
                <NavItem id="upload" icon={FileSpreadsheet} label="Importar Dados" />
                <NavItem id="permissions" icon={Users} label="Gestão de Acessos" />
                <NavItem id="register" icon={UserPlus} label="Novo Consultor" />
                <NavItem id="units" icon={MapPin} label="Nova Unidade" />
                <NavItem id="cards" icon={LayoutTemplate} label="Novo Módulo" />
            </nav>
            <div className="p-4 border-t border-gray-100 mb-4">
                <button onClick={handleLogout} className={`flex items-center ${isSidebarOpen ? 'justify-center gap-3' : 'justify-center'} text-gray-400 hover:text-red-600 font-bold transition-all py-4 rounded-xl hover:bg-red-50 w-full`}>
                    <LogOut size={18} />
                    <span className={`transition-all duration-300 ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>Sair</span>
                </button>
            </div>
        </aside>
    );
}