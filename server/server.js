import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Present only when client is built alongside the server (single-service deploys)
const clientDistPath = path.join(__dirname, '../client/dist');

const app = express();
const port = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());
app.use(morgan('dev'));

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

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get(/^(?!\/api\/).*/, (_req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const startServer = async () => {
  try {
    await connectDatabase(process.env.MONGO_URI);
  } catch (error) {
    // Mongo is optional at runtime — repository.js falls back to in-memory demo data
    // whenever the connection isn't ready, so a failed connect should not be fatal.
    console.error('MongoDB connection failed, continuing in demo mode:', error.message);
  }

  app.listen(port, () => {
    console.log(`Travel Booking API running on port ${port}`);
  });
};

startServer();
