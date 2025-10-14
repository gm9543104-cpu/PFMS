import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    vendor: { type: String, required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    date: { type: String, required: true },
    type: { type: String, enum: ['income', 'expense'], default: 'expense' },
    paymentMethod: { type: String },
    source: { type: String, enum: ['CSV', 'Gmail', 'Manual'], default: 'Manual' },
    isRecurring: { type: Boolean, default: false },
    isUnused: { type: Boolean, default: false },
    rawText: { type: String },
    softDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Transaction = mongoose.model('Transaction', transactionSchema);
