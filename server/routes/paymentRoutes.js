import { Router } from 'express';
import { createPaymentIntent } from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/intent', requireAuth, createPaymentIntent);

export default router;
