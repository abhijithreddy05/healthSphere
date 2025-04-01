import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Bed, Calendar, Package, Home, Layout, LogOut, ArrowLeft } from 'lucide-react';
import { Link as ScrollLink } from 'react-scroll';
import StaffManagement from './StaffManagement';
import BedManagement from './BedManagement';
import AppointmentRequests from './AppointmentRequests';
import StockManagement from './StockManagement';

const features = [
  {
    title: "Staff Management",
    description: "Efficiently manage healthcare staff schedules, assignments, and performance tracking",
    image: "https://www.shutterstock.com/image-photo/closeup-healthcare-professional-scrubs-arms-260nw-2483848893.jpg",
    view: "StaffManagement",
    icon: Users,
  },
  {
    title: "Bed Management",
    description: "Real-time monitoring and allocation of hospital beds for optimal patient care",
    image: "https://bdtask.com/blog/assets/plugins/ckfinder/core/connector/php/uploads/images/time-to-end-the-waiting-game.jpg",
    view: "BedManagement",
    icon: Bed,
  },
  {
    title: "Appointment Requests",
    description: "Streamlined appointment scheduling and management system",
    image: "https://www.bigscal.com/wp-content/uploads/2023/12/Best-Clinic-Appointment-Management-System-Software-For-2023-24.webp",
    view: "AppointmentRequests",
    icon: Calendar,
  },
  {
    title: "Medical Stock Management",
    description: "Comprehensive inventory control system for medical supplies and equipment",
    image: "https://cdn.open-pr.com/T/3/T304504218_g.jpg",
    view: "StockManagement",
    icon: Package,
  },
];

const HospitalDashboard = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<string | null>(null);

  const handleLogout = () => {
    localStorage.removeItem('hospitalToken');
    navigate('/login/hospital');
  };

  const renderView = () => {
    switch (currentView) {
      case 'StaffManagement':
        return <StaffManagement />;
      case 'BedManagement':
        return <BedManagement />;
      case 'AppointmentRequests':
        return <AppointmentRequests />;
      case 'StockManagement':
        return <StockManagement />;
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
                    <h1 className="text-5xl font-bold mb-6">Advanced Healthcare Solutions</h1>
                    <p className="text-xl mb-8">Transforming healthcare delivery with innovative technology</p>
                    <p className="text-lg mb-8">Experience the future of medical care management</p>
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
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
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

      {/* Main Content */}
      <div className="pt-16">
        {currentView && (
          <button
            onClick={() => setCurrentView(null)}
            className="fixed top-20 left-4 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
        )}
        {renderView()}
      </div>
    </div>
  );
};

export default HospitalDashboard;