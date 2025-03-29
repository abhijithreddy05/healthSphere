// routes/doctorRoutes.js
import express from 'express';
import { loginDoctor } from '../controllers/doctorController.js';

const router = express.Router();

// Public route (no authentication needed)
router.post('/login', loginDoctor);

export default router;