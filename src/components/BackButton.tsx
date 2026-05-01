import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { useUniversalBack } from '../hooks/useUniversalBack';
import { cn } from '../lib/utils';

export default function BackButton({ className = "left-6 top-6" }: { className?: string }) {
  const handleBack = useUniversalBack();

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1, x: -4 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => {
        console.log("Action Triggered: Universal Back Handshake");
        handleBack();
      }}
      className={cn(
        "z-[100] flex items-center justify-center rounded-full border-2 border-white/20 bg-primary-purple/90 p-4 backdrop-blur-3xl transition-all shadow-[0_0_30px_rgba(153,69,255,0.6)] group",
        className.includes('static') || className.includes('absolute') || className.includes('relative') ? '' : 'fixed',
        className
      )}
      title="Secure Return"
    >
      <ChevronLeft className="h-6 w-6 text-white font-bold" />
    </motion.button>
  );
}
