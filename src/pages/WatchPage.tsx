import React, { useEffect, useState, useRef, useCallback, memo, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { 
  ArrowLeft,
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  RotateCcw, 
  RotateCw, 
  Settings,
  SkipForward,
  SkipBack,
  Loader2,
  Share2,
  Globe,
  Check,
  ChevronDown,
  WifiOff,
  Zap,
  Type,
  Download,
  Info,
  Users,
  Calendar,
  Film
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Movie } from '../types';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import tmdb, { requests } from '../lib/tmdb';
import PageLayout from '../components/PageLayout';
import MovieRow from '../components/MovieRow';
import Comments from '../components/Comments';
import { supabaseService } from '../services/supabaseService';

type AudioTrack = 'original' | 'english' | 'urdu';
type SubtitleTrack = 'off' | 'english' | 'urdu';
type SettingsTab = 'main' | 'speed' | 'audio' | 'subtitles';

const EpisodeButton = memo(({ num, title, isActive, onClick }: { num: number, title?: string, isActive: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-4 p-4 rounded-2xl transition-all border group",
      isActive 
        ? "bg-primary-purple/10 border-primary-purple text-white shadow-[0_0_15px_rgba(153,69,255,0.2)]" 
        : "bg-white/5 border-white/5 text-zinc-500 hover:border-white/20 hover:text-white"
    )}
  >
    <div className={cn(
      "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-colors",
      isActive ? "bg-primary-purple text-white" : "bg-white/10 text-zinc-400 group-hover:bg-white/20"
    )}>
      {num}
    </div>
    <div className="flex-1 text-left">
      <p className="text-xs font-bold uppercase tracking-widest leading-none mb-1">{title || `Episode ${num}`}</p>
      <p className="text-[10px] text-zinc-600 font-medium">Standard Release</p>
    </div>
    <Play className={cn("h-4 w-4", isActive ? "text-primary-purple" : "text-zinc-700 opacity-0 group-hover:opacity-100")} />
  </button>
));

EpisodeButton.displayName = 'EpisodeButton';

