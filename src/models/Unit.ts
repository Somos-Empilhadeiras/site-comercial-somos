import mongoose, { Schema, model, models } from 'mongoose';

const UnitSchema = new Schema({
  id: { type: String, required: true, unique: true }, // ex: 'go'
  name: { type: String, required: true },
  address: { type: String, required: true }
});

export default models.Unit || model('Unit', UnitSchema);