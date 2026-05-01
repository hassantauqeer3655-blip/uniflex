import { useEffect, useState, useRef } from 'react';
import ReactPlayer from 'react-player';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Check, Play, Volume2, VolumeX, ThumbsUp, Share2, Link } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import tmdb, { requests } from '../lib/tmdb';
import { Movie } from '../types';
import { useList } from '../context/ListContext';
import { useNavigation } from '../context/NavigationContext';
import VideoPlayer from './VideoPlayer';
import { genreMap } from '../constants/genres';
import { User } from 'lucide-react';

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

const Player = ReactPlayer as any;

interface MovieModalProps {
  movie: Movie | null;
  onClose: () => void;
}

export default function MovieModal({ movie, onClose }: MovieModalProps) {
  const [trailer, setTrailer] = useState<string>('');
  const [muted, setMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showPlayer, setShowPlayer] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [cast, setCast] = useState<CastMember[]>([]);
  const playerRef = useRef<any>(null);
  const { addToList, removeFromList, isInList } = useList();
  const { registerModal, unregisterModal } = useNavigation();
  const navigate = useNavigate();

  useEffect(() => {
    if (movie) {
      registerModal(onClose);
      return () => unregisterModal(onClose);
    }
  }, [movie, registerModal, unregisterModal, onClose]);

  useEffect(() => {
    if (!movie) return;

    async function fetchMovie() {
      const type = movie?.media_type || 'movie';
      const { data } = await tmdb.get(requests.fetchMovieDetails(movie.id, type as 'movie' | 'tv'));
      
      if (data?.videos?.results) {
        const index = data.videos.results.findIndex((element: any) => element.type === 'Trailer');
        setTrailer(data.videos.results[index]?.key);
      }

      // Fetch Cast
      const { data: creditsData } = await tmdb.get(requests.fetchMovieCredits(movie.id, type as 'movie' | 'tv'));
      setCast(creditsData.cast.slice(0, 10));
    }

    fetchMovie();
  }, [movie]);

  const handleShare = async () => {
    const movieTitle = movie?.title || movie?.name || 'UNIFLEX';
    const shareData = {
      title: movieTitle,
      text: `Check out ${movieTitle} on UNIFLEX!`,
      url: window.location.origin + `/watch/${movie?.id}`,
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
      // Fallback to clipboard if share fails (except if user cancelled)
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

  const handleCopyLink = async () => {
    const url = window.location.origin + `/watch/${movie?.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setToastMessage('Link copied to clipboard! 📋');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!movie) return null;

  return (
    <>
      <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 md:px-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-5xl overflow-hidden rounded-lg bg-zinc-950 scrollbar-hide"
        >
          <button
            onClick={onClose}
            className="absolute right-5 top-5 z-50 h-9 w-9 border-none bg-[#181818] hover:bg-[#262626] rounded-full flex items-center justify-center"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="relative pt-[56.25%]">
            <Player
              ref={playerRef}
              url={`https://www.youtube.com/watch?v=${trailer}`}
              width="100%"
              height="100%"
              style={{ position: 'absolute', top: '0', left: '0' }}
              playing={isPlaying}
              muted={muted}
              onEnded={() => setIsPlaying(false)}
            />
            <div className="absolute bottom-10 flex w-full items-center justify-between px-10">
              <div className="flex space-x-2">
                <button 
                  className="flex items-center gap-x-2 rounded bg-white px-8 text-xl font-bold text-black transition hover:bg-[#e6e6e6] relative group/tooltip"
                  onClick={() => navigate(`/watch/${movie.id}`)}
                >
                  <Play className="h-7 w-7 fill-black" />
                  Play
                  <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold py-1.5 px-3 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                    Play Movie
                  </span>
                </button>
                <button 
                  className="flex items-center gap-x-2 rounded bg-white/30 px-8 text-xl font-bold text-white transition hover:bg-white/40 relative group/tooltip"
                  onClick={() => {
                    setIsPlaying(true);
                    playerRef.current?.seekTo(0);
                  }}
                >
                  <Play className="h-7 w-7 fill-white" />
                  Play Trailer
                  <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold py-1.5 px-3 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                    Watch Trailer
                  </span>
                </button>
                <button 
                  className="modalButton relative group/tooltip"
                  onClick={() => isInList(movie.id) ? removeFromList(movie.id) : addToList(movie)}
                >
                  {isInList(movie.id) ? (
                    <Check className="h-7 w-7" />
                  ) : (
                    <Plus className="h-7 w-7" />
                  )}
                  <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold py-1.5 px-3 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                    {isInList(movie.id) ? 'Remove from My List' : 'Add to My List'}
                  </span>
                </button>
                <button className="modalButton relative group/tooltip">
                  <ThumbsUp className="h-7 w-7" />
                  <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold py-1.5 px-3 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                    I like this
                  </span>
                </button>
                <button 
                  className="modalButton relative group/tooltip"
                  onClick={handleShare}
                >
                  <Share2 className="h-7 w-7" />
                  <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold py-1.5 px-3 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                    Share
                  </span>
                </button>
                <button 
                  className="modalButton relative group/tooltip"
                  onClick={handleCopyLink}
                >
                  <Link className="h-7 w-7" />
                  <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold py-1.5 px-3 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                    Copy Link
                  </span>
                </button>
              </div>
              <button className="modalButton relative group/tooltip" onClick={() => setMuted(!muted)}>
                {muted ? (
                  <VolumeX className="h-6 w-6" />
                ) : (
                  <Volume2 className="h-6 w-6" />
                )}
                <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold py-1.5 px-3 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                  {muted ? 'Unmute' : 'Mute'}
                </span>
              </button>
            </div>
          </div>

          <div className="flex space-x-16 rounded-b-md bg-zinc-900/50 px-10 py-8">
            <div className="space-y-6 text-lg">
              <div className="flex items-center space-x-2 text-sm">
                <p className="font-semibold text-green-400">
                  {Math.round(movie!.vote_average * 10)}% Match
                </p>
                <p className="font-light">
                  {movie?.release_date || movie?.first_air_date}
                </p>
                <div className="flex h-4 items-center justify-center rounded border border-white/40 px-1.5 text-xs">
                  HD
                </div>
              </div>
              <div className="flex flex-col gap-x-10 gap-y-4 font-light md:flex-row">
                <div className="w-5/6 space-y-4">
                  <p>{movie?.overview}</p>
                  <div className="flex flex-wrap gap-2">
                    {movie?.genre_ids?.map((id) => (
                      <button
                        key={id}
                        className="px-3 py-1 text-xs font-bold tracking-wider uppercase border border-white/20 rounded-full bg-white/5 hover:bg-white/10 hover:border-primary-purple transition-all duration-200 text-gray-300 hover:text-white"
                        onClick={() => console.log(`Filter by genre: ${genreMap[id]}`)}
                      >
                        {genreMap[id]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col space-y-3 text-sm">
                  <div>
                    <span className="text-[gray]">Genres:</span>{' '}
                    {movie?.genre_ids?.map(id => genreMap[id]).join(', ')}
                  </div>
                  <div>
                    <span className="text-[gray]">Original language:</span>{' '}
                    English
                  </div>
                  <div>
                    <span className="text-[gray]">Total votes:</span>{' '}
                    {movie?.vote_average}
                  </div>
                </div>
              </div>

              {/* Top Billed Cast Section */}
              <div className="mt-12 space-y-6">
                <h3 className="text-xl font-black uppercase tracking-widest text-white/80">Top Billed Cast</h3>
                <div className="flex overflow-x-auto no-scrollbar gap-8 pb-4">
                  {cast.map((member) => (
                      <div 
                        key={member.id} 
                        className="flex flex-col items-center text-center space-y-3 min-w-[100px] group cursor-pointer"
                        onClick={() => {
                          console.log("Searching for actor:", member.name);
                          navigate(`/search?q=${encodeURIComponent(member.name)}&actor=true`);
                        }}
                      >
                      <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-primary-purple transition-colors duration-300">
                        {member.profile_path ? (
                          <img 
                            src={`https://image.tmdb.org/t/p/w185${member.profile_path}`}
                            alt={member.name}
                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="h-full w-full bg-white/5 flex items-center justify-center text-xl font-black text-gray-500">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        )}
                      </div>
                      <div className="max-w-[120px]">
                        <p className="text-xs font-black text-white line-clamp-1">{member.name}</p>
                        <p className="text-[10px] font-bold text-gray-500 line-clamp-1">{member.character}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
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
    </AnimatePresence>

    {showPlayer && movie && (
      <VideoPlayer 
        movie={movie} 
        onClose={() => setShowPlayer(false)} 
      />
    )}
  </>
);
}
