import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import patientRoutes from './routes/patientRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import hospitalRoutes from './routes/hospitalRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 6000;

app.use(express.json());
app.use('/patients', patientRoutes);
app.use('/doctors', doctorRoutes);
app.use('/hospitals', hospitalRoutes);

mongoose.connect(process.env.MONGO_URI, {
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// app.get('/', (req, res) => {
//     res.send('Server is running');
// });


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});