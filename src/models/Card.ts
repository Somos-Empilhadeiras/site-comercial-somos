import mongoose, { Schema, model, models } from 'mongoose';

const CardSchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  url: { type: String, required: true },
  isGlobal: { type: Boolean, default: true }
});

export default models.Card || model('Card', CardSchema);