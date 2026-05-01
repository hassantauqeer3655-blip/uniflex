import React from 'react';
import { useLocation } from 'react-router-dom';

export default function ParticleBackground() {
  const location = useLocation();
  const isWatchPage = location.pathname.startsWith('/watch/');

  if (isWatchPage) return null;

  return (
    <div className="fixed inset-0 -z-[1] bg-black pointer-events-none overflow-hidden">
      {/* 
        Static Cinematic Background: 
        Lock the background to a radial gradient: center: #1a103d (Deep Purple) to edges: #000000 (Black).
        This eliminates WebGL context errors in sandboxed environments.
      */}
      <div 
        className="absolute inset-0 bg-[#000000]"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #1a103d 0%, #000000 100%)',
          opacity: 0.8
        }}
      />
      
      {/* Subtle overlays for depth and texture without GPU overhead */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black pointer-events-none" />
      
      {/* Decorative grain/noise pattern (optional, can be added if needed via CSS) */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] pointer-events-none blend-overlay" />
    </div>
  );
}
