// controllers/patientController.js
import Patient from '../models/patient.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerPatient = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const patient = new Patient({
      fullName,
      email,
      password
    });

    await patient.save();
    res.status(201).json({ message: 'Patient registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const loginPatient = async (req, res) => {
  try {
    const { email, password } = req.body;

    const patient = await Patient.findOne({ email });
    if (!patient) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: patient._id, role: 'patient' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful',
      token,
      patient: {
        id: patient._id,
        fullName: patient.fullName,
        email: patient.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};