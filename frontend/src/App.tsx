import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy-loaded pages
const Home = lazy(() => import('./pages/Home'));
const UserSelection = lazy(() => import('./pages/UserSelection'));
const Login = lazy(() => import('./components/Login'));
const PatientRegister = lazy(() => import('./components/PatientRegister'));
const Patient = lazy(() => import('./pages/Patient'));
const PatientHistory = lazy(() => import('./pages/AppointmentBooking/PatientHistory')); // Added import
const AppointmentBookingMain = lazy(() => import('./pages/AppointmentBooking/AppointmentBookingPage'));
// const HospitalDashboard = lazy(() => import('./pages/Hospital/HospitalDashboard'));
// const DoctorDashboard = lazy(() => import('./pages/doctor/DoctorDashboard'));

const App = () => {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Log the client ID to debug
  console.log('Google Client ID:', googleClientId);

  // Conditionally render GoogleOAuthProvider only if clientId is available
  const renderWithGoogleOAuth = (children: React.ReactNode) => {
    if (googleClientId) {
      return (
        <GoogleOAuthProvider clientId={googleClientId}>
          {children}
        </GoogleOAuthProvider>
      );
    }
    return <>{children}</>;
  };

  return (
    <Router>
      <Suspense fallback={<div className="text-center text-gray-500">Loading...</div>}>
        {renderWithGoogleOAuth(
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/user-selection" element={<UserSelection />} />
            <Route path="/login/:userType" element={<Login />} />
            <Route path="/signup/patient" element={<PatientRegister />} />
            <Route
              path="/patient-dashboard"
              element={
                <ProtectedRoute>
                  <Patient />
                </ProtectedRoute>
              }
            />
            <Route
              path="/PatientHistory" // Added route for PatientHistory
              element={
                <ProtectedRoute>
                  <PatientHistory />
                </ProtectedRoute>
              }
            />
            {/* <Route
              path="/hospital-dashboard"
              element={
                <ProtectedRoute>
                  <HospitalDashboard />
                </ProtectedRoute>
              }
            /> */}
            {/* <Route
              path="/doctor-dashboard"
              element={
                <ProtectedRoute>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            /> */}
            <Route
              path="/appointments"
              element={
                <ProtectedRoute>
                  <AppointmentBookingMain />
                </ProtectedRoute>
              }
            />
            <Route path="/symptom-prediction" element={<div>Symptom Prediction Page</div>} />
            <Route path="/xray-prediction" element={<div>X-Ray Prediction Page</div>} />
            <Route path="/fitness" element={<div>Fitness Page</div>} />
            <Route path="/chatbot" element={<div>Chatbot Page</div>} />
            <Route path="/reports" element={<div>Reports Page</div>} />
            <Route path="/pill-identification" element={<div>Pill Identification Page</div>} />
            <Route path="/pill-reminders" element={<div>Pill Reminders Page</div>} />
            <Route path="/health-tracking" element={<div>Health Tracking Page</div>} />
            <Route path="/emergency" element={<div>Emergency Page</div>} />
          </Routes>
        )}
      </Suspense>
    </Router>
  );
};

export default App;