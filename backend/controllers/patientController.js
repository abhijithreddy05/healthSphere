import Patient from '../models/Patient.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerPatient = async (req, res) => {
  try {
    const { fullName, contactNumber, email, password } = req.body; // Added contactNumber

    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Added password hashing
    const patient = new Patient({
      fullName,
      contactNumber, // Added contactNumber
      email,
      password: hashedPassword
    });

    await patient.save();

    const token = jwt.sign(
      { id: patient._id, role: 'patient' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'Patient registered successfully',
      token, // Added token for frontend consistency
      user: { // Added user data for frontend
        id: patient._id,
        fullName: patient.fullName,
        contactNumber: patient.contactNumber,
        email: patient.email
      }
    });
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
      user: { // Changed "patient" to "user" for consistency
        id: patient._id,
        fullName: patient.fullName,
        contactNumber: patient.contactNumber, // Added contactNumber
        email: patient.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};