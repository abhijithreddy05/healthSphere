import Hospital from '../models/Hospital.js';
import Doctor from '../models/doctor.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerHospital = async (req, res) => {
  try {
    const { hospitalName, email, password } = req.body;

    const existingHospital = await Hospital.findOne({ email });
    if (existingHospital) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Added password hashing
    const hospital = new Hospital({
      hospitalName,
      email,
      password: hashedPassword
    });

    await hospital.save();

    const token = jwt.sign(
      { id: hospital._id, role: 'hospital' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'Hospital registered successfully',
      token, // Added token for frontend consistency
      user: { // Added user data for frontend
        id: hospital._id,
        hospitalName: hospital.hospitalName,
        email: hospital.email
      }
    });
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
    // Extract hospitalId from URL parameters
    const { hospitalId } = req.params;

    // Extract authenticated hospital user from req.user (set by authMiddleware)
    const authenticatedHospitalId = req.user.id;

    // Verify that the authenticated hospital matches the hospitalId in the URL
    if (hospitalId !== authenticatedHospitalId) {
      return res.status(403).json({ message: 'Unauthorized: You can only add doctors to your own hospital' });
    }

    // Extract doctor details from the request body
    const { fullName, email, password, specialization, experience, rating, image } = req.body;

    // Validate required fields
    if (!fullName || !email || !password || !specialization || !experience || !rating || !image) {
      return res.status(400).json({ message: 'All fields are required: fullName, email, password, specialization, experience, rating, image' });
    }

    // Check if a doctor with the same email already exists
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({ message: 'A doctor with this email already exists' });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new doctor
    const newDoctor = new Doctor({
      fullName,
      email,
      password: hashedPassword, // Store the hashed password
      hospital: hospitalId,
      specialization,
      experience,
      rating,
      image,
    });

    // Save the doctor to the database
    await newDoctor.save();

    // Return success response (excluding the password in the response)
    const { password: _, ...doctorResponse } = newDoctor.toObject();
    res.status(201).json({ message: 'Doctor added successfully', doctor: doctorResponse });
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