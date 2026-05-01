import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="relative bg-black/40 backdrop-blur-md pt-12 pb-24 px-4 md:px-12 text-zinc-500 text-xs border-t border-white/5 z-20">
      <div className="max-w-6xl mx-auto flex flex-col items-center space-y-8">
        {/* Navigation Links */}
        <div className="flex items-center space-x-8">
          <Link to="/about" className="hover:text-primary-purple transition-colors font-bold uppercase tracking-widest text-[10px]">About</Link>
          <Link to="/terms" className="hover:text-primary-purple transition-colors font-bold uppercase tracking-widest text-[10px]">Terms</Link>
          <Link to="/privacy" className="hover:text-primary-purple transition-colors font-bold uppercase tracking-widest text-[10px]">Privacy</Link>
          <Link to="/support" className="hover:text-primary-purple transition-colors font-bold uppercase tracking-widest text-[10px]">Support</Link>
        </div>

        <div className="text-center space-y-4">
          <p className="font-black text-white text-lg tracking-[0.2em]">UNIFLEX</p>
          <div className="h-1 w-12 bg-primary-purple mx-auto rounded-full" />
          <p className="font-bold uppercase tracking-[0.3em] text-[10px] opacity-60">
            UNIFLEX | Developed by <span className="text-primary-purple">M. Tauqeer Hassan</span>
          </p>
        </div>

        <div className="pt-8 text-[9px] uppercase tracking-widest opacity-30 text-center border-t border-white/5 w-full">
          © {new Date().getFullYear()} UNIFLEX GLOBAL SYNC. ALL RIGHTS RESERVED.
        </div>
      </div>
    </footer>
  );
}
