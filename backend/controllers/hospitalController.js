// controllers/hospitalController.js
import Hospital from '../models/hospital.js';
import Doctor from '../models/doctor.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerHospital = async (req, res) => {
  try {
    const { hospitalName, email, password } = req.body;

    // Check if hospital already exists
    const existingHospital = await Hospital.findOne({ email });
    if (existingHospital) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hospital = new Hospital({
      hospitalName,
      email,
      password
    });

    await hospital.save();
    res.status(201).json({ message: 'Hospital registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const loginHospital = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find hospital
    const hospital = await Hospital.findOne({ email });
    if (!hospital) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, hospital.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: hospital._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      hospital: {
        id: hospital._id,
        hospitalName: hospital.hospitalName,
        email: hospital.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const addDoctor = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { name, email, password, specialization } = req.body;

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({ message: 'Doctor email already registered' });
    }

    const doctor = new Doctor({
      name,
      email,
      password,
      specialization,
      hospital: hospitalId
    });

    await doctor.save();

    if (!hospital.specializations.includes(specialization)) {
      hospital.specializations.push(specialization);
    }
    hospital.doctors.push({ name, specialization });
    await hospital.save();

    res.status(201).json({
      message: 'Doctor added successfully',
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        hospitalId: hospital._id
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getSpecializations = async (req, res) => {
    try {
      const { hospitalId } = req.params;
      const hospital = await Hospital.findById(hospitalId);
      if (!hospital) {
        return res.status(404).json({ message: 'Hospital not found' });
      }
  
      res.json({
        hospitalName: hospital.hospitalName,
        specializations: hospital.specializations
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getDoctors = async (req, res) => {
    try {
      const { hospitalId } = req.params;
      const hospital = await Hospital.findById(hospitalId);
      if (!hospital) {
        return res.status(404).json({ message: 'Hospital not found' });
      }
  
      res.json({
        hospitalName: hospital.hospitalName,
        doctors: hospital.doctors
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
};