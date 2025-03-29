// controllers/appointmentController.js
import Appointment from '../models/appointment.js';
import Hospital from '../models/hospital.js';
import Patient from '../models/patient.js';

// Get all specializations across all hospitals
export const getAllSpecializations = async (req, res) => {
  try {
    const hospitals = await Hospital.find();
    const specializations = [...new Set(hospitals.flatMap(hospital => hospital.specializations))];
    res.json({ specializations });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get hospitals by specialization
export const getHospitalsBySpecialization = async (req, res) => {
  try {
    const { specialization } = req.params;
    const hospitals = await Hospital.find({ specializations: specialization });
    res.json({ hospitals: hospitals.map(h => ({ id: h._id, name: h.hospitalName })) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all hospitals
export const getAllHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find();
    res.json({ hospitals: hospitals.map(h => ({ id: h._id, name: h.hospitalName })) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get specializations by hospital
export const getSpecializationsByHospital = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }
    res.json({ specializations: hospital.specializations });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Check available time slots (to avoid overlaps)
export const checkAvailableTimeSlots = async (req, res) => {
  try {
    const { hospitalId, date } = req.query;
    const appointments = await Appointment.find({
      hospital: hospitalId,
      date: new Date(date),
      status: { $in: ['pending', 'approved'] }
    });

    const allTimeSlots = [
      '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
      '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
    ];

    const bookedSlots = appointments.map(appointment => appointment.time);
    const availableSlots = allTimeSlots.filter(slot => !bookedSlots.includes(slot));

    res.json({ availableSlots });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Book an appointment (Updated to use authenticated patient)
export const bookAppointment = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { patientName, problem, specialization, hospitalId, date, time } = req.body;

    // Patient is already validated by authMiddleware, so we can use req.userModel
    const patient = req.userModel;

    // Validate hospital
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    // Validate specialization
    if (!hospital.specializations.includes(specialization)) {
      return res.status(400).json({ message: 'Specialization not available in this hospital' });
    }

    // Check for existing appointment at the same date and time
    const existingAppointment = await Appointment.findOne({
      hospital: hospitalId,
      date: new Date(date),
      time,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'Time slot already booked' });
    }

    // Create appointment
    const appointment = new Appointment({
      patient: patientId,
      patientName,
      problem,
      specialization,
      hospital: hospitalId,
      date: new Date(date),
      time,
      status: 'pending'
    });

    await appointment.save();
    res.status(201).json({ message: 'Appointment request sent successfully', appointmentId: appointment._id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get pending appointments for a hospital (for approval)
export const getPendingAppointments = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    // Hospital is already validated by authMiddleware
    const appointments = await Appointment.find({ hospital: hospitalId, status: 'pending' })
      .populate('patient', 'fullName email')
      .populate('hospital', 'hospitalName');
    res.json({ appointments });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Approve or reject an appointment
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Ensure the hospital making the request matches the appointment's hospital
    if (appointment.hospital.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied: Hospital mismatch' });
    }

    appointment.status = status;
    await appointment.save();

    res.json({ message: `Appointment ${status} successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get appointment status for a patient
export const getAppointmentStatus = async (req, res) => {
  try {
    const { patientId, appointmentId } = req.params;

    // Patient is already validated by authMiddleware
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patient: patientId
    })
      .populate('hospital', 'hospitalName');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found or does not belong to this patient' });
    }

    res.json({
      appointmentId: appointment._id,
      patientName: appointment.patientName,
      problem: appointment.problem,
      specialization: appointment.specialization,
      hospital: {
        id: appointment.hospital._id,
        name: appointment.hospital.hospitalName
      },
      date: appointment.date,
      time: appointment.time,
      status: appointment.status
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};