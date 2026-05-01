import React from 'react';
import { Star, PlayCircle, Sparkles, Download, CheckCircle2 } from 'lucide-react';
import { Movie } from '../types';
import { useAuth } from '../context/AuthContext';
import { genreMap } from '../constants/genres';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface MovieCardProps {
  movie: Movie;
  onMovieClick: (movie: Movie) => void;
  index?: number;
  isTrendingRow?: boolean;
  isMostWatchedRow?: boolean;
  priority?: boolean;
}

export default React.memo(function MovieCard({ 
  movie, 
  onMovieClick, 
  index = 0,
  isTrendingRow,
  isMostWatchedRow,
  priority = false,
}: MovieCardProps) {
  const { userData, toggleDownload } = useAuth();
  
  const mainProfile = userData?.profiles?.[0];
  const isDownloaded = mainProfile?.downloads?.some(m => m.id === movie.id);
  const mainGenre = movie.genre_ids ? genreMap[movie.genre_ids[0]] : 'Movie';

  const posterUrl = movie.poster_path 
    ? (movie.poster_path.startsWith('http') ? movie.poster_path : `https://image.tmdb.org/t/p/w500${movie.poster_path}`)
    : (movie.backdrop_path 
      ? (movie.backdrop_path.startsWith('http') ? movie.backdrop_path : `https://image.tmdb.org/t/p/w500${movie.backdrop_path}`)
      : null);

  const placeholderImg = 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&q=80&w=500';

  return (
    <div className={cn(
      "flex items-center group relative h-full",
      isTrendingRow ? "min-w-[170px] md:min-w-[240px]" : "min-w-[150px] md:min-w-[200px]"
    )}>
      {/* Rank Number for Trending Row */}
      {isTrendingRow && index < 10 && (
        <div className="relative z-10 -mr-16 md:-mr-24 pointer-events-none select-none overflow-visible">
          <span className="text-[180px] md:text-[280px] font-black leading-none tracking-tighter text-transparent transition-all duration-500 group-hover:scale-110 drop-shadow-[0_0_30px_rgba(153,69,255,0.4)]" 
                style={{ 
                  WebkitTextStroke: '4px rgba(255,255,255,0.8)',
                  fontFamily: 'unset'
                }}>
            {index + 1}
          </span>
        </div>
      )}

      <motion.div 
        whileHover={{ 
          scale: 1.3, 
          y: -40,
          zIndex: 100,
          transition: { delay: 0.3, duration: 0.4, ease: "easeOut" }
        }}
        className={cn(
          "relative aspect-[2/3] w-full cursor-pointer rounded-xl transition-all duration-500 shadow-2xl overflow-hidden bg-zinc-900 border border-white/5 group-hover:border-primary-purple/50 group-hover:shadow-[0_0_40px_rgba(153,69,255,0.4)]",
          "poster-ratio"
        )}
        onClick={() => {
          console.log("Movie Clicked:", movie.id);
          onMovieClick(movie);
        }}
      >
        {/* Play Icon Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center">
          <PlayCircle className="h-12 w-12 text-white fill-white/10 filter drop-shadow-[0_0_20px_rgba(153,69,255,0.7)]" />
        </div>

        {/* Image Source with Placeholder Logic */}
        {!posterUrl ? (
          <div className="w-full h-full bg-gradient-to-br from-[#1a103d] to-black flex flex-col items-center justify-center p-4 border border-white/10 relative overflow-hidden">
             <div className="absolute inset-0 bg-primary-purple/10 animate-pulse" />
             <div className="z-10 text-center">
                <span className="text-primary-purple font-black text-xl tracking-[0.2em] mb-2 block">UNIFLEX</span>
                <p className="text-white font-black text-[10px] px-2 line-clamp-2">{movie.title || movie.name}</p>
             </div>
          </div>
        ) : (
          <img 
            src={posterUrl} 
            alt={movie.title || movie.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            referrerPolicy="no-referrer"
            loading={priority ? "eager" : "lazy"}
            onError={(e) => {
              (e.target as HTMLImageElement).src = placeholderImg;
            }}
          />
        )}

        {/* Badges and Download Button */}
        <div className="absolute top-2 right-2 z-30 flex flex-col gap-1 items-end">
          {isTrendingRow && index < 10 && (
            <div className="bg-red-600 text-[8px] font-black px-2 py-0.5 rounded shadow-lg uppercase tracking-tighter text-white border border-white/20">
              TOP 10
            </div>
          )}
          
          {userData && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log("Toggle Download:", movie.id);
                toggleDownload(movie);
              }}
              className={cn(
                "mt-1 p-1.5 rounded-full backdrop-blur-md border transition-all duration-300",
                isDownloaded 
                  ? "bg-green-500/20 border-green-500/50 text-green-400 opacity-100" 
                  : "bg-black/60 border-white/10 text-white/70 hover:text-white hover:bg-primary-purple/40 hover:border-primary-purple/50 opacity-0 group-hover:opacity-100"
              )}
            >
              {isDownloaded ? <CheckCircle2 className="w-3 h-3" /> : <Download className="w-3 h-3" />}
            </button>
          )}
        </div>

        {/* Footer Info Overlay on Hover */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300">
           <div className="flex items-center justify-between mb-1">
             <span className="text-[9px] font-black text-white truncate max-w-[120px]">
               {movie.title || movie.name}
             </span>
             <div className="flex items-center">
               <Star className="h-2 w-2 text-yellow-500 fill-current mr-1" />
               <span className="text-[9px] font-black text-white">{movie.vote_average?.toFixed(1) || '8.0'}</span>
             </div>
           </div>
           <div className="flex items-center justify-between">
             <span className="text-[8px] font-bold text-gray-400">
               {movie.release_date?.split('-')[0] || '2024'} • {mainGenre}
             </span>
             <span className="text-[8px] font-black text-primary-purple bg-primary-purple/10 px-1 rounded border border-primary-purple/20">
               4K
             </span>
           </div>
        </div>
      </motion.div>
    </div>
  );
});
