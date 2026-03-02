import mongoose, { Schema, model, models } from 'mongoose';

const UnitSchema = new Schema({
  id: { type: String, required: true, unique: true }, // ex: 'go'
  name: { type: String, required: true },
  address: { type: String, required: true }
});

const Unit: any = mongoose.models.Unit || mongoose.model('Unit', UnitSchema);
export default Unit;