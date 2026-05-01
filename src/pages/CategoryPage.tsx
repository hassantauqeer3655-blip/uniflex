import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import tmdb, { requests } from '../lib/tmdb';
import { Movie } from '../types';
import PageLayout from '../components/PageLayout';
import MovieCard from '../components/MovieCard';
import { Film, User } from 'lucide-react';
import { motion } from 'motion/react';
import { useList } from '../context/ListContext';
import { useAuth } from '../context/AuthContext';
import { supabaseService } from '../services/supabaseService';

export default function CategoryPage({ forceGenre }: { forceGenre?: string }) {
  const { genreId: paramGenreId } = useParams<{ genreId: string }>();
  const genreId = forceGenre || paramGenreId;
  const location = useLocation();
  const navigate = useNavigate();
  const { myList } = useList();
  const { userData } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  // Get query params for typeFilter
  const queryParams = new URLSearchParams(location.search);
  const typeFilter = queryParams.get('type');

  const handleMovieClick = (movie: Movie) => {
    navigate(`/movie/${movie.id}`);
  };

  useEffect(() => {
    async function fetchData() {
      if (!genreId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      let results: Movie[] = [];

      try {
        if (genreId === 'mylist') {
          results = myList;
        } else if (genreId === 'history') {
          results = userData?.profiles?.[0]?.watchHistory || [];
        } else if (genreId === 'tv') {
          const request = await tmdb.get(requests.fetchTrending);
          results = request.data.results.filter((m: any) => (m.media_type === 'tv' || !m.title));
        } else if (genreId === 'movies') {
          const request = await tmdb.get(requests.fetchTrending);
          results = request.data.results.filter((m: any) => (m.media_type === 'movie' || m.title));
        } else if (genreId === 'trending') {
          const { data: movies } = await supabaseService.getMovies({ sortBy: 'Hottest', limit: 50, excludeAdult: true });
          if (movies && movies.length > 0) {
            results = movies as Movie[];
          } else {
            const request = await tmdb.get(requests.fetchTrending);
            results = request.data.results;
          }
        } else if (genreId === 'latest') {
          const { data: movies } = await supabaseService.getMovies({ sortBy: 'Latest', limit: 50, excludeAdult: true });
          results = movies as Movie[];
        } else if (genreId === 'most-watched') {
          const { data: movies } = await supabaseService.getMovies({ sortBy: 'Most Watched', limit: 50, excludeAdult: true });
          results = movies as Movie[];
        } else if (genreId === 'top-rated') {
          const { data: movies } = await supabaseService.getMovies({ sortBy: 'Hottest', excludeAdult: true });
          if (movies && movies.length > 0) {
            results = movies as Movie[];
          } else {
            const request = await tmdb.get(requests.fetchTopRated);
            results = request.data.results;
          }
        } else if (genreId === 'upcoming') {
          const { data: movies } = await supabaseService.getMovies({ status: 'upcoming', excludeAdult: true });
          results = movies as Movie[];
        } else if (genreId === 'ongoing') {
          const { data: movies } = await supabaseService.getMovies({ status: 'ongoing', excludeAdult: true });
          results = movies as Movie[];
        } else if (genreId === 'finished') {
          const { data: movies } = await supabaseService.getMovies({ status: 'finished', excludeAdult: true });
          results = movies as Movie[];
        } else {
          // Check for regional slugs or genres
          const normalizedGenreId = genreId.toLowerCase();

          const regionalMap: Record<string, string> = {
            'pakistani': requests.fetchPakistani,
            'bollywood': requests.fetchBollywood,
            'korean': requests.fetchKorean,
            'chinese': requests.fetchChinese,
            'hollywood': requests.fetchHollywood,
            'south-indian': requests.fetchSouthIndian,
          };

          const genreMapList: Record<string, string> = {
            'action': requests.fetchActionMovies,
            'comedy': requests.fetchComedyMovies,
            'horror': requests.fetchHorrorMovies,
            'romance': requests.fetchRomanceMovies,
            'anime': requests.fetchAnimeMovies,
          };

          const isRegional = Object.keys(regionalMap).includes(normalizedGenreId);
          if (isRegional) {
            const regionName = normalizedGenreId.charAt(0).toUpperCase() + normalizedGenreId.slice(1);
            const { data: movies } = await supabaseService.getMovies({ region: regionName, excludeAdult: true });
            if (movies && movies.length > 0) {
              results = movies as Movie[];
            } else {
              const fetchUrl = regionalMap[normalizedGenreId];
              if (fetchUrl) {
                const request = await tmdb.get(fetchUrl);
                results = request.data.results;
              }
            }
          } else {
            const fetchUrl = genreMapList[normalizedGenreId];
            if (fetchUrl) {
              const request = await tmdb.get(fetchUrl);
              results = request.data.results;
            } else {
              // Assume it's a genre in Supabase
              const { data: movies } = await supabaseService.getMovies({ category: genreId, excludeAdult: true });
              results = movies as Movie[];
            }
          }
        }

        // Fallback logic: If results are empty, fetch Trending Global
        if (results.length === 0) {
          console.log(`Category "${genreId}" is empty, falling back to Trending Global.`);
          const request = await tmdb.get(requests.fetchTrending);
          results = request.data.results;
        }

        // Apply type filter if present
        if (typeFilter) {
          results = results.filter((m: any) => {
            const type = m.media_type || (m.title ? 'movie' : 'tv');
            return type === typeFilter;
          });
        }
      } catch (error) {
        console.error("Error fetching category data:", error);
        // Final fallback on error
        try {
          const request = await tmdb.get(requests.fetchTrending);
          results = request.data.results;
        } catch (e) {
          results = [];
        }
      }

      // Deduplicate by ID
      const uniqueResults = Array.from(new Map(results.map(m => [m.id, m])).values());
      setMovies(uniqueResults);
      setLoading(false);
    }
    fetchData();
  }, [genreId, typeFilter, myList, userData]);

  const displayTitle = genreId 
    ? genreId === 'mylist' ? 'My List' : genreId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') 
    : 'Collection';

  return (
    <div className="relative min-h-screen bg-black">
      {/* High-Contrast Fixed Back Arrow as requested */}
      <div className="fixed top-8 left-8 z-[100]">
        <button
          onClick={() => {
            console.log("Action Triggered: Category Back Gate");
            navigate(-1);
          }}
          className="p-4 rounded-full bg-primary-purple/90 text-white shadow-[0_0_20px_rgba(153,69,255,0.5)] border border-white/20 hover:scale-110 active:scale-95 transition-all"
        >
          <motion.div
            animate={{ x: [-2, 2, -2] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronLeft className="h-6 w-6" />
          </motion.div>
        </button>
      </div>

      <div className="relative pb-24 px-4 md:px-12 lg:px-16 pt-32">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <motion.div 
                initial={{ rotate: -20, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                className="p-3 rounded-2xl bg-primary-purple/10 border border-primary-purple/20 text-primary-purple shadow-[0_0_20px_rgba(153,69,255,0.2)]"
              >
                <Film className="h-8 w-8" />
              </motion.div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-2 text-primary-purple mb-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">UNIFLEX Library</span>
                  <div className="h-1 w-1 rounded-full bg-primary-magenta" />
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{typeFilter ? (typeFilter === 'movie' ? 'Cinematic' : 'Series') : 'Global'}</span>
                </div>
                <h1 className="text-4xl md:text-8xl font-black text-white tracking-tighter uppercase leading-none filter drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
                  {displayTitle}
                  {typeFilter && <span className="text-primary-magenta ml-4 opacity-50 text-2xl md:text-4xl">{typeFilter === 'movie' ? 'Movies' : 'Series'}</span>}
                </h1>
              </div>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <div className="bg-white/5 border border-white/10 rounded-full px-4 py-1 flex items-center space-x-2 mb-2">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-widest leading-none">Scanning Active</span>
            </div>
            <span className="text-sm text-zinc-500 font-bold uppercase tracking-[0.2em]">
              {movies.length} Titles Found
            </span>
          </div>
        </div>

        {loading ? (
          <div className="library-grid">
            {Array.from({ length: 14 }).map((_, i) => (
              <div 
                key={i} 
                className="relative aspect-[2/3] w-full rounded-2xl animate-pulse bg-white/5 border border-white/10"
              />
            ))}
          </div>
        ) : movies.length > 0 ? (
          <div className="library-grid pb-24">
            {movies.map((movie, index) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                index={index}
                onMovieClick={handleMovieClick}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
            <div className="h-24 w-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <Film className="h-12 w-12 text-gray-600" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">No Titles Found</h3>
              <p className="text-gray-500 mt-2 max-w-md mx-auto">
                We couldn't find any content in this category. Try exploring our other collections.
              </p>
            </div>
            <button 
              onClick={() => navigate('/')}
              className="px-8 py-3 bg-primary-purple text-white font-black rounded-full hover:bg-primary-magenta transition-all"
            >
              Return Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
