import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function InfoPageHeader() {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/browse');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-black/40 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 md:px-12 h-20 flex items-center">
        <button
          onClick={handleBack}
          className="group flex items-center space-x-2 text-gray-300 transition-all duration-300 hover:text-primary-purple"
        >
          <div className="p-2 rounded-full bg-white/5 group-hover:bg-primary-purple/10 transition-colors">
            <ChevronLeft className="h-6 w-6 transition-transform duration-300 group-hover:-translate-x-1" />
          </div>
          <span className="text-sm font-black uppercase tracking-widest">Back to Home</span>
        </button>
      </div>
    </header>
  );
}
