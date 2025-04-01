import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import SpecialtiesList from './SpecialtiesList';
import HospitalsList from './HospitalsList';
import DoctorsList from './DoctorsList';
import AppointmentBooking from './AppointmentBooking';
import axios from 'axios';

export type Step = 'landing' | 'specialties-hospitals' | 'hospitals-specialties' | 'doctors' | 'booking';

interface DecodedToken {
  id: string;
  email: string;
  iat: number;
  exp: number;
}

function AppointmentBookingPage() {
  const [currentStep, setCurrentStep] = useState<Step>('landing');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [selectedHospital, setSelectedHospital] = useState<{ id: string; name: string }>({ id: '', name: '' });
  const [selectedDoctor, setSelectedDoctor] = useState<{ id: string; name: string }>({ id: '', name: '' });
  const [bookingPath, setBookingPath] = useState<'specialty-first' | 'hospital-first' | null>(null);
  const [patientId, setPatientId] = useState<string>('');
  const [isBookingSubmitted, setIsBookingSubmitted] = useState(false);
  const [hospitalSpecialties, setHospitalSpecialties] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('patientToken');
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        setPatientId(decoded.id);
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('patientToken');
        navigate('/login/patient');
      }
    } else {
      navigate('/login/patient');
    }
  }, [navigate]);

  useEffect(() => {
    if (currentStep === 'hospitals-specialties' && selectedHospital.id) {
      const fetchHospitalSpecialties = async () => {
        try {
          const response = await axios.get(
            `http://localhost:3000/appointments/hospitals/${selectedHospital.id}/specializations`
          );
          setHospitalSpecialties(response.data.specializations);
        } catch (err: any) {
          console.error('Error fetching hospital specialties:', err);
        }
      };
      fetchHospitalSpecialties();
    }
  }, [currentStep, selectedHospital.id]);

  const goBack = () => {
    switch (currentStep) {
      case 'specialties-hospitals':
      case 'hospitals-specialties':
        setCurrentStep('landing');
        setSelectedSpecialty('');
        setSelectedHospital({ id: '', name: '' });
        setBookingPath(null);
        break;
      case 'doctors':
        setCurrentStep(bookingPath === 'specialty-first' ? 'specialties-hospitals' : 'hospitals-specialties');
        setSelectedDoctor({ id: '', name: '' });
        break;
      case 'booking':
        setCurrentStep('doctors');
        setIsBookingSubmitted(false);
        break;
    }
  };

  if (!patientId) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{
        backgroundImage: `url('https://www.shutterstock.com/image-photo/doctors-hands-gloves-holding-mans-260nw-1701905974.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <header className="bg-white shadow-md fixed w-full z-10 top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <img
              src="https://marketplace.canva.com/EAE8fLYOzrA/1/0/1600w/canva-health-care-bO8TgMWVszg.jpg"
              alt="Healthsphere Logo"
              className="h-12 w-auto"
            />
            <h1 className="ml-4 text-2xl font-bold text-indigo-600">Healthsphere</h1>
          </div>
          <nav className="space-x-6 flex items-center">
            <Link
              to="/patient-dashboard"
              className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/25/25694.png"
                alt="Back to Dashboard Icon"
                className="h-5 w-5 mr-1"
              />
              Back to Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <div className="pt-24 pb-16">
        {currentStep !== 'landing' && (
          <button
            onClick={goBack}
            className="fixed top-20 left-4 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
        )}

        {currentStep === 'landing' && (
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                  Book Your Medical Appointment Online
                </h1>
                <div className="space-y-4">
                  <p className="text-lg text-gray-600">
                    Schedule appointments with top healthcare specialists in your area with just a few clicks.
                  </p>
                  <p className="text-lg text-gray-600">
                    Access video consultations and in-person visits based on your convenience.
                  </p>
                  <p className="text-lg text-gray-600">
                    Choose from a wide network of hospitals and experienced doctors.
                  </p>
                </div>
              </div>
              <div className="hidden md:block">
                <img
                  src="https://www.shutterstock.com/image-vector/book-your-doctor-online-patient-600nw-1776815561.jpg"
                  alt="Online Doctor Booking"
                  className="rounded-lg shadow-xl w-full"
                />
              </div>
            </div>

            <div className="space-y-20">
              <div>
                <h2 className="text-3xl font-bold text-center mb-8">Browse by Specialty</h2>
                <SpecialtiesList
                  onSelectSpecialty={(specialty) => {
                    setSelectedSpecialty(specialty);
                    setBookingPath('specialty-first');
                    setCurrentStep('specialties-hospitals');
                  }}
                />
              </div>

              <div>
                <h2 className="text-3xl font-bold text-center mb-8">Browse by Hospital</h2>
                <HospitalsList
                  specialty={null}
                  onSelectHospital={(hospital) => {
                    setSelectedHospital(hospital);
                    setBookingPath('hospital-first');
                    setCurrentStep('hospitals-specialties');
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 'specialties-hospitals' && (
          <div className="container mx-auto px-4 py-12">
            <h2 className="text-3xl font-bold text-center mb-12">
              Select a Hospital for {selectedSpecialty}
            </h2>
            <HospitalsList
              specialty={selectedSpecialty}
              onSelectHospital={(hospital) => {
                setSelectedHospital(hospital);
                setCurrentStep('doctors');
              }}
            />
          </div>
        )}

        {currentStep === 'hospitals-specialties' && (
          <div className="container mx-auto px-4 py-12">
            <h2 className="text-3xl font-bold text-center mb-12">
              Select a Specialty at {selectedHospital.name}
            </h2>
            <SpecialtiesList
              hospitalId={selectedHospital.id} // Pass hospitalId
              onSelectSpecialty={(specialty) => {
                setSelectedSpecialty(specialty);
                setCurrentStep('doctors');
              }}
            />
          </div>
        )}

        {currentStep === 'doctors' && (
          <DoctorsList
            hospital={selectedHospital}
            specialty={selectedSpecialty}
            onSelectDoctor={(doctor) => {
              setSelectedDoctor(doctor);
              setCurrentStep('booking');
            }}
          />
        )}

        {currentStep === 'booking' && (
          <AppointmentBooking
            hospital={selectedHospital}
            specialty={selectedSpecialty}
            doctor={selectedDoctor}
            patientId={patientId}
            onBookingSubmit={() => setIsBookingSubmitted(true)}
            isBookingSubmitted={isBookingSubmitted}
          />
        )}
      </div>
    </div>
  );
}

export default AppointmentBookingPage;