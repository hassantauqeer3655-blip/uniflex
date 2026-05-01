import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import Navbar from '../../components/Navbar';
import Hero from '../../components/Hero';
import MovieRow from '../../components/MovieRow';
import MovieModal from '../../components/MovieModal';
import PageLayout from '../../components/PageLayout';
import { requests } from '../../lib/tmdb';
import { Movie } from '../../types';
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed';

export default function BrowsePage() {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const navigate = useNavigate();
  const { recentlyViewed, addToHistory } = useRecentlyViewed();

  // Profile selection is now handled automatically in the background
  useEffect(() => {
    // If we want to force a specific profile name for debugging
    console.log("Browse Page initialized");
  }, []);

  const handleMovieClick = (movie: Movie) => {
    addToHistory(movie);
    setSelectedMovie(movie);
  };

  const handleCloseModal = () => {
    setSelectedMovie(null);
  };

  return (
    <PageLayout>
      <main className="pb-20">
        <Hero />
        
        <div className="relative -mt-32 md:-mt-48 z-10 pb-20 px-4 md:px-12 space-y-12">
          {/* Recently Played - Using DLL */}
          {recentlyViewed.length > 0 && (
            <MovieRow 
              title="Resume Identity Sync (Recently Played)" 
              initialMovies={recentlyViewed}
              onMovieClick={handleMovieClick}
              onViewMore={() => navigate('/category/mylist')}
              isFocusedRow
            />
          )}

          {/* Main Rows */}
          <MovieRow 
            title="Trending Now" 
            fetchUrl={requests.fetchTrending} 
            onMovieClick={handleMovieClick}
            onViewMore={() => navigate('/category/trending')}
            isLargeRow 
          />
          
          <MovieRow 
            title="Bollywood Blockbusters" 
            fetchUrl={requests.fetchBollywood} 
            onMovieClick={handleMovieClick}
            onViewMore={() => navigate('/category/bollywood')}
          />

          <MovieRow 
            title="South Indian Hits" 
            fetchUrl={requests.fetchSouthIndian} 
            onMovieClick={handleMovieClick}
            onViewMore={() => navigate('/category/south-indian')}
          />

          <MovieRow 
            title="Hollywood Prime" 
            fetchUrl={requests.fetchHollywood} 
            onMovieClick={handleMovieClick}
            onViewMore={() => navigate('/category/hollywood')}
          />

          <MovieRow 
            title="Korean Dramas" 
            fetchUrl={requests.fetchKorean} 
            onMovieClick={handleMovieClick}
            onViewMore={() => navigate('/category/korean')}
          />

          <MovieRow 
            title="Chinese Series" 
            fetchUrl={requests.fetchChinese} 
            onMovieClick={handleMovieClick}
            onViewMore={() => navigate('/category/chinese')}
          />

          <MovieRow 
            title="UNIFLEX Originals" 
            fetchUrl={requests.fetchTrending} 
            onMovieClick={handleMovieClick}
            onViewMore={() => navigate('/category/top-rated')}
          />

          <MovieRow 
            title="Ongoing Worldwide" 
            fetchUrl={requests.fetchOngoing} 
            onMovieClick={handleMovieClick}
            onViewMore={() => navigate('/category/ongoing')}
          />

          <MovieRow 
            title="Upcoming Attractions" 
            fetchUrl={requests.fetchUpcoming} 
            onMovieClick={handleMovieClick}
            onViewMore={() => navigate('/category/upcoming')}
          />

          <MovieRow 
            title="Top Rated Globally" 
            fetchUrl={requests.fetchTopRated} 
            onMovieClick={handleMovieClick}
            onViewMore={() => navigate('/category/top-rated')}
            isTopRated
          />

          <MovieRow 
            title="Animation Universe" 
            fetchUrl={requests.fetchAnime} 
            onMovieClick={handleMovieClick}
            onViewMore={() => navigate('/category/Anime')}
            isAnime
          />

          <MovieRow 
            title="Anime Movies" 
            fetchUrl={requests.fetchAnimeMovies} 
            onMovieClick={handleMovieClick}
            onViewMore={() => navigate('/category/Anime')}
            isAnime
          />

          <MovieRow 
            title="Action Packed" 
            fetchUrl={requests.fetchActionMovies} 
            onMovieClick={handleMovieClick}
            onViewMore={() => navigate('/category/Action')}
          />

          <MovieRow 
            title="Comedy Specials" 
            fetchUrl={requests.fetchComedyMovies} 
            onMovieClick={handleMovieClick}
            onViewMore={() => navigate('/category/Comedy')}
          />

          <MovieRow 
            title="Suspense & Horror" 
            fetchUrl={requests.fetchHorrorMovies} 
            onMovieClick={handleMovieClick}
            onViewMore={() => navigate('/category/Horror')}
          />

          <MovieRow 
            title="Romance & Drama" 
            fetchUrl={requests.fetchRomanceMovies} 
            onMovieClick={handleMovieClick}
            onViewMore={() => navigate('/category/Romance')}
          />

          <MovieRow 
            title="Documentaries" 
            fetchUrl={requests.fetchDocumentaries} 
            onMovieClick={handleMovieClick}
            onViewMore={() => navigate('/category/top-rated')}
          />
        </div>
      </main>

      {selectedMovie && (
        <MovieModal 
          movie={selectedMovie} 
          onClose={handleCloseModal} 
        />
      )}
    </PageLayout>
  );
}
