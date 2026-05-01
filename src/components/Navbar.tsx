import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, BellRing, BellOff, User as UserIcon, LogOut, Settings, CreditCard, ChevronDown, Menu, X, Volume2, VolumeX, Loader2, FileVideo, Share2, Download, Zap, Edit2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePWA } from '../context/PWAContext';
import { useNavigation } from '../context/NavigationContext';
import { cn } from '../lib/utils';
import Logo from './Logo';
import InteractiveIcon from './InteractiveIcon';
import NavKey from './NavKey';
import { motion, AnimatePresence } from 'motion/react';

type NotificationMode = 'normal' | 'vibrate' | 'silent';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationMode, setNotificationMode] = useState<NotificationMode>(
    (localStorage.getItem('uniflex_notification_mode') as NotificationMode) || 'normal'
  );
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const handleShare = async () => {
    const shareData = {
      title: 'Check out UNIFLEX – Stream the Future of Entertainment!',
      text: 'Experience the best in digital entertainment on UNIFLEX.',
      url: window.location.origin,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        setToastMessage('Link Copied! 📋');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(shareData.url);
          setToastMessage('Link Copied! 📋');
          setShowToast(true);
          setTimeout(() => setShowToast(false), 2000);
        } catch (clipErr) {
          console.error('Clipboard failed:', clipErr);
        }
      }
    }
  };

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLFormElement>(null);
  
  const { user, userData, isAdmin, signOut } = useAuth();
  const { isInstallable, isInstalled, showInstallPrompt, isPreparing } = usePWA();
  const { registerModal, unregisterModal } = useNavigation();
  const navigate = useNavigate();

  const handleSignOut = () => {
    console.log("Sign Out Clicked");
    signOut();
  };

  const handleAccountClick = () => {
    console.log("Account Settings Clicked");
    navigate('/account');
    setShowDropdown(false);
  };

  const handleAdminClick = () => {
    console.log("Admin Dashboard Clicked");
    navigate('/admin-upload');
    setShowDropdown(false);
  };

  const handleProfileClick = () => {
    console.log("Account Dropdown Toggle");
    setShowDropdown(!showDropdown);
  };

  const handleDeveloperClick = () => {
    console.log("Developer Page Clicked");
    navigate('/developers');
    setShowDropdown(false);
  };
  const location = useLocation();

  useEffect(() => {
    if (showDropdown) {
      const handleClose = () => setShowDropdown(false);
      registerModal(handleClose);
      return () => unregisterModal(handleClose);
    }
  }, [showDropdown, registerModal, unregisterModal]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      const handleClose = () => setIsMobileMenuOpen(false);
      registerModal(handleClose);
      return () => unregisterModal(handleClose);
    }
  }, [isMobileMenuOpen, registerModal, unregisterModal]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const q = queryParams.get('q');
    if (q) {
      setSearchQuery(q);
    } else if (location.pathname !== '/search') {
      setSearchQuery('');
    }

    // Sync active tab
    const currentLink = navLinks.find(link => 
      link.path === location.pathname || 
      (link.path !== '/' && location.pathname.startsWith(link.path))
    );
    if (currentLink) {
      setActiveTab(currentLink.name);
    } else if (location.pathname === '/') {
      setActiveTab('Home');
    }
  }, [location.search, location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);

    const handleClickOutside = (e: MouseEvent) => {
      // Handle click outside if needed
    };
    window.addEventListener('mousedown', handleClickOutside);
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key === 'Escape') {
          e.target.blur();
        }
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'f':
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
              console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
          } else {
            document.exitFullscreen();
          }
          break;
        case 'm':
          setIsMuted(prev => !prev);
          break;
        case '/':
          e.preventDefault();
          searchInputRef.current?.focus();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const handleCustomToast = (e: any) => {
      setToastMessage(e.detail.message);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    };
    window.addEventListener('uniflex-toast', handleCustomToast);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('uniflex-toast', handleCustomToast);
    };
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
      if (searchInputRef.current) searchInputRef.current.blur();
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const navLinks = [
    { name: 'Home', path: '/browse' },
    { name: 'TV Shows', path: '/tv' },
    { name: 'Movies', path: '/movies' },
    { name: 'New & Popular', path: '/new' },
    { name: 'My List', path: '/mylist' },
  ];

  const toggleNotificationMode = () => {
    const modes: NotificationMode[] = ['normal', 'vibrate', 'silent'];
    const currentIndex = modes.indexOf(notificationMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    const nextMode = modes[nextIndex];
    
    setNotificationMode(nextMode);
    localStorage.setItem('uniflex_notification_mode', nextMode);
    
    // Toast notification
    setToastMessage(`Mode: ${nextMode.charAt(0).toUpperCase() + nextMode.slice(1)}`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);

    // Haptic feedback
    if (nextMode === 'vibrate' && 'vibrate' in navigator) {
      navigator.vibrate(200);
    }
  };

  const getNotificationIcon = () => {
    switch (notificationMode) {
      case 'vibrate': return <BellRing className="h-5 w-5 text-primary-purple" />;
      case 'silent': return <BellOff className="h-5 w-5 text-gray-500" />;
      default: return <Bell className="h-5 w-5 text-primary-magenta" />;
    }
  };

  return (
    <nav className={cn(
      "sticky top-0 left-0 right-0 z-[50] w-full px-4 py-4 transition-all duration-500 lg:px-12",
      isScrolled ? "bg-bg-dark/95 backdrop-blur-xl border-b border-white/5 py-3 shadow-2xl" : "bg-gradient-to-b from-bg-dark/80 to-transparent"
    )}>
      <div className="flex items-center">
        <div className="flex items-center space-x-8 lg:space-x-12">
          <Link to="/" className="transition-transform hover:scale-105 active:scale-95 shrink-0">
            <Logo />
          </Link>
          <ul className="hidden space-x-6 lg:flex">
            {navLinks.map((link) => (
              <li 
                key={link.name}
                className={cn(
                  "text-sm transition-colors duration-300 cursor-pointer",
                  activeTab === link.name 
                    ? "text-white font-bold" 
                    : "text-gray-200 hover:text-white"
                )}
                onClick={() => {
                  setActiveTab(link.name);
                  navigate(link.path);
                }}
              >
                {link.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center space-x-5 ml-auto">
          <div className="hidden items-center space-x-5 md:flex">
            <form onSubmit={handleSearchSubmit} ref={searchContainerRef} className="relative flex items-center">
              <div className="relative flex items-center">
                <input 
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search... (/)"
                  className={cn(
                    "bg-white/10 border border-white/10 rounded-full px-4 py-1 text-xs text-white outline-none transition-all duration-300 pr-10",
                    searchQuery ? "w-64 opacity-100" : "w-0 focus:w-64 opacity-0 focus:opacity-100"
                  )}
                />
                <button 
                  type="submit"
                  className={cn(
                    "absolute right-1 p-1.5 rounded-full bg-gradient-to-r from-primary-purple to-primary-magenta text-white transition-all duration-300 hover:scale-110 active:scale-95",
                    searchQuery ? "opacity-100 scale-100" : "opacity-0 scale-0 pointer-events-none"
                  )}
                >
                  <Search className="h-3 w-3" />
                </button>
              </div>
              {!searchQuery && (
                <InteractiveIcon onClick={() => searchInputRef.current?.focus()}>
                  <Search className="h-5 w-5 text-gray-300" />
                </InteractiveIcon>
              )}
            </form>
            
            <InteractiveIcon 
              onClick={() => {
                console.log("Action Triggered: Toggle Mute");
                setIsMuted(!isMuted);
              }}
            >
              {isMuted ? <VolumeX className="h-5 w-5 text-primary-magenta" /> : <Volume2 className="h-5 w-5 text-gray-300" />}
            </InteractiveIcon>

            <InteractiveIcon 
              onClick={() => {
                console.log("Action Triggered: Toggle Notifications");
                toggleNotificationMode();
              }}
              className={cn(
                "transition-all duration-300",
                notificationMode !== 'silent' && "shadow-[0_0_15px_rgba(139,92,246,0.3)]"
              )}
            >
              {getNotificationIcon()}
            </InteractiveIcon>

            <InteractiveIcon 
              onClick={() => {
                console.log("Action Triggered: Social Share");
                handleShare();
              }}
            >
              <Share2 className="h-5 w-5 text-gray-300 hover:text-primary-magenta transition-colors" />
            </InteractiveIcon>

            <div className="relative group">
              <InteractiveIcon>
                <div className="flex items-center justify-center h-5 w-5 rounded border border-gray-500 text-[10px] font-bold text-gray-400 group-hover:text-white group-hover:border-white transition-colors">
                  ?
                </div>
              </InteractiveIcon>
              
              {/* Shortcuts Tooltip */}
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-card-dark/98 p-4 text-xs text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10 backdrop-blur-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
                <p className="font-bold text-primary-magenta mb-2 uppercase tracking-widest">Shortcuts</p>
                <ul className="space-y-2">
                  <li className="flex justify-between"><span>Search</span> <span className="bg-white/10 px-1.5 rounded text-primary-purple">/</span></li>
                  <li className="flex justify-between"><span>Mute</span> <span className="bg-white/10 px-1.5 rounded text-primary-purple">M</span></li>
                  <li className="flex justify-between"><span>Fullscreen</span> <span className="bg-white/10 px-1.5 rounded text-primary-purple">F</span></li>
                  <li className="flex justify-between"><span>Close</span> <span className="bg-white/10 px-1.5 rounded text-primary-purple">ESC</span></li>
                </ul>
              </div>
            </div>
          </div>
          {user ? (
            <div className="relative">
              <motion.div 
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 cursor-pointer group"
                onClick={handleProfileClick}
              >
                <InteractiveIcon glow={true}>
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-purple to-primary-magenta flex items-center justify-center overflow-hidden border border-white/20 shadow-[0_0_20px_rgba(153,69,255,0.3)]">
                    <UserIcon className="h-5 w-5 text-white" />
                  </div>
                </InteractiveIcon>
                <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform duration-300", showDropdown && "rotate-180 text-white")} />
                
                {showDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-card-dark/98 p-2 text-sm text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 z-[200]">
                    <div className="p-3 border-b border-white/10 mb-2">
                       <p className="text-[10px] font-black uppercase tracking-widest text-primary-purple mb-1">Authenticated as</p>
                       <p className="text-xs font-bold truncate opacity-80">{user.email}</p>
                    </div>
                    
                    <button 
                      onClick={handleAccountClick}
                      className="w-full flex items-center space-x-3 p-2.5 hover:bg-white/5 rounded-lg transition-colors text-gray-300 hover:text-white"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Account Settings</span>
                    </button>
                    
                    {isAdmin && (
                      <button 
                        onClick={handleAdminClick}
                        className="w-full flex items-center space-x-3 p-2.5 hover:bg-white/5 rounded-lg transition-colors text-primary-magenta hover:text-white"
                      >
                        <FileVideo className="h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </button>
                    )}
                    
                    <Link to="/developers" className="flex items-center space-x-3 p-2.5 hover:bg-white/5 rounded-lg transition-colors text-gray-300 hover:text-white" onClick={() => setShowDropdown(false)}>
                      <UserIcon className="h-4 w-4" />
                      <span>Developers</span>
                    </Link>
                    
                    {isInstallable && !isInstalled && (
                      <div 
                        className="flex items-center space-x-3 p-2.5 hover:bg-primary-purple/10 rounded-lg cursor-pointer transition-all text-primary-purple group/install"
                        onClick={() => {
                          console.log("Install App Clicked");
                          showInstallPrompt();
                        }}
                      >
                        <Download className={cn("h-4 w-4", isPreparing && "animate-bounce")} />
                        <span className="font-bold">{isPreparing ? "Preparing System..." : "Install App"}</span>
                      </div>
                    )}
                    
                    <div 
                      className="flex items-center space-x-3 p-2.5 hover:bg-red-500/10 rounded-lg cursor-pointer border-t border-white/10 mt-2 transition-colors text-gray-400 hover:text-red-500"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          ) : (
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="rounded-lg bg-gradient-to-r from-primary-purple to-primary-magenta px-6 py-2 text-sm font-bold text-white hover:opacity-90 transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] active:scale-95"
            >
              Sign In
            </motion.button>
          )}

          {/* Mobile Menu Toggle */}
          <motion.button 
            whileTap={{ scale: 0.95 }}
            className="lg:hidden text-white p-1"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </motion.button>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-10 left-1/2 z-[100] bg-primary-purple/90 backdrop-blur-md text-white px-6 py-3 rounded-full font-bold shadow-2xl border border-white/20"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-[72px] z-40 bg-bg-dark/98 backdrop-blur-2xl lg:hidden animate-in fade-in slide-in-from-right">
          <ul className="flex flex-col p-8 space-y-6 text-xl font-bold">
            {navLinks.map((link) => (
              <li 
                key={link.name} 
                className={cn(
                  "transition-colors",
                  activeTab === link.name ? "text-white" : "text-gray-400 hover:text-white"
                )}
                onClick={() => {
                  setActiveTab(link.name);
                  setIsMobileMenuOpen(false);
                }}
              >
                <Link to={link.path}>{link.name}</Link>
              </li>
            ))}
            <li className="pt-6 border-t border-white/10 flex space-x-6">
              <Search className="h-6 w-6 text-gray-400" />
              <Bell className="h-6 w-6 text-gray-400" />
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
