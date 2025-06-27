'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch } from 'react-icons/fa';

export default function GlobalSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
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
                  placeholder="Search by title, actor, director..."
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
                  disabled={!searchQuery.trim()}
                  className={`w-full bg-primary hover:bg-secondary disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors px-6 py-3 rounded-lg font-medium flex items-center justify-center ${!searchQuery.trim() ? 'pointer-events-none' : ''}`}
                >
                  <FaSearch className="mr-2" /> Search
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