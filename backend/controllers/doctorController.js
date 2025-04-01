import Doctor from '../models/Doctor.js';
import Hospital from '../models/Hospital.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const addDoctor = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { fullName, email, password, specialization, experience, rating, image } = req.body;

    // Check if the authenticated hospital matches the hospitalId
    if (req.user.id !== hospitalId) {
      return res.status(403).json({ message: 'You can only add doctors to your own hospital' });
    }

    if (!fullName || !email || !password || !specialization) {
      return res.status(400).json({ message: 'Full name, email, password, and specialization are required' });
    }

    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({ message: 'Doctor already exists' });
    }

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    // Hash the doctor's password
    const hashedPassword = await bcrypt.hash(password, 10);

    const doctor = new Doctor({
      fullName,
      email,
      password: hashedPassword, // Store the hashed password
      hospital: hospitalId,
      specialization,
      experience: experience || 'Not specified',
      rating: rating || 4.0,
      image: image || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2',
    });

    await doctor.save();

    // Add the specialization to the hospital's specializations array (remove duplicates)
    if (!hospital.specializations.includes(specialization)) {
      hospital.specializations.push(specialization);
      hospital.specializations = [...new Set(hospital.specializations)];
      await hospital.save();
    }

    res.status(201).json({ message: 'Doctor added successfully', doctorId: doctor._id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: doctor._id, role: 'doctor' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};