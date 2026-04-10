import mongoose from 'mongoose';

const CommissionSchema = new mongoose.Schema({
  collaboratorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cliente: { type: String, required: true },
  modelo: { type: String, required: true },
  quantidade: { type: Number, required: true },
  valorVenda: { type: Number, required: true },
  valorComissao: { type: Number, required: true },
  
  // NOVOS CAMPOS OFICIAIS
  type: { type: String, enum: ['venda', 'locacao'], default: 'venda' },
  estado: { type: String, default: 'GO' },

  // Usamos o monthYear automático para agrupar nos gráficos (Ex: '2026-03')
  monthYear: {
    type: String,
    default: () => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }
  },
  date: { type: String },
}, { 
  timestamps: true,
  strict: false // Mantendo a trava de segurança desativada
});

const Commission: any = mongoose.models.Commission || mongoose.model('Commission', CommissionSchema);
export default Commission;