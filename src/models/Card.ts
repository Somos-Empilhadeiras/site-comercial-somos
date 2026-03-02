import mongoose from 'mongoose';

const CardSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  url: { type: String, required: true },
  isLocked: { 
    type: Boolean, 
    default: true 
  },
  units: [{ 
    type: String,
  }]
}, { 
  timestamps: true 
});

const Card: any = mongoose.models.Card || mongoose.model('Card', CardSchema);
export default Card;