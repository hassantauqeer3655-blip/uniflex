import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { User, Plus, Edit2, Lock, ShieldCheck, Zap, ChevronLeft, Loader2 } from 'lucide-react';
import Cookies from 'js-cookie';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { cn } from '../lib/utils';
import ParticleBackground from '../components/ParticleBackground';
import BackButton from '../components/BackButton';
import Logo from '../components/Logo';

export default function ProfileSelection() {
  const navigate = useNavigate();
  const { userData, user, signOut, switchProfile, createProfile } = useAuth();
  const { registerModal, unregisterModal } = useNavigation();
  const [isManaging, setIsManaging] = useState(false);
  const [isAddingProfile, setIsAddingProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);

  // Fallback profiles if data is still loading
  const profiles = userData?.profiles || [];

  const handleProfileSelect = (profileId: string) => {
    if (isSelecting) return;
    setIsSelecting(true);
    console.log("UNIFLEX: Profile Selected ->", profileId);
    
    // Store in cookie as requested
    Cookies.set('activeProfileId', profileId, { expires: 30 });
    
    switchProfile(profileId);
    
    // Instant navigate with replace to avoid history loops
    setTimeout(() => {
      navigate('/browse', { replace: true });
    }, 500);
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim() || isCreating) return;
    
    console.log("UNIFLEX: Initializing New Identity ->", newProfileName);
    setIsCreating(true);
    try {
      const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`;
      await createProfile(newProfileName, avatar);
      setIsAddingProfile(false);
      setNewProfileName('');
      
      // Auto-select is handled in AuthContext, but let's ensure navigation
      navigate('/browse', { replace: true });
    } catch (err) {
      console.error("UNIFLEX: Error creating identity:", err);
    } finally {
      setIsCreating(false);
    }
  };

  React.useEffect(() => {
    if (isAddingProfile) {
      const handleClose = () => setIsAddingProfile(false);
      registerModal(handleClose);
      return () => unregisterModal(handleClose);
    }
  }, [isAddingProfile, registerModal, unregisterModal]);

  return (
    <div className="relative min-h-screen w-full bg-[#050505] flex items-center justify-center overflow-hidden">
      <ParticleBackground />
      
      {/* Branding Header */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20">
        <Logo className="h-10 md:h-12" />
      </div>

      {/* Back Button - Positioned specifically for this screen */}
      <div className="absolute top-10 left-6 md:left-12 z-[100]">
        <BackButton className="static" />
      </div>

      <div className="relative z-10 w-full max-w-5xl px-4 py-20 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 space-y-4"
        >
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">
            Who's watching?
          </h1>
          <p className="text-gray-500 font-medium uppercase tracking-[0.3em] text-xs">
            SELECT IDENTITY TO INITIALIZE SYNC
          </p>
        </motion.div>

        <div className="flex flex-wrap items-start justify-center gap-8 md:gap-12">
          {profiles.map((profile) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -10 }}
              className="flex flex-col items-center space-y-4 group cursor-pointer"
              onClick={() => handleProfileSelect(profile.id)}
            >
              <div className="relative">
                <div className="relative h-32 w-32 md:h-40 md:w-40 rounded-xl overflow-hidden border-2 border-transparent group-hover:border-white group-hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all duration-300">
                  <img 
                    src={profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`} 
                    alt={profile.name}
                    className={cn(
                      "h-full w-full object-cover group-hover:scale-110 transition-transform duration-500",
                      isSelecting && "opacity-50 grayscale"
                    )}
                  />
                  
                  {(isManaging || isSelecting) && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                      {isSelecting ? <Loader2 className="h-8 w-8 text-primary-purple animate-spin" /> : <Edit2 className="h-8 w-8 text-white" />}
                    </div>
                  )}
                </div>
                
                {/* Status Badges */}
                {profile.id === profiles[0]?.id && (
                  <div className="absolute -top-2 -right-2 bg-primary-purple p-1.5 rounded-lg shadow-lg">
                    <ShieldCheck className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              
              <span className="text-gray-500 group-hover:text-white transition-colors font-bold text-lg text-center truncate w-32 md:w-40">
                {profile.name}
              </span>
            </motion.div>
          ))}

          {/* Add Profile Placeholder */}
          {profiles.length < 5 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -10 }}
              className="flex flex-col items-center space-y-4 group cursor-pointer"
              onClick={() => setIsAddingProfile(true)}
            >
              <div className="h-32 w-32 md:h-40 md:w-40 rounded-xl bg-zinc-900/40 border-2 border-dashed border-zinc-800 flex items-center justify-center group-hover:bg-zinc-800 group-hover:border-zinc-500 transition-all duration-300">
                <Plus className="h-12 w-12 text-zinc-600 group-hover:text-white transition-colors" />
              </div>
              <span className="text-zinc-600 group-hover:text-white transition-colors font-bold text-lg">
                Add Identity
              </span>
            </motion.div>
          )}
        </div>

        <div className="mt-20 flex flex-col items-center space-y-8">
          <motion.button
            whileHover={{ scale: 1.05, borderColor: '#fff', color: '#fff' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsManaging(!isManaging)}
            className={cn(
              "px-10 py-3 border-2 font-black uppercase tracking-[0.2em] text-xs transition-all",
              isManaging ? "bg-white text-black border-white" : "bg-transparent text-gray-500 border-zinc-800"
            )}
          >
            {isManaging ? 'Done Managing' : 'Manage Identities'}
          </motion.button>
          
          <button 
            onClick={() => signOut()}
            className="text-zinc-600 hover:text-red-500 transition-colors uppercase tracking-[0.4em] text-[10px] font-black"
          >
            Terminate Session
          </button>
        </div>
      </div>

      {/* Add Profile Modal */}
      <AnimatePresence>
        {isAddingProfile && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingProfile(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-zinc-900 border border-white/10 p-10 rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)]"
            >
               <form onSubmit={handleCreateProfile} className="space-y-8">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tight">New Identity</h2>
                    <p className="text-zinc-500 text-sm">Create a unique profile sync</p>
                  </div>
                  
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Display Name</label>
                    <input 
                      type="text" 
                      autoFocus
                      value={newProfileName}
                      onChange={(e) => setNewProfileName(e.target.value)}
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary-purple/50 transition-all"
                      placeholder="Enter name..."
                    />
                  </div>

                  <div className="flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setIsAddingProfile(false)}
                      className="flex-1 py-4 bg-white/5 text-zinc-400 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-white/10 transition-all"
                    >
                      Abort
                    </button>
                    <button 
                      type="submit"
                      disabled={!newProfileName.trim() || isCreating}
                      className="flex-1 py-4 bg-primary-purple text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-lg shadow-primary-purple/20 hover:bg-primary-magenta transition-all disabled:opacity-50"
                    >
                      {isCreating ? 'Initializing...' : 'Initialize'}
                    </button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Background radial highlight */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[50vh] bg-primary-purple/5 blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
}
