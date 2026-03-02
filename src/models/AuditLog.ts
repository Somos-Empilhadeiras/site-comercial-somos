import mongoose, { Schema, model, models } from 'mongoose';

const AuditLogSchema = new Schema({
  entity: { type: String, enum: ['commission', 'collaborator', 'unit', 'card'], required: true },
  description: { type: String, required: true },
  user: { type: String, default: 'Admin Master' },
  targetName: { type: String },
  action: { 
    type: String, 
    enum: ['create', 'update', 'delete', 'access_change', 'login', 'send_email'],
    required: true 
},
}, { timestamps: true });

const AuditLog: any = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
export default AuditLog;