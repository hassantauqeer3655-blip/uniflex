import { useEffect, useState, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, AlertCircle, Loader2, Plus, Check, X, Sparkles, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Movie } from '../types';
import tmdb, { requests } from '../lib/tmdb';
import { MOCK_MOVIES } from '../lib/mockData';
import PageLayout from '../components/PageLayout';
import MovieCard from '../components/MovieCard';
import { useDebounce } from '../hooks/useDebounce';
import { useList } from '../context/ListContext';
import { useAuth } from '../context/AuthContext';
import { genreMap } from '../constants/genres';
import { cn } from '../lib/utils';
import { supabaseService } from '../services/supabaseService';

import FilterBar, { FilterState } from '../components/FilterBar';

export default function SearchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('q') || '';
  
  const isActorSearch = queryParams.get('actor') === 'true';
  
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    searchQuery: initialQuery,
    genre: 'All',
    country: 'All',
    year: 'All',
    language: 'All',
    sortBy: 'Relevance'
  });
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [trending, setTrending] = useState<Movie[]>([]);
  
  const debouncedQuery = useDebounce(activeFilters.searchQuery, 300);
  const { addToList, removeFromList, isInList } = useList();
  const { userData } = useAuth();

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await tmdb.get(requests.fetchTrending);
        setTrending(response.data.results || []);
      } catch (err) {
        console.error("Failed to fetch trending:", err);
      }
    };
    fetchTrending();
  }, []);

  // Update searchQuery when URL changes
  useEffect(() => {
    setActiveFilters(prev => ({ ...prev, searchQuery: initialQuery }));
  }, [initialQuery]);

  const fetchResults = useCallback(async (query: string) => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      let fetchedResults: Movie[] = [];

      if (isActorSearch) {
        // Search by actor in TMDB
        const personResponse = await tmdb.get(`/search/person?query=${encodeURIComponent(normalizedQuery)}`);
        const person = personResponse.data.results?.[0];
        let tmdbActorCredits: Movie[] = [];
        if (person) {
          const creditsResponse = await tmdb.get(`/person/${person.id}/movie_credits`);
          tmdbActorCredits = creditsResponse.data.cast || [];
        }

        // Search by actor in Supabase (the getMovies {search: ...} already looks in 'cast' column)
        const { data: supabaseActorResults } = await supabaseService.getMovies({ search: normalizedQuery });
        
        fetchedResults = [...tmdbActorCredits, ...(supabaseActorResults as Movie[] || [])];
      } else {
        // 1. Search Local Mock Data
        const localMatches = MOCK_MOVIES.filter(movie => {
          const title = (movie.title || movie.name || '').toLowerCase();
          return title.includes(normalizedQuery);
        });

        // 2. Search Supabase
        const { data: supabaseResults } = await supabaseService.getMovies({ search: normalizedQuery });
        
        // 3. Search TMDB
        let tmdbResults: Movie[] = [];
        if (normalizedQuery.length > 2) {
          const response = await tmdb.get(requests.searchMovies(encodeURIComponent(normalizedQuery)));
          tmdbResults = response.data.results || [];
        }
        
        fetchedResults = [...(supabaseResults || []), ...localMatches, ...tmdbResults];
      }

      // Remove duplicates by ID
      const uniqueResults = Array.from(new Map(fetchedResults.map(item => [item.id, item])).values());

      // Filter and Sort
      const sortedResults = uniqueResults
        .filter(movie => {
          if (isActorSearch) return true; // Keep all actor credits
          const title = (movie.title || movie.name || '').toLowerCase();
          return title.includes(normalizedQuery);
        })
        .sort((a, b) => {
          if (isActorSearch) return (b.popularity || 0) - (a.popularity || 0);
          
          const titleA = (a.title || a.name || '').toLowerCase();
          const titleB = (b.title || b.name || '').toLowerCase();
          
          if (titleA === normalizedQuery) return -1;
          if (titleB === normalizedQuery) return 1;
          if (titleA.startsWith(normalizedQuery) && !titleB.startsWith(normalizedQuery)) return -1;
          if (!titleA.startsWith(normalizedQuery) && titleB.startsWith(normalizedQuery)) return 1;
          
          return 0;
        });

      setResults(sortedResults);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  }, [isActorSearch]);

  // Use debounced query for searching to reduce lag while typing
  useEffect(() => {
    fetchResults(debouncedQuery);
  }, [debouncedQuery, fetchResults]);

  // Part 4: Filter Engine (CRITICAL)
  const filteredResults = useMemo(() => {
    let filtered = [...results];

    // 3. Genre Filter
    if (activeFilters.genre !== 'All') {
      filtered = filtered.filter(movie => 
        movie.category === activeFilters.genre ||
        movie.genre_ids?.some(id => genreMap[id.toString()] === activeFilters.genre)
      );
    }

    // 4. Year Filter
    if (activeFilters.year !== 'All') {
      filtered = filtered.filter(movie => {
        const date = movie.release_date || movie.first_air_date;
        return date?.startsWith(activeFilters.year);
      });
    }

    // 5. Language Filter
    if (activeFilters.language !== 'All') {
      filtered = filtered.filter(movie => 
        movie.original_language === activeFilters.language ||
        (movie as any).language === activeFilters.language
      );
    }

    // 6. Country Filter
    if (activeFilters.country !== 'All') {
      filtered = filtered.filter(movie => 
        movie.region === activeFilters.country
      );
    }

    // 7. Rating Filter & Sort
    if (activeFilters.sortBy === 'Hottest') {
      filtered.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
    } else if (activeFilters.sortBy === 'My Personal Ratings') {
      const userRatings = userData?.profiles?.[0]?.ratings || {};
      filtered = filtered.filter(movie => userRatings[movie.id.toString()] !== undefined);
      filtered.sort((a, b) => (userRatings[b.id.toString()] || 0) - (userRatings[a.id.toString()] || 0));
    }

    return filtered;
  }, [results, activeFilters, userData]);

  return (
    <PageLayout showBackButton={true}>
      <main className="pb-24 px-4 md:px-12 lg:px-16 pt-24">
        {/* Header & Search Controls */}
        <div className="flex flex-col space-y-8 mb-12">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-primary-purple">
              <Search className="h-5 w-5" />
              <span className="text-xs font-black uppercase tracking-[0.4em]">Advanced Search Engine</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
              {isActorSearch ? (
                <>Explore more with <span className="text-primary-magenta">"{activeFilters.searchQuery}"</span></>
              ) : activeFilters.searchQuery ? (
                <>Results for <span className="text-primary-magenta">"{activeFilters.searchQuery}"</span></>
              ) : (
                <>Explore <span className="text-primary-magenta">Collection</span></>
              )}
            </h1>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] px-8 py-2 shadow-2xl">
            <FilterBar 
              activeFilters={activeFilters}
              onFilterChange={setActiveFilters}
            />
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div 
                key={i} 
                className="relative aspect-[2/3] w-full rounded-2xl animate-shimmer bg-white/5 border border-white/5"
              />
            ))}
          </div>
        ) : filteredResults.length > 0 ? (
            <div className="space-y-16">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8">
                {filteredResults.map((movie, index) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    index={index}
                    onMovieClick={(m) => navigate(`/movie/${m.id}`)}
                  />
                ))}
              </div>
            </div>
        ) : (
          /* Part 6: Empty State Handling */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-12 flex flex-col items-center">
              <div className="relative mb-8">
                <AlertCircle className="h-20 w-20 text-gray-700" />
                <div className="absolute inset-0 blur-2xl bg-primary-purple/10" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-widest text-white">No Results Found</h2>
              <p className="text-gray-500 max-w-md mx-auto mt-2">
              {isActorSearch ? (
                <>This is currently the only title featuring <span className="text-white">"{activeFilters.searchQuery}"</span> in our library.</>
              ) : (
                <>No direct matches for <span className="text-white">"{activeFilters.searchQuery}"</span>. Try checking our trending movies below.</>
              )}
              </p>
            </div>

            {/* Related Content even when empty */}
            {trending.length > 0 && (
              <div className="w-full space-y-12">
                <div className="flex items-center justify-between mb-8 px-4 md:px-0">
                  <h3 className="text-xl font-black uppercase tracking-widest text-primary-purple">Popular Recommendations</h3>
                  <button 
                    onClick={() => navigate('/category/trending')}
                    className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-primary-purple transition-all flex items-center gap-2 group px-4 py-1.5 rounded-full border border-white/5 hover:border-primary-purple/30 hover:bg-primary-purple/5 backdrop-blur-sm shadow-2xl"
                  >
                    View All
                    <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-primary-magenta group-hover:rotate-12 transition-transform" />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8">
                  {trending.slice(0, 12).map((movie, index) => (
                    <MovieCard
                      key={`alt-${movie.id}`}
                      movie={movie}
                      index={index}
                      onMovieClick={(m) => navigate(`/movie/${m.id}`)}
                    />
                   ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </PageLayout>
  );
}
