// routes/hospitalRoutes.js
import express from 'express';
import { 
  registerHospital, 
  loginHospital, 
  addDoctor,
  getSpecializations, 
  getDoctors 
} from '../controllers/hospitalController.js';
import { 
  getPendingAppointments,
  updateAppointmentStatus
} from '../controllers/appointmentController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (no authentication needed)
router.post('/register', registerHospital);
router.post('/login', loginHospital);

// Protected routes (require hospital authentication)
router.post('/:hospitalId/addDoctor', authMiddleware('hospital'), addDoctor);
router.get('/:hospitalId/specializations', authMiddleware('hospital'), getSpecializations);
router.get('/:hospitalId/doctors', authMiddleware('hospital'), getDoctors);
router.get('/:hospitalId/pending-appointments', authMiddleware('hospital'), getPendingAppointments);
router.put('/:hospitalId/appointments/:appointmentId/status', authMiddleware('hospital'), updateAppointmentStatus);

export default router;