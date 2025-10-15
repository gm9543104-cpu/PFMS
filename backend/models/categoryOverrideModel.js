import mongoose from 'mongoose';

const categoryOverrideSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    vendor: { type: String, required: true },
    category: { type: String, required: true }
  },
  { timestamps: true }
);

categoryOverrideSchema.index({ userId: 1, vendor: 1 }, { unique: true });

export const CategoryOverride = mongoose.model('CategoryOverride', categoryOverrideSchema);
