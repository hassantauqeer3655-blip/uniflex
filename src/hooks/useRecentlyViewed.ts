import { useState, useCallback, useMemo } from 'react';
import { DoublyLinkedList } from '../lib/doublyLinkedList';
import { Movie } from '../types';

// Singleton instance for the session
const sessionHistory = new DoublyLinkedList<Movie>();
const MAX_HISTORY = 10;

export function useRecentlyViewed() {
  const [history, setHistory] = useState<Movie[]>(sessionHistory.toArray());

  const addToHistory = useCallback((movie: Movie) => {
    // Check if already in history to avoid duplicates
    let current = sessionHistory.head;
    while (current) {
      if (current.value.id === movie.id) {
        sessionHistory.remove(current);
        break;
      }
      current = current.next;
    }

    // Add to front
    sessionHistory.prepend(movie);

    // Trim history
    if (sessionHistory.size > MAX_HISTORY) {
      if (sessionHistory.tail) {
        sessionHistory.remove(sessionHistory.tail);
      }
    }

    setHistory(sessionHistory.toArray());
  }, []);

  const clearHistory = useCallback(() => {
    sessionHistory.clear();
    setHistory([]);
  }, []);

  return {
    recentlyViewed: history,
    addToHistory,
    clearHistory
  };
}
