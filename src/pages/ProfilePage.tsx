import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePWA } from '../context/PWAContext';
import { useNavigation } from '../context/NavigationContext';
import { 
  User, 
  Settings, 
  History, 
  Download, 
  Trash2, 
  X, 
  ChevronRight, 
  Bell, 
  Play, 
  Layers, 
  LogOut,
  Edit2,
  Check,
  ShieldCheck,
  Upload,
  Zap,
  Monitor,
  Smartphone,
  Gauge,
  Palette,
  HardDrive,
  Loader2,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ParticleBackground from '../components/ParticleBackground';
import Navbar from '../components/Navbar';
import BackButton from '../components/BackButton';
import PageLayout from '../components/PageLayout';
import { cn } from '../lib/utils';
import { Movie } from '../types';

export default function ProfilePage() {
  const { user, userData, removeFromHistory, clearHistory, toggleDownload, signOut, updateProfile, uploadAvatar } = useAuth();
  const { isInstallable, isInstalled, showInstallPrompt, isPreparing } = usePWA();
  const { registerModal, unregisterModal } = useNavigation();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const currentProfile = userData?.profiles?.[0];
  const settings = currentProfile?.settings || {
    autoplay: true,
    notifications: true,
    backgroundIntensity: 1,
    playbackSpeed: 1.0,
    dataSaver: false,
    accentColor: 'purple' as const
  };

  const toggleSetting = async (key: string) => {
    if (!currentProfile) return;
    const newSettings = { ...settings, [key]: !(settings as any)[key] };
    await updateProfile({ settings: newSettings });
  };

  const updateNumericSetting = async (key: string, value: any) => {
    if (!currentProfile) return;
    const newSettings = { ...settings, [key]: value };
    await updateProfile({ settings: newSettings });
  };

  useEffect(() => {
    if (currentProfile) {
      setEditName(currentProfile.name || '');
    }
  }, [currentProfile]);

  useEffect(() => {
    if (isEditModalOpen) {
      const handleClose = () => setIsEditModalOpen(false);
      registerModal(handleClose);
      return () => unregisterModal(handleClose);
    }
  }, [isEditModalOpen, registerModal, unregisterModal]);

  const handleSaveEdit = async () => {
    if (!currentProfile || isSaving) return;
    setIsSaving(true);
    try {
      await updateProfile({ name: editName });
      setIsEditModalOpen(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentProfile) return;

    setIsUploading(true);
    try {
      await uploadAvatar(file);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const history = currentProfile?.watchHistory || [];
  const downloads = currentProfile?.downloads || [];
  
  const clearAllDownloads = async () => {
    if (!window.confirm('Wipe all offline data from this profile?')) return;
    await updateProfile({ downloads: [] });
  };

  const storageUsed = downloads.length * (Math.random() * 500 + 1000); 
  const storageLimit = 50000; 
  const storagePercent = (storageUsed / storageLimit) * 100;

  return (
    <PageLayout showBackButton={true}>
      <ParticleBackground />

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-4 bg-green-500 text-white rounded-2xl shadow-[0_20px_40px_rgba(34,197,94,0.3)] border border-green-400/20"
          >
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
              <Check className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-black uppercase tracking-widest text-xs">Success</span>
              <span className="text-sm font-medium opacity-90">Settings Updated (Client Only)</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pt-32 pb-24 px-4 md:px-12 lg:px-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Sidebar / User Info */}
          <div className="lg:col-span-4 space-y-8">
            <div className="relative p-8 rounded-[2.5rem] bg-zinc-900/40 border border-white/10 backdrop-blur-xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-purple/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                <div className="relative group/avatar">
                  <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-primary-purple/30 shadow-[0_0_30px_rgba(139,92,246,0.2)] group-hover/avatar:border-primary-purple group-hover/avatar:shadow-[0_0_40px_rgba(139,92,246,0.5)] transition-all duration-500 relative">
                    {isUploading ? (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 backdrop-blur-sm">
                        <Loader2 className="h-8 w-8 text-primary-purple animate-spin" />
                      </div>
                    ) : (
                      <div 
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10 cursor-pointer"
                        onClick={() => document.getElementById('avatar-upload')?.click()}
                      >
                        <Upload className="h-8 w-8 text-white" />
                      </div>
                    )}
                    <img 
                      src={currentProfile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'} 
                      alt="Avatar" 
                      className="h-full w-full object-cover transition-all duration-500"
                    />
                  </div>
                  <input 
                    type="file" 
                    id="avatar-upload" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={isUploading}
                  />
                </div>

                <div className="space-y-2 relative group-name">
                  <div className="flex items-center justify-center gap-2">
                    <h1 className="text-3xl font-black tracking-tighter uppercase">{currentProfile?.name || 'User'}</h1>
                    <button 
                      onClick={() => {
                        console.log("Edit Profile Modal Opened");
                        setIsEditModalOpen(true);
                      }}
                      className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-primary-purple transition-all"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-gray-500 font-medium">{user?.email}</p>
                </div>

                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary-purple/20 bg-primary-purple/10 text-primary-purple text-[10px] font-black uppercase tracking-widest">
                  <ShieldCheck className="h-3 w-3" />
                  Verified User
                </div>

                <div className="w-full pt-6 border-t border-white/5 space-y-3">
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => signOut()}
                    className="w-full py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all font-bold text-sm flex items-center justify-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Global Settings */}
            <div className="p-8 rounded-[2.5rem] bg-zinc-900/40 border border-white/10 backdrop-blur-xl space-y-8">
              <div className="flex items-center gap-3 text-primary-purple">
                <Settings className="h-5 w-5" />
                <h2 className="text-sm font-black uppercase tracking-[0.3em]">Command Center</h2>
              </div>

              <div className="space-y-8">
                {/* Playback Speed */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-gray-400" />
                      <p className="font-bold text-sm">Playback Speed</p>
                    </div>
                    <span className="text-xs font-black text-primary-purple">{settings.playbackSpeed || 1.0}x</span>
                  </div>
                  <div className="flex gap-2">
                    {[1.0, 1.25, 1.5].map((speed) => (
                      <motion.button
                        key={speed}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => updateNumericSetting('playbackSpeed', speed)}
                        className={cn(
                          "flex-1 py-2 rounded-xl text-xs font-black transition-all border",
                          settings.playbackSpeed === speed 
                            ? "bg-primary-purple border-primary-purple text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]" 
                            : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                        )}
                      >
                        {speed}x
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Data Saver */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-gray-400" />
                    <div className="space-y-0.5">
                      <p className="font-bold text-sm">Data Saver Mode</p>
                    </div>
                  </div>
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleSetting('dataSaver')}
                    className={cn(
                      "w-12 h-6 rounded-full transition-all duration-300 relative",
                      settings.dataSaver ? "bg-primary-purple" : "bg-white/10"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm",
                      settings.dataSaver ? "left-7" : "left-1"
                    )} />
                  </motion.button>
                </div>

                {/* Theme Accent Picker */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-gray-400" />
                    <p className="font-bold text-sm">Theme Accent</p>
                  </div>
                  <div className="flex gap-3">
                    {(['purple', 'blue', 'green'] as const).map((color) => (
                      <motion.button
                        key={color}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateNumericSetting('accentColor', color)}
                        className={cn(
                          "h-8 w-8 rounded-full border-2 transition-all flex items-center justify-center",
                          color === 'purple' ? "bg-[#8B5CF6] border-[#8B5CF6]" : 
                          color === 'blue' ? "bg-[#3B82F6] border-[#3B82F6]" : 
                          "bg-[#10B981] border-[#10B981]",
                          settings.accentColor === color || (!settings.accentColor && color === 'purple')
                            ? "ring-2 ring-white ring-offset-2 ring-offset-bg-dark"
                            : "opacity-50 hover:opacity-100"
                        )}
                      >
                        {(settings.accentColor === color || (!settings.accentColor && color === 'purple')) && <Check className="h-4 w-4 text-white" />}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-gray-400" />
                    <div className="space-y-0.5">
                      <p className="font-bold text-sm">Autoplay Next</p>
                    </div>
                  </div>
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleSetting('autoplay')}
                    className={cn(
                      "w-12 h-6 rounded-full transition-all duration-300 relative",
                      settings.autoplay ? "bg-primary-purple" : "bg-white/10"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm",
                      settings.autoplay ? "left-7" : "left-1"
                    )} />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Watch History */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-primary-magenta">
                  <History className="h-6 w-6" />
                  <h2 className="text-xl font-black uppercase tracking-[0.3em]">Watch History</h2>
                </div>
                <div className="flex items-center gap-6">
                  {history.length > 0 && (
                    <button 
                      onClick={() => navigate('/category/history')}
                      className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-primary-purple transition-all flex items-center gap-2 group px-4 py-1.5 rounded-full border border-white/5 hover:border-primary-purple/30 hover:bg-primary-purple/5 backdrop-blur-sm"
                    >
                      View All
                      <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                  {history.length > 0 && (
                    <motion.button 
                      whileTap={{ scale: 0.95 }}
                      onClick={clearHistory}
                      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                      Clear All
                    </motion.button>
                  )}
                </div>
              </div>

              {history.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  <AnimatePresence mode="popLayout">
                    {history.map((movie: Movie) => (
                      <motion.div
                        key={movie.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/5 hover:border-primary-purple/50 transition-all duration-300 shadow-xl"
                      >
                        <img 
                          src={movie.poster_path ? `https://image.tmdb.org/t/p/w342${movie.poster_path}` : movie.posterUrl} 
                          alt={movie.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                          <motion.button 
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromHistory(movie.id);
                            }}
                            className="absolute top-2 right-2 p-2 rounded-full bg-red-500/80 text-white backdrop-blur-md hover:bg-red-600 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </motion.button>
                          <p className="text-[10px] font-black uppercase tracking-tighter line-clamp-1">{movie.title || movie.name}</p>
                          <motion.button 
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate(`/watch/${movie.id}`)}
                            className="mt-2 w-full py-1.5 rounded-lg bg-primary-purple text-[10px] font-black uppercase tracking-widest hover:bg-primary-magenta transition-colors flex items-center justify-center gap-1"
                          >
                            <Play className="h-3 w-3 fill-current" />
                            Resume
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="py-20 rounded-[2.5rem] bg-zinc-900/40 border border-white/10 border-dashed backdrop-blur-xl flex flex-col items-center justify-center text-center space-y-6">
                  <div className="relative">
                    <History className="h-12 w-12 text-gray-700" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-gray-400">Your timeline is empty</p>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/')}
                    className="px-8 py-3 bg-primary-purple text-white rounded-full font-black uppercase tracking-widest text-xs shadow-lg hover:bg-primary-magenta transition-all"
                  >
                    Start Watching
                  </motion.button>
                </div>
              )}
            </section>

            {/* PWA Install Section */}
            {isInstallable && !isInstalled && (
              <section className="space-y-6">
                <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary-purple/20 to-primary-magenta/20 border border-white/10 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_0_50px_rgba(139,92,246,0.2)]">
                  <div className="space-y-4 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3 text-primary-purple">
                      <Zap className="h-6 w-6 animate-pulse" />
                      <span className="text-xs font-black uppercase tracking-[0.4em]">Native Experience</span>
                    </div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">Install App Native</h2>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={showInstallPrompt}
                    disabled={isPreparing}
                    className="px-10 py-4 bg-white text-black rounded-full font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-primary-purple hover:text-white transition-all flex items-center gap-3 disabled:opacity-50"
                  >
                    {isPreparing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Preparing...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Install Now
                      </>
                    )}
                  </motion.button>
                </div>
              </section>
            )}

            {/* Downloads Manager */}
            <section className="space-y-6" id="downloads-section">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-primary-purple">
                  <Download className="h-6 w-6" />
                  <h2 className="text-xl font-black uppercase tracking-[0.3em]">Downloads</h2>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-6">
                  {downloads.length > 0 && (
                    <button 
                      onClick={clearAllDownloads}
                      className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors px-4 py-2 bg-red-500/10 rounded-lg border border-red-500/10"
                    >
                      Wipe Local Storage
                    </button>
                  )}
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-500">
                    <HardDrive className="h-3 w-3" />
                    <span>{Math.round(storageUsed / 1024 * 10) / 10} GB Used</span>
                  </div>
                </div>
              </div>

              {/* Storage Bar */}
              <div className="space-y-2">
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${storagePercent}%` }}
                    className="h-full bg-gradient-to-r from-primary-purple to-primary-magenta"
                  />
                </div>
              </div>

              {downloads.length > 0 ? (
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {downloads.map((movie: Movie) => (
                      <motion.div
                        key={movie.id}
                        layout
                        className="p-4 rounded-3xl bg-zinc-900/40 border border-white/10 backdrop-blur-xl flex items-center gap-6 group"
                      >
                        <div className="h-24 w-16 rounded-xl overflow-hidden flex-shrink-0">
                          <img 
                            src={movie.poster_path ? `https://image.tmdb.org/t/p/w185${movie.poster_path}` : movie.posterUrl} 
                            alt={movie.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-black uppercase tracking-tighter text-lg">{movie.title || movie.name}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <motion.button 
                            whileTap={{ scale: 0.9 }}
                            onClick={() => toggleDownload(movie)}
                            className="p-3 rounded-2xl bg-red-500/10 text-red-500"
                          >
                            <Trash2 className="h-5 w-5" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="py-10 text-center text-gray-500">
                  <p className="text-xs uppercase tracking-widest font-bold">No items downloaded for offline viewing</p>
                </div>
              )}
            </section>

          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-zinc-900 border border-white/10 p-10 rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary-purple to-primary-magenta" />
              
              <div className="space-y-8">
                <div className="space-y-2">
                  <h2 className="text-4xl font-black uppercase tracking-tight text-white leading-none">Edit Profile</h2>
                  <p className="text-gray-500 font-medium">Customize your profile identity</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Display Name</label>
                    <input 
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Enter identity name"
                      className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary-purple/50 focus:border-primary-purple transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-gray-400 font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSaveEdit}
                    disabled={isSaving || !editName.trim()}
                    className="flex-1 py-4 rounded-2xl bg-primary-purple text-white shadow-[0_15px_30px_rgba(139,92,246,0.3)] font-black uppercase tracking-widest text-xs hover:bg-primary-magenta transition-all disabled:opacity-50"
                  >
                    {isSaving ? 'Synchronizing...' : 'Update identity'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageLayout>
  );
}
