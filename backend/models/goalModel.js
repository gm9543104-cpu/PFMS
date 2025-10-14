import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['savings', 'budget'], required: true },
    target: { type: Number, required: true },
    current: { type: Number, default: 0 },
    deadline: { type: String },
    status: { type: String, enum: ['in_progress', 'completed', 'cancelled'], default: 'in_progress' }
  },
  { timestamps: true }
);

export const Goal = mongoose.model('Goal', goalSchema);
