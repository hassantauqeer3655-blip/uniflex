import axios from 'axios';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const tmdb = axios.create({
  baseURL: BASE_URL,
  timeout: 5000, // 5-second timeout
  params: {
    api_key: API_KEY || 'DEMO_MODE', // Fallback for missing key
  },
});

tmdb.interceptors.request.use((config) => {
  if (!API_KEY) {
    // Silently cancel the request if API key is missing to avoid 401 errors
    const source = axios.CancelToken.source();
    config.cancelToken = source.token;
    source.cancel('TMDB_API_KEY_MISSING');
    return config;
  }
  return config;
});

tmdb.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error) && error.message === 'TMDB_API_KEY_MISSING') {
      // Don't log or reject if it was a planned cancellation due to missing key
      return new Promise(() => {}); 
    }
    if (error.response?.status === 401) {
      console.error('TMDB API Error: Unauthorized. Check if your API key is correct.');
    }
    return Promise.reject(error);
  }
);

export const requests = {
  fetchTrending: `/trending/all/week?language=en-US`,
  fetchTrendingDay: `/trending/all/day?language=en-US`,
  fetchNetflixOriginals: `/discover/tv?with_networks=213`,
  fetchTopRated: `/movie/top_rated?language=en-US`,
  fetchActionMovies: `/discover/movie?with_genres=28`,
  fetchComedyMovies: `/discover/movie?with_genres=35`,
  fetchHorrorMovies: `/discover/movie?with_genres=27`,
  fetchRomanceMovies: `/discover/movie?with_genres=10749`,
  fetchDocumentaries: `/discover/movie?with_genres=99`,
  fetchPakistani: `/discover/movie?with_origin_country=PK&language=ur-PK`,
  fetchBollywood: `/discover/movie?with_original_language=hi&region=IN`,
  fetchKorean: `/discover/movie?with_original_language=ko`,
  fetchChinese: `/discover/movie?with_original_language=zh`,
  fetchHollywood: `/discover/movie?with_original_language=en&region=US`,
  fetchSouthIndian: `/discover/movie?with_original_language=te|ta|ml|kn&region=IN`,
  fetchUpcoming: `/movie/upcoming?language=en-US`,
  fetchOngoing: `/tv/on_the_air?language=en-US`,
  fetchAnime: `/discover/tv?with_genres=16&with_keywords=210024|287501&language=en-US`,
  fetchAnimeMovies: `/discover/movie?with_genres=16&with_keywords=210024|287501&language=en-US`,
  searchMovies: (query: string) => `/search/multi?language=en-US&query=${query}&page=1&include_adult=false`,
  fetchMovieDetails: (id: number, type: 'movie' | 'tv') => `/${type}/${id}?language=en-US&append_to_response=videos`,
  fetchMovieCredits: (id: number, type: 'movie' | 'tv') => `/${type}/${id}/credits?language=en-US`,
  fetchRelatedMovies: (id: number, type: 'movie' | 'tv') => `/${type}/${id}/similar?language=en-US`,
};

export default tmdb;
