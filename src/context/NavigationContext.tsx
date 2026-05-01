import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavigationContextType {
  registerModal: (onClose: () => void) => void;
  unregisterModal: (onClose: () => void) => void;
  handleBack: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [modalStack, setModalStack] = useState<(() => void)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  const registerModal = useCallback((onClose: () => void) => {
    setModalStack(prev => [...prev, onClose]);
  }, []);

  const unregisterModal = useCallback((onClose: () => void) => {
    setModalStack(prev => prev.filter(handler => handler !== onClose));
  }, []);

  const handleBack = useCallback(() => {
    // Priority 1: Fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen();
      return;
    }

    // Priority 2: Modals
    if (modalStack.length > 0) {
      const lastModalClose = modalStack[modalStack.length - 1];
      lastModalClose();
      return;
    }

    // Priority 3: Navigate Back
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Fallback: Home
      navigate('/');
    }
  }, [modalStack, navigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Smart Input Shield
      const isInput = e.target instanceof HTMLInputElement || 
                      e.target instanceof HTMLTextAreaElement || 
                      (e.target as HTMLElement).isContentEditable;

      if (isInput) return;

      if (e.key === 'Escape') {
        handleBack();
      } else if (e.key === 'Backspace') {
        handleBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleBack]);

  return (
    <NavigationContext.Provider value={{ registerModal, unregisterModal, handleBack }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
