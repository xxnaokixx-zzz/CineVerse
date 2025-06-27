"use client";

import { useState, useEffect, Suspense } from "react";
import TrendingSection from "@/components/TrendingSection";
import { getTrendingMovies, Movie, multiSearch, getImageUrl, TVShow } from "@/services/movieService";
import type { MediaItem } from '@/services/movieService';
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

const SearchPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<MediaItem[]>([]);
  const [searched, setSearched] = useState(false);
  const [trending, setTrending] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchType, setSearchType] = useState<'work' | 'person_works' | 'person_search'>('work');
  const [personWorks, setPersonWorks] = useState<MediaItem[]>([]);
  const [personWorksError, setPersonWorksError] = useState('');

  useEffect(() => {
    getTrendingMovies().then(setTrending);
  }, []);

  useEffect(() => {
    if (initialQuery) {
      handleSearch(undefined, initialQuery);
    }
    // eslint-disable-next-line
  }, [initialQuery]);

  const handleSearch = async (e?: React.FormEvent, overrideQuery?: string) => {
    if (e) e.preventDefault();
    const searchTerm = overrideQuery !== undefined ? overrideQuery : query;
    if (!searchTerm.trim()) return;
    setIsLoading(true);
    setSearched(false);
    setPersonWorks([]);
    setPersonWorksError('');
    try {
      if (searchType === 'work') {
        const data = await multiSearch(searchTerm.trim());
        setResults(data.results);
      } else if (searchType === 'person_works') {
        // 出演作品検索: 人物名で検索→最初の人物IDで出演作取得
        const personRes = await fetch(`https://api.themoviedb.org/3/search/person?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&query=${encodeURIComponent(searchTerm.trim())}&language=ja-JP`);
        const personData = await personRes.json();
        if (personData.results && personData.results.length > 0) {
          const personId = personData.results[0].id;
          const creditsRes = await fetch(`https://api.themoviedb.org/3/person/${personId}/combined_credits?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=ja-JP`);
          const creditsData = await creditsRes.json();
          // 映画・TV両方をまとめてカード表示
          const works = [...(creditsData.cast || []), ...(creditsData.crew || [])]
            .filter((item, idx, arr) => item.poster_path && arr.findIndex(x => x.id === item.id) === idx)
            .sort((a, b) => ((b.vote_average || 0) - (a.vote_average || 0)));
          setPersonWorks(works);
        } else {
          setPersonWorks([]);
          setPersonWorksError('該当する人物が見つかりませんでした');
        }
      } else if (searchType === 'person_search') {
        // 出演者検索: 人物名で検索→最初の人物詳細ページに遷移
        const personRes = await fetch(`https://api.themoviedb.org/3/search/person?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&query=${encodeURIComponent(searchTerm.trim())}&language=ja-JP`);
        const personData = await personRes.json();
        if (personData.results && personData.results.length > 0) {
          const personId = personData.results[0].id;
          router.push(`/person/${personId}`);
          return;
        } else {
          setPersonWorksError('該当する人物が見つかりませんでした');
        }
      }
    } catch (err) {
      setResults([]);
      setPersonWorks([]);
      setPersonWorksError('検索中にエラーが発生しました');
    } finally {
      setSearched(true);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">作品検索</h1>
        <p className="text-center text-gray-400 mb-8">
          映画・アニメ・ドラマなどを検索できます。
        </p>

        {/* 検索種別タブ */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            className={`px-4 py-2 rounded-t-md font-bold border-b-2 ${searchType === 'work' ? 'border-primary text-primary' : 'border-transparent text-gray-400'}`}
            onClick={() => setSearchType('work')}
          >
            作品検索
          </button>
          <button
            className={`px-4 py-2 rounded-t-md font-bold border-b-2 ${searchType === 'person_works' ? 'border-primary text-primary' : 'border-transparent text-gray-400'}`}
            onClick={() => setSearchType('person_works')}
          >
            出演作品検索
          </button>
          <button
            className={`px-4 py-2 rounded-t-md font-bold border-b-2 ${searchType === 'person_search' ? 'border-primary text-primary' : 'border-transparent text-gray-400'}`}
            onClick={() => setSearchType('person_search')}
          >
            出演者検索
          </button>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col items-center gap-4 mb-8">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={searchType === 'work' ? '作品名を入力...' : '人物名を入力...'}
            className="w-full max-w-lg px-4 py-2 rounded-md bg-darkgray text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="w-full max-w-lg px-6 py-2 rounded-md bg-red-600 hover:bg-red-700 transition-colors font-bold"
            disabled={isLoading}
          >
            {isLoading ? '検索中...' : '検索'}
          </button>
        </form>

        {/* Trending Nowセクション（作品検索時のみ） */}
        {searchType === 'work' && !searched && (
          <div className="w-full max-w-4xl mx-auto">
            <TrendingSection movies={trending} />
          </div>
        )}

        {/* 検索結果表示 */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-8">
          {isLoading ? (
            <div className="text-center text-gray-400 col-span-full">検索中...</div>
          ) : searched && ((searchType === 'work' && results.length === 0) || (searchType === 'person_works' && personWorks.length === 0)) ? (
            <div className="text-gray-400 text-center col-span-full">
              検索結果はありません<br />
              <span className="text-xs text-gray-500">{searchType === 'person_works' && personWorksError ? personWorksError : '日本語名でヒットしない場合は、英語名やローマ字でもお試しください。'}</span>
            </div>
          ) : searchType === 'person_works' ? (
            personWorks.map((item, idx) => (
              <Link key={item.id + '-' + item.media_type} href={`/${item.media_type}/${item.id}`} className="bg-darkgray rounded-lg p-2 flex flex-col items-center hover:bg-primary/20 transition-colors">
                <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden mb-2" style={{ maxWidth: 160 }}>
                  {('poster_path' in item && item.poster_path) ? (
                    <img src={getImageUrl(item.poster_path)} alt={item.media_type === 'movie' ? (item as Movie).title : item.media_type === 'tv' ? (item as TVShow).name : ''} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-800">No Image</div>
                  )}
                </div>
                <div className="text-white text-sm font-semibold text-center truncate w-full">
                  {item.media_type === 'movie' ? (item as Movie).title : item.media_type === 'tv' ? (item as TVShow).name : ''}
                </div>
                <div className="text-xs text-gray-400 mt-1">{item.media_type === 'movie' ? '映画' : item.media_type === 'tv' ? 'アニメ/ドラマ' : ''}</div>
              </Link>
            ))
          ) : (
            results.map((item, idx) => {
              if (item.media_type === 'person') {
                // 人物カード
                return (
                  <Link key={item.id} href={`/person/${item.id}`} className="bg-darkgray rounded-lg p-2 flex flex-col items-center hover:bg-primary/20 transition-colors">
                    <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden mb-2" style={{ maxWidth: 160 }}>
                      {item.profile_path ? (
                        <img src={getImageUrl(item.profile_path)} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-800">No Image</div>
                      )}
                    </div>
                    <div className="text-white text-sm font-semibold text-center truncate w-full">{item.name}</div>
                    <div className="text-xs text-gray-400 mt-1">人物</div>
                    {/* 代表作（known_for）があれば表示 */}
                    {item.known_for && Array.isArray(item.known_for) && item.known_for.length > 0 && (
                      <div className="mt-2 w-full">
                        <div className="text-xs text-gray-400 mb-1">代表作:</div>
                        <ul className="text-xs text-gray-300 space-y-1">
                          {item.known_for.slice(0, 3).map((work, i) => (
                            <li key={i} className="truncate">
                              {work.media_type === 'movie'
                                ? work.title
                                : work.media_type === 'tv'
                                  ? work.name
                                  : ''}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Link>
                );
              }
              // 映画・TVカード
              return (
                <Link key={item.id} href={`/${item.media_type}/${item.id}`} className="bg-darkgray rounded-lg p-2 flex flex-col items-center hover:bg-primary/20 transition-colors">
                  <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden mb-2" style={{ maxWidth: 160 }}>
                    {item.poster_path ? (
                      <img src={getImageUrl(item.poster_path)} alt={item.media_type === 'movie' ? item.title : item.media_type === 'tv' ? item.name : ''} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-800">No Image</div>
                    )}
                  </div>
                  <div className="text-white text-sm font-semibold text-center truncate w-full">{item.media_type === 'movie' ? item.title : item.media_type === 'tv' ? item.name : ''}</div>
                  <div className="text-xs text-gray-400 mt-1">{item.media_type === 'movie' ? '映画' : item.media_type === 'tv' ? 'アニメ/ドラマ' : ''}</div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default function SearchPageWithSuspense() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchPage />
    </Suspense>
  );
} 