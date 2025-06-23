'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getMovieDetails, getMovieCredits, getSimilarMovies, getMovieVideos, getImageUrl, MovieDetails, Movie, Cast, Crew, Video } from '@/services/movieService';
import { FaStar, FaPlay, FaBookmark, FaThumbsUp, FaComment, FaUser, FaTv } from 'react-icons/fa';
import { notFound } from 'next/navigation';
import MovieCard from '@/components/MovieCard';
import TrailerModal from '@/components/TrailerModal';
import { createClient } from '@/lib/supabase/client';

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

// Helper function to format currency
const formatCurrency = (amount: number) => {
  if (amount === 0) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Helper function to format runtime
const formatRuntime = (minutes: number) => {
  if (!minutes) return 'N/A';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

export default function MovieDetailPage({ params }: PageProps) {
  const { id } = React.use(params) as { id: string };
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [credits, setCredits] = useState<{ cast: Cast[], crew: Crew[] } | null>(null);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [vodProviders, setVodProviders] = useState<any[]>([]);
  const [vodModalOpen, setVodModalOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const moviePromise = getMovieDetails(id);
        const creditsPromise = getMovieCredits(id);
        const similarMoviesPromise = getSimilarMovies(id);
        const videosPromise = getMovieVideos(id);

        const [movieData, creditsData, similarMoviesData, videosData] = await Promise.all([
          moviePromise,
          creditsPromise,
          similarMoviesPromise,
          videosPromise,
        ]);

        setMovie(movieData);
        setCredits(creditsData);
        setSimilarMovies(similarMoviesData);
        setVideos(videosData);

        // VOD配信情報取得
        if (movieData && movieData.id) {
          try {
            const res = await fetch(`https://api.themoviedb.org/3/movie/${movieData.id}/watch/providers?api_key=${TMDB_API_KEY}`);
            const data = await res.json();
            const jp = data.results?.JP;
            if (jp && jp.flatrate) {
              setVodProviders(jp.flatrate);
            } else {
              setVodProviders([]);
            }
          } catch (e) {
            setVodProviders([]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch movie details:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  // 追加済み判定（初回マウント時にチェック）
  useEffect(() => {
    async function checkWatchlist() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('watchlist_items')
        .select('id')
        .eq('user_id', user.id)
        .eq('media_id', movie?.id)
        .eq('media_type', 'movie')
        .maybeSingle();
      if (data) setAdded(true);
    }
    if (movie) checkWatchlist();
  }, [movie]);

  // 追加処理
  const handleAddToWatchlist = async () => {
    setAdding(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('ログインが必要です');
      setAdding(false);
      return;
    }
    const { error } = await supabase.from('watchlist_items').insert({
      user_id: user.id,
      media_id: movie?.id,
      media_type: 'movie',
      status: 'Unselected',
    });
    setAdding(false);
    if (!error) setAdded(true);
    else alert('追加に失敗しました: ' + error.message);
  };

  if (loading) {
    return <div className="min-h-screen bg-dark text-white flex items-center justify-center">Loading...</div>;
  }

  if (!movie) {
    return null;
  }

  const trailer = videos.find(video => video.site === 'YouTube' && video.type === 'Trailer');
  const director = credits?.crew.find((member: Crew) => member.job === 'Director');
  const writers = credits?.crew.filter((member: Crew) => member.job === 'Writer' || member.job === 'Screenplay');

  return (
    <>
      <main>
        {/* Hero Section */}
        <section className="relative h-[60vh] min-h-[500px] md:h-[75vh] md:min-h-[600px] -mt-20">
          <div className="absolute inset-0">
            <Image
              src={getImageUrl(movie.backdrop_path, 'original')}
              alt={`Backdrop for ${movie.title}`}
              layout="fill"
              objectFit="cover"
              className="opacity-40"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/80 to-transparent"></div>
          </div>
          <div className="container mx-auto px-4 relative z-10 h-full flex items-end pb-16 pt-20">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-48 flex-shrink-0">
                <Image
                  src={getImageUrl(movie.poster_path)}
                  alt={`Poster for ${movie.title}`}
                  width={200}
                  height={300}
                  className="rounded-lg shadow-lg"
                />
              </div>
              <div className="text-white">
                <h1 className="text-4xl lg:text-5xl font-bold mb-2">{movie.title}</h1>
                <p className="text-lg text-gray-300 mb-4">{movie.tagline}</p>
                <div className="flex items-center gap-4 text-gray-300 text-sm mb-4">
                  <div className="flex items-center gap-1 text-primary">
                    <FaStar />
                    <span>{movie.vote_average.toFixed(1)}</span>
                  </div>
                  <span>{movie.release_date.substring(0, 4)}</span>
                  <span>{formatRuntime(movie.runtime)}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {movie.genres.map((genre: { id: number; name: string }) => (
                    <span key={genre.id} className="bg-white/10 px-3 py-1 text-xs rounded-full">{genre.name}</span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-4">
                  {trailer && (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="bg-white/10 hover:bg-white/20 transition-colors px-6 py-3 rounded-full flex items-center font-semibold text-sm opacity-100"
                    >
                      <FaPlay className="mr-2" /> Watch Trailer
                    </button>
                  )}
                  <button
                    className={`bg-white/10 hover:bg-white/20 transition-colors px-6 py-3 rounded-full flex items-center font-semibold text-sm opacity-100${added || adding ? ' opacity-60 cursor-not-allowed' : ''}`}
                    onClick={handleAddToWatchlist}
                    disabled={added || adding}
                  >
                    <FaBookmark className="mr-2" />
                    {added ? 'Added' : adding ? 'Adding...' : 'Add to Watchlist'}
                  </button>
                  <button
                    className="bg-white/10 hover:bg-white/20 transition-colors px-6 py-3 rounded-full flex items-center font-semibold text-sm opacity-100"
                    onClick={() => setVodModalOpen(true)}
                  >
                    <FaTv className="mr-2" /> VOD
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Details Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 text-white">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-4">ストーリー</h2>
              <p className="text-gray-400 leading-relaxed mb-8">{movie.overview}</p>

              <h2 className="text-2xl font-bold mb-4">キャスト・スタッフ</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {credits?.cast.slice(0, 8).map((actor) => (
                  <Link key={actor.id} href={`/person/${actor.id}`} className="block group">
                    <div className="bg-darkgray p-3 rounded-lg text-center transition-colors hover:bg-lightgray">
                      <div className="w-24 h-24 rounded-full mx-auto mb-2 overflow-hidden bg-secondary">
                        {actor.profile_path ? (
                          <Image
                            src={getImageUrl(actor.profile_path)}
                            alt={actor.name}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FaUser className="text-4xl text-gray-400" />
                          </div>
                        )}
                      </div>
                      <p className="font-semibold text-sm group-hover:text-primary">{actor.name}</p>
                      <p className="text-xs text-gray-400">{actor.character}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <div className="bg-gray-800/50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">詳細</h3>
                <div className="space-y-3 text-sm text-gray-300">
                  <p><strong className="font-semibold text-white">監督:</strong> {director ? director.name : 'N/A'}</p>
                  <p><strong className="font-semibold text-white">脚本:</strong> {writers && writers.length > 0 ? writers.map((w: Crew) => w.name).join(', ') : 'N/A'}</p>
                  <p><strong className="font-semibold text-white">制作費:</strong> {formatCurrency(movie.budget)}</p>
                  <p><strong className="font-semibold text-white">興行収入:</strong> {formatCurrency(movie.revenue)}</p>
                  <p><strong className="font-semibold text-white">ステータス:</strong> {movie.status}</p>
                  <p><strong className="font-semibold text-white">オリジナル言語:</strong> {movie.original_language.toUpperCase()}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Similar Movies Section */}
        {similarMovies && similarMovies.length > 0 && (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold mb-6 text-white">More Like This</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {similarMovies.slice(0, 4).map((movie) => (
                  <MovieCard
                    key={movie.id}
                    id={movie.id}
                    imageUrl={getImageUrl(movie.poster_path)}
                    title={movie.title}
                    rating={movie.vote_average.toFixed(1)}
                    year={new Date(movie.release_date).getFullYear().toString()}
                    mediaType="movie"
                  />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <TrailerModal isOpen={isModalOpen} videoKey={trailer?.key || null} onClose={() => setIsModalOpen(false)} />

      {/* VODモーダル */}
      {vodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px] max-w-[90vw] relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
              onClick={() => setVodModalOpen(false)}
              aria-label="閉じる"
            >
              ×
            </button>
            <h2 className="text-lg font-bold mb-4 text-gray-900">配信中のVOD</h2>
            {vodProviders.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {Array.from(new Map(vodProviders.map(p => [p.provider_id, p])).values()).map((provider) => (
                  <div key={provider.provider_id} className="flex items-center gap-2 bg-lightgray rounded px-2 py-1">
                    {provider.logo_path && (
                      <img src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`} alt={provider.provider_name} className="w-6 h-6 object-contain" />
                    )}
                    <span className="text-xs text-gray-900 font-medium">{provider.provider_name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">VOD配信情報はありません。</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
