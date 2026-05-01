import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Info, Loader2, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import InteractiveIcon from './InteractiveIcon';
import tmdb, { requests } from '../lib/tmdb';
import { Movie } from '../types';
import MovieModal from './MovieModal';
import { cn } from '../lib/utils';

import { MOCK_MOVIES } from '../lib/mockData';
import { supabaseService } from '../services/supabaseService';

export default function Hero() {
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn("Hero fetch timed out. Using mock data.");
        setTrendingMovies(MOCK_MOVIES.slice(0, 10));
        setLoading(false);
      }
    }, 5000);

    async function fetchTrending() {
      try {
        // Try Supabase first
        const { data: supabaseMovies } = await supabaseService.getMovies({ limit: 10, sortBy: 'Hottest' });
        
        let movies: Movie[] = [];
        if (supabaseMovies && supabaseMovies.length > 0) {
          movies = supabaseMovies as Movie[];
        } else {
          const { data } = await tmdb.get(requests.fetchTrending);
          movies = data.results.slice(0, 10);
        }

        // Ensure "Synthetic Age" or "The Boys" feel by adding a custom entry if needed
        // or just ensuring the first one is prominent
        setTrendingMovies(movies);
        clearTimeout(timeoutId);
      } catch (error) {
        console.error("Error fetching trending for hero:", error);
        setTrendingMovies(MOCK_MOVIES.slice(0, 10));
        clearTimeout(timeoutId);
      } finally {
        setLoading(false);
      }
    }
    fetchTrending();
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (isPaused || trendingMovies.length === 0 || showModal) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % trendingMovies.length);
    }, 8000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, trendingMovies.length, showModal]);

  if (loading) {
    return (
      <div className="relative h-full w-full flex items-center justify-center bg-[#050505]">
        <div className="relative">
          <div className="h-24 w-24 border-4 border-primary-purple border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-12 w-12 border-4 border-primary-magenta border-b-transparent rounded-full animate-spin-reverse" />
          </div>
        </div>
      </div>
    );
  }

  const currentMovie = trendingMovies[currentIndex];

  if (!currentMovie) return null;

  return (
    <div className="relative w-full h-[85vh] lg:h-[95vh] overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMovie.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          {/* Background Image with Cinematic Overlay */}
          <div className="absolute inset-0 w-full h-full">
            <img 
              src={
                currentMovie.backdrop_path?.startsWith('http') 
                  ? currentMovie.backdrop_path 
                  : `https://image.tmdb.org/t/p/original${currentMovie.backdrop_path}`
              }
              className="h-full w-full object-cover"
              alt={currentMovie.title || currentMovie.name}
              referrerPolicy="no-referrer"
              loading="eager"
            />
            
            {/* Dark Cinematic Gradients */}
            {/* UNIFLEX-style left-shadow overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
            {/* UNIFLEX-style bottom-shadow overlay that blends with the content rows */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          </div>

          {/* Featured Content Overlay */}
          <div className="relative z-10 flex h-full flex-col justify-center px-6 md:px-16 lg:px-24">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="max-w-3xl space-y-6"
            >
              {/* Category/Genre Badge */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center gap-2 px-3 py-1 bg-primary-purple/20 backdrop-blur-md border border-primary-purple/30 rounded-full">
                  <Sparkles className="h-3 w-3 text-primary-purple animate-pulse" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">
                    Featured {currentMovie.media_type === 'tv' ? 'Series' : 'Film'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-[10px] font-black text-white/60 uppercase tracking-widest">
                  {currentMovie.genres?.slice(0, 3).map((g: any, i: number) => (
                    <React.Fragment key={i}>
                      <span>{typeof g === 'string' ? g : g.name}</span>
                      {i < 2 && currentMovie.genres && i < currentMovie.genres.length - 1 && <span className="opacity-30">•</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              
              {/* Massive Title */}
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-tighter leading-[0.95] drop-shadow-2xl">
                {currentMovie.title || currentMovie.name}
              </h1>
              
              {/* Meta Info */}
              <div className="flex items-center space-x-4 text-xs md:text-sm font-black text-white uppercase tracking-widest drop-shadow-md">
                <span className="text-green-500">{Math.round(currentMovie.vote_average * 10)}% Match</span>
                <span className="text-white/60">{(currentMovie.release_date || currentMovie.first_air_date || '2024').split('-')[0]}</span>
                <span className="px-1.5 py-0.5 border border-white/40 rounded text-[8px] md:text-[10px]">ULTRA HD 4K</span>
                <span className="px-1.5 py-0.5 border border-white/40 rounded text-[8px] md:text-[10px]">ATMOS</span>
              </div>

              {/* Short Cinematic Description */}
              <p className="text-base md:text-xl text-white/80 font-medium max-w-2xl leading-relaxed line-clamp-2 drop-shadow-lg">
                {currentMovie.overview}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-4">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    console.log("Action Triggered: Hero Play ->", currentMovie.title || currentMovie.name);
                    navigate(`/watch/${currentMovie.id}`);
                  }}
                  className="flex items-center gap-x-3 rounded-md bg-white px-8 md:px-12 py-3 md:py-4 text-sm md:text-lg font-black text-black transition-all shadow-2xl hover:bg-white/90"
                >
                  <Play className="h-6 w-6 fill-black" />
                  Play
                </motion.button>
                
                <motion.button 
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.3)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    console.log("Action Triggered: Hero More Info ->", currentMovie.title || currentMovie.name);
                    setShowModal(true);
                  }}
                  className="flex items-center gap-x-3 rounded-md bg-white/20 backdrop-blur-md border border-white/10 px-8 md:px-12 py-3 md:py-4 text-sm md:text-lg font-black text-white transition-all shadow-xl"
                >
                  <Info className="h-6 w-6" />
                  More Info
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Modern Carousel Indicators */}
      <div className="absolute bottom-16 right-6 md:right-16 z-30 flex items-center space-x-2">
        {trendingMovies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "h-1 transition-all duration-500 rounded-full",
              currentIndex === index ? "w-8 bg-primary-purple shadow-[0_0_10px_#9945FF]" : "w-2 bg-white/30 hover:bg-white/50"
            )}
          />
        ))}
      </div>

      {/* Bottom Border Accent */}
      <div className="absolute bottom-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary-purple/50 to-transparent opacity-50" />

      {/* Movie Modal */}
      <AnimatePresence>
        {showModal && (
          <MovieModal 
            movie={currentMovie} 
            onClose={() => setShowModal(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
