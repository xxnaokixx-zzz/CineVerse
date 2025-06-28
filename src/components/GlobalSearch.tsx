'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch } from 'react-icons/fa';

export default function GlobalSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 人物名かどうかを判定する関数
  const isPersonName = (query: string) => {
    // 日本語の人名パターン（姓+名、2-4文字）
    const japaneseNamePattern = /^[あ-んア-ン一-龯]{2,4}$/;

    // 英語の人名パターン（FirstName LastName）
    const englishNamePattern = /^[A-Za-z]+\s+[A-Za-z]+$/;

    // 単一の英語名（俳優名など、3文字以上）
    const singleEnglishName = /^[A-Za-z]{3,}$/;

    // 一般的な人物名のキーワード
    const personKeywords = [
      '監督', '俳優', '声優', '女優', '男優', 'アニメーター', '脚本家', 'プロデューサー',
      'director', 'actor', 'actress', 'voice', 'animator', 'writer', 'producer'
    ];

    const hasPersonKeyword = personKeywords.some(keyword =>
      query.toLowerCase().includes(keyword.toLowerCase())
    );

    return japaneseNamePattern.test(query) ||
      englishNamePattern.test(query) ||
      singleEnglishName.test(query) ||
      hasPersonKeyword;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    const query = searchQuery.trim();

    try {
      // 人物名かどうかを判定
      if (isPersonName(query)) {
        // 人物検索を先に実行
        const personResponse = await fetch(
          `https://api.themoviedb.org/3/search/person?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=ja-JP`
        );
        const personData = await personResponse.json();

        if (personData.results && personData.results.length > 0) {
          if (personData.results.length === 1) {
            // 1件の場合は直接人物詳細ページへ
            router.push(`/person/${personData.results[0].id}`);
            return;
          } else {
            // 複数件の場合は人物検索ページで候補を表示
            router.push(`/search?q=${encodeURIComponent(query)}&type=person_search`);
            return;
          }
        }
      }

      // 人物が見つからない場合、または人物名でない場合は通常の検索
      router.push(`/search?q=${encodeURIComponent(query)}`);
    } catch (error) {
      console.error('Search error:', error);
      // エラーの場合は通常の検索ページにリダイレクト
      router.push(`/search?q=${encodeURIComponent(query)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="global-search" className="py-8 bg-darkgray">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6">Discover Your Next Favorite</h2>
          <form onSubmit={handleSearch} className="bg-lightgray rounded-lg p-6">
            <div className="flex gap-4">
              <div className="flex-grow">
                <input
                  type="text"
                  placeholder="作品名、俳優、監督で検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-dark rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="relative"
                onMouseEnter={() => setIsButtonHovered(true)}
                onMouseLeave={() => setIsButtonHovered(false)}
                onFocus={() => setIsButtonHovered(true)}
                onBlur={() => setIsButtonHovered(false)}
                tabIndex={-1}
              >
                <button
                  ref={buttonRef}
                  type="submit"
                  disabled={!searchQuery.trim() || isLoading}
                  className={`w-full bg-primary hover:bg-secondary disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors px-6 py-3 rounded-lg font-medium flex items-center justify-center ${!searchQuery.trim() || isLoading ? 'pointer-events-none' : ''}`}
                >
                  <FaSearch className="mr-2" /> {isLoading ? '検索中...' : '検索'}
                </button>
                {isButtonHovered && !searchQuery.trim() && (
                  <div className="absolute left-1/2 -translate-x-1/2 mt-2 bg-red-600 text-white text-xs rounded px-3 py-2 shadow-lg z-20 whitespace-nowrap">
                    検索欄に何も入力されていません
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
} 