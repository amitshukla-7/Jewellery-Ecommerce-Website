import mongoose from 'mongoose';

const metalRatesSchema = mongoose.Schema(
  {
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

const MetalRates = mongoose.model('MetalRates', metalRatesSchema);

export default MetalRates;
