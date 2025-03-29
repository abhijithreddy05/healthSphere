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

const router = express.Router();

router.post('/register', registerHospital);
router.post('/login', loginHospital);
router.post('/:hospitalId/addDoctor', addDoctor);
router.get('/:hospitalId/specializations', getSpecializations);
router.get('/:hospitalId/doctors', getDoctors);

// Hospital-specific appointment routes
router.get('/:hospitalId/pending-appointments', getPendingAppointments);
router.put('/:hospitalId/appointments/:appointmentId/status', updateAppointmentStatus);

export default router;