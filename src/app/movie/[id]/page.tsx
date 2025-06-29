'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getMovieDetails, getMovieCredits, getSimilarMovies, getMovieVideos, getImageUrl, MovieDetails, Movie, Cast, Crew, Video, getMovieCollection } from '@/services/movieService';
import { FaStar, FaPlay, FaBookmark, FaThumbsUp, FaComment, FaUser, FaTv, FaSearch } from 'react-icons/fa';
import { notFound, useRouter } from 'next/navigation';
import MovieCard from '@/components/MovieCard';
import TrailerModal from '@/components/TrailerModal';
import { createClient } from '@/lib/supabase/client';
import AIAssistantButton from '@/components/AIAssistantButton';

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

// VODサービスロゴマッピング
const VOD_LOGOS: Record<string, string> = {
  'netflix': '/icons/netflix.png',
  'hulu': '/icons/hulu.png',
  'prime': '/icons/primevideo.png',
  'amazon': '/icons/primevideo.png',
  'u-next': '/icons/unext.png',
  'unext': '/icons/unext.png',
  'disney': '/icons/disneyplus.png',
  'dアニメ': '/icons/danime.png',
  'wowow': '/icons/wowow.png',
  'apple': '/icons/appletv.png',
  'abema': '/icons/abema.png',
  'rakuten': '/icons/rakuten.png',
};

const isHiddenService = (service: string) => {
  const lower = service.toLowerCase();
  return (
    lower.includes('standard with ads') ||
    lower.includes('max unext channel') ||
    lower.includes('prime video with ads')
  );
};

// アイコン表示を一時的に無効化
const VODServiceIcon = ({ service }: { service: string }) => {
  return null; // アイコンを表示しない
};

// 主要映画館チェーンのリンク
const THEATER_LINKS = {
  'TOHO': {
    name: 'TOHOシネマズ',
    url: 'https://hlo.tohotheater.jp/net/movie/TNPI3060J01.do',
    searchUrl: (title: string) => `https://hlo.tohotheater.jp/net/movie/TNPI3060J01.do?search=${encodeURIComponent(title)}`
  },
  '109': {
    name: '109シネマズ',
    url: 'https://109cinemas.net/',
    searchUrl: (title: string) => `https://109cinemas.net/search?q=${encodeURIComponent(title)}`
  },
  'United': {
    name: 'ユナイテッド・シネマ',
    url: 'https://www.unitedcinemas.jp/',
    searchUrl: (title: string) => `https://www.unitedcinemas.jp/search?keyword=${encodeURIComponent(title)}`
  },
  'Aeon': {
    name: 'イオンシネマ',
    url: 'https://aeoncinema.com/',
    searchUrl: (title: string) => `https://aeoncinema.com/search?q=${encodeURIComponent(title)}`
  },
  'Filmarks': {
    name: 'Filmarks',
    url: 'https://filmarks.com/',
    searchUrl: (title: string) => `https://filmarks.com/search/movies?q=${encodeURIComponent(title)}`
  }
};

