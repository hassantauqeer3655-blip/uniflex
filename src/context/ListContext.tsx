import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { Movie } from '../types';

interface ListContextType {
  myList: Movie[];
  addToList: (movie: Movie) => Promise<void>;
  removeFromList: (movieId: number) => Promise<void>;
  isInList: (movieId: number) => boolean;
}

const ListContext = createContext<ListContextType | undefined>(undefined);

export function ListProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [myList, setMyList] = useState<Movie[]>([]);

  useEffect(() => {
    if (!user) {
      setMyList([]);
      return;
    }

    const fetchMyList = async () => {
      const { data, error } = await supabase
        .from('my_list')
        .select('movie_data')
        .eq('user_id', user.id);

      if (error) {
        console.error('Supabase error:', error);
      } else {
        setMyList(data.map(item => item.movie_data as Movie));
      }
    };

    fetchMyList();

    // Subscribe to real-time changes
    const channel = supabase
      .channel(`my_list:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'my_list',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchMyList();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addToList = async (movie: Movie) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('my_list')
        .upsert({
          user_id: user.id,
          movie_id: movie.id.toString(),
          movie_data: movie
        });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error adding to list:', error);
    }
  };

  const removeFromList = async (movieId: number) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('my_list')
        .delete()
        .eq('user_id', user.id)
        .eq('movie_id', movieId.toString());
      
      if (error) throw error;
    } catch (error) {
      console.error('Error removing from list:', error);
    }
  };

  const isInList = (movieId: number) => {
    return myList.some(movie => movie.id === movieId);
  };

  return (
    <ListContext.Provider value={{ myList, addToList, removeFromList, isInList }}>
      {children}
    </ListContext.Provider>
  );
}

export function useList() {
  const context = useContext(ListContext);
  if (context === undefined) {
    throw new Error('useList must be used within a ListProvider');
  }
  return context;
}
