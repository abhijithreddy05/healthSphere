import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

interface SpecialtiesListProps {
  onSelectSpecialty: (specialty: string) => void;
}

const SpecialtiesList: React.FC<SpecialtiesListProps> = ({ onSelectSpecialty }) => {
  const [specialties, setSpecialties] = useState<{ name: string; image: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const scrollContainer = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const response = await axios.get('http://localhost:3000/patients/specializations');
        // Add a default image since the backend doesn't provide one
        const data = response.data as { specializations: string[] };
        const specialtiesWithImages = data.specializations.map((specialty: string) => ({
          name: specialty,
          image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528', // Default image
        }));
        setSpecialties(specialtiesWithImages);
      } catch (err: any) {
        setError('Failed to load specialties');
        console.error('Error fetching specialties:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialties();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainer.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollContainer.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (loading) return <div className="text-center text-gray-500">Loading specialties...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="relative">
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white p-2 rounded-full shadow-lg z-10"
      >
        <ChevronLeft size={24} />
      </button>
      <div
        ref={scrollContainer}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide py-4 px-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {specialties.map((specialty) => (
          <div
            key={specialty.name}
            className="flex-none w-64 snap-center cursor-pointer transform hover:scale-105 transition-transform duration-200"
            onClick={() => onSelectSpecialty(specialty.name)}
          >
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <img
                src={specialty.image}
                alt={specialty.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-900">{specialty.name}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white p-2 rounded-full shadow-lg z-10"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};

export default SpecialtiesList;