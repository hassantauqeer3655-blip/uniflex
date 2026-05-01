import { supabase } from '../lib/supabase';
import { Movie, SiteSettings, UserProfile, MovieComment } from '../types';

export const supabaseService = {
  // --- Movies ---
  async getMovies(filters?: {
    category?: string;
    region?: string;
    isAnime?: boolean;
    sortBy?: string;
    status?: string;
    limit?: number;
    offset?: number;
    search?: string;
    year?: string;
    language?: string;
    excludeAdult?: boolean;
  }) {
    let query = supabase.from('content').select('*', { count: 'exact' });

    if (filters?.category) query = query.ilike('category', filters.category);
    if (filters?.region) query = query.eq('region', filters.region);
    if (filters?.isAnime !== undefined) query = query.eq('is_anime', filters.isAnime);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      // Use logical OR to search across multiple columns
      query = query.or(`title.ilike.${searchTerm},description.ilike.${searchTerm},cast.cs.{${filters.search}}`);
    }
    if (filters?.year) query = query.ilike('release_date', `%${filters.year}%`);
    if (filters?.language) query = query.eq('original_language', filters.language);
    if (filters?.excludeAdult) query = query.eq('is_adult', false);

    if (filters?.sortBy === 'Hottest') {
      query = query.order('trending_score', { ascending: false, nullsFirst: false });
    } else if (filters?.sortBy === 'Most Watched') {
      query = query.order('views', { ascending: false, nullsFirst: false });
    } else if (filters?.sortBy === 'Latest') {
      query = query.order('release_date', { ascending: false, nullsFirst: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    if (filters?.limit) {
      const from = filters.offset || 0;
      const to = from + filters.limit - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count };
  },

  async getCategories() {
    const { data, error } = await supabase
      .from('content')
      .select('category')
      .not('category', 'is', null);
    
    if (error) throw error;
    
    // Extract unique categories
    const categories = Array.from(new Set(data.map(item => item.category)));
    return categories;
  },

  async getMovieById(id: string) {
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async addMovie(movie: Partial<Movie>) {
    const { data, error } = await supabase
      .from('content')
      .insert([movie])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateMovie(id: string, updates: Partial<Movie>) {
    const { data, error } = await supabase
      .from('content')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteMovie(id: string) {
    const { error } = await supabase
      .from('content')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // --- Profiles ---
  async getProfiles(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data;
  },

  async updateProfile(profileId: string, updates: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profileId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // --- Site Settings ---
  async getSiteSettings(): Promise<SiteSettings> {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*');
    
    if (error) throw error;
    
    const settings: any = {};
    data.forEach(item => {
      settings[item.key] = item.value;
    });
    return settings as SiteSettings;
  },

  async updateSiteSetting(key: string, value: string) {
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() });
    
    if (error) throw error;
  },

  // --- Watchlist (My List) ---
  async getWatchlist(userId: string) {
    const { data, error } = await supabase
      .from('my_list')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async addToWatchlist(userId: string, movieId: string, movieData: any) {
    const { data, error } = await supabase
      .from('my_list')
      .upsert({ 
        user_id: userId, 
        movie_id: movieId, 
        movie_data: movieData,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async removeFromWatchlist(userId: string, movieId: string) {
    const { error } = await supabase
      .from('my_list')
      .delete()
      .eq('user_id', userId)
      .eq('movie_id', movieId);
    
    if (error) throw error;
  },

  async isInWatchlist(userId: string, movieId: string) {
    const { data, error } = await supabase
      .from('my_list')
      .select('id')
      .eq('user_id', userId)
      .eq('movie_id', movieId)
      .maybeSingle();
    
    if (error) throw error;
    return !!data;
  },

  // --- Comments ---
  async getComments(movieId: string) {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('movie_id', movieId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.warn('Error fetching comments, might be missing table:', error.message);
      return [];
    }
    return data;
  },

  async addComment(comment: Partial<MovieComment>) {
    const { data, error } = await supabase
      .from('comments')
      .insert([comment])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async toggleCommentLike(commentId: string, currentLikes: number) {
    const { data, error } = await supabase
      .from('comments')
      .update({ likes: currentLikes + 1 })
      .eq('id', commentId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // --- Storage ---
  async uploadFile(bucket: string, path: string, file: File) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);
    
    return publicUrl;
  }
};
