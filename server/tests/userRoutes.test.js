import request from 'supertest';
import app from '../index.js';
import User from '../models/User.js';
import { connectDBForTesting, disconnectDBForTesting, clearDB } from './db.js';

beforeAll(async () => {
  await connectDBForTesting();
});

afterEach(async () => {
  await clearDB();
});

afterAll(async () => {
  await disconnectDBForTesting();
});

describe('User Routes Integration Tests', () => {
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  };

  it('register with duplicate email fails', async () => {
    // First registration
    await request(app).post('/api/users').send(testUser);

    // Second registration with same email
    const res = await request(app).post('/api/users').send({
      name: 'Another User',
      email: 'test@example.com',
      password: 'newpassword',
    });

    expect(res.statusCode).toBe(400); // Usually 400 for bad request (duplicate email)
  });

  it('login with wrong password fails', async () => {
    await request(app).post('/api/users').send(testUser);

    const res = await request(app).post('/api/users/login').send({
      email: 'test@example.com',
      password: 'wrongpassword',
    });

    expect(res.statusCode).toBe(401); // Unauthorized
  });

  it('/profile rejects requests with no token', async () => {
    const res = await request(app).get('/api/users/profile');
    expect(res.statusCode).toBe(401);
  });
});
