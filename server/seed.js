import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import MetalRates from './models/MetalRates.js';
import Investment from './models/Investment.js';
import Rate from './models/Rate.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    await connectDB();

    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await MetalRates.deleteMany();
    await Investment.deleteMany();
    await Rate.deleteMany();

    // Create Admin and Customers
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@aurajewels.com',
        password: 'Admin@123',
        role: 'admin',
      },
      { name: 'Priya Sharma', email: 'priya.sharma@gmail.com', password: 'password123' },
      { name: 'Rahul Verma', email: 'rahul.verma@gmail.com', password: 'password123' },
      { name: 'Sunita Patel', email: 'sunita.patel@gmail.com', password: 'password123' },
      { name: 'Amit Gupta', email: 'amit.gupta@gmail.com', password: 'password123' },
      { name: 'Neha Reddy', email: 'neha.reddy@gmail.com', password: 'password123' },
    ]);

    const adminUser = users[0]._id;
    const customers = users.slice(1);

    // Initial Metal Rates
    await MetalRates.create({ goldRate: 7250, silverRate: 92 });

    // 20 Products
    const productsData = [
      {
        name: 'Kundan Polki Wedding Set',
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800',
        description: 'Heritage Kundan Polki necklace set with handcrafted detailing and matching earrings.',
        category: 'wedding',
        price: 245000,
        metalType: 'gold',
        weight: 45.5,
        makingCharge: 18000,
        sku: 'WED-001',
        countInStock: 5,
        rating: 5,
        numReviews: 12,
      },
      {
        name: '22KT Gold Hoop Classic',
        image: 'https://images.unsplash.com/photo-1630019058353-5240579b7631?auto=format&fit=crop&q=80&w=800',
        description: 'Timeless 22KT high-polish gold hoops. A staple for every jewelry collection.',
        category: 'earrings',
        price: 32000,
        metalType: 'gold',
        weight: 8.2,
        makingCharge: 3500,
        sku: 'EAR-001',
        countInStock: 15,
        rating: 4.8,
        numReviews: 8,
      },
      {
        name: 'Solitaire Diamond Ring',
        image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800',
        description: 'Certified 1-carat brilliant cut diamond set in 18KT hallmarked white gold.',
        category: 'diamond',
        price: 185000,
        metalType: 'gold',
        weight: 4.0,
        makingCharge: 6500,
        sku: 'DIA-001',
        countInStock: 8,
        rating: 5,
        numReviews: 6,
      },
      {
        name: 'Royal Heritage Bangle',
        image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=800',
        description: 'Ornate gold bangle with traditional filigree work, inspired by Indian royalty.',
        category: 'gold-silver',
        price: 85000,
        metalType: 'gold',
        weight: 22.4,
        makingCharge: 5500,
        sku: 'BNG-001',
        countInStock: 12,
        rating: 4.5,
        numReviews: 15,
      },
      {
        name: '925 Sterling Silver Bracelet',
        image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800',
        description: 'Pure 925 sterling silver chain bracelet with a contemporary geometric clasp.',
        category: 'gold-silver',
        price: 6500,
        metalType: 'silver',
        weight: 18.0,
        makingCharge: 1200,
        sku: 'SIL-001',
        countInStock: 25,
        rating: 4.3,
        numReviews: 20,
      },
      {
        name: 'Emerald Tear-Drop Earrings',
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800',
        description: 'Deep green natural emeralds set in 18KT gold with a vintage drop design.',
        category: 'earrings',
        price: 55000,
        metalType: 'gold',
        weight: 10.5,
        makingCharge: 4500,
        sku: 'EAR-002',
        countInStock: 6,
        rating: 4.9,
        numReviews: 9,
      },
      {
        name: 'Pave Diamond Wedding Band',
        image: 'https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&q=80&w=800',
        description: 'Glistening row of micro-pave diamonds in a sleek 18KT yellow gold band.',
        category: 'diamond',
        price: 95000,
        metalType: 'gold',
        weight: 6.2,
        makingCharge: 8000,
        sku: 'WED-002',
        countInStock: 10,
        rating: 5,
        numReviews: 14,
      },
      {
        name: 'Floral Gold Daily Studs',
        image: 'https://images.unsplash.com/photo-1590548364669-906d4e2d3b24?auto=format&fit=crop&q=80&w=800',
        description: 'Elegant flower-motif studs in 22KT gold. Perfect for office and daily wear.',
        category: 'earrings',
        price: 18000,
        metalType: 'gold',
        weight: 3.8,
        makingCharge: 2200,
        sku: 'EAR-003',
        countInStock: 30,
        rating: 4.6,
        numReviews: 22,
      },
      {
        name: 'Antique Gold Choker',
        image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&q=80&w=800',
        description: 'Rich antique-finish choker with pearl accents. A masterpiece of traditional art.',
        category: 'wedding',
        price: 185000,
        metalType: 'gold',
        weight: 35.0,
        makingCharge: 15000,
        sku: 'NEC-002',
        countInStock: 4,
        rating: 4.7,
        numReviews: 11,
      },
      {
        name: 'Rose Gold Pave Ring',
        image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&q=80&w=800',
        description: 'Contemporary rose gold band featuring a brilliant pave-set diamond cluster.',
        category: 'diamond',
        price: 42000,
        metalType: 'gold',
        weight: 4.2,
        makingCharge: 5500,
        sku: 'RNG-003',
        countInStock: 18,
        rating: 4.4,
        numReviews: 7,
      },
      {
        name: 'Traditional Jhumkas',
        image: 'https://images.unsplash.com/photo-1596944210900-34d125132274?auto=format&fit=crop&q=80&w=800',
        description: 'Peacock-inspired gold jhumkas with intricate bell design and ruby stones.',
        category: 'earrings',
        price: 68000,
        metalType: 'gold',
        weight: 15.5,
        makingCharge: 6500,
        sku: 'EAR-004',
        countInStock: 9,
        rating: 4.8,
        numReviews: 18,
      },
      {
        name: 'Minimal Diamond Solitaire',
        image: 'https://images.unsplash.com/photo-1588444650733-d0c51dcaab06?q=80&w=1000&auto=format&fit=crop',
        description: 'Single sparkling diamond pendant in a minimalist 18KT gold setting.',
        category: 'diamond',
        price: 35000,
        metalType: 'gold',
        weight: 2.5,
        makingCharge: 3500,
        sku: 'PEN-001',
        countInStock: 20,
        rating: 4.2,
        numReviews: 5,
      },
      {
        name: '925 Silver Anklet Duo',
        image: 'https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?q=80&w=1000&auto=format&fit=crop',
        description: 'Delicate pair of silver anklets with tiny dangling charms and durable finish.',
        category: 'gold-silver',
        price: 4500,
        metalType: 'silver',
        weight: 12.0,
        makingCharge: 800,
        sku: 'SIL-002',
        countInStock: 40,
        rating: 4.1,
        numReviews: 14,
      },
      {
        name: 'Magnificent Bridal Set',
        image: 'https://images.unsplash.com/photo-1599643477877-537ef5278533?q=80&w=1000&auto=format&fit=crop',
        description: 'A complete bridal set featuring a heavy necklace, earrings, and maang tikka.',
        category: 'wedding',
        price: 450000,
        metalType: 'gold',
        weight: 85.0,
        makingCharge: 35000,
        sku: 'WED-003',
        countInStock: 2,
        rating: 5,
        numReviews: 8,
      },
      {
        name: '24KT Gold Investment Coin',
        image: 'https://images.unsplash.com/photo-1610492421959-53396c34b071?q=80&w=1000&auto=format&fit=crop',
        description: 'Pure 99.9% 24KT gold coin. The perfect choice for investment and gifting.',
        category: 'gold-silver',
        price: 75000,
        metalType: 'gold',
        weight: 10.0,
        makingCharge: 500,
        sku: 'INV-001',
        countInStock: 100,
        rating: 5,
        numReviews: 35,
      }
    ];

    // Seed Products and Reviews
    const createdProducts = [];
    for (const p of productsData) {
      const productReviews = [];
      const numR = Math.floor(Math.random() * 3) + 3; // 3-5 reviews
      for (let i = 0; i < numR; i++) {
        const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
        productReviews.push({
          user: randomCustomer._id,
          name: randomCustomer.name,
          rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
          comment: [
            'Absolutely stunning piece! The quality is amazing.',
            'Beautiful craftsmanship. Highly recommend Aura Jewels.',
            'Bought this for my anniversary, my wife loved it!',
            'Excellent service and fast delivery.',
            'The gold finish is perfect. Looks even better in person.',
          ][Math.floor(Math.random() * 5)],
        });
      }

      const product = await Product.create({
        ...p,
        user: adminUser,
        reviews: productReviews,
        numReviews: productReviews.length,
        rating: productReviews.reduce((acc, item) => item.rating + acc, 0) / productReviews.length,
      });
      createdProducts.push(product);
    }

    // Seed 10 Orders
    const orderStatuses = ['Delivered', 'Processing', 'Shipped', 'Cancelled'];
    for (let i = 0; i < 10; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const numItems = Math.floor(Math.random() * 3) + 1;
      const orderItems = [];
      let itemsPrice = 0;

      for (let j = 0; j < numItems; j++) {
        const product = createdProducts[Math.floor(Math.random() * createdProducts.length)];
        orderItems.push({
          name: product.name,
          qty: 1,
          image: product.image,
          price: product.price,
          product: product._id,
        });
        itemsPrice += product.price;
      }

      const shippingPrice = itemsPrice > 50000 ? 0 : 500;
      const totalPrice = itemsPrice + shippingPrice;

      // Spread dates across last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const createdAt = new Date(sixMonthsAgo.getTime() + Math.random() * (new Date().getTime() - sixMonthsAgo.getTime()));

      const status = orderItems.length === 1 && i === 9 ? 'Cancelled' : orderStatuses[Math.floor(Math.random() * 3)];

      await Order.create({
        user: customer._id,
        orderItems,
        shippingAddress: {
          address: '123 Test Street',
          city: 'Indore',
          postalCode: '452001',
          country: 'India',
        },
        paymentMethod: 'Credit Card',
        itemsPrice,
        shippingPrice,
        totalPrice,
        isPaid: status === 'Delivered' || status === 'Shipped',
        paidAt: status === 'Delivered' || status === 'Shipped' ? createdAt : null,
        isDelivered: status === 'Delivered',
        deliveredAt: status === 'Delivered' ? new Date() : null,
        createdAt,
      });
    }

    // Seed Investment Data
    await Investment.insertMany([
      { name: 'New Inventory - Gold', amount: 500000, type: 'Expense', date: '2024-01-15' },
      { name: 'Website Migration', amount: 50000, type: 'Expense', date: '2024-02-10' },
      { name: 'Seasonal Sale Profit', amount: 150000, type: 'Income', date: '2024-03-20' },
    ]);

    // Seed 7-Day Historical Rates
    const ratesData = [];
    const baseGold = 7100;
    const baseSilver = 90;
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      // Add slight variation
      const goldVar = Math.floor(Math.random() * 200) - 100; // -100 to +100
      const silverVar = Math.floor(Math.random() * 10) - 5;   // -5 to +5
      
      ratesData.push({
        date,
        goldRate: baseGold + goldVar,
        silverRate: baseSilver + silverVar,
      });
    }
    await Rate.insertMany(ratesData);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error('❌ SEED ERROR:', error);
    process.exit(1);
  }
};

importData();
