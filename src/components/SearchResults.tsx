import { useState } from 'react';
import { Movie } from '../types';
import { Check, Plus } from 'lucide-react';
import { useList } from '../context/ListContext';
import MovieModal from './MovieModal';

interface SearchResultsProps {
  results: Movie[];
  onMovieClick?: (movie: Movie) => void;
}

export default function SearchResults({ results, onMovieClick }: SearchResultsProps) {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const { addToList, removeFromList, isInList } = useList();

  const handleMovieClick = (movie: Movie) => {
    if (onMovieClick) {
      onMovieClick(movie);
    } else {
      setSelectedMovie(movie);
    }
  };

  if (results.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center text-zinc-500">
        No results found for your search.
      </div>
    );
  }

  return (
    <>
      <div className="px-4 pt-32 pb-24 md:px-12">
        <h2 className="mb-8 text-2xl font-semibold text-white">Search Results</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {results.map((movie) => (
            <div
              key={movie.id}
              className="group relative cursor-pointer transition duration-200 ease-out hover:scale-105"
              onClick={() => handleMovieClick(movie)}
            >
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.backdrop_path || movie.poster_path}`}
                className="rounded-sm object-cover md:rounded h-full w-full aspect-video"
                alt={movie.title || movie.name}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <button
                  className="h-10 w-10 bg-black/60 rounded-full flex items-center justify-center border border-white/40 hover:bg-black/80 transition relative group/tooltip"
                  onClick={(e) => {
                    e.stopPropagation();
                    isInList(movie.id) ? removeFromList(movie.id) : addToList(movie);
                  }}
                >
                  {isInList(movie.id) ? (
                    <Check className="h-6 w-6 text-white" />
                  ) : (
                    <Plus className="h-6 w-6 text-white" />
                  )}
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                    {isInList(movie.id) ? 'Remove from List' : 'Add to List'}
                  </span>
                </button>
              </div>
              <div className="mt-2 text-sm font-medium text-zinc-300 line-clamp-1">
                {movie.title || movie.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedMovie && (
        <MovieModal 
          movie={selectedMovie} 
          onClose={() => setSelectedMovie(null)} 
        />
      )}
    </>
  );
}
