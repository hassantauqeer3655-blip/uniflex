import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, Plus, X, Film, Type, FileText, Link as LinkIcon, 
  Tag, Globe, Loader2, CheckCircle2, Calendar, MapPin, 
  Search, BarChart3, LayoutDashboard, Users, TrendingUp,
  ChevronRight, Menu, ArrowLeft, Shield, Zap, Settings,
  ChevronUp, ChevronDown, GripVertical
} from 'lucide-react';
import BackButton from '../components/BackButton';
import Select from 'react-select';
import { GENRES, COUNTRIES, LANGUAGES, getYears, REGIONS, STATUSES } from '../lib/metadata';
import tmdb, { requests } from '../lib/tmdb';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { supabaseService } from '../services/supabaseService';
import { Movie } from '../types';

const YEARS = getYears();

interface Subtitle {
  label: string;
  lang: string;
  src: string;
}

const customSelectStyles = {
  control: (provided: any) => ({
    ...provided,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '0.75rem',
    padding: '4px',
    color: 'white',
    '&:hover': {
      borderColor: 'rgba(139, 92, 246, 0.5)',
    },
  }),
  menu: (provided: any) => ({
    ...provided,
    backgroundColor: '#18181b',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    zIndex: 200,
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#8b5cf6' : state.isFocused ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
    color: 'white',
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: 'white',
  }),
  input: (provided: any) => ({
    ...provided,
    color: 'white',
  }),
};

