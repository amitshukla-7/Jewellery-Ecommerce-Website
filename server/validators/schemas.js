import { z } from 'zod';

export const userRegisterSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const userLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  image: z.string().min(1, 'Image is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.number().min(0, 'Price must be non-negative'),
  metalType: z.enum(['gold', 'silver']).nullable().optional(),
  weight: z.number().nullable().optional(),
  makingCharge: z.number().nullable().optional(),
});

export const productUpdateSchema = productSchema.partial();

export const orderSchema = z.object({
  orderItems: z.array(
    z.object({
      name: z.string(),
      qty: z.number().min(1),
      image: z.string(),
      price: z.number().min(0),
      product: z.string(), // ObjectId as string
    })
  ).min(1, 'No order items'),
  shippingAddress: z.object({
    address: z.string(),
    city: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  itemsPrice: z.number().optional(),
  shippingPrice: z.number().optional(),
  totalPrice: z.number().optional(),
});

export const ratesSchema = z.object({
  goldRate: z.number().min(0, 'Gold rate must be non-negative'),
  silverRate: z.number().min(0, 'Silver rate must be non-negative'),
});
