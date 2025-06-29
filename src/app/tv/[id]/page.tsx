'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getTVShowDetails, getTVShowCredits, getSimilarTVShows, getTVShowVideos, getImageUrl, TVShowDetails, TVShow, Cast, Crew, Video, getTVShowKeywords, searchTVShows } from '@/services/movieService';
import { FaStar, FaPlay, FaBookmark, FaThumbsUp, FaComment, FaTv, FaUser } from 'react-icons/fa';
import { FaRegUser } from 'react-icons/fa6';
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

function formatRuntime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

function formatCurrency(amount: number): string {
  if (amount === 0) return 'N/A';
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function TVShowDetailPage({ params }: PageProps) {
  const { id } = React.use(params) as { id: string };
  const [tvShow, setTVShow] = useState<TVShowDetails | null>(null);
  const [credits, setCredits] = useState<{ cast: Cast[], crew: Crew[] } | null>(null);
  const [similarShows, setSimilarShows] = useState<TVShow[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [vodProviders, setVodProviders] = useState<any[]>([]);
  const [vodModalOpen, setVodModalOpen] = useState(false);
  const [seriesShows, setSeriesShows] = useState<TVShow[]>([]);
  const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const tvShowPromise = getTVShowDetails(id);
        const creditsPromise = getTVShowCredits(id);
        const videosPromise = getTVShowVideos(id);

        // getSimilarTVShowsを個別に処理してエラーハンドリング
        let similarShowsData: TVShow[] = [];
        try {
          similarShowsData = await getSimilarTVShows(id);
        } catch (error) {
          console.error("Failed to fetch similar TV shows:", error);
          // 404エラーの場合はTV番組が存在しない可能性があるため、より詳細なログを出力
          if (error instanceof Error && error.message.includes('404')) {
            console.warn(`Similar TV shows not found for TV show ID: ${id}. This may indicate the TV show doesn't exist or has been removed.`);
          }
          similarShowsData = [];
        }

        const [tvShowData, creditsData, videosData] = await Promise.all([
          tvShowPromise,
          creditsPromise,
          videosPromise,
        ]);

        setTVShow(tvShowData);
        setCredits(creditsData);
        setSimilarShows(similarShowsData);
        setVideos(videosData);

        // タイトル先頭一致でシリーズ作品を抽出
        if (tvShowData && tvShowData.name) {
          const searchRes = await searchTVShows(tvShowData.name, 1);
          const baseTitle = tvShowData.name;
          const related = searchRes.results.filter(show =>
            show.id !== tvShowData.id &&
            (show.name.startsWith(baseTitle) || show.name.startsWith("ONE PIECE"))
          );
          setSeriesShows(related);
        } else {
          setSeriesShows([]);
        }

        // VOD配信情報取得
        if (tvShowData && tvShowData.id) {
          try {
            const res = await fetch(`https://api.themoviedb.org/3/tv/${tvShowData.id}/watch/providers?api_key=${TMDB_API_KEY}`);
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
      } catch (error) {
        console.error("Failed to fetch TV show details:", error);
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
        .eq('media_id', tvShow?.id)
        .eq('media_type', 'tv')
        .maybeSingle();
      if (data) setAdded(true);
    }
    if (tvShow) checkWatchlist();
  }, [tvShow]);

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
      media_id: tvShow?.id,
      media_type: 'tv',
      status: 'Unselected',
    });
    setAdding(false);
    if (!error) setAdded(true);
    else alert('追加に失敗しました: ' + error.message);
  };

  if (loading) {
    return <div className="min-h-screen bg-dark text-white flex items-center justify-center">Loading...</div>;
  }

  if (!tvShow) {
    return null;
  }

  const trailer = videos.find(video => video.site === 'YouTube' && video.type === 'Trailer');
  const creator = credits?.crew.find((member: Crew) => member.job === 'Creator');
  const writers = credits?.crew.filter((member: Crew) => member.job === 'Writer' || member.job === 'Screenplay');

  const tvYear = Number(tvShow.first_air_date?.substring(0, 4));
  const tvGenreIds = tvShow.genres.map(g => g.id);
  const filteredSimilarShows = similarShows.filter(sim => {
    const simYear = Number(sim.first_air_date?.substring(0, 4));
    const genreMatchCount = sim.genre_ids?.filter(id => tvGenreIds.includes(id)).length || 0;
    return (
      Math.abs(simYear - tvYear) <= 5 &&
      genreMatchCount >= 1
    );
  });

  return (
    <>
      <main>
        {/* Hero Section */}
        <section className="relative h-[600px] md:h-[700px] overflow-hidden -mt-20">
          <div className="absolute inset-0">
            <Image
              src={getImageUrl(tvShow.backdrop_path, 'original')}
              alt={`Backdrop for ${tvShow.name}`}
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
                  src={getImageUrl(tvShow.poster_path)}
                  alt={`Poster for ${tvShow.name}`}
                  width={200}
                  height={300}
                  className="rounded-lg shadow-lg"
                />
              </div>
              <div className="text-white">
                <div className="flex items-center gap-2 mb-2">
                  <FaTv className="text-blue-500" />
                  <span className="text-blue-400 text-sm">テレビ番組</span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold mb-2">{tvShow.name}</h1>
                <div className="mb-4">
                  <AIAssistantButton onClick={() => router.push(`/ai/summary/tv/${tvShow.id}`)} />
                </div>
                <div className="flex items-center gap-4 text-gray-300 text-sm mb-4">
                  <div className="flex items-center gap-1 text-primary">
                    <FaStar />
                    <span>{tvShow.vote_average.toFixed(1)}</span>
                  </div>
                  <span>{tvShow.first_air_date.substring(0, 4)}</span>
                  <span>{tvShow.number_of_seasons}シーズン</span>
                  <span>{tvShow.number_of_episodes}エピソード</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {tvShow.genres.map((genre: { id: number; name: string }) => (
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
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold mb-4 text-white">ストーリー</h2>
                <p className="text-gray-300 leading-relaxed mb-8">{tvShow.overview}</p>

                {credits && credits.cast.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">キャスト・スタッフ</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {credits.cast.slice(0, 8).map((actor) => (
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
                )}
              </div>

              <div>
                <div className="bg-gray-800/50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4">詳細</h3>
                  <div className="space-y-3 text-sm text-gray-300">
                    <p><strong className="font-semibold text-white">クリエイター:</strong> {creator ? creator.name : 'N/A'}</p>
                    <p><strong className="font-semibold text-white">脚本:</strong> {writers && writers.length > 0 ? writers.map((w: Crew) => w.name).join(', ') : 'N/A'}</p>
                    <p><strong className="font-semibold text-white">シーズン数:</strong> {tvShow.number_of_seasons}</p>
                    <p><strong className="font-semibold text-white">エピソード数:</strong> {tvShow.number_of_episodes}</p>
                    <p><strong className="font-semibold text-white">ステータス:</strong> {tvShow.status}</p>
                    <p><strong className="font-semibold text-white">オリジナル言語:</strong> {tvShow.original_language.toUpperCase()}</p>
                    {tvShow.networks && tvShow.networks.length > 0 && (
                      <p><strong className="font-semibold text-white">放送局:</strong> {tvShow.networks[0].name}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Similar TV Shows Section */}
        {/* このセクションを削除 */}

        {/* シリーズ作品セクション */}
        {seriesShows.length > 0 && (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold mb-6 text-white">シリーズ作品</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {seriesShows.slice(0, 8).map((show) => (
                  <MovieCard
                    key={show.id}
                    id={show.id}
                    imageUrl={getImageUrl(show.poster_path)}
                    title={show.name}
                    rating={show.vote_average.toFixed(1)}
                    year={new Date(show.first_air_date).getFullYear().toString()}
                    mediaType="tv"
                  />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {trailer && (
        <TrailerModal
          isOpen={isModalOpen}
          videoKey={trailer.key}
          onClose={() => setIsModalOpen(false)}
        />
      )}

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
                      <button
                        onClick={() => {
                          if (provider.link) {
                            window.open(provider.link, '_blank', 'noopener,noreferrer');
                          }
                        }}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        disabled={!provider.link}
                        title={provider.link ? `${provider.provider_name}で視聴` : 'リンクが利用できません'}
                      >
                        <img src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`} alt={provider.provider_name} className="w-6 h-6 object-contain" />
                      </button>
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