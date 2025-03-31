import express from 'express';
import mongoose from 'mongoose';
import patientRoutes from './routes/patientRoutes.js';
import hospitalRoutes from './routes/hospitalRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import dotenv from 'dotenv';
import cors from 'cors';

// Import models to ensure they are registered with Mongoose
import './models/Patient.js';
import './models/Hospital.js';
import './models/doctor.js';
import './models/appointment.js';

const app = express();
app.use(cors());

dotenv.config();

// Middleware
app.use(express.json());

// MongoDB Atlas connection
mongoose.connect(process.env.MONGO_URI, {})
  .then(() => console.log('MongoDB Atlas connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/patients', patientRoutes);
app.use('/hospitals', hospitalRoutes);
app.use('/doctors', doctorRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});