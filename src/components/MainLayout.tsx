import React from 'react';
import { useLocation } from 'react-router-dom';
import Footer from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  
  // Define routes where standard footer should NOT show
  // Usually watch page and profile selection don't want the full footer
  const isWatchPage = location.pathname.startsWith('/watch/');
  const isProfileSelection = location.pathname === '/profiles';
  const shouldShowFooter = !isWatchPage && !isProfileSelection;

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        {children}
      </div>
      {shouldShowFooter && (
        <div className="relative z-[40]">
          <Footer />
        </div>
      )}
    </div>
  );
};

export default MainLayout;
