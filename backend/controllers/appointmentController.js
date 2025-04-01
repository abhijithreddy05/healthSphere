import Appointment from '../models/Appointment.js';
import Hospital from '../models/Hospital.js';
import Doctor from '../models/Doctor.js';

export const getAllSpecializations = async (req, res) => {
  try {
    const hospitals = await Hospital.find();
    const specializations = [...new Set(hospitals.flatMap(hospital => hospital.specializations))];
    res.json({ specializations });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getHospitalsBySpecialization = async (req, res) => {
  try {
    const { specialization } = req.params;
    const hospitals = await Hospital.find({ specializations: specialization });
    res.json({
      hospitals: hospitals.map(h => ({
        id: h._id,
        name: h.hospitalName,
        image: h.image,
        location: h.location,
        rating: h.rating,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAllHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find();
    res.json({
      hospitals: hospitals.map(h => ({
        id: h._id,
        name: h.hospitalName,
        image: h.image,
        location: h.location,
        rating: h.rating,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

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

export const bookAppointment = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { patientName, problem, specialization, hospitalId, doctorId, date, time, appointmentType } = req.body;

    if (req.user.id !== patientId) {
      return res.status(403).json({ message: 'You can only book appointments for yourself' });
    }

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    if (!hospital.specializations.includes(specialization) || doctor.specialization !== specialization) {
      return res.status(400).json({ message: 'Specialization not available for this hospital or doctor' });
    }

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

    const appointment = new Appointment({
      patient: patientId,
      patientName,
      problem,
      specialization,
      hospital: hospitalId,
      doctor: doctorId,
      date: new Date(date),
      time,
      appointmentType,
      status: 'pending',
    });

    await appointment.save();
    res.status(201).json({ message: 'Appointment request sent successfully', appointmentId: appointment._id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getPatientAppointments = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (req.user.id !== patientId) {
      return res.status(403).json({ message: 'You can only view your own appointments' });
    }

    const appointments = await Appointment.find({ patient: patientId })
      .populate('hospital', 'hospitalName')
      .populate('doctor', 'fullName specialization');

    const filteredAppointments = appointments
      .filter(appointment => appointment.hospital && appointment.doctor)
      .map(appointment => ({
        hospitalName: appointment.hospital.hospitalName,
        specialization: appointment.doctor.specialization,
        doctorName: appointment.doctor.fullName,
        date: appointment.date.toISOString().split('T')[0],
        time: appointment.time,
        status: appointment.status,
      }));

    res.json(filteredAppointments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Updated controller to fetch appointments for a hospital
export const getHospitalAppointments = async (req, res) => {
  try {
    const { hospitalId } = req.params;

    // Verify that the authenticated hospital is accessing its own appointments
    if (req.user.id !== hospitalId) {
      return res.status(403).json({ message: 'You can only view appointments for your own hospital' });
    }

    const appointments = await Appointment.find({ hospital: hospitalId })
      .populate('patient', 'fullName')
      .populate('doctor', 'fullName specialization');

    const filteredAppointments = appointments
      .filter(appointment => appointment.patient && appointment.doctor)
      .map(appointment => ({
        _id: appointment._id,
        patientName: appointment.patientName,
        doctorName: appointment.doctor.fullName, // Include doctor's name instead of problem
        specialization: appointment.specialization,
        date: appointment.date,
        time: appointment.time,
        status: appointment.status,
      }));

    res.json({ appointments: filteredAppointments });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Controller to update appointment status
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { hospitalId, appointmentId } = req.params;
    const { status } = req.body;

    // Verify that the authenticated hospital is updating its own appointment
    if (req.user.id !== hospitalId) {
      return res.status(403).json({ message: 'You can only update appointments for your own hospital' });
    }

    // Validate status
    if (!['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be "Accepted" or "Rejected"' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Ensure the appointment belongs to this hospital
    if (appointment.hospital.toString() !== hospitalId) {
      return res.status(403).json({ message: 'This appointment does not belong to your hospital' });
    }

    // Update status (map frontend status to backend status)
    appointment.status = status === 'Accepted' ? 'approved' : 'rejected';
    await appointment.save();

    res.json({ message: 'Appointment status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};