export default function MovieDetailPage({ params }: PageProps) {
  const { id } = React.use(params) as { id: string };
  const router = useRouter();
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
  const [collectionMovies, setCollectionMovies] = useState<Movie[]>([]);
  const [justWatchLinks, setJustWatchLinks] = useState<any[]>([]);
  const [justWatchLoading, setJustWatchLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const moviePromise = getMovieDetails(id);
        const creditsPromise = getMovieCredits(id);
        const videosPromise = getMovieVideos(id);

        // getSimilarMoviesを個別に処理してエラーハンドリング
        let similarMoviesData: Movie[] = [];
        try {
          similarMoviesData = await getSimilarMovies(id);
        } catch (error) {
          console.error("Failed to fetch similar movies:", error);
          // 404エラーの場合は映画が存在しない可能性があるため、より詳細なログを出力
          if (error instanceof Error && error.message.includes('404')) {
            console.warn(`Similar movies not found for movie ID: ${id}. This may indicate the movie doesn't exist or has been removed.`);
          }
          similarMoviesData = [];
        }

        const [movieData, creditsData, videosData] = await Promise.all([
          moviePromise,
          creditsPromise,
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
              // linkプロパティを各プロバイダーに追加
              const providersWithLink = jp.flatrate.map((provider: any) => ({
                ...provider,
                link: jp.link
              }));
              setVodProviders(providersWithLink);
            } else {
              setVodProviders([]);
            }
          } catch (e) {
            setVodProviders([]);
          }
        }

        // コレクション（シリーズ）取得
        if (movieData && movieData.belongs_to_collection?.id) {
          try {
            const collection = await getMovieCollection(movieData.belongs_to_collection.id);
            // 今の作品自身は除外
            const others = (collection.parts || []).filter((m: any) => m.id !== movieData.id);
            setCollectionMovies(others);
          } catch (e) {
            setCollectionMovies([]);
          }
        } else {
          setCollectionMovies([]);
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

  // JustWatch APIからVODリンクを取得
  const fetchJustWatchLinks = async () => {
    if (!movie?.title) return;

    setJustWatchLoading(true);
    try {
      const response = await fetch(`/api/justwatch?title=${encodeURIComponent(movie.title)}`);
      const data = await response.json();

      if (data.success && data.vodLinks) {
        setJustWatchLinks(data.vodLinks);
      } else {
        setJustWatchLinks([]);
      }
    } catch (error) {
      console.error('JustWatch API error:', error);
      setJustWatchLinks([]);
    } finally {
      setJustWatchLoading(false);
    }
  };

  // VODモーダルを開く際にJustWatchリンクを取得
  const handleVodModalOpen = () => {
    setVodModalOpen(true);
    fetchJustWatchLinks();
  };

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

  // 削除処理
  const handleRemoveFromWatchlist = async () => {
    setAdding(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('ログインが必要です');
      setAdding(false);
      return;
    }
    const { error } = await supabase
      .from('watchlist_items')
      .delete()
      .eq('user_id', user.id)
      .eq('media_id', movie?.id)
      .eq('media_type', 'movie');
    setAdding(false);
    if (!error) setAdded(false);
    else alert('削除に失敗しました: ' + error.message);
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

  const movieYear = Number(movie.release_date?.substring(0, 4));
  const movieGenreIds = movie.genres.map(g => g.id);
  const filteredSimilarMovies = similarMovies.filter(sim => {
    const simYear = Number(sim.release_date?.substring(0, 4));
    const genreMatchCount = sim.genre_ids?.filter(id => movieGenreIds.includes(id)).length || 0;
    return (
      Math.abs(simYear - movieYear) <= 5 &&
      genreMatchCount >= 1
    );
  });

  return (
    <>
      <main className="pt-0">
        {/* Hero Section */}
        <section className="relative h-[600px] md:h-[700px] overflow-hidden -mt-20">
          <div className="absolute inset-0">
            <Image
              src={getImageUrl(movie.backdrop_path, 'original')}
              alt={`Backdrop for ${movie.title}`}
              layout="fill"
              objectFit="cover"
              className="opacity-40 object-[center_-50%]"
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
                <div className="mb-4">
                  <AIAssistantButton onClick={() => router.push(`/ai/summary/movie/${movie.id}`)} />
                </div>
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
                  {added ? (
                    <button
                      className="bg-red-600 hover:bg-red-700 transition-colors px-6 py-3 rounded-full flex items-center font-semibold text-sm text-white"
                      onClick={handleRemoveFromWatchlist}
                      disabled={adding}
                    >
                      <FaBookmark className="mr-2" /> Remove from Watchlist
                    </button>
                  ) : (
                    <button
                      className={`bg-white/10 hover:bg-white/20 transition-colors px-6 py-3 rounded-full flex items-center font-semibold text-sm opacity-100${adding ? ' opacity-60 cursor-not-allowed' : ''}`}
                      onClick={handleAddToWatchlist}
                      disabled={adding}
                    >
                      <FaBookmark className="mr-2" /> {adding ? 'Adding...' : 'Add to Watchlist'}
                    </button>
                  )}
                  <button
                    className="bg-white/10 hover:bg-white/20 transition-colors px-6 py-3 rounded-full flex items-center font-semibold text-sm opacity-100"
                    onClick={handleVodModalOpen}
                  >
                    <FaTv className="mr-2" /> VOD
                  </button>
                  <button
                    className="bg-white/10 hover:bg-white/20 transition-colors px-6 py-3 rounded-full flex items-center font-semibold text-sm opacity-100"
                    onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(movie.title)}`, '_blank', 'noopener,noreferrer')}
                  >
                    <FaSearch className="mr-2" /> 検索
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
        {collectionMovies.length > 0 && (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold mb-6 text-white">シリーズ作品</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {collectionMovies.slice(0, 4).map((movie) => (
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-4 min-w-[280px] max-w-[95vw] max-h-[60vh] overflow-y-auto relative">
            <button
              className="absolute top-4 right-4 bg-white/90 text-gray-900 hover:bg-gray-200 text-2xl font-bold rounded-full w-10 h-10 flex items-center justify-center shadow transition-colors z-10"
              onClick={() => setVodModalOpen(false)}
              aria-label="閉じる"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-6 text-white-900 text-center">配信中のVOD</h2>

            {/* VODリスト（JustWatchのみ） */}
            {justWatchLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
                <p className="text-gray-500 mt-4 text-lg">VOD情報を取得中...</p>
              </div>
            ) : justWatchLinks.length > 0 ? (
              <div className="mb-6">
                <div className="text-xs text-gray-200 text-center mb-4">※ 古い映画や一部作品はVODリンクが正確でない場合があります。リンク先が異なる作品の場合もあります。</div>
                <div className="grid gap-2">
                  {Array.from(new Map(justWatchLinks.filter(link => !isHiddenService(link.service)).map(link => [link.service.toLowerCase().replace(/\s+/g, ''), link])).values()).map((link, index) => (
                    <div key={index} className="bg-red-600 rounded-lg p-3 shadow-md flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <div className="mb-1">
                          <h4 className="font-semibold text-white text-base">{link.service}</h4>
                        </div>
                      </div>
                      <button
                        onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
                        className="bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 shadow-md flex items-center gap-2"
                      >
                        <FaPlay className="text-xs" />
                        視聴する
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* VODリスト（TMDBのみ） */}
            {justWatchLinks.length === 0 && vodProviders.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaTv className="text-gray-400 text-2xl" />
                </div>
                <p className="text-gray-500 text-lg">VOD配信情報はありません。</p>
                <p className="text-gray-400 text-sm mt-2">現在、この作品は配信されていない可能性があります。</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
