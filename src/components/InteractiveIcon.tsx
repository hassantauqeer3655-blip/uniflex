import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface InteractiveIconProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  glow?: boolean;
}

const InteractiveIcon = React.memo(({ children, onClick, className, glow = true }: InteractiveIconProps) => {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ 
        scale: 1.1,
        filter: glow ? "drop-shadow(0 0 8px rgba(139, 92, 246, 0.6))" : "none"
      }}
      whileTap={{ scale: 0.9 }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 17 
      }}
      className={cn(
        "cursor-pointer flex items-center justify-center will-change-transform",
        className
      )}
      style={{ transform: "translateZ(0)" }}
    >
      {children}
    </motion.div>
  );
});

InteractiveIcon.displayName = 'InteractiveIcon';

export default InteractiveIcon;
