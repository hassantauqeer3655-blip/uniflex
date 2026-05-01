import { useEffect, useState, useRef } from 'react';
import ReactPlayer from 'react-player';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Plus, Check, Play, Volume2, VolumeX, ThumbsUp, Share2, Link, ChevronLeft, Star, Calendar, Globe, Award, Download, Heart, Loader2, Info, CheckCircle2, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import tmdb, { requests } from '../lib/tmdb';
import { Movie } from '../types';
import { useList } from '../context/ListContext';
import { useAuth } from '../context/AuthContext';
import PageLayout from '../components/PageLayout';
import VideoPlayer from '../components/VideoPlayer';
import MovieModal from '../components/MovieModal';
import { genreMap } from '../constants/genres';
import { cn } from '../lib/utils';
import Navbar from '../components/Navbar';
import BackButton from '../components/BackButton';
import RatingStars from '../components/RatingStars';
import CastCard from '../components/CastCard';
import { supabaseService } from '../services/supabaseService';

const Player = ReactPlayer as any;

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export default function MovieDetailsPage() {
  const { movieId } = useParams<{ movieId: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [trailer, setTrailer] = useState<string>('');
  const [muted, setMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [cast, setCast] = useState<CastMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [castLoading, setCastLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const playerRef = useRef<any>(null);
  const { addToList, removeFromList, isInList } = useList();
  const { userData, toggleWatchlist, updateRating, updateProfile, toggleDownload: authToggleDownload } = useAuth();
  const navigate = useNavigate();

  const [downloadingIds, setDownloadingIds] = useState<Set<string | number>>(new Set());

  const userRating = userData?.profiles?.[0]?.ratings?.[movie?.id || ''] || 0;

  const handleRate = async (rating: number) => {
    if (!movie) return;
    try {
      await updateRating(movie.id.toString(), rating);
      setToastMessage(`Rated ${rating}/10! ⭐`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (err) {
      console.error("Rating failed:", err);
      setToastMessage("Rating failed. Please try again.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  const isInWatchlist = () => {
    const mainProfile = userData?.profiles?.[0];
    return mainProfile?.watchlist?.some(m => m.id === movie?.id);
  };

  const handleToggleWatchlist = async () => {
    if (!movie) return;
    await toggleWatchlist(movie);
    setToastMessage(isInWatchlist() ? 'Removed from Watchlist 💔' : 'Added to Watchlist ❤️');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const isDownloaded = (id: number | string) => {
    const mainProfile = userData?.profiles?.[0];
    return mainProfile?.downloads?.some(d => d.id === id);
  };

  const toggleDownload = async (movie: Movie) => {
    const mainProfile = userData?.profiles?.[0];
    if (!mainProfile) return;

    const downloads = mainProfile.downloads || [];
    const exists = downloads.some(d => d.id === movie.id);

    if (!exists) {
      // Simulate real download process
      setDownloadingIds(prev => new Set(prev).add(movie.id));
      setToastMessage('Starting download... 📥');
      setShowToast(true);
      
      // Simulate progress stages
      setTimeout(() => setToastMessage('Preparing files... ⚡'), 800);
      setTimeout(() => setToastMessage('Saving for offline viewing... 🔗'), 1600);
      
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Actually trigger a browser "download" of a metadata file for "realism"
      const data = {
        title: movie.title || movie.name,
        timestamp: new Date().toISOString(),
        quality: '4K Ultra HD',
        encryption: 'UNIFLEX-AES-256'
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(movie.title || movie.name || 'uniflex').toLowerCase().replace(/\s+/g, '_')}_offline_key.uniflex`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setDownloadingIds(prev => {
        const next = new Set(prev);
        next.delete(movie.id);
        return next;
      });
    }

    await authToggleDownload(movie);

    if (exists) {
      setToastMessage('Removed from downloads 🗑️');
    } else {
      setToastMessage('Download complete! 🔒');
    }

    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  useEffect(() => {
    if (!movieId) return;

    async function fetchMovieDetails() {
      if (!movieId) return;
      setLoading(true);
      try {
        // Try Supabase first
        let data = await supabaseService.getMovieById(movieId);
        
        if (!data) {
          // Fallback to TMDB
          const isNumeric = !isNaN(Number(movieId));
          if (isNumeric) {
            try {
              const response = await tmdb.get(requests.fetchMovieDetails(Number(movieId), 'movie'));
              data = response.data;
            } catch (e) {
              const response = await tmdb.get(requests.fetchMovieDetails(Number(movieId), 'tv'));
              data = response.data;
            }
          }
        }
        
        if (!data) throw new Error("Movie not found");
        
        setMovie(data);
        
        // Fetch Cast
        setCastLoading(true);
        if (data.cast && Array.isArray(data.cast)) {
          setCast(data.cast.map((name: string, i: number) => ({ id: i, name, character: 'Cast', profile_path: null })));
          setCastLoading(false);
        } else {
          const numericId = Number(movieId);
          if (!isNaN(numericId)) {
            const creditsUrl = data.title ? requests.fetchMovieCredits(numericId, 'movie') : requests.fetchMovieCredits(numericId, 'tv');
            const { data: creditsData } = await tmdb.get(creditsUrl);
            setCast(creditsData.cast.slice(0, 12));
          } else {
            setCast([]);
          }
          setCastLoading(false);
        }

        if (data.videos?.results) {
          const index = data.videos.results.findIndex((element: any) => element.type === 'Trailer');
          setTrailer(data.videos.results[index]?.key || data.videos.results[0]?.key);
        } else if (data.trailerUrl) {
          // Custom trailer field
          const trailerUrl = data.trailerUrl;
          if (trailerUrl) {
            try {
              const url = new URL(trailerUrl);
              const v = url.searchParams.get('v');
              if (v) setTrailer(v);
            } catch (e) {
              // Might be a direct key or differently formatted URL
              setTrailer(trailerUrl.length < 15 ? trailerUrl : '');
            }
          }
        }

      } catch (error) {
        console.error("Error fetching movie details:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMovieDetails();
  }, [movieId]);

  const handleShare = async () => {
    const movieTitle = movie?.title || movie?.name || 'UNIFLEX';
    const shareData = {
      title: movieTitle,
      text: `Check out ${movieTitle} on UNIFLEX!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        setToastMessage('Link copied to clipboard! 📋');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(shareData.url);
          setToastMessage('Link copied to clipboard! 📋');
          setShowToast(true);
          setTimeout(() => setShowToast(false), 2000);
        } catch (clipErr) {
          console.error('Clipboard failed:', clipErr);
        }
      }
    }
  };

  if (loading) {
    return (
      <PageLayout showBackButton={false}>
        <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
          <div className="h-12 w-12 border-4 border-primary-purple border-t-transparent rounded-full animate-spin" />
          <p className="text-primary-purple font-black uppercase tracking-widest animate-pulse">Scanning library...</p>
        </div>
      </PageLayout>
    );
  }

  if (!movie) {
    return (
      <PageLayout showBackButton={false}>
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6 px-4">
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Signal Lost</h1>
          <p className="text-gray-400 max-w-md">The requested content could not be found in the UNIFLEX database. The content may have been moved or removed.</p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-gradient-to-r from-primary-purple to-primary-magenta rounded-full font-bold text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all"
          >
            Return to Home
          </motion.button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout fullBleed={true} showBackButton={true}>
      <main className="pb-20">
        {/* Hero Section with Video/Backdrop */}
        <div className="relative w-full aspect-video md:h-[70vh] overflow-hidden">
          {trailer ? (
            <div className="absolute inset-0">
              <Player
                ref={playerRef}
                url={`https://www.youtube.com/watch?v=${trailer}`}
                width="100%"
                height="100%"
                playing={isPlaying}
                muted={muted}
                controls={false}
                onEnded={() => setIsPlaying(false)}
                config={{
                  youtube: {
                    playerVars: { showinfo: 0, rel: 0, modestbranding: 1 }
                  }
                }}
              />
            </div>
          ) : (
            <img 
              src={`https://image.tmdb.org/t/p/original${movie.backdrop_path || movie.poster_path}`}
              alt={movie.title || movie.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          )}
          
          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg-dark via-transparent to-transparent" />

          {/* Controls Overlay */}
          <div className="absolute bottom-10 left-4 md:left-12 right-4 md:right-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-3xl space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center space-x-3">
                  <span className="px-2 py-0.5 bg-primary-purple text-[10px] font-black uppercase tracking-widest rounded">UNIFLEX Original</span>
                  <div className="flex items-center text-green-400 text-sm font-bold">
                    <Star className="h-4 w-4 fill-green-400 mr-1" />
                    {Math.round(movie.vote_average * 10)}% Match
                  </div>
                </div>
                <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase leading-none drop-shadow-2xl">
                  {movie.title || movie.name}
                </h1>
              </motion.div>

              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => navigate(`/watch/${movie.id}`)}
                  className="flex items-center gap-2 px-8 py-3 bg-white text-black rounded-full font-black uppercase tracking-widest hover:bg-primary-purple hover:text-white transition-all active:scale-95"
                >
                  <Play className="h-5 w-5 fill-current" />
                  Play Now
                </button>
                <button 
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-8 py-3 bg-white/20 backdrop-blur-md border border-white/10 text-white rounded-full font-black uppercase tracking-widest hover:bg-white/30 transition-all active:scale-95"
                >
                  <Info className="h-5 w-5" />
                  More Info
                </button>
                <button 
                  onClick={() => isInList(movie.id) ? removeFromList(movie.id) : addToList(movie)}
                  className="flex items-center justify-center h-12 w-12 rounded-full border border-white/20 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:border-primary-purple transition-all"
                  title="My List"
                >
                  {isInList(movie.id) ? <Check className="h-6 w-6 text-primary-purple" /> : <Plus className="h-6 w-6" />}
                </button>
                <button 
                  onClick={handleToggleWatchlist}
                  className={cn(
                    "flex items-center justify-center h-12 w-12 rounded-full border backdrop-blur-md transition-all active:scale-95",
                    isInWatchlist() 
                      ? "bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]" 
                      : "bg-white/5 border-white/20 text-white hover:bg-red-500/20 hover:border-red-500"
                  )}
                  title={isInWatchlist() ? "Remove from Watchlist" : "Add to Watchlist"}
                >
                  <Heart className={cn("h-6 w-6", isInWatchlist() && "fill-current")} />
                </button>
                <button 
                  onClick={() => setMuted(!muted)}
                  className="flex items-center justify-center h-12 w-12 rounded-full border border-white/20 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all active:scale-95"
                >
                  {muted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                </button>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleDownload(movie)}
                  disabled={downloadingIds.has(movie.id)}
                  className={cn(
                    "flex items-center justify-center h-12 w-12 rounded-full border backdrop-blur-md transition-all relative overflow-hidden",
                    downloadingIds.has(movie.id) && "border-primary-purple bg-primary-purple/10",
                    isDownloaded(movie.id) 
                      ? "bg-primary-magenta/20 border-primary-magenta text-primary-magenta shadow-[0_0_15px_rgba(236,72,153,0.3)]" 
                      : "bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-primary-magenta"
                  )}
                  title={isDownloaded(movie.id) ? "Remove from Downloads" : "Download for Offline"}
                >
                  {downloadingIds.has(movie.id) ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin text-primary-purple" />
                      <motion.div 
                        initial={{ height: "0%" }}
                        animate={{ height: "100%" }}
                        transition={{ duration: 2.5, ease: "linear" }}
                        className="absolute bottom-0 left-0 w-full bg-primary-purple/20 pointer-events-none"
                      />
                    </>
                  ) : isDownloaded(movie.id) ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <Download className="h-6 w-6" />
                  )}
                </motion.button>
                <button 
                  onClick={handleShare}
                  className="flex items-center justify-center h-12 w-12 rounded-full border border-white/20 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all active:scale-95"
                >
                  <Share2 className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Details Content */}
        <div className="px-4 md:px-12 lg:px-16 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {/* Overview */}
            <section className="space-y-4">
              <h2 className="text-xl font-black uppercase tracking-[0.3em] text-primary-purple">Synopsis</h2>
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed font-light">
                {movie.overview}
              </p>
            </section>

            {/* Cast Grid */}
            <section className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black uppercase tracking-[0.3em] text-primary-purple">Top Billed Cast</h2>
                <button 
                  onClick={() => navigate(`/search?q=${encodeURIComponent(movie.title || movie.name || '')}&credits=true`)}
                  className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary-purple transition-colors border-b border-gray-800 hover:border-primary-purple pb-1"
                >
                  View Full Cast & Crew
                </button>
              </div>

              {castLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-4 animate-pulse">
                      <div className="aspect-square rounded-2xl bg-white/5 border border-white/5" />
                      <div className="space-y-2">
                        <div className="h-4 w-2/3 bg-white/5 rounded" />
                        <div className="h-3 w-1/2 bg-white/5 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : cast.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {cast.map((member) => (
                    <CastCard
                      key={member.id}
                      id={member.id}
                      name={member.name}
                      character={member.character}
                      profilePath={member.profile_path}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-12 border border-white/5 bg-white/5 rounded-[2rem] flex flex-col items-center justify-center text-center space-y-4">
                  <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-600" />
                  </div>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Cast metadata unavailable for this sector.</p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar Info */}
          <aside className="space-y-8">
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-6">
              <h3 className="text-lg font-black uppercase tracking-widest text-white">Metadata</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary-purple/20 flex items-center justify-center text-primary-purple">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Release Date</p>
                    <p className="text-sm font-bold">{movie.release_date || movie.first_air_date || 'Unknown'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary-purple/20 flex items-center justify-center text-primary-purple">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Language</p>
                    <p className="text-sm font-bold uppercase">{movie.original_language || 'EN'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary-purple/20 flex items-center justify-center text-primary-purple">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Global Score</p>
                    <p className="text-sm font-bold">{movie.vote_average.toFixed(1)} / 10</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <p className="text-[10px] font-black text-primary-purple uppercase tracking-[0.3em] mb-4">Movie Details</p>
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Your Perception</p>
                  <RatingStars 
                    initialRating={userRating} 
                    onRate={handleRate}
                  />
                  {userRating > 0 && (
                    <p className="text-[11px] text-zinc-400 italic">
                      "System validated this data with a factor of {userRating}/10."
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Genres</p>
                <div className="flex flex-wrap gap-2">
                  {movie.genres?.map((genre: any) => (
                    <span 
                      key={genre.id}
                      className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-gray-300"
                    >
                      {genre.name}
                    </span>
                  )) || movie.genre_ids?.map((id: number) => (
                    <span 
                      key={id}
                      className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-gray-300"
                    >
                      {genreMap[id]}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Poster Fallback */}
            <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <img 
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title || movie.name}
                className="w-full h-auto"
                referrerPolicy="no-referrer"
              />
            </div>
          </aside>
        </div>
      </main>

      {/* Movie Modal */}
      <AnimatePresence>
        {showModal && (
          <MovieModal 
            movie={movie} 
            onClose={() => setShowModal(false)} 
          />
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-10 left-1/2 z-[100] bg-primary-purple/90 backdrop-blur-md text-white px-6 py-3 rounded-full font-bold shadow-2xl border border-white/20"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </PageLayout>
  );
}
