import express from 'express';
import {
  registerPatient,
  loginPatient,
} from '../controllers/patientController.js';
import {
  getAllSpecializations,
  getHospitalsBySpecialization,
  getAllHospitals,
  getSpecializationsByHospital,
  getDoctorsByHospitalAndSpecialization,
  checkAvailableTimeSlots,
  bookAppointment,
  getAppointmentStatus,
} from '../controllers/appointmentController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (no authentication needed)
router.post('/register', registerPatient);
router.post('/login', loginPatient);
router.get('/specializations', getAllSpecializations);
router.get('/hospitals/specialization/:specialization', getHospitalsBySpecialization);
router.get('/hospitals', getAllHospitals);
router.get('/hospitals/:hospitalId/specializations', getSpecializationsByHospital);
router.get('/doctors', getDoctorsByHospitalAndSpecialization);
router.get('/timeslots', checkAvailableTimeSlots);

// Protected routes (require patient authentication)
router.post('/:patientId/book', authMiddleware('patient'), bookAppointment);
router.get('/:patientId/appointments/:appointmentId/status', authMiddleware('patient'), getAppointmentStatus);

export default router;