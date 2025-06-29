// src/services/movieService.ts

export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  vote_average: number;
  vote_count: number;
  release_date: string;
  genre_ids?: number[];
  media_type?: 'movie';
}

export interface TVShow {
  id: number;
  name: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  vote_average: number;
  first_air_date: string;
  genre_ids?: number[];
  media_type?: 'tv';
}

export interface TVShowDetails extends TVShow {
  genres: Genre[];
  episode_run_time: number[];
  number_of_seasons: number;
  number_of_episodes: number;
  status: string;
  original_language: string;
  networks: Array<{ name: string }>;
}

export interface PersonDetails {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  gender: number;
  known_for_department: string;
  place_of_birth: string | null;
  profile_path: string | null;
  popularity: number;
}

export interface PersonCredit {
  id: number;
  poster_path: string | null;
  vote_average: number;
  overview: string;
  media_type: 'movie' | 'tv';
  character: string;
  popularity?: number;
  // Movie specific
  title?: string;
  release_date?: string;
  // TV specific
  name?: string;
  first_air_date?: string;
  job?: string;
}

export interface PersonCombinedCredits {
  cast: PersonCredit[];
  crew: PersonCredit[];
}

export interface PersonExternalIds {
  instagram_id: string | null;
  twitter_id: string | null;
  facebook_id: string | null;
  imdb_id: string | null;
}

export interface PersonResult {
  id: number;
  name: string;
  profile_path: string | null;
  media_type: 'person';
  known_for?: Array<Movie | TVShow>;
}

export type MediaItem = Movie | TVShow | PersonResult;

export interface Genre {
  id: number;
  name: string;
}

export interface MovieDetails extends Movie {
  genres: Genre[];
  runtime: number;
  budget: number;
  revenue: number;
  tagline: string;
  status: string;
  original_language: string;
  vote_count: number;
  belongs_to_collection?: {
    id: number;
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
  };
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface Crew {
  id: number;
  name: string;
  job: string;
}

interface CreditsResponse {
  cast: Cast[];
  crew: Crew[];
}

export interface Video {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
}

interface VideosResponse {
  results: Video[];
}

interface FetchMoviesResponse {
  results: Movie[];
}

interface FetchTVShowsResponse {
  results: TVShow[];
}

interface MultiSearchResponse {
  results: Array<{
    id: number;
    media_type: 'movie' | 'tv' | 'person';
    title?: string;
    name?: string;
    poster_path: string;
    backdrop_path: string;
    overview: string;
    vote_average: number;
    release_date?: string;
    first_air_date?: string;
    genre_ids?: number[];
  }>;
}

export interface VODProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  link?: string;
}

export interface VODProviders {
  JP?: {
    link?: string;
    flatrate?: VODProvider[];
    rent?: VODProvider[];
    buy?: VODProvider[];
  };
}

export interface VODProvidersResponse {
  id: number;
  results: {
    JP?: {
      link?: string;
      flatrate?: VODProvider[];
      rent?: VODProvider[];
      buy?: VODProvider[];
    };
  };
}

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

