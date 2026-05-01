import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface CastCardProps {
  id: number | string;
  name: string;
  character: string;
  profilePath: string | null;
  className?: string;
}

export default function CastCard({ id, name, character, profilePath, className }: CastCardProps) {
  const navigate = useNavigate();

  const handleActorSearch = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/search?q=${encodeURIComponent(name)}&actor=true`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn("group cursor-pointer space-y-3", className)}
      onClick={handleActorSearch}
    >
      <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group-hover:border-primary-purple transition-all duration-500 shadow-2xl group-hover:shadow-primary-purple/20">
        {profilePath ? (
          <img 
            src={`https://image.tmdb.org/t/p/w185${profilePath}`}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-white/5 to-white/10 flex flex-col items-center justify-center space-y-2">
            <User className="h-8 w-8 text-gray-700 group-hover:text-primary-purple transition-colors" />
            <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
              {name.split(' ').map(n => n[0]).join('')}
            </div>
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
          <div className="p-3 rounded-full bg-primary-purple/80 text-white shadow-lg transform scale-50 group-hover:scale-100 transition-transform">
            <Search className="h-4 w-4" />
          </div>
        </div>
        
        {/* Border Glow Effect */}
        <div className="absolute inset-0 border-2 border-primary-purple/0 rounded-2xl group-hover:border-primary-purple/40 transition-all pointer-events-none" />
      </div>

      <div className="text-center md:text-left">
        <h4 className="text-sm font-black text-white line-clamp-1 group-hover:text-primary-purple transition-colors">{name}</h4>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider line-clamp-1 italic">{character}</p>
      </div>

      {/* Tooltip */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-2xl">
        See all movies with {name}
      </div>
    </motion.div>
  );
}