export default function AdminUpload() {
  const { user, userData, isAdmin: isAuthAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Content Management State
  const [movies, setMovies] = useState<Movie[]>([]);
  const [moviesLoading, setMoviesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Movie, direction: 'asc' | 'desc' } | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [view, setView] = useState<'upload' | 'analytics' | 'content' | 'settings'>('content');

  // Site Settings State
  const [siteSettings, setSiteSettings] = useState<any>({});
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // TMDB Search State
  const [tmdbSearchQuery, setTmdbSearchQuery] = useState('');
  const [tmdbResults, setTmdbResults] = useState<any[]>([]);
  const [isSearchingTMDB, setIsSearchingTMDB] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [category, setCategory] = useState('Trending');
  const [region, setRegion] = useState('International');
  const [status, setStatus] = useState('finished');
  const [isAnime, setIsAnime] = useState(false);
  const [country, setCountry] = useState('Pakistan');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [language, setLanguage] = useState('Urdu dub');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [views, setViews] = useState(0);
  const [trendingScore, setTrendingScore] = useState(0);
  const [trailerUrl, setTrailerUrl] = useState('');
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [episodes, setEpisodes] = useState<{ id: number, title: string, video_url: string }[]>([]);
  const [isAdult, setIsAdult] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthAdmin && user) {
      console.warn("Access Denied: Admin privileges required.");
      navigate('/');
    } else if (!loading && !user) {
      navigate('/login');
    }
  }, [user, navigate, loading, isAuthAdmin]);

  const isAdminUser = isAuthAdmin;

  useEffect(() => {
    if (view === 'analytics' && isAdminUser) {
      fetchStats();
    } else if (view === 'content' && isAdminUser) {
      fetchMovies();
    } else if (view === 'settings' && isAdminUser) {
      fetchSettings();
    }
  }, [view, isAdminUser]);

  const fetchSettings = async () => {
    setSettingsLoading(true);
    try {
      const data = await supabaseService.getSiteSettings();
      setSiteSettings(data);
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleUpdateSetting = async (key: string, value: string) => {
    try {
      await supabaseService.updateSiteSetting(key, value);
      setSiteSettings((prev: any) => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error(`Error updating setting ${key}:`, error);
    }
  };

  const handleRestoreDefaults = async () => {
    if (!window.confirm('WARNING: This will reset all MISSION statements and DASHBOARD headings to factory defaults. Continue?')) return;
    
    const defaults = {
      footerCopyright: '© 2026 UNIFLEX. ALL RIGHTS RESERVED.',
      footerMission: 'Redefining the future of cinematic streaming.',
      aboutMission: 'UNIFLEX was born from a simple yet ambitious vision: to create a streaming platform that doesn\'t just deliver content, but crafts an immersive viewing experience.',
      dashboardHeading: 'The Evolution of Entertainment',
      dashboardSubheading: 'Redefining the cinematic experience through advanced technology and high-performance architecture.',
      footerCol1Title: 'Support',
      footerCol2Title: 'Company',
      footerCol3Title: 'Legal',
      footerCol4Title: 'Technical'
    };

    setSettingsLoading(true);
    try {
      for (const [key, value] of Object.entries(defaults)) {
        await supabaseService.updateSiteSetting(key, value);
      }
      setSiteSettings(defaults);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      console.error("Restoration failed:", error);
    } finally {
      setSettingsLoading(false);
    }
  };

  const fetchMovies = async () => {
    setMoviesLoading(true);
    try {
      const { data } = await supabaseService.getMovies({ limit: 1000 });
      setMovies(data as Movie[]);
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setMoviesLoading(false);
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }
      
      setStats(data);
    } catch (error: any) {
      console.error("Error fetching stats:", error);
      setStats({ error: error.message });
    } finally {
      setStatsLoading(false);
    }
  };

  const searchTMDB = async () => {
    if (!tmdbSearchQuery.trim()) return;
    setIsSearchingTMDB(true);
    try {
      const { data } = await tmdb.get(requests.searchMovies(tmdbSearchQuery));
      setTmdbResults(data.results);
    } catch (error) {
      console.error("TMDB Search Error:", error);
    } finally {
      setIsSearchingTMDB(false);
    }
  };

  const syncWithTMDB = async (tmdbMovie: any) => {
    setTitle(tmdbMovie.title || tmdbMovie.name);
    setDescription(tmdbMovie.overview);
    setYear(tmdbMovie.release_date?.split('-')[0] || tmdbMovie.first_air_date?.split('-')[0] || year);
    setThumbnailPreview(`https://image.tmdb.org/t/p/w500${tmdbMovie.backdrop_path || tmdbMovie.poster_path}`);
    setTmdbResults([]);
    setTmdbSearchQuery('');
    
    // Fetch more details like trailer
    try {
      const type = tmdbMovie.media_type || (tmdbMovie.title ? 'movie' : 'tv');
      const { data } = await tmdb.get(requests.fetchMovieDetails(tmdbMovie.id, type));
      if (data.videos?.results) {
        const trailer = data.videos.results.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
        if (trailer) {
          setTrailerUrl(`https://www.youtube.com/watch?v=${trailer.key}`);
        }
      }
    } catch (error) {
      console.error("Error fetching extra TMDB details:", error);
    }
  };

  const handleSort = (key: keyof Movie) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedMovies = [...movies].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    const valA = a[key];
    const valB = b[key];

    if (valA === valB) return 0;
    if (valA === null || valA === undefined) return 1;
    if (valB === null || valB === undefined) return -1;

    if (direction === 'asc') {
      return valA < valB ? -1 : 1;
    } else {
      return valA > valB ? -1 : 1;
    }
  }).filter(m => 
    m.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addSubtitle = () => {
    setSubtitles([...subtitles, { label: '', lang: '', src: '' }]);
  };

  const removeSubtitle = (index: number) => {
    setSubtitles(subtitles.filter((_, i) => i !== index));
  };

  const updateSubtitle = (index: number, field: keyof Subtitle, value: string) => {
    const newSubtitles = [...subtitles];
    newSubtitles[index][field] = value;
    setSubtitles(newSubtitles);
  };

  const moveEpisode = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === episodes.length - 1)) return;
    const newEpisodes = [...episodes];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newEpisodes[index], newEpisodes[targetIndex]] = [newEpisodes[targetIndex], newEpisodes[index]];
    setEpisodes(newEpisodes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminUser) return;

    setLoading(true);
    try {
      let thumbnailUrl = '';
      if (thumbnail) {
        thumbnailUrl = await supabaseService.uploadFile('posters', `${Date.now()}_${thumbnail.name}`, thumbnail);
      } else if (thumbnailPreview && thumbnailPreview.startsWith('http')) {
        thumbnailUrl = thumbnailPreview;
      }

      const moviePayload = {
        title,
        description,
        video_url: videoUrl,
        trailer_url: trailerUrl,
        category,
        region: region as any,
        status: status as any,
        is_anime: isAnime,
        backdrop_url: thumbnailUrl,
        poster_url: thumbnailUrl,
        subtitles: subtitles as any,
        episodes: episodes as any,
        is_adult: isAdult,
        vote_average: editingMovie?.vote_average || 0,
        views: views,
        trending_score: trendingScore,
        release_date: year.includes('s') ? `${year.replace('s', '0')}-01-01` : `${year}-01-01`,
        media_type: editingMovie?.media_type || 'movie',
        is_series: category.toLowerCase().includes('series') || category.toLowerCase().includes('tv')
      };

      if (editingMovie) {
        await supabaseService.updateMovie(editingMovie.id, moviePayload);
      } else {
        await supabaseService.addMovie(moviePayload);
      }

      setSuccess(true);
      if (view === 'content') fetchMovies();
      
      setTimeout(() => {
        setSuccess(false);
        setIsAddModalOpen(false);
        setEditingMovie(null);
        // Reset form
        setTitle('');
        setDescription('');
        setVideoUrl('');
        setTrailerUrl('');
        setCategory('Trending');
        setRegion('International');
        setStatus('finished');
        setIsAnime(false);
        setThumbnail(null);
        setThumbnailPreview(null);
        setViews(0);
        setTrendingScore(0);
        setSubtitles([]);
        setEpisodes([]);
        setIsAdult(false);
      }, 2000);

    } catch (error) {
      console.error("Error adding movie:", error);
      alert("Failed to add movie. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthAdmin) return null;

  return (
    <div className="min-h-screen bg-bg-dark text-white font-sans selection:bg-primary-purple selection:text-white flex">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="fixed left-0 top-0 h-full bg-card-dark/50 backdrop-blur-3xl border-r border-white/5 z-[60] flex flex-col transition-all duration-500"
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-purple to-primary-magenta flex items-center justify-center shadow-lg shadow-primary-purple/20">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="font-black text-lg tracking-tighter uppercase">Admin <span className="text-primary-purple">Home</span></span>
            </motion.div>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-4">
          <div className="px-4 mb-4">
            <p className={cn(
              "text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 transition-opacity",
              !isSidebarOpen && "opacity-0"
            )}>Main Operations</p>
          </div>
          <motion.button 
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              console.log("Action Triggered: Admin View -> Upload");
              setView('upload');
            }}
            className={cn(
              "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group relative",
              view === 'upload' ? "bg-primary-purple text-white shadow-lg shadow-primary-purple/20" : "text-gray-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <Upload className="h-5 w-5 shrink-0" />
            {isSidebarOpen && <span className="font-bold text-xs uppercase tracking-[0.2em]">Upload Factory</span>}
            {!isSidebarOpen && view === 'upload' && <div className="absolute left-0 w-1 h-6 bg-white rounded-r-full" />}
          </motion.button>
          <motion.button 
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              console.log("Action Triggered: Admin View -> Content");
              setView('content');
            }}
            className={cn(
              "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group relative",
              view === 'content' ? "bg-primary-purple text-white shadow-lg shadow-primary-purple/20" : "text-gray-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <Film className="h-5 w-5 shrink-0" />
            {isSidebarOpen && <span className="font-bold text-xs uppercase tracking-[0.2em]">Content Registry</span>}
            {!isSidebarOpen && view === 'content' && <div className="absolute left-0 w-1 h-6 bg-white rounded-r-full" />}
          </motion.button>

          <div className="pt-6 px-4 mb-4">
            <p className={cn(
              "text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 transition-opacity",
              !isSidebarOpen && "opacity-0"
            )}>Intelligence</p>
          </div>
          <motion.button 
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setView('analytics')}
            className={cn(
              "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group relative",
              view === 'analytics' ? "bg-primary-purple text-white shadow-lg shadow-primary-purple/20" : "text-gray-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <BarChart3 className="h-5 w-5 shrink-0" />
            {isSidebarOpen && <span className="font-bold text-xs uppercase tracking-[0.2em]">Dashboard Stats</span>}
            {!isSidebarOpen && view === 'analytics' && <div className="absolute left-0 w-1 h-6 bg-white rounded-r-full" />}
          </motion.button>
          <motion.button 
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setView('settings')}
            className={cn(
              "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group relative",
              view === 'settings' ? "bg-primary-purple text-white shadow-lg shadow-primary-purple/20" : "text-gray-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <Settings className="h-5 w-5 shrink-0" />
            {isSidebarOpen && <span className="font-bold text-xs uppercase tracking-[0.2em]">System Config</span>}
            {!isSidebarOpen && view === 'settings' && <div className="absolute left-0 w-1 h-6 bg-white rounded-r-full" />}
          </motion.button>
        </nav>

        <div className="p-4 border-t border-white/5">
          <motion.button 
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-gray-500 hover:text-white transition-colors group"
          >
            <ArrowLeft className="h-5 w-5 shrink-0 group-hover:-translate-x-1 transition-transform" />
            {isSidebarOpen && <span className="font-bold text-xs uppercase tracking-widest">Exit Home</span>}
          </motion.button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-500 min-h-screen",
        isSidebarOpen ? "ml-[280px]" : "ml-[80px]"
      )}>
        <div className="max-w-6xl mx-auto px-8 py-12">
          {/* Header with Back Button */}
          <div className="flex items-center gap-6 mb-12">
            <motion.button
              whileHover={{ x: -4 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(-1)}
              className="p-3 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-primary-purple/20 hover:border-primary-purple/50 transition-all group"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            </motion.button>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter text-white">
                {view === 'upload' && "Content Upload"}
                {view === 'content' && "Library Manager"}
                {view === 'analytics' && "Platform Insights"}
                {view === 'settings' && "System Parameters"}
              </h1>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Admin Central / <span className="text-primary-purple">{view}</span></p>
            </div>
          </div>

          {view === 'content' ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-2">
                    Content <span className="text-primary-purple">Manager</span>
                  </h1>
                  <p className="text-gray-500 text-lg">Manage and curate the UNIFLEX movie library.</p>
                </div>
                <button 
                  onClick={() => {
                    setEditingMovie(null);
                    setTitle('');
                    setDescription('');
                    setVideoUrl('');
                    setTrailerUrl('');
                    setCategory('Trending');
                    setRegion('International');
                    setStatus('finished');
                    setIsAnime(false);
                    setThumbnail(null);
                    setThumbnailPreview(null);
                    setEpisodes([]);
                    setSubtitles([]);
                    setIsAddModalOpen(true);
                  }}
                  className="flex items-center gap-3 px-8 py-4 bg-primary-purple text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary-purple/20 hover:bg-primary-magenta transition-all"
                >
                  <Plus className="h-5 w-5" />
                  Add New Content
                </button>
              </div>

              {/* Search and Filters */}
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input 
                    type="text"
                    placeholder="Search by title or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 focus:outline-none focus:border-primary-purple transition-all"
                  />
                </div>
              </div>

              {/* Content Table */}
              <div className="bg-card-dark/50 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/5">
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('title')}>
                          Title {sortConfig?.key === 'title' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('category')}>
                          Category {sortConfig?.key === 'category' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('status')}>
                          Status {sortConfig?.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('release_date')}>
                          Release Date {sortConfig?.key === 'release_date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {moviesLoading ? (
                        <tr>
                          <td colSpan={5} className="px-8 py-20 text-center">
                            <Loader2 className="h-8 w-8 text-primary-purple animate-spin mx-auto mb-4" />
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Library...</p>
                          </td>
                        </tr>
                      ) : sortedMovies.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-8 py-20 text-center text-gray-500">
                            No content found matching your criteria.
                          </td>
                        </tr>
                      ) : (
                        sortedMovies.map((m) => (
                          <tr key={m.id} className="hover:bg-white/5 transition-colors group">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <img 
                                  src={m.poster_url || m.backdrop_url || 'https://via.placeholder.com/150'} 
                                  className="h-12 w-8 rounded object-cover bg-white/5"
                                  alt=""
                                />
                                <span className="font-bold text-white group-hover:text-primary-purple transition-colors">{m.title}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                {m.category}
                              </span>
                            </td>
                            <td className="px-8 py-6">
                              <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                m.status === 'finished' ? "bg-green-500/10 text-green-500 border border-green-500/20" :
                                m.status === 'ongoing' ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" :
                                "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                              )}>
                                {m.status}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-zinc-500 font-mono text-xs">
                              {m.release_date ? new Date(m.release_date).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={() => {
                                    setEditingMovie(m);
                                    // Populate form fields
                                    setTitle(m.title || '');
                                    setDescription(m.description || '');
                                    setVideoUrl(m.video_url || '');
                                    setTrailerUrl(m.trailer_url || '');
                                    setCategory(m.category || 'Trending');
                                    setRegion(m.region || 'International');
                                    setStatus(m.status || 'finished');
                                    setIsAnime(m.is_anime || false);
                                    setThumbnailPreview(m.poster_url || m.backdrop_url || null);
                                    setViews(m.views || 0);
                                    setTrendingScore(m.trending_score || 0);
                                    setEpisodes(m.episodes || []);
                                    setSubtitles(m.subtitles || []);
                                    setIsAdult(m.is_adult || false);
                                    setIsAddModalOpen(true);
                                  }}
                                  className="p-2 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-white transition-all"
                                >
                                  <Type className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={async () => {
                                    if (window.confirm(`Are you sure you want to permanently delete "${m.title}"?`)) {
                                      try {
                                        await supabaseService.deleteMovie(m.id);
                                        fetchMovies();
                                      } catch (e) {
                                        console.error("Deletion Error:", e);
                                        alert("Failed to delete. Check console.");
                                      }
                                    }
                                  }}
                                  className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-500 hover:text-red-500 transition-all"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          ) : view === 'upload' ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-4">
                    Content <span className="text-primary-purple">Sync</span>
                  </h1>
                  <p className="text-gray-500 text-lg">Add new titles to the global library.</p>
                </div>
                
                {/* TMDB Quick Search */}
                <div className="relative w-full md:w-96">
                  <div className="relative">
                    <input 
                      type="text"
                      value={tmdbSearchQuery}
                      onChange={(e) => setTmdbSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && searchTMDB()}
                      placeholder="TMDB Quick Sync..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 pl-12 focus:outline-none focus:border-primary-purple transition-all text-sm"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    {isSearchingTMDB && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-purple animate-spin" />}
                  </div>

                  <AnimatePresence>
                    {tmdbResults.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-card-dark border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto backdrop-blur-2xl"
                      >
                        {tmdbResults.map((res) => (
                          <button
                            key={res.id}
                            onClick={() => syncWithTMDB(res)}
                            className="w-full p-4 flex gap-4 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
                          >
                            <img 
                              src={`https://image.tmdb.org/t/p/w92${res.poster_path}`} 
                              className="w-12 h-18 rounded-lg object-cover bg-white/5" 
                              alt="" 
                            />
                            <div>
                              <p className="font-bold text-sm text-white">{res.title || res.name}</p>
                              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                                {res.release_date?.split('-')[0] || res.first_air_date?.split('-')[0]} • {res.media_type}
                              </p>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-12">
                {/* Thumbnail Upload */}
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="aspect-video w-full rounded-[2.5rem] border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-primary-purple/50 group-hover:bg-white/10 shadow-2xl">
                    {thumbnailPreview ? (
                      <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                          <Upload className="w-8 h-8 text-gray-600 group-hover:text-primary-purple transition-colors" />
                        </div>
                        <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-xs">Thumbnail Upload</p>
                      </div>
                    )}
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleThumbnailChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                  {/* Title */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                      <Type className="w-3 h-3" /> Basic Information
                    </label>
                    <input 
                      required
                      type="text" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary-purple transition-all font-bold"
                      placeholder="Content Title"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                      <Tag className="w-3 h-3" /> Genre / Category
                    </label>
                    <Select
                      styles={customSelectStyles}
                      options={GENRES.map(g => ({ value: g, label: g }))}
                      value={{ value: category, label: category }}
                      onChange={(opt: any) => setCategory(opt.value)}
                    />
                  </div>

                  {/* Region */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                      <Globe className="w-3 h-3" /> Origin Region
                    </label>
                    <Select
                      styles={customSelectStyles}
                      options={REGIONS.map(r => ({ value: r, label: r }))}
                      value={{ value: region, label: region }}
                      onChange={(opt: any) => setRegion(opt.value)}
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                      <CheckCircle2 className="w-3 h-3" /> Release Status
                    </label>
                    <Select
                      styles={customSelectStyles}
                      options={STATUSES.map(s => ({ value: s, label: s }))}
                      value={{ value: status, label: status }}
                      onChange={(opt: any) => setStatus(opt.value)}
                    />
                  </div>

                  {/* Anime Toggle */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                      <Film className="w-3 h-3" /> Content Type
                    </label>
                    <div 
                      onClick={() => setIsAnime(!isAnime)}
                      className={cn(
                        "w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 cursor-pointer transition-all flex items-center justify-between group",
                        isAnime && "border-primary-purple bg-primary-purple/5"
                      )}
                    >
                      <span className="text-sm font-bold uppercase tracking-widest">{isAnime ? 'Anime Universe' : 'Standard Cinema'}</span>
                      <div className={cn(
                        "w-12 h-6 rounded-full transition-all relative",
                        isAnime ? "bg-primary-purple" : "bg-gray-800"
                      )}>
                        <motion.div 
                          animate={{ x: isAnime ? 24 : 4 }}
                          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-lg" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Country */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                      <BarChart3 className="w-3 h-3" /> Initial Views
                    </label>
                    <input 
                      type="number" 
                      value={views}
                      onChange={(e) => setViews(parseInt(e.target.value) || 0)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary-purple transition-all"
                      placeholder="e.g. 5000"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                      <TrendingUp className="w-3 h-3" /> Trending Score (0-100)
                    </label>
                    <input 
                      type="number" 
                      value={trendingScore}
                      onChange={(e) => setTrendingScore(parseInt(e.target.value) || 0)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary-purple transition-all"
                      placeholder="e.g. 85"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                      <MapPin className="w-3 h-3" /> Country
                    </label>
                    <Select
                      styles={customSelectStyles}
                      options={COUNTRIES.map(c => ({ value: c, label: c }))}
                      value={{ value: country, label: country }}
                      onChange={(opt: any) => setCountry(opt.value)}
                    />
                  </div>

                  {/* 18+ Label Toggle */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                      <Shield className="w-3 h-3" /> Age Restriction
                    </label>
                    <div 
                      onClick={() => setIsAdult(!isAdult)}
                      className={cn(
                        "w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 cursor-pointer transition-all flex items-center justify-between group",
                        isAdult && "border-red-500 bg-red-500/5"
                      )}
                    >
                      <span className={cn(
                        "text-sm font-bold uppercase tracking-widest",
                        isAdult ? "text-red-500" : "text-zinc-400"
                      )}>
                        {isAdult ? "18+ Adult Content" : "General Audience"}
                      </span>
                      <div className={cn(
                        "w-12 h-6 rounded-full transition-all relative",
                        isAdult ? "bg-red-500" : "bg-gray-800"
                      )}>
                        <motion.div 
                          animate={{ x: isAdult ? 24 : 4 }}
                          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-lg" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                    <FileText className="w-3 h-3" /> Content Summary
                  </label>
                  <textarea 
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-8 py-6 focus:outline-none focus:border-primary-purple transition-all resize-none leading-relaxed"
                    placeholder="Describe the content..."
                  />
                </div>

                {/* Video URLs */}
                <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                      <LinkIcon className="w-3 h-3" /> Main Stream Link
                    </label>
                    <input 
                      required
                      type="url" 
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary-purple transition-all"
                      placeholder="Video stream URL"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                      <LinkIcon className="w-3 h-3" /> Trailer Preview (YouTube)
                    </label>
                    <input 
                      type="url" 
                      value={trailerUrl}
                      onChange={(e) => setTrailerUrl(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary-purple transition-all"
                      placeholder="YouTube trailer URL"
                    />
                  </div>
                </div>

                {/* Episodes */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                        <Film className="w-3 h-3" /> Episodes Registry
                      </label>
                      <p className="text-[9px] text-zinc-500 uppercase tracking-widest mt-1">Add episodes for series content</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setEpisodes([...episodes, { id: Date.now(), title: `Episode ${episodes.length + 1}`, video_url: '' }])}
                      className="group flex items-center gap-2 px-4 py-2 bg-primary-purple/10 border border-primary-purple/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary-purple hover:bg-primary-purple hover:text-white transition-all shadow-lg shadow-primary-purple/10"
                    >
                      <Plus className="h-3 w-3 group-hover:scale-110 transition-transform" /> 
                      Add New Episode
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {episodes.map((ep, idx) => (
                        <motion.div 
                          key={ep.id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="flex gap-4 items-center bg-white/5 p-5 rounded-2xl border border-white/10 group hover:border-primary-purple/30 hover:bg-white/[0.07] transition-all"
                        >
                          <div className="flex flex-col gap-1">
                            <button 
                              type="button"
                              onClick={() => moveEpisode(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 text-zinc-600 hover:text-primary-purple disabled:opacity-0 transition-all"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </button>
                            <div className="px-1">
                              <GripVertical className="h-4 w-4 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
                            </div>
                            <button 
                              type="button"
                              onClick={() => moveEpisode(idx, 'down')}
                              disabled={idx === episodes.length - 1}
                              className="p-1 text-zinc-600 hover:text-primary-purple disabled:opacity-0 transition-all"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest ml-1">Title</span>
                              <input 
                                type="text"
                                placeholder="Episode Title (e.g. S01E01)"
                                value={ep.title}
                                onChange={(e) => {
                                  const newEpisodes = [...episodes];
                                  newEpisodes[idx].title = e.target.value;
                                  setEpisodes(newEpisodes);
                                }}
                                className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-purple/50 transition-all text-zinc-200"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest ml-1">Stream URL</span>
                              <input 
                                type="url"
                                placeholder="Video source URL"
                                value={ep.video_url}
                                onChange={(e) => {
                                  const newEpisodes = [...episodes];
                                  newEpisodes[idx].video_url = e.target.value;
                                  setEpisodes(newEpisodes);
                                }}
                                className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-purple/50 transition-all text-zinc-200"
                              />
                            </div>
                          </div>
                          
                          <button 
                            type="button"
                            onClick={() => setEpisodes(episodes.filter((_, i) => i !== idx))}
                            className="p-3 text-zinc-600 hover:text-red-500 transition-colors rounded-xl hover:bg-red-500/10"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {episodes.length === 0 && (
                      <div className="text-center py-10 border-2 border-dashed border-white/5 rounded-3xl">
                        <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">No segments added yet</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-8">
                  <button 
                    disabled={loading}
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary-purple to-primary-magenta text-white font-black uppercase tracking-[0.4em] py-6 rounded-[2rem] transition-all duration-500 shadow-2xl shadow-primary-purple/30 flex items-center justify-center gap-4 disabled:opacity-50 hover:scale-[1.02] active:scale-95"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Plus className="w-6 h-6" />
                        Upload Content
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          ) : view === 'analytics' ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-12"
            >
              <div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-4">
                  User <span className="text-primary-purple">Analytics</span>
                </h1>
                <p className="text-gray-500 text-lg">Real-time stats from the UNIFLEX platform.</p>
              </div>

              {statsLoading ? (
                <div className="flex items-center justify-center py-32">
                  <Loader2 className="h-12 w-12 text-primary-purple animate-spin" />
                </div>
              ) : stats?.error ? (
                <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-[2.5rem] text-center space-y-4">
                  <Shield className="h-12 w-12 text-red-500 mx-auto" />
                  <h3 className="text-xl font-bold text-white">Analytics Restricted</h3>
                  <p className="text-gray-400 max-w-md mx-auto">{stats.error}</p>
                  <button 
                    onClick={fetchStats}
                    className="px-6 py-2 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors"
                  >
                    Retry Connection
                  </button>
                </div>
              ) : stats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-card-dark/50 backdrop-blur-3xl border border-white/5 p-8 rounded-[2.5rem] space-y-4">
                    <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Total Users</p>
                      <h3 className="text-4xl font-black text-white mt-1">{stats.totalUsers}</h3>
                    </div>
                  </div>

                  <div className="bg-card-dark/50 backdrop-blur-3xl border border-white/5 p-8 rounded-[2.5rem] space-y-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary-purple/10 flex items-center justify-center text-primary-purple">
                      <Film className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Library Size</p>
                      <h3 className="text-4xl font-black text-white mt-1">{stats.totalMovies}</h3>
                    </div>
                  </div>

                  {/* Category Distribution */}
                  <div className="md:col-span-2 lg:col-span-4 bg-card-dark/50 backdrop-blur-3xl border border-white/5 p-10 rounded-[3rem] space-y-8">
                    <h4 className="text-xl font-black uppercase tracking-tighter">Category Distribution</h4>
                    <div className="space-y-6">
                      {Object.entries(stats.categoryStats).map(([cat, count]: any) => (
                        <div key={cat} className="space-y-2">
                          <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                            <span className="text-gray-400">{cat}</span>
                            <span className="text-primary-purple">{count} Titles</span>
                          </div>
                          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(count / stats.totalMovies) * 100}%` }}
                              className="h-full bg-gradient-to-r from-primary-purple to-primary-magenta"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-32 text-gray-500">Failed to load telemetry data.</div>
              )}
            </motion.div>
          ) : view === 'settings' ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-4">
                    Site <span className="text-primary-purple">Config</span>
                  </h1>
                  <p className="text-gray-500 text-lg">Modify the site settings.</p>
                </div>
                <button 
                  onClick={handleRestoreDefaults}
                  disabled={settingsLoading}
                  className="px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 h-fit"
                >
                  Restore Defaults
                </button>
              </div>

              {settingsLoading ? (
                <div className="flex items-center justify-center py-32">
                  <Loader2 className="h-12 w-12 text-primary-purple animate-spin" />
                </div>
              ) : (
                <div className="bg-card-dark/50 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-10 space-y-10">
                  <div className="grid gap-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">App Name</label>
                      <input 
                        type="text"
                        value={siteSettings?.appName || 'UNIFLEX'}
                        onChange={(e) => handleUpdateSetting('appName', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary-purple transition-all"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Footer Mission Statement</label>
                      <textarea 
                        value={siteSettings?.footerMission || ''}
                        onChange={(e) => handleUpdateSetting('footerMission', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary-purple transition-all resize-none"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Footer Copyright</label>
                      <input 
                        type="text"
                        value={siteSettings?.footerCopyright || '© 2026 UNIFLEX. All rights reserved.'}
                        onChange={(e) => handleUpdateSetting('footerCopyright', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary-purple transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Dashboard Heading</label>
                        <input 
                          type="text"
                          value={siteSettings?.dashboardHeading || 'The Evolution of Entertainment'}
                          onChange={(e) => handleUpdateSetting('dashboardHeading', e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary-purple transition-all"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Dashboard Subheading</label>
                        <input 
                          type="text"
                          value={siteSettings?.dashboardSubheading || 'Redefining the cinematic experience...'}
                          onChange={(e) => handleUpdateSetting('dashboardSubheading', e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary-purple transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">About Mission Statement</label>
                      <textarea 
                        value={siteSettings?.aboutMission || ''}
                        onChange={(e) => handleUpdateSetting('aboutMission', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary-purple transition-all resize-none"
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Footer Column 1 Title</label>
                        <input 
                          type="text"
                          value={siteSettings?.footerCol1Title || 'Support'}
                          onChange={(e) => handleUpdateSetting('footerCol1Title', e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary-purple transition-all"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Footer Column 2 Title</label>
                        <input 
                          type="text"
                          value={siteSettings?.footerCol2Title || 'Company'}
                          onChange={(e) => handleUpdateSetting('footerCol2Title', e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary-purple transition-all"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Footer Column 3 Title</label>
                        <input 
                          type="text"
                          value={siteSettings?.footerCol3Title || 'Legal'}
                          onChange={(e) => handleUpdateSetting('footerCol3Title', e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary-purple transition-all"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Footer Column 4 Title</label>
                        <input 
                          type="text"
                          value={siteSettings?.footerCol4Title || 'Technical'}
                          onChange={(e) => handleUpdateSetting('footerCol4Title', e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary-purple transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : null}
        </div>
      </main>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingMovie(null);
              }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-zinc-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter">
                    {editingMovie ? 'Edit' : 'Add New'} <span className="text-primary-purple">Content</span>
                  </h2>
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Content Management</p>
                </div>
                <button 
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingMovie(null);
                  }}
                  className="p-3 hover:bg-white/5 rounded-2xl transition-colors text-zinc-500 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-8 scrollbar-hide">
                <form onSubmit={handleSubmit} className="space-y-12">
                  {/* Reuse the existing form fields here - I'll move the form logic to a separate component or just repeat it for now to be safe with tool calls */}
                  {/* Thumbnail Upload */}
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="aspect-video w-full rounded-[2.5rem] border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-primary-purple/50 group-hover:bg-white/10 shadow-2xl">
                      {thumbnailPreview ? (
                        <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center">
                          <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                            <Upload className="w-8 h-8 text-gray-600 group-hover:text-primary-purple transition-colors" />
                          </div>
                          <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-xs">Thumbnail Upload</p>
                        </div>
                      )}
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleThumbnailChange} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                    {/* Title */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                        <Type className="w-3 h-3" /> Core Identity
                      </label>
                      <input 
                        required
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary-purple transition-all font-bold"
                        placeholder="Content Title"
                      />
                    </div>

                    {/* Category */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                        <Tag className="w-3 h-3" /> Classification
                      </label>
                      <Select
                        styles={customSelectStyles}
                        options={GENRES.map(g => ({ value: g, label: g }))}
                        value={{ value: category, label: category }}
                        onChange={(opt: any) => setCategory(opt.value)}
                      />
                    </div>

                    {/* Region */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                        <Globe className="w-3 h-3" /> Sector Origin
                      </label>
                      <Select
                        styles={customSelectStyles}
                        options={REGIONS.map(r => ({ value: r, label: r }))}
                        value={{ value: region, label: region }}
                        onChange={(opt: any) => setRegion(opt.value)}
                      />
                    </div>

                    {/* Status */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                        <CheckCircle2 className="w-3 h-3" /> Sync Status
                      </label>
                      <Select
                        styles={customSelectStyles}
                        options={STATUSES.map(s => ({ value: s, label: s }))}
                        value={{ value: status, label: status }}
                        onChange={(opt: any) => setStatus(opt.value)}
                      />
                    </div>

                    {/* Anime Toggle */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                        <Film className="w-3 h-3" /> Visual Engine
                      </label>
                      <div 
                        onClick={() => setIsAnime(!isAnime)}
                        className={cn(
                          "w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 cursor-pointer transition-all flex items-center justify-between group",
                          isAnime && "border-primary-purple bg-primary-purple/5"
                        )}
                      >
                        <span className="text-sm font-bold uppercase tracking-widest">{isAnime ? 'Anime Universe' : 'Standard Cinema'}</span>
                        <div className={cn(
                          "w-12 h-6 rounded-full transition-all relative",
                          isAnime ? "bg-primary-purple" : "bg-gray-800"
                        )}>
                          <motion.div 
                            animate={{ x: isAnime ? 24 : 4 }}
                            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-lg" 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Country */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                        <MapPin className="w-3 h-3" /> Geo-Tag
                      </label>
                      <Select
                        styles={customSelectStyles}
                        options={COUNTRIES.map(c => ({ value: c, label: c }))}
                        value={{ value: country, label: country }}
                        onChange={(opt: any) => setCountry(opt.value)}
                      />
                    </div>

                    {/* 18+ Label Toggle for Modal */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                        <Shield className="w-3 h-3" /> Age Restriction
                      </label>
                      <div 
                        onClick={() => setIsAdult(!isAdult)}
                        className={cn(
                          "w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 cursor-pointer transition-all flex items-center justify-between group",
                          isAdult && "border-red-500 bg-red-500/5"
                        )}
                      >
                        <span className={cn(
                          "text-sm font-bold uppercase tracking-widest",
                          isAdult ? "text-red-500" : "text-zinc-400"
                        )}>
                          {isAdult ? "18+ Adult Content" : "General Audience"}
                        </span>
                        <div className={cn(
                          "w-12 h-6 rounded-full transition-all relative",
                          isAdult ? "bg-red-500" : "bg-gray-800"
                        )}>
                          <motion.div 
                            animate={{ x: isAdult ? 24 : 4 }}
                            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-lg" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                      <FileText className="w-3 h-3" /> Content Summary
                    </label>
                    <textarea 
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={5}
                      className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-8 py-6 focus:outline-none focus:border-primary-purple transition-all resize-none leading-relaxed"
                      placeholder="Describe the content..."
                    />
                  </div>

                  {/* Video URLs */}
                  <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                        <LinkIcon className="w-3 h-3" /> Main Stream Link
                      </label>
                      <input 
                        required
                        type="url" 
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary-purple transition-all"
                        placeholder="Video stream URL"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                        <LinkIcon className="w-3 h-3" /> Trailer Preview (YouTube)
                      </label>
                      <input 
                        type="url" 
                        value={trailerUrl}
                        onChange={(e) => setTrailerUrl(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary-purple transition-all"
                        placeholder="YouTube trailer URL"
                      />
                    </div>
                  </div>

                  {/* Episodes */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                          <Film className="w-3 h-3" /> Episodes Registry
                        </label>
                        <p className="text-[9px] text-zinc-500 uppercase tracking-widest mt-1">Add episodes for series content</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setEpisodes([...episodes, { id: Date.now(), title: `Episode ${episodes.length + 1}`, video_url: '' }])}
                        className="group flex items-center gap-2 px-4 py-2 bg-primary-purple/10 border border-primary-purple/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary-purple hover:bg-primary-purple hover:text-white transition-all shadow-lg shadow-primary-purple/10"
                      >
                        <Plus className="h-3 w-3 group-hover:scale-110 transition-transform" /> 
                        Add New Episode
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <AnimatePresence mode="popLayout">
                        {episodes.map((ep, idx) => (
                          <motion.div 
                            key={ep.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex gap-4 items-center bg-white/5 p-5 rounded-2xl border border-white/10 group hover:border-primary-purple/30 hover:bg-white/[0.07] transition-all"
                          >
                            <div className="flex flex-col gap-1">
                              <button 
                                type="button"
                                onClick={() => moveEpisode(idx, 'up')}
                                disabled={idx === 0}
                                className="p-1 text-zinc-600 hover:text-primary-purple disabled:opacity-0 transition-all"
                              >
                                <ChevronUp className="h-4 w-4" />
                              </button>
                              <div className="px-1">
                                <GripVertical className="h-4 w-4 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
                              </div>
                              <button 
                                type="button"
                                onClick={() => moveEpisode(idx, 'down')}
                                disabled={idx === episodes.length - 1}
                                className="p-1 text-zinc-600 hover:text-primary-purple disabled:opacity-0 transition-all"
                              >
                                <ChevronDown className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest ml-1">Title</span>
                                <input 
                                  type="text"
                                  placeholder="Episode Title (e.g. S01E01)"
                                  value={ep.title}
                                  onChange={(e) => {
                                    const newEpisodes = [...episodes];
                                    newEpisodes[idx].title = e.target.value;
                                    setEpisodes(newEpisodes);
                                  }}
                                  className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-purple/50 transition-all text-zinc-200"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest ml-1">Stream URL</span>
                                <input 
                                  type="url"
                                  placeholder="Video source URL"
                                  value={ep.video_url}
                                  onChange={(e) => {
                                    const newEpisodes = [...episodes];
                                    newEpisodes[idx].video_url = e.target.value;
                                    setEpisodes(newEpisodes);
                                  }}
                                  className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-purple/50 transition-all text-zinc-200"
                                />
                              </div>
                            </div>
                            
                            <button 
                              type="button"
                              onClick={() => setEpisodes(episodes.filter((_, i) => i !== idx))}
                              className="p-3 text-zinc-600 hover:text-red-500 transition-colors rounded-xl hover:bg-red-500/10"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      {episodes.length === 0 && (
                        <div className="text-center py-10 border-2 border-dashed border-white/5 rounded-3xl">
                          <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">No segments added yet</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-8 pb-12">
                    <button 
                      disabled={loading}
                      type="submit"
                      className="w-full bg-gradient-to-r from-primary-purple to-primary-magenta text-white font-black uppercase tracking-[0.4em] py-6 rounded-[2rem] transition-all duration-500 shadow-2xl shadow-primary-purple/30 flex items-center justify-center gap-4 disabled:opacity-50 hover:scale-[1.02] active:scale-95"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          {editingMovie ? <CheckCircle2 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                          {editingMovie ? 'Update Content' : 'Upload Content'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-green-500 px-8 py-4 rounded-full font-black text-white shadow-2xl flex items-center gap-3"
          >
            <CheckCircle2 className="w-6 h-6" />
            Content Uploaded Successfully! 🎬
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
