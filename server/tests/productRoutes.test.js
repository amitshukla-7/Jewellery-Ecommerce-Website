import request from 'supertest';
import app from '../index.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import MetalRates from '../models/MetalRates.js';
import { connectDBForTesting, disconnectDBForTesting, clearDB } from './db.js';
import jwt from 'jsonwebtoken';

beforeAll(async () => {
  await connectDBForTesting();
  process.env.JWT_SECRET = 'testsecret';
});

afterEach(async () => {
  await clearDB();
});

afterAll(async () => {
  await disconnectDBForTesting();
});

describe('Product Rates Integration Tests', () => {
  const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  };

  it('GET /api/products/rates returns current rates', async () => {
    await MetalRates.create({ goldRate: 6000, silverRate: 80 });

    const res = await request(app).get('/api/products/rates');

    expect(res.statusCode).toBe(200);
    expect(res.body.goldRate).toBe(6000);
    expect(res.body.silverRate).toBe(80);
  });

  it('POST /api/products/rates recalculates prices correctly', async () => {
    const adminUser = await User.create({ name: 'Admin', email: 'admin@test.com', password: 'pw', role: 'admin' });
    const token = generateToken(adminUser._id);

    // Create a product with weight and making charge
    const prod = await Product.create({
      name: 'Gold Ring',
      image: 'img',
      description: 'desc',
      category: 'Rings',
      price: 10000, // old price
      metalType: 'gold',
      weight: 10, // 10 grams
      makingCharge: 500, // 500 charge
    });

    // Post new rates
    const res = await request(app)
      .post('/api/products/rates')
      .set('Authorization', `Bearer ${token}`)
      .send({ goldRate: 7000, silverRate: 90 });

    expect(res.statusCode).toBe(201);
    expect(res.body.updatedCount).toBe(1);

    // Verify recalculation
    const updatedProd = await Product.findById(prod._id);
    // formula: 10 * 7000 + 500 = 70500
    expect(updatedProd.price).toBe(70500);
  });
});
