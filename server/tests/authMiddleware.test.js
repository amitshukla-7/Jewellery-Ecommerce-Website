import { protect, admin } from '../middleware/authMiddleware.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { connectDBForTesting, disconnectDBForTesting, clearDB } from './db.js';
import { jest } from '@jest/globals';

beforeAll(async () => {
  await connectDBForTesting();
});

afterEach(async () => {
  await clearDB();
});

afterAll(async () => {
  await disconnectDBForTesting();
});

describe('Auth Middleware', () => {
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    process.env.JWT_SECRET = 'testsecret';
  });

  describe('protect middleware', () => {
    it('rejects missing token', async () => {
      const req = { headers: {} };
      await protect(req, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Not authorized, no token' });
    });

    it('rejects invalid token', async () => {
      const req = { headers: { authorization: 'Bearer invalidtoken' } };
      await protect(req, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Session expired. Please login again.' });
    });

    it('accepts a valid token', async () => {
      const user = await User.create({ name: 'Test', email: 'test@test.com', password: 'pass' });
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      const req = { headers: { authorization: `Bearer ${token}` } };
      
      await protect(req, mockRes, mockNext);
      
      expect(req.user).toBeDefined();
      expect(req.user.email).toBe('test@test.com');
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('admin middleware', () => {
    it('rejects non-admin users with 403', () => {
      const req = { user: { role: 'user' } };
      admin(req, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Not authorized as an admin' });
    });

    it('accepts admin users', () => {
      const req = { user: { role: 'admin' } };
      admin(req, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
