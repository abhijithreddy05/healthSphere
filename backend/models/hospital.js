import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
  hospitalName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  specializations: [{
    type: String,
    // Remove unique: true to avoid the duplicate key error
  }],
  image: {
    type: String,
  },
  location: {
    type: String,
  },
  rating: {
    type: Number,
  },
});

export default mongoose.model('Hospital', hospitalSchema);