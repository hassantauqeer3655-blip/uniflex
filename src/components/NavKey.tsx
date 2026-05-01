import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface NavKeyProps {
  name: string;
  isActive: boolean;
  onClick: () => void;
}

const NavKey = React.memo(({ name, isActive, onClick }: NavKeyProps) => {
  return (
    <li 
      className={cn(
        "relative cursor-pointer text-sm font-semibold transition-colors duration-200 py-1",
        isActive ? "text-primary-magenta" : "text-gray-300 hover:text-white"
      )}
      onClick={onClick}
      style={{ transform: "translateZ(0)" }}
    >
      <span className="relative z-10">{name}</span>
      
      {isActive && (
        <motion.div
          layoutId="nav-underline"
          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-magenta shadow-[0_0_10px_rgba(217,70,239,0.5)]"
          transition={{
            type: "spring",
            stiffness: 380,
            damping: 30
          }}
        />
      )}
    </li>
  );
});

NavKey.displayName = 'NavKey';

export default NavKey;
