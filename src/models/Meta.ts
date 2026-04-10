// models/Meta.ts
import mongoose from 'mongoose';

const MetaSchema = new mongoose.Schema({
  collaboratorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  monthYear:      { type: String, required: true }, // Ex: "2026-03"
  metaVendas:     { type: Number, default: 0 },
  metaLocacao:    { type: Number, default: 0 },
  metaPropostas:  { type: Number, default: 0 },
}, { timestamps: true });

// Garante que só existe uma meta por consultor/mês
MetaSchema.index({ collaboratorId: 1, monthYear: 1 }, { unique: true });

const Meta = mongoose.models.Meta || mongoose.model('Meta', MetaSchema);
export default Meta;