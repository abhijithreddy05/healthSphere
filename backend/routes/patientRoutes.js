// routes/patientRoutes.js
import express from 'express';
import { 
  registerPatient, 
  loginPatient 
} from '../controllers/patientController.js';
import { 
  getAllSpecializations,
  getHospitalsBySpecialization,
  getAllHospitals,
  getSpecializationsByHospital,
  checkAvailableTimeSlots,
  bookAppointment,
  getAppointmentStatus
} from '../controllers/appointmentController.js';

const router = express.Router();

// Existing patient routes
router.post('/register', registerPatient);
router.post('/login', loginPatient);

// Appointment booking routes (nested under /patients)
router.get('/specializations', getAllSpecializations);
router.get('/hospitals/specialization/:specialization', getHospitalsBySpecialization);
router.get('/hospitals', getAllHospitals);
router.get('/hospitals/:hospitalId/specializations', getSpecializationsByHospital);
router.get('/timeslots', checkAvailableTimeSlots);
router.post('/:patientId/book', bookAppointment); // Updated to include patientId
router.get('/:patientId/appointments/:appointmentId/status', getAppointmentStatus); // New endpoint

export default router;