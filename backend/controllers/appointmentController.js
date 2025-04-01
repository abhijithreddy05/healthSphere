import Appointment from '../models/appointment.js';
import Hospital from '../models/Hospital.js';
import Doctor from '../models/doctor.js';
import Patient from '../models/Patient.js';

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
    res.json({
      hospitals: hospitals.map(h => ({
        id: h._id,
        name: h.hospitalName,
        image: h.image || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc',
        location: h.location || 'Unknown',
        rating: h.rating || 4.5,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all hospitals
export const getAllHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find();
    res.json({
      hospitals: hospitals.map(h => ({
        id: h._id,
        name: h.hospitalName,
        image: h.image || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc',
        location: h.location || 'Unknown',
        rating: h.rating || 4.5,
      })),
    });
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

// Get doctors by hospital and specialization
export const getDoctorsByHospitalAndSpecialization = async (req, res) => {
  try {
    const { hospitalId, specialization } = req.query;
    const doctors = await Doctor.find({
      hospital: hospitalId,
      specialization,
    });
    res.json({
      doctors: doctors.map(d => ({
        id: d._id,
        name: d.fullName,
        image: d.image,
        experience: d.experience,
        rating: d.rating,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Check available time slots (to avoid overlaps)
export const checkAvailableTimeSlots = async (req, res) => {
  try {
    const { hospitalId, doctorId, date } = req.query;
    const appointments = await Appointment.find({
      hospital: hospitalId,
      doctor: doctorId,
      date: new Date(date),
      status: { $in: ['pending', 'approved'] },
    });

    const allTimeSlots = [
      '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
      '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
    ];

    const bookedSlots = appointments.map(appointment => appointment.time);
    const availableSlots = allTimeSlots.filter(slot => !bookedSlots.includes(slot));

    res.json({ availableSlots });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Book an appointment
export const bookAppointment = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { patientName, problem, specialization, hospitalId, doctorId, date, time, appointmentType } = req.body;

    // Validate patient (already authenticated via middleware)
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Validate hospital
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    // Validate doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Validate specialization
    if (!hospital.specializations.includes(specialization) || doctor.specialization !== specialization) {
      return res.status(400).json({ message: 'Specialization not available for this hospital or doctor' });
    }

    // Check for existing appointment at the same date and time for the doctor
    const existingAppointment = await Appointment.findOne({
      hospital: hospitalId,
      doctor: doctorId,
      date: new Date(date),
      time,
      status: { $in: ['pending', 'approved'] },
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
      doctor: doctorId,
      date: new Date(date),
      time,
      status: 'pending',
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
    const appointments = await Appointment.find({ hospital: hospitalId, status: 'pending' })
      .populate('patient', 'fullName email')
      .populate('hospital', 'hospitalName')
      .populate('doctor', 'fullName');
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

    // Adjust status to match frontend expectations
    if (!['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

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

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patient: patientId,
    })
      .populate('hospital', 'hospitalName')
      .populate('doctor', 'fullName');

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
        name: appointment.hospital.hospitalName,
      },
      doctor: {
        id: appointment.doctor._id,
        name: appointment.doctor.fullName,
      },
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get appointment history for a patient
export const getAppointmentHistory = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Fetch all appointments for the patient
    const appointments = await Appointment.find({ patient: patientId })
      .populate('hospital', 'hospitalName') // Populate hospitalName from Hospital model
      .populate('doctor', 'fullName') // Populate fullName from Doctor model
      .sort({ createdAt: -1 }); // Sort by creation date (newest first)

    // Map the appointments to the desired format, with error handling
    const appointmentHistory = appointments
      .filter((appointment) => {
        // Check if hospital and doctor are populated
        if (!appointment.hospital || !appointment.doctor) {
          console.error(
            `Invalid appointment (ID: ${appointment._id}): ` +
            `hospital: ${JSON.stringify(appointment.hospital)}, ` +
            `doctor: ${JSON.stringify(appointment.doctor)}`
          );
          return false; // Skip this appointment
        }
        return true;
      })
      .map((appointment) => ({
        hospitalName: appointment.hospital.hospitalName,
        specialization: appointment.specialization,
        doctorName: appointment.doctor.fullName,
        date: appointment.date.toISOString().split('T')[0], // Format date as YYYY-MM-DD
        time: appointment.time,
        status: appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1), // Capitalize status (e.g., "pending" -> "Pending")
      }));

    res.status(200).json(appointmentHistory);
  } catch (error) {
    console.error('Error in getAppointmentHistory:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};