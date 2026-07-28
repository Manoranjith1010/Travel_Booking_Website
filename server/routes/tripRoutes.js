import { Router } from 'express';
import { listAllTripPackages, listTrips } from '../controllers/tripController.js';

const router = Router();

router.get('/', listTrips);
router.get('/all', listAllTripPackages);

export default router;
