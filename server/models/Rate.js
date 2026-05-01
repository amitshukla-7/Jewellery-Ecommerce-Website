import mongoose from 'mongoose';

const rateSchema = mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
      index: true,
    },
    goldRate: {
      type: Number,
      required: true,
    },
    silverRate: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Rate = mongoose.model('Rate', rateSchema);

export default Rate;
