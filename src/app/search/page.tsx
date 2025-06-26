"use client";

import { useState, useEffect } from "react";
import TrendingSection from "@/components/TrendingSection";
import { getTrendingMovies, Movie } from "@/services/movieService";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [trending, setTrending] = useState<Movie[]>([]);

  useEffect(() => {
    getTrendingMovies().then(setTrending);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 検索ロジックは後で実装
    setResults([]);
    setSearched(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">作品検索</h1>
        <p className="text-center text-gray-400 mb-8">
          映画・アニメ・ドラマなどを検索できます。
        </p>

        <form onSubmit={handleSearch} className="flex flex-col items-center gap-4 mb-8">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="作品名を入力..."
            className="w-full max-w-lg px-4 py-2 rounded-md bg-darkgray text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="w-full max-w-lg px-6 py-2 rounded-md bg-red-600 hover:bg-red-700 transition-colors font-bold"
          >
            検索
          </button>
        </form>

        {/* Trending Nowセクション */}
        <div className="w-full max-w-4xl mx-auto">
          <TrendingSection movies={trending} />
        </div>

        {/* 検索結果プレースホルダー */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {searched && results.length === 0 ? (
            <div className="text-gray-400 text-center col-span-full">検索結果はありません</div>
          ) : (
            results.map((item, idx) => (
              <div key={idx} className="bg-darkgray rounded-lg p-4">{item}</div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 