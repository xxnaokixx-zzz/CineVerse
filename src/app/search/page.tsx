"use client";

import { useState, useEffect, Suspense } from "react";
import TrendingSection from "@/components/TrendingSection";
import { getTrendingMovies, Movie, multiSearch, getImageUrl } from "@/services/movieService";
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
    try {
      const data = await multiSearch(searchTerm.trim());
      setResults(data.results);
    } catch (err) {
      setResults([]);
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
          映画・アニメ・ドラマ・俳優・監督・声優などを検索できます。
        </p>

        <form onSubmit={handleSearch} className="flex flex-col items-center gap-4 mb-8">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="作品名・俳優名・監督名・声優名で検索..."
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

        {/* Trending Nowセクション */}
        {!searched && (
          <div className="w-full max-w-4xl mx-auto">
            <TrendingSection movies={trending} />
          </div>
        )}

        {/* 検索結果表示 */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-8">
          {isLoading ? (
            <div className="text-center text-gray-400 col-span-full">検索中...</div>
          ) : searched && results.length === 0 ? (
            <div className="text-gray-400 text-center col-span-full">
              検索結果はありません<br />
              <span className="text-xs text-gray-500">日本語名でヒットしない場合は、英語名やローマ字でもお試しください。</span>
            </div>
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