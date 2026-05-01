import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  Volume1, 
  VolumeX, 
  Settings, 
  Maximize, 
  Minimize, 
  RotateCcw, 
  RotateCw, 
  FastForward, 
  SkipBack, 
  SkipForward,
  Gauge,
  Languages,
  Subtitles as SubtitlesIcon,
  X,
  Monitor
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Movie } from '../types';
import { useNavigation } from '../context/NavigationContext';
import { cn } from '../lib/utils';

interface VideoPlayerProps {
  movie: Movie;
  onClose?: () => void;
  isEmbed?: boolean;
}

export default function VideoPlayer({ movie, onClose, isEmbed = false }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedTime, setBufferedTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'main' | 'audio' | 'subtitles' | 'speed'>('main');
  const [selectedSubtitle, setSelectedSubtitle] = useState<string>(localStorage.getItem('uniflex_subtitle') || 'off');
  const [selectedAudio, setSelectedAudio] = useState<string>(localStorage.getItem('uniflex_audio') || 'original');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [skipFeedback, setSkipFeedback] = useState<{ type: 'forward' | 'backward', count: number } | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const skipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const { registerModal, unregisterModal } = useNavigation();

  useEffect(() => {
    if (showSettings) {
      const handleClose = () => setShowSettings(false);
      registerModal(handleClose);
      return () => unregisterModal(handleClose);
    }
  }, [showSettings, registerModal, unregisterModal]);

  const videoUrl = movie.videoUrl || 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4';

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const updateBuffered = () => {
      if (video.buffered.length > 0) {
        setBufferedTime(video.buffered.end(video.buffered.length - 1));
      }
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('progress', updateBuffered);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('progress', updateBuffered);
    };
  }, []);

  // Apply volume and playback rate
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
      videoRef.current.playbackRate = playbackRate;
    }
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
      audioRef.current.playbackRate = playbackRate;
    }
  }, [volume, isMuted, playbackRate]);

  // Controls visibility logic
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (!isDragging) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  };

  // Sync audio with video
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video || !audio || selectedAudio === 'original') return;

    const syncAudio = () => {
      if (Math.abs(audio.currentTime - video.currentTime) > 0.1) {
        audio.currentTime = video.currentTime;
      }
    };

    const handlePlay = () => audio.play();
    const handlePause = () => audio.pause();

    if (isPlaying) {
      audio.play().catch(e => console.error("Audio play failed", e));
    } else {
      audio.pause();
    }

    video.addEventListener('timeupdate', syncAudio);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    
    return () => {
      video.removeEventListener('timeupdate', syncAudio);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [isPlaying, selectedAudio]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      if (audioRef.current && selectedAudio !== 'original') {
        audioRef.current.currentTime = time;
      }
    }
  };

  const toggleFullscreen = () => {
    if (!playerRef.current) return;

    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleSubtitleChange = (lang: string) => {
    setSelectedSubtitle(lang);
    localStorage.setItem('uniflex_subtitle', lang);
    if (videoRef.current) {
      const tracks = videoRef.current.textTracks;
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].mode = tracks[i].language === lang ? 'showing' : 'disabled';
      }
    }
  };

  const handleAudioChange = (lang: string) => {
    setSelectedAudio(lang);
    localStorage.setItem('uniflex_audio', lang);
    if (videoRef.current) {
      videoRef.current.muted = lang !== 'original' || isMuted;
      if (lang !== 'original' && audioRef.current) {
        audioRef.current.currentTime = videoRef.current.currentTime;
        if (isPlaying) audioRef.current.play();
      }
    }
  };

  const handleSkip = (seconds: number) => {
    if (!videoRef.current) return;
    
    const newTime = Math.max(0, Math.min(videoRef.current.duration, videoRef.current.currentTime + seconds));
    videoRef.current.currentTime = newTime;
    if (audioRef.current && selectedAudio !== 'original') {
      audioRef.current.currentTime = newTime;
    }

    // Visual feedback logic
    const type = seconds > 0 ? 'forward' : 'backward';
    setSkipFeedback(prev => ({
      type,
      count: (prev?.type === type ? prev.count : 0) + 10
    }));

    if (skipTimeoutRef.current) clearTimeout(skipTimeoutRef.current);
    skipTimeoutRef.current = setTimeout(() => setSkipFeedback(null), 500);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'arrowleft':
          handleSkip(-10);
          break;
        case 'arrowright':
          handleSkip(10);
          break;
        case 'arrowup':
          e.preventDefault();
          setVolume(prev => Math.min(1, prev + 0.1));
          setIsMuted(false);
          break;
        case 'arrowdown':
          e.preventDefault();
          setVolume(prev => Math.max(0, prev - 0.1));
          break;
        case 'm':
          setIsMuted(prev => !prev);
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 't':
          setIsTheaterMode(prev => !prev);
          break;
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case '>':
          if (e.shiftKey) {
            const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
            const currentIndex = speeds.indexOf(playbackRate);
            if (currentIndex < speeds.length - 1) setPlaybackRate(speeds[currentIndex + 1]);
          }
          break;
        case '<':
          if (e.shiftKey) {
            const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
            const currentIndex = speeds.indexOf(playbackRate);
            if (currentIndex > 0) setPlaybackRate(speeds[currentIndex - 1]);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, selectedAudio]);

  return (
    <div 
      ref={playerRef}
      onMouseMove={handleMouseMove}
      className={cn(
        "bg-black flex items-center justify-center group/player overflow-hidden transition-all duration-500",
        (isEmbed && !isTheaterMode) ? "relative w-full aspect-video" : "fixed inset-0 z-[100]",
        isTheaterMode && "z-[150] bg-black"
      )}
    >
      {/* Theater Mode Background Dimming */}
      <AnimatePresence>
        {isTheaterMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[-1] pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div className={cn(
        "relative w-full h-full flex items-center justify-center transition-all duration-500",
        isTheaterMode && "max-w-7xl mx-auto aspect-video"
      )}>
        <video
          ref={videoRef}
          src={selectedAudio === 'original' ? videoUrl : undefined}
          className="w-full h-full object-contain"
          onClick={togglePlay}
          onDoubleClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            if (x < rect.width / 2) {
              handleSkip(-10);
            } else {
              handleSkip(10);
            }
          }}
          playsInline
        >
          {movie.subtitles?.map((sub) => (
            <track
              key={sub.lang}
              label={sub.label}
              kind="subtitles"
              srcLang={sub.lang}
              src={sub.src}
              default={selectedSubtitle === sub.lang}
            />
          ))}
        </video>

        {/* Skip Feedback Animation */}
        <AnimatePresence>
          {skipFeedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none z-50",
                skipFeedback.type === 'forward' ? 'right-[20%]' : 'left-[20%]'
              )}
            >
              <div className="bg-white/10 backdrop-blur-md rounded-full p-8 border border-white/20">
                {skipFeedback.type === 'forward' ? <RotateCw className="h-12 w-12 text-white" /> : <RotateCcw className="h-12 w-12 text-white" />}
                <span className="mt-2 text-2xl font-black text-white">{skipFeedback.count}s</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Big Play/Pause Center Overlay */}
        <AnimatePresence>
          {!isPlaying && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="p-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                <Play className="h-16 w-16 text-white fill-white" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Separate Audio Track for Dubbing */}
      {selectedAudio !== 'original' && (
        <audio
          ref={audioRef}
          src={movie.audioTracks?.find(a => a.language === selectedAudio)?.src}
          muted={isMuted}
        />
      )}

      {/* Custom Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 flex flex-col justify-between p-6 md:p-10 z-40"
          >
            {/* Top Bar */}
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-black text-white tracking-tighter uppercase drop-shadow-lg">
                  {movie.title || movie.name}
                </h2>
                <span className="px-2 py-0.5 rounded border border-white/20 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {movie.quality || 'HD'}
                </span>
              </div>
              {onClose && (
                <button 
                  onClick={onClose} 
                  className="p-3 rounded-full bg-white/5 hover:bg-white/20 border border-white/10 text-white transition-all duration-300 group"
                >
                  <X className="h-6 w-6 group-hover:rotate-90 transition-transform" />
                </button>
              )}
            </motion.div>

            {/* Bottom Controls */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="space-y-6"
            >
              {/* Progress Bar Container */}
              <div className="group/progress relative h-2 w-full bg-white/10 rounded-full cursor-pointer transition-all hover:h-2.5">
                {/* Buffered Bar */}
                <motion.div 
                  className="absolute inset-y-0 left-0 bg-white/20 rounded-full pointer-events-none" 
                  initial={false}
                  animate={{ width: `${(bufferedTime / (duration || 1)) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
                
                {/* Active Progress */}
                <motion.div 
                  className="absolute inset-y-0 left-0 bg-primary-purple rounded-full shadow-[0_0_20px_rgba(153,69,255,0.8)] z-10"
                  initial={false}
                  animate={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                  transition={isDragging ? { duration: 0 } : { type: 'spring', damping: 30, stiffness: 200 }}
                />
                
                {/* Scrubber Input */}
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeek}
                  onMouseDown={() => setIsDragging(true)}
                  onMouseUp={() => setIsDragging(false)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                />
                
                {/* Thumb Handle */}
                <motion.div 
                  className="absolute top-1/2 -translate-y-1/2 h-5 w-5 bg-white rounded-full border-2 border-primary-purple shadow-2xl z-20 opacity-0 group-hover/progress:opacity-100 transition-opacity pointer-events-none"
                  initial={false}
                  animate={{ left: `${(currentTime / (duration || 1)) * 100}%` }}
                  transition={isDragging ? { duration: 0 } : { type: 'spring', damping: 30, stiffness: 200 }}
                  style={{ transform: 'translate(-50%, -50%)' }}
                />
                
                {/* Time Tooltip */}
                <motion.div 
                  className="absolute bottom-full mb-4 px-2 py-1 bg-black/80 backdrop-blur-md rounded text-[10px] font-black text-white opacity-0 group-hover/progress:opacity-100 transition-opacity pointer-events-none"
                  initial={false}
                  animate={{ left: `${(currentTime / duration) * 100}%` }}
                  transition={isDragging ? { duration: 0 } : { type: 'spring', damping: 30, stiffness: 200 }}
                  style={{ transform: 'translateX(-50%)' }}
                >
                  {formatTime(currentTime)}
                </motion.div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-8">
                  <motion.button 
                    onClick={togglePlay} 
                    whileTap={{ scale: 1.2 }}
                    whileHover={{ scale: 1.1 }}
                    className="text-white"
                  >
                    {isPlaying ? <Pause className="h-10 w-10 fill-white" /> : <Play className="h-10 w-10 fill-white" />}
                  </motion.button>
                  
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => handleSkip(-10)} 
                      className="group/skip flex flex-col items-center text-white/70 hover:text-white transition-all duration-300"
                      title="Rewind 10s"
                    >
                      <RotateCcw className="h-8 w-8 group-hover/skip:-rotate-12 transition-transform" />
                      <span className="text-[8px] font-black mt-1">10s</span>
                    </button>
                    <button 
                      onClick={() => handleSkip(10)} 
                      className="group/skip flex flex-col items-center text-white/70 hover:text-white transition-all duration-300"
                      title="Fast Forward 10s"
                    >
                      <RotateCw className="h-8 w-8 group-hover/skip:rotate-12 transition-transform" />
                      <span className="text-[8px] font-black mt-1">10s</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-4 group/volume">
                    <button onClick={() => setIsMuted(!isMuted)} className="text-white/70 hover:text-white transition-colors">
                      {isMuted || volume === 0 ? <VolumeX className="h-8 w-8" /> : volume < 0.5 ? <Volume1 className="h-8 w-8" /> : <Volume2 className="h-8 w-8" />}
                    </button>
                    <div className="w-0 group-hover/volume:w-24 transition-all duration-300 overflow-hidden flex items-center">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => {
                          setVolume(parseFloat(e.target.value));
                          if (parseFloat(e.target.value) > 0) setIsMuted(false);
                        }}
                        className="w-24 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
                      />
                    </div>
                  </div>

                  <div className="text-sm font-black text-white/50 tracking-widest uppercase">
                    <span className="text-white">{formatTime(currentTime)}</span>
                    <span className="mx-2">/</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-8">
                  <div className="relative">
                    <button 
                      onClick={() => {
                        setShowSettings(!showSettings);
                        setSettingsTab('main');
                      }}
                      className={cn(
                        "text-white/70 hover:text-white transition-all duration-500",
                        showSettings && "text-primary-purple rotate-90"
                      )}
                    >
                      <Settings className="h-8 w-8" />
                    </button>

                    <AnimatePresence>
                      {showSettings && (
                        <motion.div
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 20, scale: 0.95 }}
                          className="absolute bottom-full right-0 mb-6 w-72 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[110]"
                        >
                          {settingsTab === 'main' && (
                            <div className="space-y-2">
                              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 px-2">Playback Settings</h3>
                              <button 
                                onClick={() => setSettingsTab('audio')}
                                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group"
                              >
                                <div className="flex items-center space-x-3">
                                  <Languages className="h-4 w-4 text-primary-purple" />
                                  <span className="text-sm font-bold">Audio</span>
                                </div>
                                <span className="text-xs text-gray-500 group-hover:text-white uppercase">{selectedAudio}</span>
                              </button>
                              <button 
                                onClick={() => setSettingsTab('subtitles')}
                                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group"
                              >
                                <div className="flex items-center space-x-3">
                                  <SubtitlesIcon className="h-4 w-4 text-primary-magenta" />
                                  <span className="text-sm font-bold">Subtitles</span>
                                </div>
                                <span className="text-xs text-gray-500 group-hover:text-white uppercase">{selectedSubtitle}</span>
                              </button>
                              <button 
                                onClick={() => setSettingsTab('speed')}
                                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group"
                              >
                                <div className="flex items-center space-x-3">
                                  <Gauge className="h-4 w-4 text-green-500" />
                                  <span className="text-sm font-bold">Speed</span>
                                </div>
                                <span className="text-xs text-gray-500 group-hover:text-white uppercase">{playbackRate}x</span>
                              </button>
                            </div>
                          )}

                          {settingsTab === 'audio' && (
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2 mb-4">
                                <button onClick={() => setSettingsTab('main')} className="p-1 hover:text-primary-purple transition-colors">
                                  <RotateCcw className="h-4 w-4" />
                                </button>
                                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Audio Tracks</h3>
                              </div>
                              <div className="space-y-1">
                                <button 
                                  onClick={() => handleAudioChange('original')}
                                  className={cn(
                                    "w-full text-left text-sm p-3 rounded-xl transition-all",
                                    selectedAudio === 'original' ? "bg-primary-purple text-white" : "hover:bg-white/5 text-gray-400"
                                  )}
                                >
                                  Original Audio
                                </button>
                                {movie.audioTracks?.map(track => (
                                  <button 
                                    key={track.language}
                                    onClick={() => handleAudioChange(track.language)}
                                    className={cn(
                                      "w-full text-left text-sm p-3 rounded-xl transition-all",
                                      selectedAudio === track.language ? "bg-primary-purple text-white" : "hover:bg-white/5 text-gray-400"
                                    )}
                                  >
                                    {track.language}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {settingsTab === 'subtitles' && (
                            <div className="space-y-4">
                              <div className="flex items-center space-x-2 -ml-2">
                                <button 
                                  onClick={() => setSettingsTab('main')} 
                                  className="p-2 hover:bg-white/10 rounded-full transition-colors group"
                                >
                                  <RotateCcw className="h-4 w-4 group-hover:-rotate-45 transition-transform" />
                                </button>
                                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Subtitle Configuration</h3>
                              </div>
                              <div className="space-y-1 max-h-64 overflow-y-auto pr-2 no-scrollbar">
                                <button 
                                  onClick={() => handleSubtitleChange('off')}
                                  className={cn(
                                    "w-full text-left text-sm p-4 rounded-2xl transition-all flex items-center justify-between group",
                                    selectedSubtitle === 'off' ? "bg-primary-magenta text-white shadow-lg shadow-primary-magenta/20" : "hover:bg-white/5 text-gray-400"
                                  )}
                                >
                                  <span className="font-bold">Off</span>
                                  {selectedSubtitle === 'off' && (
                                    <motion.div layoutId="sub-active" className="w-1.5 h-1.5 rounded-full bg-white" />
                                  )}
                                </button>
                                
                                {movie.subtitles?.map(sub => (
                                  <button 
                                    key={sub.lang}
                                    onClick={() => handleSubtitleChange(sub.lang)}
                                    className={cn(
                                      "w-full text-left text-sm p-4 rounded-2xl transition-all flex items-center justify-between group",
                                      selectedSubtitle === sub.lang ? "bg-primary-magenta text-white shadow-lg shadow-primary-magenta/20" : "hover:bg-white/5 text-gray-400"
                                    )}
                                  >
                                    <div className="flex flex-col">
                                      <span className="font-bold">{sub.label}</span>
                                      <span className="text-[8px] uppercase tracking-widest opacity-50">{sub.lang === 'ur' ? 'Native' : 'Default'}</span>
                                    </div>
                                    {selectedSubtitle === sub.lang && (
                                      <motion.div layoutId="sub-active" className="w-1.5 h-1.5 rounded-full bg-white" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {settingsTab === 'speed' && (
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2 mb-4">
                                <button onClick={() => setSettingsTab('main')} className="p-1 hover:text-primary-purple transition-colors">
                                  <RotateCcw className="h-4 w-4" />
                                </button>
                                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Playback Speed</h3>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                                  <button 
                                    key={speed}
                                    onClick={() => {
                                      setPlaybackRate(speed);
                                      setShowSettings(false);
                                    }}
                                    className={cn(
                                      "text-sm p-3 rounded-xl transition-all font-bold",
                                      playbackRate === speed ? "bg-green-500 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"
                                    )}
                                  >
                                    {speed}x
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button 
                    onClick={toggleFullscreen}
                    className="text-white/70 hover:text-white transition-all duration-300 hover:scale-110"
                    title="Fullscreen (f)"
                  >
                    {isFullscreen ? <Minimize className="h-8 w-8" /> : <Maximize className="h-8 w-8" />}
                  </button>

                  <button 
                    onClick={() => setIsTheaterMode(!isTheaterMode)}
                    className={cn(
                      "text-white/70 hover:text-white transition-all duration-300 hover:scale-110",
                      isTheaterMode && "text-primary-purple"
                    )}
                    title="Theater Mode (t)"
                  >
                    <Monitor className="h-8 w-8" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        video::cue {
          background: rgba(0, 0, 0, 0.7);
          color: white;
          font-family: 'Inter', sans-serif;
          font-size: 1.2rem;
          text-shadow: 1px 1px 2px black;
        }
      `}</style>
    </div>
  );
}
