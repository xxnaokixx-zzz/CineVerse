'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { multiSearch, MediaItem, getImageUrl } from '@/services/movieService';
import MovieCard from '@/components/MovieCard';
import { FaSearch, FaSpinner } from 'react-icons/fa';

function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (query.trim()) {
      performSearch(1);
    }
  }, [query]);

  const performSearch = async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      const result = await multiSearch(query, page);

      if (page === 1) {
        setMediaItems(result.results);
      } else {
        setMediaItems(prev => [...prev, ...result.results]);
      }
      setTotalResults(result.total_results);
      setTotalPages(result.total_pages);
      setCurrentPage(page);
    } catch (err) {
      setError('検索中にエラーが発生しました。');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (currentPage < totalPages && !loading) {
      performSearch(currentPage + 1);
    }
  };

  if (!query.trim()) {
    return (
      <div className="min-h-screen bg-dark text-white pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <FaSearch className="text-6xl text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">検索クエリを入力してください</h1>
            <p className="text-gray-400">映画やテレビ番組のタイトル、俳優、監督で検索できます</p>
          </div>
        </div>
      </div>
    );
  }

  const searchTitle = `「${query}」の検索結果`;

  return (
    <div className="min-h-screen bg-dark text-white pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {searchTitle}
          </h1>
          {totalResults > 0 && (
            <p className="text-gray-400">
              {totalResults.toLocaleString()}件の結果が見つかりました
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && mediaItems.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <FaSpinner className="animate-spin text-4xl text-primary" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-400 text-lg">{error}</p>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && mediaItems.length === 0 && (
          <div className="text-center py-12">
            <FaSearch className="text-6xl text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">検索結果が見つかりませんでした</h2>
            <p className="text-gray-400">
              `「${query}」`に一致する映画やテレビ番組が見つかりませんでした。<br />
              別のキーワードで検索してみてください。
            </p>
          </div>
        )}

        {/* Search Results */}
        {mediaItems.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
              {mediaItems.map((item) => (
                <MovieCard
                  key={`${item.media_type}-${item.id}`}
                  id={item.id}
                  imageUrl={getImageUrl(item.poster_path)}
                  title={'title' in item ? item.title : item.name}
                  rating={item.vote_average.toFixed(1)}
                  year={'release_date' in item ? (item.release_date ? item.release_date.substring(0, 4) : 'N/A') : (item.first_air_date ? item.first_air_date.substring(0, 4) : 'N/A')}
                  mediaType={item.media_type === 'movie' || item.media_type === 'tv' ? item.media_type : 'movie'}
                />
              ))}
            </div>

            {/* Load More Button */}
            {currentPage < totalPages && (
              <div className="text-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="bg-primary hover:bg-secondary disabled:bg-gray-600 transition-colors px-8 py-3 rounded-lg font-medium flex items-center mx-auto"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      読み込み中...
                    </>
                  ) : (
                    'さらに読み込む'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark text-white flex items-center justify-center">Loading...</div>}>
      <SearchPage />
    </Suspense>
  );
} 