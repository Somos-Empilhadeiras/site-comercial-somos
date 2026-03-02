'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../../shared/components/admin/AdminSidebar';
import RecordsManager from '../../shared/components/admin/RecordsManager';
import DashboardOverview from '../../shared/components/admin/DashboardOverview';
import UploadManager from '../../shared/components/admin/UploadManager';
import PermissionsManager from '../../shared/components/admin/PermissionsManager';
import ActivityLogManager from '../../shared/components/admin/ActivityLogManager';
import RegisterCollaboratorForm from '../../shared/components/forms/RegisterCollaboratorForm';
import RegisterUnitForm from '../../shared/components/forms/RegisterUnitForm';
import RegisterCardForm from '../../shared/components/forms/RegisterCardForm';

// Importação dos componentes de formulário e gestão


export default function AdminDashboard() {
    const router = useRouter();
    
    // Definição das abas disponíveis no sistema
    const [activeTab, setActiveTab] = useState<'dashboard' | 'records' | 'upload' | 'permissions' | 'register' | 'units' | 'cards' | 'activity'>('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Estados de Dados Globais (O Maestro do Admin)
    const [collaborators, setCollaborators] = useState<any[]>([]);
    const [allCommissions, setAllCommissions] = useState<any[]>([]);
    const [allCards, setAllCards] = useState<any[]>([]);
    const [allLogs, setAllLogs] = useState<any[]>([]); // Estado para o histórico de ações
    const [loading, setLoading] = useState(true);

    /**
     * Função centralizada para carregar todos os dados do banco
     * Busca: Colaboradores, Comissões, Cards de Módulos e Logs de Auditoria
     */
    const loadData = async () => {
        try {
            setLoading(true);
            
            // Realiza as chamadas em paralelo para maior performance
            const [resCollabs, resComms, resCards, resLogs] = await Promise.all([
                fetch('/api/collaborators', { cache: 'no-store' }),
                fetch('/api/commissions', { cache: 'no-store' }),
                fetch('/api/cards', { cache: 'no-store' }),
                fetch('/api/logs', { cache: 'no-store' }) // Rota de logs de auditoria
            ]);

            // Processamento de Colaboradores
            if (resCollabs.ok) {
                const data = await resCollabs.json();
                setCollaborators(Array.isArray(data) ? data : []);
            }

            // Processamento de Comissões (Ordenadas por data decrescente)
            if (resComms.ok) {
                const data = await resComms.json();
                setAllCommissions(data.sort((a: any, b: any) => 
                    new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime()
                ));
            }

            // Processamento de Cards/Módulos
            if (resCards.ok) {
                setAllCards(await resCards.json());
            }

            // Processamento de Logs de Auditoria
            if (resLogs.ok) {
                setAllLogs(await resLogs.json());
            }

        } catch (error) {
            console.error('Erro crítico no carregamento do painel:', error);
        } finally {
            setLoading(false);
        }
    };

    // Carrega os dados assim que o componente é montado
    useEffect(() => { 
        loadData(); 
    }, []);

    // Tela de carregamento estilizada
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 text-green-700 font-bold animate-pulse">
                Sincronizando Painel...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* 1. BARRA LATERAL DE NAVEGAÇÃO */}
            <AdminSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
            />

            {/* 2. ÁREA DE CONTEÚDO PRINCIPAL */}
            <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-72' : 'ml-24'} p-10 overflow-y-auto w-full`}>
                <div className="max-w-[1400px] mx-auto w-full">
                    
                    {/* Cabeçalho da Aba Ativa */}
                    <header className="mb-10">
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight capitalize">
                            {activeTab === 'records' ? 'Extrato Geral e Edição' : 
                             activeTab === 'activity' ? 'Histórico de Ações' : 
                             activeTab.replace('-', ' ')}
                        </h2>
                        <p className="text-slate-500 font-medium mt-1">Gerencie indicadores, acessos e lançamentos do sistema.</p>
                    </header>

                    {/* 3. RENDERIZAÇÃO DOS COMPONENTES (Conteúdo Dinâmico) */}
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        
                        {/* Dashboard: Gráficos e KPIs */}
                        {activeTab === 'dashboard' && (
                            <DashboardOverview 
                                commissions={allCommissions} 
                                collaborators={collaborators} 
                                cards={allCards} 
                            />
                        )}

                        {/* Extrato: Tabela de lançamentos e edição */}
                        {activeTab === 'records' && (
                            <RecordsManager 
                                commissions={allCommissions} 
                                collaborators={collaborators} 
                                onUpdate={loadData} 
                            />
                        )}

                        {/* Upload: Importação de Excel/Planilhas */}
                        {activeTab === 'upload' && (
                            <UploadManager 
                                collaborators={collaborators} 
                                onUploadSuccess={loadData} 
                            />
                        )}

                        {/* Permissões: Controle de acesso aos cards por consultor */}
                        {activeTab === 'permissions' && (
                            <PermissionsManager 
                                collaborators={collaborators} 
                                cards={allCards} 
                                onUpdate={loadData} 
                            />
                        )}

                        {/* Histórico: Novo componente de Auditoria */}
                        {activeTab === 'activity' && (
                            <ActivityLogManager 
                                logs={allLogs} 
                                collaborators={collaborators} 
                            />
                        )}

                        {/* Formulários de Cadastro (Consultores, Unidades e Cards) */}
                        {activeTab === 'register' && <RegisterCollaboratorForm onUserCreated={loadData} />}
                        {activeTab === 'units' && <RegisterUnitForm onUnitCreated={loadData} />}
                        {activeTab === 'cards' && <RegisterCardForm onCardCreated={loadData} allCards={allCards} />}
                        
                    </div>
                </div>
            </main>
        </div>
    );
}