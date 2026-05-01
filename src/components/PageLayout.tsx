import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import BackButton from './BackButton';
import ParticleBackground from './ParticleBackground';
import { motion } from 'motion/react';

import { cn } from '../lib/utils';

interface PageLayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
  showBackButton?: boolean;
  showFooter?: boolean;
  showParticles?: boolean;
  fullBleed?: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({ 
  children, 
  showNavbar = true, 
  showBackButton = false,
  // showFooter removed as handled by MainLayout
  showParticles = false, // Default to false as it's already in App.tsx
  fullBleed = false
}) => {
  return (
    <div className="relative min-h-screen bg-[#050505] text-white overflow-x-hidden selection:bg-primary-purple selection:text-white mesh-gradient">
      {/* ParticleBackground is now handled globally in App.tsx */}
      
      {showNavbar && (
        <div className="fixed top-0 left-0 right-0 z-[50]">
          <Navbar />
        </div>
      )}

      {showBackButton && (
        <BackButton className={cn("left-4 md:left-8", showNavbar ? "top-20 md:top-24" : "top-4 md:top-8")} />
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn("relative z-[10]", showNavbar && !fullBleed && "pt-20 lg:pt-24")}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default PageLayout;
