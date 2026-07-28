import { Router } from 'express';
import { cancelBooking, createBooking, listBookings } from '../controllers/bookingController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, listBookings);
router.post('/', requireAuth, createBooking);
router.patch('/:bookingId/cancel', requireAuth, cancelBooking);

export default router;
