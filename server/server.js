import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import { connectDatabase } from './config/db.js';
import { bootstrapData } from './data/repository.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (_req, res) => {
  res.json({ message: 'Travel Booking API is running' });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'travel-booking-api' });
});

app.get('/api/bootstrap', async (_req, res) => {
  res.json(await bootstrapData());
});

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const startServer = async () => {
  try {
    await connectDatabase(process.env.MONGO_URI);
    app.listen(port, () => {
      console.log(`Travel Booking API running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
