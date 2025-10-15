import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    name: { type: String },
    totalPoints: { type: Number, default: 0 },
    tier: { type: String, enum: ['Bronze', 'Silver', 'Gold'], default: 'Bronze' },
    google: {
      access_token: String,
      refresh_token: String,
      scope: String,
      token_type: String,
      expiry_date: Number
    }
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
