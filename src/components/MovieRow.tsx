import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import tmdb from '../lib/tmdb';
import { Movie } from '../types';
import MovieCard from './MovieCard';
import { cn } from '../lib/utils';
import useSWR from 'swr';
import { supabaseService } from '../services/supabaseService';

interface MovieRowProps {
  title: string;
  fetchUrl?: string;
  initialMovies?: Movie[];
  onMovieClick: (movie: Movie) => void;
  onViewMore?: () => void;
  typeFilter?: 'movie' | 'tv';
  isTrending?: boolean;
  isLargeRow?: boolean;
  genre?: string;
  isTopRated?: boolean;
  statusFilter?: 'upcoming' | 'ongoing' | 'finished';
  categorySlug?: string;
  region?: string;
  isAnime?: boolean;
  isFocusedRow?: boolean;
  focusedMovieIndex?: number;
  onDataLoaded?: (count: number) => void;
  priorityLoad?: boolean;
}

const fetcher = (url: string) => tmdb.get(url).then(res => res.data.results);

const MovieRowSkeleton = () => (
  <div className="space-y-2 md:space-y-4 py-8 px-4 md:px-12 animate-pulse">
    <div className="h-8 w-48 bg-white/10 rounded-md" />
    <div className="flex space-x-4 overflow-hidden">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="aspect-[2/3] min-w-[150px] md:min-w-[200px] bg-white/5 rounded-xl" />
      ))}
    </div>
  </div>
);

const MovieRow = React.memo(({ 
  title, 
  fetchUrl, 
  initialMovies,
  onMovieClick, 
  onViewMore,
  typeFilter, 
  isTrending,
  isLargeRow,
  genre,
  isTopRated,
  statusFilter,
  categorySlug,
  region,
  isAnime,
  isFocusedRow,
  focusedMovieIndex,
  onDataLoaded,
  priorityLoad
}: MovieRowProps) => {
  const [isVisible, setIsVisible] = useState(priorityLoad || false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: swrMovies, error, isLoading: tmdbLoading } = useSWR(
    ((isVisible || priorityLoad) && (fetchUrl || isAnime)) ? (fetchUrl || '/trending/all/week') : null, 
    fetcher, 
    {
      revalidateOnFocus: false,
      dedupingInterval: 1000 * 60 * 5, // 5 minutes
    }
  );

  const [movies, setMovies] = useState<Movie[]>(initialMovies || []);
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);

  useEffect(() => {
    if (priorityLoad) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '400px' } // Start loading 400px before it enters the viewport
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const [supabaseMovies, setSupabaseMovies] = useState<Movie[]>([]);
  const [supabaseLoading, setSupabaseLoading] = useState(false);

  useEffect(() => {
    if ((isVisible || priorityLoad) && categorySlug && !fetchUrl && !isAnime) {
      const fetchFromSupabase = async () => {
        setSupabaseLoading(true);
        try {
          // Special categories
          let filters: any = { limit: 12, excludeAdult: true };
          if (categorySlug === 'trending') filters.sortBy = 'Hottest';
          else if (categorySlug === 'latest') filters.sortBy = 'Latest';
          else if (categorySlug === 'most-watched') filters.sortBy = 'Most Watched';
          else filters.category = categorySlug;

          if (region) filters.region = region;
          if (isAnime) filters.isAnime = true;

          const { data } = await supabaseService.getMovies(filters);
          setSupabaseMovies(data as Movie[]);
          onDataLoaded?.(data?.length || 0);
        } catch (err) {
          console.error("Supabase fetch error in MovieRow:", err);
        } finally {
          setSupabaseLoading(false);
        }
      };
      fetchFromSupabase();
    }
  }, [isVisible, priorityLoad, categorySlug, fetchUrl, isAnime, region]);

  const isLoading = tmdbLoading || supabaseLoading;

  useEffect(() => {
    if (initialMovies) {
      setMovies(initialMovies);
      onDataLoaded?.(initialMovies.length);
    } else if (swrMovies) {
      setMovies(swrMovies);
      onDataLoaded?.(swrMovies.length);
    } else if (supabaseMovies.length > 0) {
      setMovies(supabaseMovies);
    }
  }, [swrMovies, initialMovies, supabaseMovies]); // Removed onDataLoaded from dependencies 

  const handleScroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const onScroll = () => {
    if (rowRef.current) {
      setShowLeftArrow(rowRef.current.scrollLeft > 0);
    }
  };

  if (!isVisible && !initialMovies) {
    return (
      <div ref={containerRef} className="h-64 flex items-center justify-center">
        <div className="w-full max-w-[200px] h-8 bg-white/5 rounded-full animate-pulse" />
      </div>
    );
  }

  if (isLoading && !initialMovies) {
    return <MovieRowSkeleton />;
  }

  return (
    <div ref={containerRef} className="space-y-2 md:space-y-4 py-[40px] last:mb-20">
      <div className="flex items-center justify-between px-4 md:px-12">
        <h2 
          onClick={onViewMore}
          className="text-lg md:text-2xl font-bold text-[#e5e5e5] hover:text-white transition cursor-pointer"
        >
          {title}
        </h2>
        {onViewMore && (
          <button 
            onClick={onViewMore}
            className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-primary-purple transition-all flex items-center gap-2 group px-4 py-1.5 rounded-full border border-white/5 hover:border-primary-purple/30 hover:bg-primary-purple/5 backdrop-blur-sm shadow-[0_0_15px_rgba(0,0,0,0.3)]"
          >
            View More
            <ChevronRight className="h-3 w-3 md:h-4 md:w-4 group-hover:translate-x-1.5 transition-transform duration-300" />
          </button>
        )}
      </div>

      <div className="group relative">
        <button
          className={cn(
            "absolute top-0 bottom-0 left-0 z-[60] w-12 md:w-16 bg-black/40 hover:bg-black/70 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100",
            !showLeftArrow && "hidden"
          )}
          onClick={() => handleScroll('left')}
        >
          <ChevronLeft className="h-8 w-8 text-white" />
        </button>

          {/* 
            STRICT USER REQUIREMENT: overflow-x-auto AND overflow-y-visible 
            To allow the hover card to expand outside the row without clipping, 
            we add substantial padding and negative margin to keep it appearing visually normal.
          */}
          <div
            ref={rowRef}
            onScroll={onScroll}
            className="flex items-center space-x-2 md:space-x-4 overflow-x-auto overflow-y-visible no-scrollbar px-4 md:px-12 pt-32 pb-32 -my-32"
          >
            {Array.from(new Map(movies.map(m => [m.id, m])).values()).map((movie, index) => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                index={index} 
                onMovieClick={onMovieClick} 
                isTrendingRow={isTrending || categorySlug === 'trending'}
                isMostWatchedRow={categorySlug === 'most-watched'}
                priority={priorityLoad}
              />
            ))}
          </div>

        <button
          className="absolute top-0 bottom-0 right-0 z-[60] w-12 md:w-16 bg-black/40 hover:bg-black/70 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
          onClick={() => handleScroll('right')}
        >
          <ChevronRight className="h-8 w-8 text-white" />
        </button>
      </div>
    </div>
  );
});

export default MovieRow;
