import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { SiteSettings } from '../types';
import { useAdmin } from '../hooks/useAdmin';
import { supabaseService } from '../services/supabaseService';

interface SettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  updateSetting: (key: keyof SiteSettings, value: string) => Promise<void>;
}

const defaultSettings: SiteSettings = {
  footerCopyright: '© 2026 UNIFLEX, Inc.',
  footerMission: 'Redefining the future of cinematic streaming.',
  aboutMission: 'UNIFLEX was born from a simple yet ambitious vision: to create a streaming platform that doesn\'t just deliver content, but crafts an immersive viewing experience.',
  dashboardHeading: 'The Evolution of Entertainment',
  dashboardSubheading: 'Redefining the cinematic experience through advanced technology and high-performance architecture.',
  footerCol1Title: 'Support',
  footerCol2Title: 'Company',
  footerCol3Title: 'Legal',
  footerCol4Title: 'Technical'
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAdmin();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const fetchedSettings = await supabaseService.getSiteSettings();
        setSettings({ ...defaultSettings, ...fetchedSettings });
      } catch (error) {
        console.error("Error fetching site settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();

    // Subscribe to changes
    const subscription = supabase
      .channel('site_settings_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, () => {
        fetchSettings();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const updateSetting = async (key: keyof SiteSettings, value: string) => {
    if (!isAdmin) throw new Error("Unauthorized: Admin access required");
    
    try {
      await supabaseService.updateSiteSetting(key as string, value);
      setSettings(prev => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error(`Error updating setting ${key}:`, error);
      throw error;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