async function fetchFromTMDB<T>(endpoint: string): Promise<T> {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB_API_KEY is not defined in your environment variables');
  }

  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  url.searchParams.append('language', 'ja-JP');

  const response = await fetch(url.toString(), { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to fetch from TMDB: ${response.statusText}`);
  }
  return response.json();
}

export async function getTrendingMovies(): Promise<Movie[]> {
  const data = await fetchFromTMDB<FetchMoviesResponse>('/trending/movie/week');
  return data.results;
}

export async function getAllMovies(page: number = 1, sortBy: string = 'popularity.desc'): Promise<{ results: Movie[], total_pages: number, total_results: number }> {
  const data = await fetchFromTMDB<FetchMoviesResponse & { total_pages: number, total_results: number }>(`/discover/movie?sort_by=${sortBy}&page=${page}`);
  return data;
}

export async function getMovieDetails(id: string): Promise<MovieDetails> {
  return fetchFromTMDB<MovieDetails>(`/movie/${id}`);
}

export async function getMovieCredits(id: string): Promise<CreditsResponse> {
  return fetchFromTMDB<CreditsResponse>(`/movie/${id}/credits`);
}

export async function getSimilarMovies(id: string): Promise<Movie[]> {
  const data = await fetchFromTMDB<FetchMoviesResponse>(`/movie/${id}/similar`);
  return data.results;
}

export async function getMovieVideos(id: string): Promise<Video[]> {
  const data = await fetchFromTMDB<VideosResponse>(`/movie/${id}/videos`);
  return data.results;
}

export async function searchMovies(query: string, page: number = 1): Promise<{ results: Movie[], total_pages: number, total_results: number }> {
  const data = await fetchFromTMDB<FetchMoviesResponse & { total_pages: number, total_results: number }>(`/search/movie?query=${encodeURIComponent(query)}&page=${page}`);
  return data;
}

export async function searchTVShows(query: string, page: number = 1): Promise<{ results: TVShow[], total_pages: number, total_results: number }> {
  const data = await fetchFromTMDB<FetchTVShowsResponse & { total_pages: number, total_results: number }>(`/search/tv?query=${encodeURIComponent(query)}&page=${page}`);
  return data;
}

export async function multiSearch(query: string, page: number = 1): Promise<{ results: MediaItem[], total_pages: number, total_results: number }> {
  const data = await fetchFromTMDB<MultiSearchResponse & { total_pages: number, total_results: number }>(`/search/multi?query=${encodeURIComponent(query)}&page=${page}`);

  // デバッグ用: APIレスポンスのresultsを出力
  console.log('multiSearch results:', data.results);

  // Filter out person results and transform to MediaItem format
  const mediaResults = data.results
    .filter(item => item.media_type === 'movie' || item.media_type === 'tv' || item.media_type === 'person')
    .map(item => ({
      ...item,
      title: item.title || item.name || '',
      name: item.name || item.title || '',
    })) as MediaItem[];

  return {
    results: mediaResults,
    total_pages: data.total_pages,
    total_results: data.results.length > 0 ? data.total_results : 0
  };
}

export async function getMoviesByGenre(genreId: number, page: number = 1, sortBy: string = 'popularity.desc'): Promise<{ results: Movie[], total_pages: number, total_results: number }> {
  const data = await fetchFromTMDB<FetchMoviesResponse & { total_pages: number, total_results: number }>(`/discover/movie?with_genres=${genreId}&sort_by=${sortBy}&page=${page}`);
  return data;
}

export async function getGenres(): Promise<Genre[]> {
  const data = await fetchFromTMDB<{ genres: Genre[] }>('/genre/movie/list');
  return data.genres;
}

export async function getTVGenres(): Promise<Genre[]> {
  const data = await fetchFromTMDB<{ genres: Genre[] }>('/genre/tv/list');
  return data.genres;
}

export async function getAllTVShows(page: number = 1, sortBy: string = 'popularity.desc'): Promise<{ results: TVShow[], total_pages: number, total_results: number }> {
  const data = await fetchFromTMDB<FetchTVShowsResponse & { total_pages: number, total_results: number }>(`/discover/tv?with_genres=16&with_origin_country=JP&sort_by=${sortBy}&page=${page}`);
  return data;
}

export async function getTVShowsByGenre(genreId: number, page: number = 1, sortBy: string = 'popularity.desc'): Promise<{ results: TVShow[], total_pages: number, total_results: number }> {
  const data = await fetchFromTMDB<FetchTVShowsResponse & { total_pages: number, total_results: number }>(`/discover/tv?with_genres=${genreId}&without_genres=16&sort_by=${sortBy}&page=${page}`);
  return data;
}

export async function getAllDramas(page: number = 1, sortBy: string = 'popularity.desc'): Promise<{ results: TVShow[], total_pages: number, total_results: number }> {
  const data = await fetchFromTMDB<FetchTVShowsResponse & { total_pages: number, total_results: number }>(`/discover/tv?without_genres=16&sort_by=${sortBy}&page=${page}`);
  return data;
}

export async function getDramasByGenre(genreId: number, page: number = 1, sortBy: string = 'popularity.desc'): Promise<{ results: TVShow[], total_pages: number, total_results: number }> {
  const data = await fetchFromTMDB<FetchTVShowsResponse & { total_pages: number, total_results: number }>(`/discover/tv?with_genres=${genreId}&without_genres=16&sort_by=${sortBy}&page=${page}`);
  return data;
}

export function getImageUrl(path: string | null, size: 'w500' | 'original' = 'w500'): string {
  if (!path) {
    return '';
  }
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export async function getTVShowDetails(id: string): Promise<TVShowDetails> {
  return fetchFromTMDB<TVShowDetails>(`/tv/${id}`);
}

export async function getTVShowCredits(id: string): Promise<CreditsResponse> {
  return fetchFromTMDB<CreditsResponse>(`/tv/${id}/credits`);
}

export async function getSimilarTVShows(id: string): Promise<TVShow[]> {
  const data = await fetchFromTMDB<FetchTVShowsResponse>(`/tv/${id}/similar`);
  return data.results;
}

export async function getTVShowVideos(id: string): Promise<Video[]> {
  const data = await fetchFromTMDB<VideosResponse>(`/tv/${id}/videos`);
  return data.results;
}

export async function getPersonDetails(id: string): Promise<PersonDetails> {
  return fetchFromTMDB<PersonDetails>(`/person/${id}`);
}

export async function getPersonCombinedCredits(id: string): Promise<PersonCombinedCredits> {
  return fetchFromTMDB<PersonCombinedCredits>(`/person/${id}/combined_credits`);
}

export async function getPersonExternalIds(id: string): Promise<PersonExternalIds> {
  return fetchFromTMDB<PersonExternalIds>(`/person/${id}/external_ids`);
}

export async function getMovieCollection(collectionId: number): Promise<any> {
  return fetchFromTMDB<any>(`/collection/${collectionId}`);
}

export async function getTVShowKeywords(id: string): Promise<{ id: number; results: { id: number; name: string }[] }> {
  return fetchFromTMDB<{ id: number; results: { id: number; name: string }[] }>(`/tv/${id}/keywords`);
}

export async function getMovieVODProviders(id: string): Promise<VODProvidersResponse> {
  return fetchFromTMDB<VODProvidersResponse>(`/movie/${id}/watch/providers`);
}

export async function getTVShowVODProviders(id: string): Promise<VODProvidersResponse> {
  return fetchFromTMDB<VODProvidersResponse>(`/tv/${id}/watch/providers`);
}

export async function getNowPlayingMovies(): Promise<Movie[]> {
  const data = await fetchFromTMDB<FetchMoviesResponse>('/movie/now_playing?region=JP&language=ja');
  return data.results;
} 