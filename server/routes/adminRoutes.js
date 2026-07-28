import { Router } from 'express';
import { getSummary, listAllBookingsHandler } from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/summary', requireAuth, requireRole('admin'), getSummary);
router.get('/bookings', requireAuth, requireRole('admin'), listAllBookingsHandler);

export default router;
