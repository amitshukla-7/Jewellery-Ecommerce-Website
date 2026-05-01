import express from 'express';
import Rate from '../models/Rate.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get current rates
// @route   GET /api/rates/current
// @access  Public
router.get('/current', async (req, res) => {
  try {
    const rate = await Rate.findOne().sort({ date: -1 });
    if (rate) {
      res.json(rate);
    } else {
      res.status(404).json({ message: 'Rates not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get 7-day rate history
// @route   GET /api/rates/history
// @access  Public
router.get('/history', async (req, res) => {
  try {
    const rates = await Rate.find().sort({ date: -1 }).limit(7);
    res.json(rates.reverse());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update today's rate
// @route   POST /api/rates/update
// @access  Private/Admin
router.post('/update', protect, admin, async (req, res) => {
  const { goldRate, silverRate } = req.body;
  
  // Normalize date to start of day
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    let rate = await Rate.findOne({ date: today });

    if (rate) {
      rate.goldRate = goldRate;
      rate.silverRate = silverRate;
      await rate.save();
      res.json({ message: 'Today\'s rates updated', rate });
    } else {
      rate = await Rate.create({
        date: today,
        goldRate,
        silverRate,
      });
      res.status(201).json({ message: 'Today\'s rates created', rate });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
