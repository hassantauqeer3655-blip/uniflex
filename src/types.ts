export interface Movie {
  id: any;
  title?: string;
  name?: string;
  original_name?: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  description?: string; // Added for AdminUpload compatibility
  first_air_date?: string;
  release_date?: string;
  vote_average: number;
  media_type?: 'movie' | 'tv';
  genre_ids?: number[];
  videoUrl?: string;
  video_url?: string; // Added for Supabase compatibility
  trailerUrl?: string;
  trailer_url?: string; // Added for Supabase compatibility
  quality?: string;
  subtitles?: { label: string; src: string; lang: string }[];
  audioTracks?: { language: string; src: string }[];
  category?: string;
  posterUrl?: string;
  poster_url?: string; // Added for Supabase compatibility
  backdrop_url?: string; // Added for Supabase compatibility
  cast?: string[];
  original_language?: string;
  genres?: { id: number; name: string }[];
  region?: 'Pakistani' | 'Bollywood' | 'South Indian' | 'Korean' | 'Chinese' | 'International';
  status?: 'upcoming' | 'ongoing' | 'finished';
  isAnime?: boolean;
  is_anime?: boolean; // Added for Supabase compatibility
  is_series?: boolean; // Added for Supabase compatibility
  downloadCount?: number;
  year?: string; // Added for metadata support
  episodes?: { id: number; title: string; video_url: string }[]; // Added for Series support
  views?: number;
  trendingScore?: number;
  trending_score?: number; // Added for Supabase compatibility
  popularity?: number; // Added for TMDB sorting
  isTrendingNow?: boolean;
  is_adult?: boolean; // Added for content filtering (18+)
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  downloads?: Movie[];
  watchlist?: Movie[];
  watchHistory?: Movie[]; // Added
  ratings?: Record<string, number>; // Added: movieId -> rating (1-10)
  settings?: { // Added
    autoplay: boolean;
    notifications: boolean;
    backgroundIntensity: number;
    playbackSpeed?: number;
    dataSaver?: boolean;
    accentColor?: 'purple' | 'blue' | 'green';
  };
}

export interface UserData {
  uid: string;
  email: string | null;
  role: 'admin' | 'user';
  currentProfileId: string;
  profiles: UserProfile[];
  createdAt: string;
  previewsWatched?: string[];
}

export interface Creator {
  id: string;
  name: string;
  email: string;
  imageURL: string;
  image?: string; // Compatibility field
  role: string;
  github?: string;
  linkedin?: string;
  bio?: string;
}

export interface SiteSettings {
  footerCopyright: string;
  footerMission: string;
  aboutMission: string;
  dashboardHeading: string;
  dashboardSubheading: string;
  footerCol1Title: string;
  footerCol2Title: string;
  footerCol3Title: string;
  footerCol4Title: string;
  [key: string]: string;
}

export interface MovieComment {
  id: string;
  movie_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  text: string;
  created_at: string;
  likes?: number;
}
