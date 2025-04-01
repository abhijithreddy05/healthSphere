import express from 'express';
import { registerHospital, loginHospital } from '../controllers/hospitalController.js';

const router = express.Router();

// Manual hospital registration (via Postman)
router.post('/register', registerHospital);

// Hospital login
router.post('/login', loginHospital);

export default router;