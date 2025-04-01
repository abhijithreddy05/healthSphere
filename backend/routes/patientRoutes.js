import express from 'express';
import { registerPatient, loginPatient, getPatientProfile } from '../controllers/patientController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { getPatientAppointments } from '../controllers/appointmentController.js';

const router = express.Router();

// Public patient registration
router.post('/register', registerPatient);

// Patient login
router.post('/login', loginPatient);

// Protected route: Get patient profile
router.get('/:patientId', authMiddleware('patient'), getPatientProfile);
// Protected route: Get patient appointment history
router.get('/:patientId/appointments', authMiddleware('patient'), getPatientAppointments);

export default router;