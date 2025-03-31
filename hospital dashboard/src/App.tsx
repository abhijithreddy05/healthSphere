import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Bell, Activity } from 'lucide-react';
import axios from 'axios';

// Define the Appointment interface
interface Appointment {
  id: string;
  patientName: string;
  problem: string;
  specialization: string;
  dateTime: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
}

function App() {
  const [activeTab, setActiveTab] = useState('All Requests');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const hospitalId = 'YOUR_HOSPITAL_ID'; // Replace with actual hospital ID (e.g., from login/auth context)
  const token = localStorage.getItem('token'); // Assuming token is stored after login

  // Fetch appointments from the backend
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        interface ApiResponse {
          appointments: {
            _id: string;
            patientName: string;
            problem: string;
            specialization: string;
            date: string;
            time: string;
            status: string;
          }[];
        }

        const response = await axios.get<ApiResponse>(
          `http://localhost:5000/api/hospitals/${hospitalId}/pending-appointments`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // Transform backend data to match frontend Appointment interface
        const transformedAppointments = response.data.appointments.map((appt) => ({
          id: appt._id,
          patientName: appt.patientName,
          problem: appt.problem,
          specialization: appt.specialization,
          dateTime: `${appt.date.split('T')[0]}, ${appt.time}`, // Combine date and time
          status: appt.status === 'pending' ? 'Pending' : appt.status as 'Pending' | 'Accepted' | 'Rejected', // Explicitly cast status
        }));
        setAppointments(transformedAppointments);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };

    fetchAppointments();
  }, [hospitalId, token]);

  // Handle accept/reject actions
  const handleAccept = async (appointmentId: string) => {
    try {
      await axios.put(
        `http://localhost:5000/api/hospitals/${hospitalId}/appointments/${appointmentId}/status`,
        { status: 'Accepted' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppointments(appointments.map(appointment =>
        appointment.id === appointmentId
          ? { ...appointment, status: 'Accepted' }
          : appointment
      ));
    } catch (error) {
      console.error('Error accepting appointment:', error);
    }
  };

  const handleReject = async (appointmentId: string) => {
    try {
      await axios.put(
        `http://localhost:5000/api/hospitals/${hospitalId}/appointments/${appointmentId}/status`,
        { status: 'Rejected' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppointments(appointments.map(appointment =>
        appointment.id === appointmentId
          ? { ...appointment, status: 'Rejected' }
          : appointment
      ));
    } catch (error) {
      console.error('Error rejecting appointment:', error);
    }
  };

  // Stats calculation
  const stats = {
    today: appointments.filter(a => a.dateTime.includes('2025-04-01')).length,
    accepted: appointments.filter(a => a.status === 'Accepted').length,
    rejected: appointments.filter(a => a.status === 'Rejected').length,
    pending: appointments.filter(a => a.status === 'Pending').length,
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Patient Appointment Requests</h1>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600">Today's Requests</p>
                <p className="text-4xl font-bold">{stats.today}</p>
              </div>
              <Calendar className="text-blue-500 w-6 h-6" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600">Accepted</p>
                <p className="text-4xl font-bold">{stats.accepted}</p>
              </div>
              <Clock className="text-green-500 w-6 h-6" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600">Rejected</p>
                <p className="text-4xl font-bold">{stats.rejected}</p>
              </div>
              <Activity className="text-red-500 w-6 h-6" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600">Pending Requests</p>
                <p className="text-4xl font-bold">{stats.pending}</p>
              </div>
              <Bell className="text-yellow-500 w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <div className="flex gap-2">
              {['All Requests', 'Pending', 'Accepted', 'Rejected'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-md ${
                    activeTab === tab
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 text-sm border-b">
                  <th className="p-4">PATIENT NAME</th>
                  <th className="p-4">PROBLEM</th>
                  <th className="p-4">SPECIALIZATION</th>
                  <th className="p-4">DATE & TIME</th>
                  <th className="p-4">STATUS</th>
                  <th className="p-4">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {appointments
                  .filter(
                    (appointment) =>
                      activeTab === 'All Requests' ||
                      appointment.status === activeTab
                  )
                  .map((appointment) => (
                    <tr key={appointment.id} className="border-b">
                      <td className="p-4">{appointment.patientName}</td>
                      <td className="p-4">{appointment.problem}</td>
                      <td className="p-4">{appointment.specialization}</td>
                      <td className="p-4">{appointment.dateTime}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-sm ${
                            appointment.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : appointment.status === 'Accepted'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {appointment.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {appointment.status === 'Pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAccept(appointment.id)}
                              className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleReject(appointment.id)}
                              className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;