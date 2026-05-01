import mongoose from 'mongoose';

const investmentSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['Income', 'Expense'],
      default: 'Expense',
    },
  },
  {
    timestamps: true,
  }
);

const Investment = mongoose.model('Investment', investmentSchema);

export default Investment;
