import mongoose from 'mongoose';

const ProposalSchema = new mongoose.Schema({
  collaboratorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cliente: { type: String, required: true },
  dataEmissao: { type: Date, default: Date.now },
  equipamento: { type: String },
  valorProposta: { type: Number },
  status: { type: String, enum: ['enviada', 'negociacao', 'fechada', 'perdida'], default: 'enviada' },
}, { timestamps: true });

const Proposal: any = mongoose.models.Proposal || mongoose.model('Proposal', ProposalSchema);
export default Proposal;