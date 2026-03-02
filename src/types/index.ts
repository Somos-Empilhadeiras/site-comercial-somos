// src/types/index.ts

export interface CollaboratorData {
  id: string;          // Mapeado do _id do MongoDB
  name: string;
  login: string;
  password?: string;   // Opcional, pois nem sempre enviamos a senha para o front
  role: 'admin' | 'employee';
  state: string;
  activeCards: string[]; // Importante: agora precisamos dessa lista para as permissões
  createdAt?: string;
  updatedAt?: string;
}

export interface Commission {
  id: string;
  collaboratorId: string;
  type: 'venda' | 'locacao'; // Removido o acento para evitar erros de comparação
  value: number;
  date: string;
  description: string;
  monthYear: string; 
  details?: any; // Adicionado como opcional (?) para resolver o erro no service
}
export interface ColumnMapping {
  date: number;        // Índice da coluna (0, 1, 2...)
  value: number;
  description: number;
  type: number;
}

export interface Card {
  id: string;
  title: string;
  description: string;
  icon: string;      // Nome do ícone (ex: do Lucide React)
  url: string;       // Pode ser um link externo ou rota interna
  isGlobal: boolean; // Se o card é um padrão do sistema
}

export interface Unit {
  id: string;
  name: string;
  address: string;
}