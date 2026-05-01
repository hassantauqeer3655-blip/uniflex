import React from 'react';
import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  variant?: 'light' | 'dark';
}

export default function Logo({ className, iconOnly = false, variant = 'light' }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3 select-none", className)}>
      {/* Abstract 'U' and 'F' Loop Icon */}
      <div className="relative h-10 w-10">
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full drop-shadow-[0_0_8px_rgba(139,92,246,0.2)]"
        >
          <defs>
            <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#D946EF" />
            </linearGradient>
          </defs>
          <path
            d="M20 30V60C20 76.5685 33.4315 90 50 90C66.5685 90 80 76.5685 80 60V30M80 30H50M50 30V60"
            stroke="url(#logo-gradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-[pulse_3s_infinite]"
          />
          <path
            d="M50 30C50 13.4315 36.5685 0 20 0"
            stroke="url(#logo-gradient)"
            strokeWidth="12"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {!iconOnly && (
        <span className="text-2xl font-black tracking-tighter md:text-3xl">
          <span className={cn(
            "bg-clip-text text-transparent bg-gradient-to-br",
            variant === 'light' ? "from-white to-gray-400" : "from-gray-900 to-gray-600"
          )}>
            UNIFLEX
          </span>
        </span>
      )}
    </div>
  );
}
