import Hospital from '../models/Hospital.js';
import Doctor from '../models/doctor.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerHospital = async (req, res) => {
  try {
    const { hospitalName, email, password, specializations } = req.body;

    // Validate required fields
    if (!hospitalName || !email || !password) {
      return res.status(400).json({ message: 'Hospital name, email, and password are required' });
    }

    // Check if hospital already exists
    const existingHospital = await Hospital.findOne({ email });
    if (existingHospital) {
      return res.status(400).json({ message: 'Hospital already exists' });
    }

    // Ensure specializations is an array and remove duplicates
    const uniqueSpecializations = specializations
      ? [...new Set(specializations)] // Remove duplicates if provided
      : []; // Default to empty array if not provided

    // Create new hospital
    const hospital = new Hospital({
      hospitalName,
      email,
      password, // In a real app, you should hash the password
      specializations: uniqueSpecializations,
    });

    await hospital.save();
    res.status(201).json({ message: 'Hospital registered successfully', hospitalId: hospital._id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const loginHospital = async (req, res) => {
  try {
    const { email, password } = req.body;

    const hospital = await Hospital.findOne({ email });
    if (!hospital) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, hospital.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: hospital._id, role: 'hospital' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { // Changed "hospital" to "user" for consistency
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
    const { fullName, email, password, hospital, specialization, experience, rating, image } = req.body;

    // Validate required fields
    if (!fullName || !email || !password || !hospital || !specialization) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Check if doctor already exists
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({ message: 'Doctor already exists' });
    }

    // Validate hospital
    const hospitalDoc = await Hospital.findById(hospital);
    if (!hospitalDoc) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    // Create new doctor
    const doctor = new Doctor({
      fullName,
      email,
      password, // In a real app, you should hash the password
      hospital,
      specialization,
      experience: experience || 'Not specified',
      rating: rating || 4.0,
      image: image || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2',
    });

    await doctor.save();

    // Update the hospital's specializations array (remove duplicates)
    if (!hospitalDoc.specializations.includes(specialization)) {
      hospitalDoc.specializations.push(specialization);
      hospitalDoc.specializations = [...new Set(hospitalDoc.specializations)]; // Remove duplicates
      await hospitalDoc.save();
    }

    res.status(201).json({ message: 'Doctor registered successfully' });
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