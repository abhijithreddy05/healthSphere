// routes/hospitalRoutes.js
import express from 'express';
import { registerHospital, loginHospital,addDoctor, getSpecializations, getDoctors } from '../controllers/hospitalController.js';

const router = express.Router();

router.post('/register', registerHospital);
router.post('/login', loginHospital);
router.post('/:hospitalId/addDoctor', addDoctor);
router.get('/:hospitalId/specializations', getSpecializations);
router.get('/:hospitalId/doctors', getDoctors);

export default router;