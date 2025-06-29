'use client';

import React, { useState, useEffect } from 'react';
import { multiSearch, getImageUrl, Movie, TVShow } from '@/services/movieService';
import Image from 'next/image';
import AIAssistantModal from '@/components/AIAssistantModal';
import { useRouter, useSearchParams } from 'next/navigation';

type SearchResult = (Movie | TVShow) & { title: string };

export default function AISummaryPageClient() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get('query') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<SearchResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    router.push(`/ai/summary?query=${encodeURIComponent(query)}`);
  };

  useEffect(() => {
    async function doSearch() {
      if (!initialQuery) return;
      setIsLoading(true);
      try {
        const searchData = await multiSearch(initialQuery);
        const filteredResults = searchData.results
          .filter(r => r.media_type === 'movie' || r.media_type === 'tv')
          .map(r => ({
            ...r,
            title: r.media_type === 'movie' ? (r as Movie).title : (r as TVShow).name,
          }));
        setResults(filteredResults as SearchResult[]);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }
    doSearch();
  }, [initialQuery]);

  const handleSelectMedia = (media: SearchResult) => {
    router.push(`/ai/summary/${media.media_type}/${media.id}?query=${encodeURIComponent(query)}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">作品の要約・質問</h1>
      <p className="text-center text-gray-400 mb-8">
        要約や質問をしたい映画・ドラマを検索してください。
      </p>

      <form onSubmit={handleSearch} className="flex flex-col items-center gap-4 mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="映画・ドラマ名を入力..."
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

      {results.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {results.map((item) => (
            <div
              key={item.id}
              className="cursor-pointer group"
              onClick={() => handleSelectMedia(item)}
            >
              <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
                <Image
                  src={getImageUrl(item.poster_path)}
                  alt={item.title}
                  layout="fill"
                  objectFit="cover"
                  className="group-hover:opacity-75 transition-opacity"
                />
              </div>
              <h3 className="mt-2 text-sm font-medium truncate">{item.title}</h3>
            </div>
          ))}
        </div>
      )}

      {selectedMedia && (
        <AIAssistantModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedMedia.title}
          contextType={selectedMedia.media_type as 'movie' | 'person'}
        />
      )}
    </div>
  );
} 