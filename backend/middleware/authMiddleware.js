import jwt from 'jsonwebtoken';
import Patient from '../models/Patient.js';
import Hospital from '../models/Hospital.js';
import Doctor from '../models/doctor.js';

const authMiddleware = (userType) => async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let user;

    if (userType === 'patient') {
      user = await Patient.findById(decoded.id);
    } else if (userType === 'hospital') {
      user = await Hospital.findById(decoded.id);
    } else if (userType === 'doctor') {
      user = await Doctor.findById(decoded.id);
    }

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    req.userModel = user;
    req.userType = userType;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token', error: error.message });
  }
};

export default authMiddleware;