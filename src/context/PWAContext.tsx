import React, { createContext, useContext, useEffect, useState } from 'react';

interface PWAContextType {
  installPrompt: any;
  isInstallable: boolean;
  isInstalled: boolean;
  showInstallPrompt: () => Promise<void>;
  isPreparing: boolean;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
      
      // Trigger success notification
      const event = new CustomEvent('uniflex-toast', { 
        detail: { message: 'UNIFLEX Installed Successfully! 🚀', type: 'success' } 
      });
      window.dispatchEvent(event);
      
      console.log('UNIFLEX was installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const showInstallPrompt = async () => {
    if (!installPrompt) return;

    setIsPreparing(true);
    
    // Artificial delay to show "Preparing System" state
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Show the install prompt
    installPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    // We've used the prompt, and can't use it again, throw it away
    setInstallPrompt(null);
    setIsInstallable(false);
    setIsPreparing(false);
  };

  return (
    <PWAContext.Provider value={{ installPrompt, isInstallable, isInstalled, showInstallPrompt, isPreparing }}>
      {children}
    </PWAContext.Provider>
  );
}

export function usePWA() {
  const context = useContext(PWAContext);
  if (context === undefined) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
}
