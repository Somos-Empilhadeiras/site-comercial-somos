import mongoose, { Schema, model, models } from 'mongoose';

const CommissionSchema = new Schema({
  collaboratorId: { type: Schema.Types.ObjectId, ref: 'Collaborator', required: true },
  date: { type: String, required: true },
  monthYear: { type: String, required: true }, // ex: 2026-03
  value: { type: Number, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['venda', 'locacao'], required: true }
}, { timestamps: true });

export default models.Commission || model('Commission', CommissionSchema);