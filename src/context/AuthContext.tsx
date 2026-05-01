import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import Cookies from 'js-cookie';
import { UserData, UserProfile, Movie } from '../types';
import { supabaseService } from '../services/supabaseService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userData: UserData | null;
  loading: boolean;
  isAdmin: boolean;
  authError: string | null;
  cooldown: number;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateEmail: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  updateRating: (movieId: string, rating: number) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  addToHistory: (movie: Movie) => Promise<void>;
  removeFromHistory: (movieId: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  toggleDownload: (movie: Movie) => Promise<void>;
  toggleWatchlist: (movie: Movie) => Promise<void>;
  switchProfile: (profileId: string) => void;
  createProfile: (name: string, avatar: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const ADMIN_EMAILS = [
    'hassantauqeer3655@gmail.com',
    'admin@uniflex.com'
  ];

  const isAdmin = !!user?.email && ADMIN_EMAILS.includes(user.email);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    if (!userId) return;
    
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      let currentProfiles = profiles || [];
      
      // If no profile exists, create a default one
      if (currentProfiles.length === 0) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{ 
            user_id: userId, 
            name: user?.email?.split('@')[0] || 'User', 
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
            email: user?.email || '',
            role: 'user'
          }])
          .select().single();
        
        if (createError) throw createError;
        currentProfiles = [newProfile];
      }

      const mappedProfiles: UserProfile[] = currentProfiles.map(p => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar_url,
        settings: p.settings,
        ratings: p.settings?.ratings || {},
        watchHistory: p.watch_history || [],
        watchlist: p.watchlist || [],
        downloads: p.downloads || []
      }));

      // In the new "Login-to-Browse" flow, we always use the primary profile
      const activeProfileId = mappedProfiles[0].id;

      setUserData({
        uid: userId,
        email: user?.email || currentProfiles[0].email || '',
        role: currentProfiles[0].role || 'user',
        currentProfileId: activeProfileId,
        profiles: mappedProfiles,
        createdAt: currentProfiles[0].created_at || new Date().toISOString()
      });
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const switchProfile = (profileId: string) => {
    console.log("UNIFLEX: Profile switching is disabled in this version.");
  };

  const [authError, setAuthError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    console.log("UNIFLEX: Terminating Session, clearing persistence.");
    await supabase.auth.signOut();
    setUserData(null);
  };

  const createProfile = async (name: string, avatar: string) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([{ 
          user_id: user.id, 
          name, 
          avatar_url: avatar,
          email: user.email || '',
          role: 'user'
        }])
        .select().single();

      if (error) throw error;

      const newProfile: UserProfile = {
        id: data.id,
        name: data.name,
        avatar: data.avatar_url,
        settings: data.settings || {},
        ratings: data.settings?.ratings || {},
        watchHistory: data.watch_history || [],
        watchlist: data.watchlist || [],
        downloads: data.downloads || []
      };

      setUserData(prev => prev ? {
        ...prev,
        profiles: [...prev.profiles, newProfile]
      } : null);
      
      // Automatically switch to the new profile
      switchProfile(data.id);
    } catch (err) {
      console.error('Error creating profile:', err);
      throw err;
    }
  };
  
  const updateEmail = async (email: string) => {
    await supabase.auth.updateUser({ email });
  };

  const updatePassword = async (password: string) => {
    await supabase.auth.updateUser({ password });
  };

  const updateRating = async (movieId: string, rating: number) => {
    const profiles = userData?.profiles || [];
    const ratings = { ...(profiles[0]?.ratings || {}), [movieId]: rating };
    await updateProfile({ ratings });
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const profile = userData?.profiles?.[0];
    if (!profile) return;
    
    const profileId = profile.id;
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.avatar) dbUpdates.avatar_url = updates.avatar;
    if (updates.settings) dbUpdates.settings = updates.settings;
    if (updates.ratings) {
      dbUpdates.settings = { ...(profile.settings || {}), ratings: updates.ratings };
    }
    if (updates.watchHistory !== undefined) dbUpdates.watch_history = updates.watchHistory;
    if (updates.watchlist !== undefined) dbUpdates.watchlist = updates.watchlist;
    if (updates.downloads !== undefined) dbUpdates.downloads = updates.downloads;

    const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', profileId);
    if (error) throw error;
    setUserData(prev => prev ? {
      ...prev,
      profiles: prev.profiles.map(p => p.id === profileId ? { ...p, ...updates } : p)
    } : null);
  };

  const uploadAvatar = async (file: File) => {
    const profile = userData?.profiles?.[0];
    if (!profile) throw new Error('No profile active');
    const profileId = profile.id;
    const url = await supabaseService.uploadFile('avatars', `${user?.id}/${profileId}`, file);
    await updateProfile({ avatar: url });
    return url;
  };

  const addToHistory = async (movie: Movie) => {
    const profile = userData?.profiles?.[0];
    if (!profile) return;
    const history = [movie, ...(profile.watchHistory || []).filter(m => m.id !== movie.id)].slice(0, 20);
    await updateProfile({ watchHistory: history });
  };

  const removeFromHistory = async (movieId: string) => {
    const profile = userData?.profiles?.[0];
    if (!profile) return;
    const history = (profile.watchHistory || []).filter(m => m.id !== movieId);
    await updateProfile({ watchHistory: history });
  };

  const clearHistory = async () => {
    if (userData?.profiles?.[0]) await updateProfile({ watchHistory: [] });
  };

  const toggleDownload = async (movie: Movie) => {
    const profile = userData?.profiles?.[0];
    if (!profile) return;
    const downloads = profile.downloads || [];
    const exists = downloads.some(m => m.id === movie.id);
    await updateProfile({ downloads: exists ? downloads.filter(m => m.id !== movie.id) : [...downloads, movie] });
  };

  const toggleWatchlist = async (movie: Movie) => {
    const profile = userData?.profiles?.[0];
    if (!profile) return;
    const watchlist = profile.watchlist || [];
    const exists = watchlist.some(m => m.id === movie.id);
    await updateProfile({ watchlist: exists ? watchlist.filter(m => m.id !== movie.id) : [...watchlist, movie] });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session,
      userData, 
      loading, 
      isAdmin, 
      authError,
      cooldown,
      signIn,
      signUp,
      signOut,
      updateEmail,
      updatePassword,
      updateRating,
      updateProfile,
      uploadAvatar,
      addToHistory,
      removeFromHistory,
      clearHistory,
      toggleDownload,
      toggleWatchlist,
      switchProfile,
      createProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
