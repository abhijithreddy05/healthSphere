import express from 'express';
import { addDoctor, loginDoctor } from '../controllers/doctorController.js';
import { getDoctorAppointments } from '../controllers/appointmentController.js'; // Import the new controller
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected route: Only authenticated hospitals can add doctors
router.post('/:hospitalId/doctors', authMiddleware('hospital'), addDoctor);

// Public route: Doctor login
router.post('/login', loginDoctor);

// Protected route: Get doctor's approved appointments
router.get('/:doctorId/appointments', authMiddleware('doctor'), getDoctorAppointments);

export default router;