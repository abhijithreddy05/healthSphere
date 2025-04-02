import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, FileText, Pill, Home, Layout, LogOut, ArrowLeft } from 'lucide-react';
import { Link as ScrollLink } from 'react-scroll';
import Appointments from './Appointments';
import EPrescription from './EPrescription';
import PatientRecords from './PatientRecords';

const features = [
  {
    title: "Patient Appointments",
    description: "Schedule and manage your medical appointments with ease. Get instant confirmations and reminders.",
    image: "https://www.bookingpressplugin.com/wp-content/uploads/2023/12/Steps-to-Create-a-Patient-Appointment-Scheduling-System-Banner.webp",
    view: "Appointments",
    icon: Calendar,
  },
  {
    title: "E-Prescription",
    description: "Access your prescriptions digitally and get medications delivered to your doorstep.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVCCZyfbZ8CAC7EoJlqIlspS-UhX75nr50PA&s",
    view: "EPrescription",
    icon: Pill,
  },
  {
    title: "Patient Records",
    description: "Securely store and access your medical history, test results, and health documents.",
    image: "https://5.imimg.com/data5/SELLER/Default/2022/2/NC/OR/OT/2911803/electronic-medical-records-services.jpg",
    view: "PatientRecords",
    icon: FileText,
  },
];

const DoctorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<string | null>(null);

  const handleLogout = () => {
    localStorage.removeItem('doctorToken');
    navigate('/login/doctor');
  };

  const renderView = () => {
    switch (currentView) {
      case 'Appointments':
        return <Appointments />;
      case 'EPrescription':
        return <EPrescription />;
      case 'PatientRecords':
        return <PatientRecords />;
      default:
        return (
          <>
            {/* Hero Section */}
            <section
              id="home"
              className="relative min-h-screen flex items-center"
              style={{
                backgroundImage: 'url(https://www.humanitas.net/content/uploads/2017/10/medical-care.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="absolute inset-0 bg-white opacity-70"></div>
              <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div className="md:w-1/2 text-gray-800">
                    <h1 className="text-5xl font-bold mb-6">Doctor Dashboard</h1>
                    <p className="text-xl mb-8">Manage your appointments, prescriptions, and patient records efficiently.</p>
                    <p className="text-lg mb-8">Providing the best care with advanced tools.</p>
                  </div>
                  <div className="md:w-1/2">
                    <img
                      src="https://static.vecteezy.com/system/resources/thumbnails/036/372/442/small_2x/hospital-building-with-ambulance-emergency-car-on-cityscape-background-cartoon-illustration-vector.jpg"
                      alt="Healthcare"
                      className="rounded-lg shadow-xl"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 relative">
              <div className="absolute inset-0 bg-gray-50 opacity-90"></div>
              <div className="container mx-auto px-6 relative z-10">
                <h2 className="text-4xl font-bold text-center text-gray-800 mb-16">Our Features</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl shadow-lg overflow-hidden transform transition duration-500 hover:scale-105 cursor-pointer"
                      onClick={() => setCurrentView(feature.view)}
                    >
                      <div className="h-48 overflow-hidden">
                        <img
                          src={feature.image}
                          alt={feature.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex items-center mb-4">
                          <feature.icon className="h-6 w-6 text-blue-600 mr-2" />
                          <h3 className="text-xl font-semibold text-gray-800">{feature.title}</h3>
                        </div>
                        <p className="text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        );
    }
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="bg-white shadow-md fixed w-full z-50">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src="https://marketplace.canva.com/EAE8fLYOzrA/1/0/1600w/canva-health-care-bO8TgMWVszg.jpg"
                alt="HealthSphere Logo"
                className="h-8 w-8 object-cover rounded-full"
              />
              <span className="text-2xl font-bold text-gray-800 ml-2">HealthSphere</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <ScrollLink
                to="home"
                spy={true}
                smooth={true}
                offset={-70}
                duration={500}
                className="text-gray-600 hover:text-blue-600 cursor-pointer flex items-center"
              >
                <Home className="h-4 w-4 mr-1" />
                Home
              </ScrollLink>
              <ScrollLink
                to="features"
                spy={true}
                smooth={true}
                offset={-70}
                duration={500}
                className="text-gray-600 hover:text-blue-600 cursor-pointer flex items-center"
              >
                <Layout className="h-4 w-4 mr-1" />
                Features
              </ScrollLink>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-blue-600 flex items-center"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Back to Dashboard Button */}
      {currentView && (
        <div className="fixed top-20 left-4 z-50">
          <button
            onClick={() => setCurrentView(null)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="pt-16">
        {renderView()}
      </div>
    </div>
  );
};

export default DoctorDashboard;