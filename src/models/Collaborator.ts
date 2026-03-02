import mongoose, { Schema, model, models } from 'mongoose';

const CollaboratorSchema = new Schema({
  name: { type: String, required: true },
  
  // LOGIN AGORA É E-MAIL OBRIGATÓRIO
  login: { 
    type: String, 
    required: [true, 'O e-mail (login) é obrigatório'], 
    unique: true,
    lowercase: true, // Transforma tudo em minúsculo automaticamente
    trim: true,      // Remove espaços no começo e no fim
    match: [/^\S+@\S+\.\S+$/, 'Por favor, insira um endereço de e-mail válido.'] // Validação Regex de e-mail
  }, 
  
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'employee'], default: 'employee' },
  state: { type: String, required: true },
  activeCards: [{ type: String }] 
}, { 
  timestamps: true,
  toJSON: { virtuals: true }, 
  toObject: { virtuals: true }
});

export default models.Collaborator || model('Collaborator', CollaboratorSchema);