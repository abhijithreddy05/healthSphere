// models/Hospital.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const hospitalSchema = new mongoose.Schema({
  hospitalName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  specializations: [{
    type: String,
    unique: true // Ensures no duplicate specializations
  }],
  doctors: [{
    name: String,
    specialization: String
  }]
});

// Hash password before saving
hospitalSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

export default mongoose.model('Hospital', hospitalSchema);