import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

import userRoutes    from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import uploadRoutes  from './routes/uploadRoutes.js';
import orderRoutes   from './routes/orderRoutes.js';
import adminRoutes   from './routes/adminRoutes.js';
import ratesRoutes   from './routes/rates.js';

dotenv.config();
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    // Allow any origin for this demo project
    callback(null, true);
  },
  credentials: true,
}));

// Relax helmet for development (allows loading images from CDN / external URLs)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting – 200 requests per 15 min per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: 'Too many requests, please try again later.' },
});
app.use('/api/', apiLimiter);

// ─── Routes ──────────────────────────────────────────────────
app.use('/api/users',    userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload',   uploadRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/rates',    ratesRoutes);

// ─── Static file serving for uploaded images ─────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Health check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV });
});

// ─── Error Handlers ───────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV}]`));
