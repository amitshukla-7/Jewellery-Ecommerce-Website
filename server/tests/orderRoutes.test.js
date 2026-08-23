import request from 'supertest';
import app from '../index.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
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

describe('Order Routes Integration Tests', () => {
  const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  };

  it('POST /api/orders rejects an empty orderItems array', async () => {
    const user = await User.create({ name: 'User 1', email: 'u1@test.com', password: 'pw' });
    const token = generateToken(user._id);

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        orderItems: [],
        shippingAddress: { address: '123', city: 'C', postalCode: '1', country: 'US' },
        paymentMethod: 'PayPal',
        itemsPrice: 0,
        shippingPrice: 0,
        totalPrice: 0,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/No order items/);
  });

  it('GET /api/orders/myorders only returns the requesting user\'s orders', async () => {
    const user1 = await User.create({ name: 'User 1', email: 'u1@test.com', password: 'pw' });
    const user2 = await User.create({ name: 'User 2', email: 'u2@test.com', password: 'pw' });
    
    // Create orders for user1 and user2
    await Order.create({
      user: user1._id,
      orderItems: [{ name: 'Item 1', qty: 1, image: 'img', price: 10, product: user1._id }], // dummy product id
      shippingAddress: { address: '123', city: 'C', postalCode: '1', country: 'US' },
      paymentMethod: 'PayPal',
      itemsPrice: 10, shippingPrice: 0, totalPrice: 10
    });

    await Order.create({
      user: user2._id,
      orderItems: [{ name: 'Item 2', qty: 1, image: 'img', price: 20, product: user2._id }],
      shippingAddress: { address: '456', city: 'D', postalCode: '2', country: 'CA' },
      paymentMethod: 'PayPal',
      itemsPrice: 20, shippingPrice: 0, totalPrice: 20
    });

    const token = generateToken(user1._id);

    const res = await request(app)
      .get('/api/orders/myorders')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].user.toString()).toBe(user1._id.toString());
  });
});
