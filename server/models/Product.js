import mongoose from 'mongoose';

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      index: true,
    },
    metalType: {
      type: String,
      enum: ['gold', 'silver', null],
      default: null,
    },
    weight: {
      type: Number,
      default: null,
    },
    makingCharge: {
      type: Number,
      default: null,
    },
    sku: {
      type: String,
      unique: true,
      index: true,
    },
    reviews: [
      {
        name: { type: String, required: true },
        rating: { type: Number, required: true },
        comment: { type: String, required: true },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'User',
        },
      },
    ],
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save to auto-generate SKU if not present
productSchema.pre('save', async function() {
  if (!this.sku) {
    this.sku = `SKU-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
});

const Product = mongoose.model('Product', productSchema);

export default Product;
