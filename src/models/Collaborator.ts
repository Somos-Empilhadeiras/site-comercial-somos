import mongoose, { Schema, model, models } from 'mongoose';

const CollaboratorSchema = new Schema({
  name: { type: String, required: true },
  login: { type: String, required: true, unique: true }, // Login com espaços e maiúsculas
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'employee'], default: 'employee' },
  state: { type: String, required: true },
  activeCards: [{ type: String }] 
}, { 
  timestamps: true,
  toJSON: { virtuals: true }, // Cria o campo .id virtualmente
  toObject: { virtuals: true }
});

export default models.Collaborator || model('Collaborator', CollaboratorSchema);