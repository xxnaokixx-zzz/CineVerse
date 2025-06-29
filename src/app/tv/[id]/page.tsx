'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getTVShowDetails, getTVShowCredits, getSimilarTVShows, getTVShowVideos, getImageUrl, TVShowDetails, TVShow, Cast, Crew, Video, getTVShowKeywords, searchTVShows } from '@/services/movieService';
import { FaStar, FaPlay, FaBookmark, FaThumbsUp, FaComment, FaTv, FaUser, FaBroadcastTower, FaSearch } from 'react-icons/fa';
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

// 主要放送局のリンク
const BROADCASTER_LINKS = {
  'NHK': {
    name: 'NHK',
    url: 'https://www.nhk.or.jp/',
    searchUrl: (title: string) => `https://www.nhk.or.jp/search/?q=${encodeURIComponent(title)}`
  },
  'TBS': {
    name: 'TBS',
    url: 'https://www.tbs.co.jp/',
    searchUrl: (title: string) => `https://www.tbs.co.jp/search/?q=${encodeURIComponent(title)}`
  },
  'フジテレビ': {
    name: 'フジテレビ',
    url: 'https://www.fujitv.co.jp/',
    searchUrl: (title: string) => `https://www.fujitv.co.jp/search/?q=${encodeURIComponent(title)}`
  },
  'テレビ朝日': {
    name: 'テレビ朝日',
    url: 'https://www.tv-asahi.co.jp/',
    searchUrl: (title: string) => `https://www.tv-asahi.co.jp/search/?q=${encodeURIComponent(title)}`
  },
  '日本テレビ': {
    name: '日本テレビ',
    url: 'https://www.ntv.co.jp/',
    searchUrl: (title: string) => `https://www.ntv.co.jp/search/?q=${encodeURIComponent(title)}`
  },
  'テレビ東京': {
    name: 'テレビ東京',
    url: 'https://www.tv-tokyo.co.jp/',
    searchUrl: (title: string) => `https://www.tv-tokyo.co.jp/search/?q=${encodeURIComponent(title)}`
  }
};

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
  const [justWatchLinks, setJustWatchLinks] = useState<any[]>([]);
  const [justWatchLoading, setJustWatchLoading] = useState(false);
  const [broadcasterModalOpen, setBroadcasterModalOpen] = useState(false);
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

  // JustWatch APIからVODリンクを取得
  const fetchJustWatchLinks = async () => {
    if (!tvShow?.name) return;

    setJustWatchLoading(true);
    try {
      const response = await fetch(`/api/justwatch?title=${encodeURIComponent(tvShow.name)}`);
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
                    onClick={handleVodModalOpen}
                  >
                    <FaTv className="mr-2" /> VOD
                  </button>
                  <button
                    className="bg-white/10 hover:bg-white/20 transition-colors px-6 py-3 rounded-full flex items-center font-semibold text-sm opacity-100"
                    onClick={() => setBroadcasterModalOpen(true)}
                  >
                    <FaBroadcastTower className="mr-2" /> 放送局
                  </button>
                  <button
                    className="bg-white/10 hover:bg-white/20 transition-colors px-6 py-3 rounded-full flex items-center font-semibold text-sm opacity-100"
                    onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(tvShow.name)}`, '_blank', 'noopener,noreferrer')}
                  >
                    <FaSearch className="mr-2" /> 検索
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur flex items-center justify-center z-50 p-4">
          <div className="bg-darkgray rounded-lg shadow-xl p-4 min-w-[280px] max-w-[95vw] max-h-[60vh] overflow-y-auto relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white focus:outline-none text-2xl font-bold rounded-full w-10 h-10 flex items-center justify-center shadow transition-colors z-10"
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
          </div>
        </div>
      )}

      {/* 放送局検索モーダル */}
      {broadcasterModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-6 min-w-[320px] max-w-[95vw] max-h-[80vh] overflow-y-auto relative">
            <button
              className="absolute top-4 right-4 bg-white/90 text-gray-900 hover:bg-gray-200 text-2xl font-bold rounded-full w-10 h-10 flex items-center justify-center shadow transition-colors z-10"
              onClick={() => setBroadcasterModalOpen(false)}
              aria-label="閉じる"
            >
              ×
            </button>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">放送局で探す</h2>
              <p className="text-gray-300 text-sm">「{tvShow?.name}」の放送情報を確認</p>
            </div>

            {/* 主要放送局 */}
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">主要放送局</h3>
              <div className="grid gap-3">
                {Object.entries(BROADCASTER_LINKS).map(([key, broadcaster]) => (
                  <div key={key} className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-white">{broadcaster.name}</h4>
                        <p className="text-gray-400 text-sm">公式サイトで放送情報を確認</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => window.open(broadcaster.searchUrl(tvShow?.name || ''), '_blank', 'noopener,noreferrer')}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                        >
                          <FaSearch className="text-xs" />
                          検索
                        </button>
                        <button
                          onClick={() => window.open(broadcaster.url, '_blank', 'noopener,noreferrer')}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                        >
                          サイト
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* その他の検索オプション */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-3">その他の検索方法</h3>

              {/* Google検索 */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white">Google検索</h4>
                    <p className="text-gray-400 text-sm">「{tvShow?.name} 放送」で検索</p>
                  </div>
                  <button
                    onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(`${tvShow?.name} 放送`)}`, '_blank', 'noopener,noreferrer')}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                  >
                    <FaSearch className="text-xs" />
                    検索
                  </button>
                </div>
              </div>

              {/* テレビ番組表 */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white">テレビ番組表</h4>
                    <p className="text-gray-400 text-sm">番組表で放送時間を確認</p>
                  </div>
                  <button
                    onClick={() => window.open('https://tv.yahoo.co.jp/', '_blank', 'noopener,noreferrer')}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                  >
                    <FaBroadcastTower className="text-xs" />
                    番組表
                  </button>
                </div>
              </div>
            </div>

            {/* 注意事項 */}
            <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
              <p className="text-yellow-200 text-sm">
                <strong>注意:</strong> 放送情報は各放送局の公式サイトで最新の情報をご確認ください。
                放送スケジュールは変更される場合があります。
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 