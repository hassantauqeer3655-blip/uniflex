import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ListProvider } from './context/ListContext';
import { PWAProvider } from './context/PWAContext';
import { SettingsProvider } from './context/SettingsContext';
import Home from './pages/Home';
import Login3D from './pages/Login3D';
import HelpCenter from './pages/HelpCenter';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import InfoPage from './pages/InfoPage';
import WatchPage from './pages/WatchPage';
import AdminUpload from './pages/AdminUpload';
import AccountSettings from './pages/AccountSettings';
import DeveloperProfiles from './pages/DeveloperProfiles';
import CategoryPage from './pages/CategoryPage';
import MovieDetailsPage from './pages/MovieDetailsPage';
import SearchPage from './pages/SearchPage';
import ProfilePage from './pages/ProfilePage';
import ProfileSelection from './pages/ProfileSelection';
import About from './pages/About';
import SupportPage from './pages/SupportPage';
import { NavigationProvider } from './context/NavigationContext';
import ScrollToTop from './components/ScrollToTop';
import ScrollToTopOnMount from './components/ScrollToTopOnMount';

import ParticleBackground from './components/ParticleBackground';
import MainLayout from './components/MainLayout';

import { checkAuthAndProfile } from './middleware';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = React.useState<boolean | null>(null);
  const [redirectPath, setRedirectPath] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function verify() {
      try {
        const result = await checkAuthAndProfile(location.pathname + location.search);
        
        if (result.redirect) {
          setRedirectPath(result.redirect);
        } else {
          setRedirectPath(null);
        }
        
        setIsAuthorized(result.authorized);
      } catch (error) {
        console.error("Verification failed:", error);
        // Fallback to allow public paths or redirect
        setIsAuthorized(false);
        setRedirectPath('/login');
      }
    }
    verify();
  }, [location.pathname, location.search, user]);
  
  if (loading || isAuthorized === null) return (
    <div className="h-screen w-screen bg-[#0a0a0a] flex flex-col items-center justify-center">
      <ParticleBackground />
      <div className="relative">
        <div className="h-20 w-20 border-4 border-primary-purple border-t-transparent rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-10 w-10 border-4 border-primary-magenta border-b-transparent rounded-full animate-spin-reverse" />
        </div>
      </div>
      <p className="mt-8 text-[10px] font-black uppercase tracking-[0.5em] text-primary-purple animate-pulse">Connecting...</p>
    </div>
  );
  
  if (redirectPath) return <Navigate to={redirectPath} replace />;
  if (!isAuthorized) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <PWAProvider>
        <SettingsProvider>
          <ListProvider>
            <Router>
              <MainLayout>
                <ScrollToTopOnMount />
            <ScrollToTop />
            <ParticleBackground />
            <NavigationProvider>
              <Routes>
                <Route path="/login" element={<Login3D />} />
                
                <Route path="/" element={<Navigate to="/browse" replace />} />

                <Route path="/browse" element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                } />
                
                {/* Profile selection removed as requested */}
                
                <Route path="/help" element={<HelpCenter />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/info/:slug" element={<InfoPage />} />
                <Route path="/watch/:id" element={
                  <ProtectedRoute>
                    <WatchPage />
                  </ProtectedRoute>
                } />
                <Route path="/admin-upload" element={
                  <ProtectedRoute>
                    <AdminUpload />
                  </ProtectedRoute>
                } />
                <Route path="/developers" element={<DeveloperProfiles />} />
                <Route path="/about" element={<About />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="/support/ticket" element={<SupportPage />} />
                
                <Route path="/tv" element={
                  <ProtectedRoute>
                    <CategoryPage forceGenre="tv" />
                  </ProtectedRoute>
                } />
                
                <Route path="/movies" element={
                  <ProtectedRoute>
                    <CategoryPage forceGenre="movies" />
                  </ProtectedRoute>
                } />
                
                <Route path="/new" element={
                  <ProtectedRoute>
                    <CategoryPage forceGenre="trending" />
                  </ProtectedRoute>
                } />
                
                <Route path="/mylist" element={
                  <ProtectedRoute>
                    <CategoryPage forceGenre="mylist" />
                  </ProtectedRoute>
                } />
                
                <Route path="/category/:genreId" element={
                  <ProtectedRoute>
                    <CategoryPage />
                  </ProtectedRoute>
                } />

                <Route path="/movie/:movieId" element={
                  <ProtectedRoute>
                    <MovieDetailsPage />
                  </ProtectedRoute>
                } />

                <Route path="/search" element={
                  <ProtectedRoute>
                    <SearchPage />
                  </ProtectedRoute>
                } />

                <Route path="/admin" element={
                  <ProtectedRoute>
                    <AdminUpload />
                  </ProtectedRoute>
                } />

                <Route path="/account" element={
                  <ProtectedRoute>
                    <AccountSettings />
                  </ProtectedRoute>
                } />
              </Routes>
            </NavigationProvider>
          </MainLayout>
        </Router>
        </ListProvider>
        </SettingsProvider>
      </PWAProvider>
    </AuthProvider>
  );
}
