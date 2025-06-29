'use client';

import { useState, useEffect } from 'react';
import { Movie, getNowPlayingMovies, getImageUrl } from '@/services/movieService';
import MovieCard from './MovieCard';
import { FaFilm, FaSpinner } from 'react-icons/fa';

export default function NowPlayingSection() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNowPlayingMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        const nowPlayingMovies = await getNowPlayingMovies();
        // 最大20件に制限
        setMovies(nowPlayingMovies.slice(0, 20));
      } catch (err) {
        console.error('Failed to fetch now playing movies:', err);
        setError('上映中映画の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchNowPlayingMovies();
  }, []);

  if (loading) {
    return (
      <section className="py-12 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-6">
            <FaFilm className="text-2xl text-primary" />
            <h2 className="text-2xl font-bold text-white">Now In Theaters（上映中映画）</h2>
          </div>
          <div className="flex justify-center items-center py-12">
            <FaSpinner className="animate-spin text-4xl text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-6">
            <FaFilm className="text-2xl text-primary" />
            <h2 className="text-2xl font-bold text-white">Now In Theaters（上映中映画）</h2>
          </div>
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (movies.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-6">
          <FaFilm className="text-2xl text-primary" />
          <h2 className="text-2xl font-bold text-white">Now In Theaters（上映中映画）</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {movies.map((movie) => (
            <div key={movie.id} className="relative group">
              <MovieCard
                id={movie.id}
                imageUrl={getImageUrl(movie.poster_path)}
                title={movie.title}
                rating={movie.vote_average.toFixed(1)}
                year={movie.release_date ? new Date(movie.release_date).getFullYear().toString() : 'N/A'}
                mediaType="movie"
                releaseDate={movie.release_date}
                isNowPlaying={true}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 