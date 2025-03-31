// models/patient.js
import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  contactNumber: { type: String, required: true }, // Added
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

export default mongoose.model('Patient', patientSchema);