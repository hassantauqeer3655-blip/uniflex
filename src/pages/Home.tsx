import React, { useState, useEffect, lazy, Suspense, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import Hero from '../components/Hero';
import FilterBar, { FilterState } from '../components/FilterBar';
import tmdb, { requests } from '../lib/tmdb';
import { Movie } from '../types';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';
import { Loader2, Film, ChevronLeft, Sparkles } from 'lucide-react';
import { MOCK_MOVIES } from '../lib/mockData';
import { supabaseService } from '../services/supabaseService';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';

const MovieRow = lazy(() => import('../components/MovieRow'));
const MovieCard = lazy(() => import('../components/MovieCard'));

const RowSkeleton = () => (
  <div className="space-y-4 px-4 md:px-12 mt-12 mb-20 animate-pulse">
    <div className="h-8 w-48 bg-white/10 rounded-md" />
    <div className="flex gap-6 overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="aspect-[2/3] min-w-[200px] md:min-w-[280px] bg-white/5 rounded-xl border border-white/5" />
      ))}
    </div>
  </div>
);

export default function Home() {
  const navigate = useNavigate();
  const { userData, loading: authLoading } = useAuth();
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    searchQuery: '',
    genre: 'All',
    country: 'All',
    year: 'All',
    language: 'All',
    sortBy: 'For You'
  });
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [trending, setTrending] = useState<Movie[]>([]);
  const [focusedRowIndex, setFocusedRowIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchUniversalTrending = async () => {
      try {
        const response = await tmdb.get(requests.fetchTrending);
        setTrending(response.data.results || []);
      } catch (err) {
        console.error("Home trending fetch failed:", err);
      }
    };
    fetchUniversalTrending();

    const fetchCategories = async () => {
      try {
        const cats = await supabaseService.getCategories();
        // Filter out categories that are already handled by special rows or requested to be removed
        const filteredCats = cats.filter(c => 
          !['Trending', 'Latest', 'Most Watched', 'Trending Now', 'Featured'].includes(c)
        );
        setCategories(filteredCats);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();

    // Set up Real-time listener for new content
    const channel = supabase
      .channel('content-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'content' },
        () => {
          fetchCategories();
          // We can also trigger a global refresh if needed, 
          // but MovieRow will re-fetch when it becomes visible or if we use a global key
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  const trendingNow = React.useMemo(() => {
    const featuredIds = ['mock-we-1', 'mock-pk-1', 'mock-we-2', 'mock-pk-2'];
    const featured = MOCK_MOVIES.filter(m => featuredIds.includes(m.id))
      .sort((a, b) => featuredIds.indexOf(a.id) - featuredIds.indexOf(b.id))
      .map(m => ({ ...m, trendingScore: 100 - featuredIds.indexOf(m.id) }));

    const others = MOCK_MOVIES.filter(m => !featuredIds.includes(m.id)).slice(0, 6);
    
    return [...featured, ...others];
  }, []);
  const pakistaniContent = React.useMemo(() => MOCK_MOVIES.filter(m => m.category === 'Pakistani' || m.region === 'Pakistani'), []);
  const westernContent = React.useMemo(() => MOCK_MOVIES.filter(m => m.category === 'Western'), []);

  const [rowMovieCounts, setRowMovieCounts] = useState<Record<number, number>>({});
  const { registerModal, unregisterModal } = useNavigation();

  // Instant Entry: Handle loading gracefully
  const showContent = !authLoading;

  const handleMovieClick = useCallback((movie: Movie) => {
    navigate(`/movie/${movie.id}`);
  }, [navigate]);

  const updateMovieCount = useCallback((index: number, count: number) => {
    setRowMovieCounts(prev => {
      if (prev[index] === count) return prev;
      return { ...prev, [index]: count };
    });
  }, []);

  const isAnyFilterActive = activeFilters.genre !== 'All' || 
                           activeFilters.country !== 'All' || 
                           activeFilters.year !== 'All' || 
                           activeFilters.language !== 'All' ||
                           activeFilters.searchQuery !== '';

  useEffect(() => {
    if (!isAnyFilterActive) {
      setFilteredMovies([]);
      return;
    }

    const fetchFilteredMovies = async () => {
      setIsFiltering(true);
      try {
        const { data: movies } = await supabaseService.getMovies({
          category: activeFilters.genre !== 'All' ? activeFilters.genre : undefined,
          region: activeFilters.country !== 'All' ? activeFilters.country : undefined,
          year: activeFilters.year !== 'All' ? activeFilters.year : undefined,
          language: activeFilters.language !== 'All' ? activeFilters.language : undefined,
          search: activeFilters.searchQuery || undefined,
          sortBy: activeFilters.sortBy as any,
          excludeAdult: true
        });

        if (movies) {
          // Strict deduplication by ID
          const uniqueMovies = Array.from(new Map(movies.map(m => [m.id, m])).values());
          setFilteredMovies(uniqueMovies as Movie[]);
        } else {
          setFilteredMovies([]);
        }
      } catch (error) {
        console.error("Error fetching filtered movies:", error);
        setFilteredMovies([]);
      } finally {
        setIsFiltering(false);
      }
    };

    fetchFilteredMovies();
  }, [activeFilters, isAnyFilterActive]);

  return (
    <PageLayout showBackButton={false} fullBleed={true}>
      {!showContent && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
          <div className="h-16 w-16 border-4 border-primary-purple border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      <main className="flex flex-col min-h-screen">
        {/* Hero Section Container */}
        <section className="relative h-[70vh] min-h-[500px] flex-shrink-0">
          <Hero />
        </section>

        {/* Filter Bar Section */}
        <section className="relative z-30 px-4 lg:px-12 -mt-20 pb-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] px-8 py-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <FilterBar 
              activeFilters={activeFilters} 
              onFilterChange={setActiveFilters} 
            />
          </div>
        </section>

        {/* Content Rows Container */}
        <section className="relative z-10 pb-12 space-y-10 px-4 lg:px-12">
          {isAnyFilterActive ? (
            <div className="pt-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveFilters({
                      searchQuery: '',
                      genre: 'All',
                      country: 'All',
                      year: 'All',
                      language: 'All',
                      sortBy: 'For You'
                    })}
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
                  >
                    <ChevronLeft className="h-6 w-6 text-gray-400 group-hover:text-white" />
                  </motion.button>
                  <h2 className="text-2xl font-black text-white flex items-center space-x-3">
                    <Film className="h-6 w-6 text-primary-purple" />
                    <span>Filtered Results</span>
                  </h2>
                </div>
              </div>

              {isFiltering ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <Loader2 className="h-12 w-12 text-primary-magenta animate-spin" />
                  <p className="text-gray-400 font-medium animate-pulse">Syncing library...</p>
                </div>
              ) : filteredMovies.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-6">
                  {filteredMovies.map((movie, index) => (
                    <Suspense key={movie.id} fallback={<div className="aspect-[2/3] bg-white/5 rounded-xl animate-pulse" />}>
                      <MovieCard 
                        movie={movie}
                        index={index}
                        onMovieClick={handleMovieClick}
                      />
                    </Suspense>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <Film className="h-10 w-10 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">No matches found</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-10">
              {/* Dynamic Special Rows */}
              <Suspense fallback={<RowSkeleton />}>
                <div className="movie-row-container">
                  <MovieRow 
                    title="UNIFLEX Originals" 
                    fetchUrl={requests.fetchTrending}
                    initialMovies={trendingNow}
                    categorySlug="trending"
                    isLargeRow={true}
                    isTrending={true}
                    priorityLoad={true}
                    onMovieClick={handleMovieClick} 
                    onViewMore={() => {
                      console.log("Action Triggered: View More - UNIFLEX Originals");
                      navigate('/category/trending');
                    }}
                  />
                </div>
              </Suspense>

              <Suspense fallback={<RowSkeleton />}>
                <div className="movie-row-container">
                  <MovieRow 
                    title="Western Hits" 
                    fetchUrl={requests.fetchHollywood} 
                    onMovieClick={handleMovieClick} 
                    onViewMore={() => {
                      console.log("Action Triggered: View More - Western Hits");
                      navigate('/category/hollywood');
                    }}
                  />
                </div>
              </Suspense>

              <Suspense fallback={<RowSkeleton />}>
                <div className="movie-row-container">
                  <MovieRow 
                    title="Local Flavors (Pakistani)" 
                    fetchUrl={requests.fetchPakistani} 
                    onMovieClick={handleMovieClick} 
                    onViewMore={() => {
                      console.log("Action Triggered: View More - Pakistani");
                      navigate('/category/pakistani');
                    }}
                  />
                </div>
              </Suspense>

              {/* Dynamic Category Rows */}
              {categories.map((cat, idx) => (
                <Suspense key={cat} fallback={<RowSkeleton />}>
                  <div className="movie-row-container">
                    <MovieRow 
                      title={`${cat} ${cat.toLowerCase().includes('movie') || cat.toLowerCase().includes('series') ? '' : 'Content'}`}
                      categorySlug={cat}
                      onMovieClick={handleMovieClick} 
                      onViewMore={() => {
                        console.log(`Action Triggered: View More - ${cat}`);
                        navigate(`/category/${cat.toLowerCase().replace(/\s+/g, '-')}`);
                      }}
                    />
                  </div>
                </Suspense>
              ))}

              <Suspense fallback={<RowSkeleton />}>
                <div className="movie-row-container">
                  <MovieRow 
                    title="Animation Universe" 
                    fetchUrl={requests.fetchAnime}
                    onMovieClick={handleMovieClick} 
                    isAnime={true}
                    onViewMore={() => {
                      console.log("Action Triggered: View More - Animation");
                      navigate('/category/anime');
                    }}
                  />
                </div>
              </Suspense>

              <Suspense fallback={<RowSkeleton />}>
                <div className="movie-row-container">
                   <MovieRow 
                    title="Korean & Chinese Dramas" 
                    fetchUrl={requests.fetchKorean} 
                    onMovieClick={handleMovieClick} 
                    onViewMore={() => {
                      console.log("Action Triggered: View More - Asian Dramas");
                      navigate('/category/korean');
                    }}
                  />
                </div>
              </Suspense>
            </div>
          )}
        </section>
      </main>
    </PageLayout>
  );
}
