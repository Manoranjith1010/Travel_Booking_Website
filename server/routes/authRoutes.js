import { Router } from 'express';
import { login, profile, register } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/login', (_req, res) => {
  res.status(405).json({
    message: 'Use POST /api/auth/login with email and password in the JSON body',
  });
});
router.post('/register', register);
router.post('/login', login);
router.get('/profile', requireAuth, profile);

export default router;
