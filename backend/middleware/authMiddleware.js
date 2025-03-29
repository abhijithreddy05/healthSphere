// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import Patient from '../models/patient.js';
import Hospital from '../models/hospital.js';
import Doctor from '../models/doctor.js';

const authMiddleware = (role) => async (req, res, next) => {
  try {
    // Get token from Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded; // Attach decoded token payload to request (contains user id and role)

    // Check user based on role
    let user;
    if (role === 'patient') {
      user = await Patient.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: 'Patient not found, authorization denied' });
      }
      // Verify the patientId in the URL matches the authenticated patient
      if (req.params.patientId && req.params.patientId !== decoded.id) {
        return res.status(403).json({ message: 'Access denied: Patient ID mismatch' });
      }
    } else if (role === 'hospital') {
      user = await Hospital.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: 'Hospital not found, authorization denied' });
      }
      // Verify the hospitalId in the URL matches the authenticated hospital
      if (req.params.hospitalId && req.params.hospitalId !== decoded.id) {
        return res.status(403).json({ message: 'Access denied: Hospital ID mismatch' });
      }
    } else if (role === 'doctor') {
      user = await Doctor.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: 'Doctor not found, authorization denied' });
      }
    } else {
      return res.status(400).json({ message: 'Invalid role' });
    }

    req.userModel = user; // Attach the user model to the request for further use
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid', error: error.message });
  }
};

export default authMiddleware;