export default function WatchPage() {
  const Player = ReactPlayer as any;
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToHistory } = useAuth();
  
  // State Management
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  
  // Player State
  const [playing, setPlaying] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  
  // Settings State with Persistence
  const [playbackRate, setPlaybackRate] = useState(() => {
    const saved = localStorage.getItem('uniflex_playback_rate');
    return saved ? parseFloat(saved) : 1.0;
  });
  const [audioTrack, setAudioTrack] = useState<AudioTrack>(() => {
    const saved = localStorage.getItem('uniflex_audio_track');
    return (saved as AudioTrack) || 'original';
  });
  const [subtitleTrack, setSubtitleTrack] = useState<SubtitleTrack>(() => {
    const saved = localStorage.getItem('uniflex_subtitle_track');
    return (saved as SubtitleTrack) || 'off';
  });

  const [showControls, setShowControls] = useState(true);
  const [activeEpisode, setActiveEpisode] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('main');
  const [playerReady, setPlayerReady] = useState(false);
  const isMounted = useRef(true);
  
  const playerRef = useRef<any>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null);

  // Determine if it's a series or movie
  const isSeries = useMemo(() => {
    if (!movie) return false;
    return movie.media_type === 'tv' || movie.category === 'Series' || movie.category === 'Anime-Series' || (movie.episodes && movie.episodes.length > 0);
  }, [movie]);

  const currentVideoUrl = useMemo(() => {
    if (!movie) return '';
    if (isSeries && movie.episodes && movie.episodes.length > 0) {
      return movie.episodes[activeEpisode - 1]?.video_url || movie.video_url || '';
    }
    return movie.video_url || movie.videoUrl || '';
  }, [movie, isSeries, activeEpisode]);

  // Reset ready state when URL changes
  useEffect(() => {
    setPlayerReady(false);
  }, [currentVideoUrl]);

  // Track mount state
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Handle Download
  const handleDownload = () => {
    if (!currentVideoUrl) {
      alert("Source URL is missing. Download unavailable.");
      return;
    }
    
    // Check if it's a YouTube link
    if (currentVideoUrl.includes('youtube.com') || currentVideoUrl.includes('youtu.be')) {
      alert("Direct download for YouTube content is restricted. Please use an external downloader or contact support for direct links.");
      return;
    }

    const link = document.createElement('a');
    link.href = currentVideoUrl;
    link.setAttribute('download', `${movie?.title || 'movie'}-episode-${activeEpisode}.mp4`);
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Memoized Episode Grid
  const episodeList = useMemo(() => {
    if (!isSeries) return null;
    const episodesData = movie?.episodes || [];

    if (episodesData.length === 0) {
      return (
        <div className="p-8 border border-dashed border-white/10 rounded-3xl text-center">
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">No segments found in the database</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {episodesData.map((ep: any, i: number) => {
          const epNum = i + 1;
          const isActive = activeEpisode === epNum;
          return (
            <EpisodeButton
              key={epNum}
              num={epNum}
              title={ep.title}
              isActive={isActive}
              onClick={() => {
                setPlayed(0);
                setActiveEpisode(epNum);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          );
        })}
      </div>
    );
  }, [movie, isSeries, activeEpisode]);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('uniflex_playback_rate', playbackRate.toString());
  }, [playbackRate]);

  useEffect(() => {
    localStorage.setItem('uniflex_audio_track', audioTrack);
  }, [audioTrack]);

  useEffect(() => {
    localStorage.setItem('uniflex_subtitle_track', subtitleTrack);
  }, [subtitleTrack]);

  // Fetch Movie Data
  useEffect(() => {
    async function fetchMovie() {
      if (!id) return;
      setLoading(true);
      setError(false);
      setPlaybackError(null);

      try {
        let movieData: Movie | null = null;
        
        try {
          movieData = await supabaseService.getMovieById(id);
        } catch (e) {
          console.log("Movie not found in Supabase, trying TMDB fallback");
        }
        
        if (!movieData) {
          const numericId = Number(id);
          if (!isNaN(numericId)) {
            try {
              const { data } = await tmdb.get(requests.fetchMovieDetails(numericId, 'movie'));
              movieData = { ...data, media_type: 'movie' };
            } catch (e) {
              try {
                const { data } = await tmdb.get(requests.fetchMovieDetails(numericId, 'tv'));
                movieData = { ...data, media_type: 'tv' };
              } catch (e2) {
                console.error("TMDB fetch failed:", e2);
              }
            }
          }
        }

        if (movieData) {
          setMovie(movieData);
          addToHistory(movieData);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Error fetching movie:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchMovie();
  }, [id]);

  // Controls Visibility
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  };

  // Player Handlers
  const handlePlayPause = useCallback(() => setPlaying(prev => !prev), []);
  const handleToggleMute = useCallback(() => setMuted(prev => !prev), []);
  const handleProgress = (state: any) => {
    if (!seeking) setPlayed(state.played);
  };
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayed(parseFloat(e.target.value));
  };
  const handleSeekMouseDown = () => setSeeking(true);
  const handleSeekMouseUp = (e: any) => {
    setSeeking(false);
    playerRef.current?.seekTo(parseFloat(e.target.value));
  };
  const handleDuration = (duration: number) => setDuration(duration);
  const skip = useCallback((amount: number) => {
    const currentTime = playerRef.current?.getCurrentTime() || 0;
    playerRef.current?.seekTo(currentTime + amount);
  }, []);

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullScreen = useCallback(() => {
    const element = videoWrapperRef.current;
    if (!element) return;

    if (!document.fullscreenElement) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'arrowright':
          skip(10);
          break;
        case 'arrowleft':
          skip(-10);
          break;
        case 'arrowup':
          e.preventDefault();
          setVolume(v => Math.min(v + 0.1, 1));
          break;
        case 'arrowdown':
          e.preventDefault();
          setVolume(v => Math.max(v - 0.1, 0));
          break;
        case 'f':
          toggleFullScreen();
          break;
        case 'm':
          handleToggleMute();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlayPause, handleToggleMute, skip, toggleFullScreen]);

  // Social Share
  const handleShare = (platform: 'fb' | 'tw' | 'wa') => {
    const url = window.location.href;
    const text = `Watching ${movie?.title || movie?.name} on UNIFLEX!`;
    const shareLinks = {
      fb: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      tw: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      wa: `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`
    };
    window.open(shareLinks[platform], '_blank');
  };

  // Format Time
  const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    if (hh) return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
    return `${mm}:${ss}`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[9999]">
        <Loader2 className="h-12 w-12 text-primary-purple animate-spin mb-4" />
        <p className="text-primary-purple font-black uppercase tracking-[0.4em] text-xs animate-pulse">Initializing Theatre Mode...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[9999] p-6 text-center">
        <WifiOff className="h-20 w-20 text-red-500/50 mb-6" />
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Content Unavailable</h2>
        <p className="text-gray-500 max-w-md mb-8 uppercase tracking-widest text-[10px]">The requested title is currently unavailable in your region.</p>
        <button onClick={() => navigate('/browse')} className="px-8 py-3 bg-white text-black font-black uppercase tracking-widest text-xs rounded-full hover:bg-primary-purple hover:text-white transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#0a0a0a] text-white flex flex-col"
      ref={containerRef}
      onMouseMove={handleMouseMove}
    >
      {/* Header (Absolute, hidden in fullscreen) */}
      {!isFullscreen && (
        <header className="absolute top-0 left-0 right-0 z-[100] p-6 flex items-center justify-between pointer-events-none">
          <button 
            onClick={() => navigate(-1)}
            className="pointer-events-auto group flex items-center gap-3 text-white/70 hover:text-white transition-all font-black uppercase tracking-widest text-[10px] active:scale-95"
          >
            <div className="p-2 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 group-hover:bg-primary-purple transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </div>
            Back
          </button>
        </header>
      )}

      {/* Hero Video Section */}
      <div className="w-full relative z-[50]" ref={videoWrapperRef}>
        <div className="relative aspect-video w-full max-w-7xl mx-auto bg-black shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden md:rounded-3xl lg:mt-12 group/wrapper">
          {currentVideoUrl && (
            <Player
              ref={playerRef}
              url={currentVideoUrl}
              width="100%"
              height="100%"
              playing={playerReady && playing}
              volume={volume}
              muted={muted}
              playbackRate={playbackRate}
              onProgress={handleProgress}
              onReady={(p: any) => {
                if (isMounted.current) {
                  setPlayerReady(true);
                  if (p.getDuration()) setDuration(p.getDuration());
                }
              }}
              onDuration={(d: number) => {
                if (isMounted.current) setDuration(d);
              }}
              onError={() => setPlaybackError("Playback Error")}
              config={{
                file: {
                  attributes: { 
                    crossOrigin: 'anonymous',
                    // Fallback for React 19 onDuration warning if react-player passes it down
                    onDurationChange: (e: any) => {
                      if (isMounted.current && e.target.duration) setDuration(e.target.duration);
                    }
                  },
                  tracks: subtitleTrack !== 'off' ? [
                    { 
                      kind: 'subtitles', 
                      src: `/subs/${subtitleTrack}.vtt`, 
                      srcLang: subtitleTrack === 'urdu' ? 'ur' : 'en', 
                      default: true 
                    }
                  ] : []
                }
              }}
            />
          )}

          {/* Controls Overlay */}
          <AnimatePresence>
            {showControls && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-black/30 flex flex-col justify-end p-4 md:p-8"
              >
                {/* Progress Bar */}
                <div className="relative group/progress mb-4 md:mb-8">
                  <input
                    type="range"
                    min={0}
                    max={0.999999}
                    step="any"
                    value={played}
                    onMouseDown={handleSeekMouseDown}
                    onChange={handleSeekChange}
                    onMouseUp={handleSeekMouseUp}
                    className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-primary-purple transition-all group-hover/progress:h-2"
                  />
                  <div 
                    className="absolute top-0 left-0 h-1 bg-primary-purple rounded-full pointer-events-none transition-all group-hover/progress:h-2 shadow-[0_0_10px_rgba(153,69,255,0.8)]"
                    style={{ width: `${played * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 md:gap-10">
                    <button onClick={handlePlayPause} className="text-white hover:text-primary-purple transition-all active:scale-90">
                      {playing ? <Pause className="h-6 w-6 md:h-8 md:w-8 fill-current" /> : <Play className="h-6 w-6 md:h-8 md:w-8 fill-current" />}
                    </button>

                    <div className="hidden sm:flex items-center gap-6">
                      <button onClick={() => skip(-10)} className="text-white/60 hover:text-white transition-colors">
                        <RotateCcw className="h-5 w-5 md:h-6 md:w-6" />
                      </button>
                      <button onClick={() => skip(10)} className="text-white/60 hover:text-white transition-colors">
                        <RotateCw className="h-5 w-5 md:h-6 md:w-6" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4 group/volume">
                      <button onClick={handleToggleMute} className="text-white/60 hover:text-white transition-colors">
                        {muted || volume === 0 ? <VolumeX className="h-5 w-5 md:h-6 md:w-6" /> : <Volume2 className="h-5 w-5 md:h-6 md:w-6" />}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step="any"
                        value={muted ? 0 : volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-0 group-hover/volume:w-16 md:group-hover/volume:w-24 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-white transition-all overflow-hidden"
                      />
                    </div>

                    <div className="text-white/60 font-mono text-[10px] md:text-sm tracking-widest hidden lg:block">
                      {formatTime(played * duration)} <span className="mx-2 opacity-30">|</span> {formatTime(duration)}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 md:gap-10">
                    <button 
                      onClick={handleDownload}
                      className="text-white/60 hover:text-white transition-all flex items-center gap-2 group/dl"
                    >
                      <Download className="h-5 w-5 md:h-6 md:w-6 group-hover/dl:scale-110" />
                      <span className="hidden lg:block text-[10px] font-black uppercase tracking-widest">Download</span>
                    </button>

                    <div className="relative">
                      <button 
                        onClick={() => {
                          setShowSettings(!showSettings);
                          setSettingsTab('main');
                        }}
                        className={cn("p-2 rounded-full transition-all hover:bg-white/10", showSettings ? "text-primary-purple" : "text-white/60")}
                      >
                        <Settings className={cn("h-5 w-5 md:h-6 md:w-6 transition-transform duration-500", showSettings && "rotate-90")} />
                      </button>

                      <AnimatePresence>
                        {showSettings && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute bottom-full mb-6 right-0 w-64 bg-black/90 backdrop-blur-3xl border border-white/10 rounded-2xl p-2 shadow-2xl overflow-hidden"
                          >
                            {settingsTab === 'main' && (
                              <div className="space-y-1">
                                <div className="px-3 py-2 border-b border-white/5 mb-2">
                                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Playback Configuration</p>
                                </div>
                                <button onClick={() => setSettingsTab('speed')} className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors">
                                  <span className="flex items-center gap-3"><Zap className="h-3 w-3 text-primary-purple" /> Speed</span>
                                  <span className="text-zinc-500 flex items-center gap-1">{playbackRate}x <ChevronDown className="-rotate-90 h-3 w-3" /></span>
                                </button>
                                <button onClick={() => setSettingsTab('audio')} className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors">
                                  <span className="flex items-center gap-3"><Globe className="h-3 w-3 text-primary-purple" /> Audio</span>
                                  <span className="text-zinc-500 flex items-center gap-1">{audioTrack} <ChevronDown className="-rotate-90 h-3 w-3" /></span>
                                </button>
                              </div>
                            )}
                            {/* Sub-menus */}
                            {settingsTab === 'speed' && (
                                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-1">
                                  <button onClick={() => setSettingsTab('main')} className="w-full flex items-center gap-3 px-3 py-2 text-[9px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors">
                                    <ArrowLeft className="h-3 w-3" /> Back
                                  </button>
                                  {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map(rate => (
                                    <button key={rate} onClick={() => { setPlaybackRate(rate); setSettingsTab('main'); }} className={cn("w-full flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors", playbackRate === rate ? "bg-primary-purple text-white" : "text-gray-400 hover:bg-white/5")}>
                                      {rate}x {playbackRate === rate && <Check className="h-3 w-3" />}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <button onClick={toggleFullScreen} className="text-white/60 hover:text-white transition-all active:scale-90">
                      <Maximize className="h-5 w-5 md:h-6 md:w-6" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {playbackError && (
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center z-[60]">
              <WifiOff className="h-16 w-16 text-primary-magenta mb-4 animate-pulse" />
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Signal Lost</h3>
              <p className="text-zinc-500 text-xs uppercase tracking-widest mb-8">Re-establishing neural connection...</p>
              <button onClick={() => window.location.reload()} className="px-10 py-3 bg-primary-purple text-white font-black uppercase tracking-widest text-[10px] rounded-full shadow-lg shadow-primary-purple/30">Retry Link</button>
            </div>
          )}
        </div>
      </div>

      {/* Page Content Grid */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-6 py-12 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
        
        {/* Left Column: Details */}
        <div className={cn("space-y-16", isSeries ? "lg:col-span-8" : "lg:col-span-12")}>
          <div className="space-y-8">
            <div className="flex flex-wrap items-center gap-4">
              <span className="px-4 py-1.5 bg-primary-purple/10 text-primary-purple text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-primary-purple/20">
                {movie.media_type === 'tv' ? 'Series' : 'Feature Film'}
              </span>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <Calendar className="h-3 w-3" /> {movie.release_date || movie.year || '2026'}
              </span>
              <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest ml-auto lg:ml-0 bg-green-500/10 px-3 py-1 rounded-full">
                {movie.vote_average || '9.8'} Quality Score
              </span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none">
              {movie.title || movie.name}
            </h1>

            <div className="flex items-center gap-10">
              <div className="flex items-center gap-3 group cursor-default">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-zinc-500 group-hover:text-primary-purple group-hover:bg-primary-purple/10 transition-colors">
                  <Users className="h-4 w-4" />
                </div>
                <span className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Cast Information</span>
              </div>
              <div className="flex items-center gap-3 group cursor-pointer" onClick={() => handleShare('wa')}>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-zinc-500 group-hover:text-green-500 group-hover:bg-green-500/10 transition-colors">
                  <Share2 className="h-4 w-4" />
                </div>
                <span className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Share Broadcast</span>
              </div>
            </div>
          </div>

          {/* About Card */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-[3rem] p-8 md:p-16 space-y-12 relative overflow-hidden group">
            <div className="absolute -top-20 -right-20 p-20 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity rotate-12">
              <Info className="h-80 w-80" />
            </div>
            
            <div className="relative z-10">
              <h2 className="flex items-center gap-4 text-2xl font-black uppercase tracking-tighter mb-8">
                <div className="h-2 w-2 bg-primary-purple rounded-full animate-pulse" />
                About this title
              </h2>
              <p className="text-xl md:text-2xl text-zinc-400 font-medium leading-relaxed max-w-5xl">
                {movie.overview || movie.description || "In a world of shimmering light and shifting shadows, the journey of consciousness unfolds through visual poetry. Every frame is a testament to the future of digital expression."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-16 relative z-10">
              <div className="space-y-4">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">The Visionaries</p>
                <div className="flex flex-wrap gap-2">
                  {(movie.cast || ['Alex Mercer', 'Elias Sterling', 'Nyx Thorne']).map((name, i) => (
                    <span key={i} className="text-sm font-bold text-white uppercase tracking-widest border-b border-transparent hover:border-primary-purple transition-all cursor-crosshair">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Genetic Markers</p>
                <div className="flex flex-wrap gap-3">
                  {(movie.genres || ['Synthesis', 'Drama', 'Cyber']).map((g: any, i) => (
                    <span key={i} className="text-[10px] font-black text-primary-purple uppercase tracking-[0.2em] bg-primary-purple/5 px-3 py-1 rounded-full">
                      {typeof g === 'string' ? g : g.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Release Epoch</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-zinc-600" />
                  </div>
                  <span className="text-base font-bold text-white uppercase tracking-widest">{movie.release_date || movie.year || '2026'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Episodes (Series Only) */}
        {isSeries && (
          <div className="lg:col-span-4 space-y-10 lg:sticky lg:top-32 h-fit">
            <div className="flex items-end justify-between border-b border-white/5 pb-6">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter mb-1">Episodes</h2>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Season 01 • The Beginning</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-white/5 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                {movie.episodes?.length || 12} Items
              </span>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4 scrollbar-hide">
              {episodeList}
            </div>
            
            <div className="flex items-center gap-5 pt-6 border-t border-white/5">
              <button 
                disabled={activeEpisode === 1}
                onClick={() => setActiveEpisode(prev => Math.max(prev - 1, 1))}
                className="flex-1 flex items-center justify-center gap-3 py-5 rounded-[2rem] bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/10 disabled:opacity-20 transition-all active:scale-95"
              >
                <SkipBack className="h-4 w-4" /> Prev
              </button>
              <button 
                onClick={() => setActiveEpisode(prev => prev + 1)}
                className="flex-1 flex items-center justify-center gap-3 py-5 rounded-[2rem] bg-primary-purple text-white font-black uppercase tracking-widest text-[10px] hover:bg-primary-magenta transition-all active:scale-95 shadow-[0_10px_20px_rgba(153,69,255,0.2)]"
              >
                Next <SkipForward className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Discussion Section */}
      <section className="w-full max-w-7xl mx-auto px-6 pb-20">
        <Comments movieId={id || ''} />
      </section>

      {/* Recommended Section */}
      <section className="w-full max-w-7xl mx-auto px-6 pb-24">
        <div className="pt-12 border-t border-white/5">
          <MovieRow 
            title="More Like This" 
            fetchUrl={requests.fetchTrending}
            onMovieClick={(m) => {
              navigate(`/watch/${m.id}`);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      </section>

      {/* Site Footer Accent */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-20 border-t border-white/5 mt-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-gradient-to-tr from-primary-purple to-primary-magenta rounded-lg opacity-20" />
            <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.5em]">
              UNIFLEX SYSTEMS | EST 2026
            </p>
          </div>
          <div className="flex gap-10">
            {['Privacy', 'Legal', 'Support'].map(item => (
              <button key={item} className="text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors">
                {item}
              </button>
            ))}
          </div>
        </div>
      </footer>

    </motion.div>
  );
}
