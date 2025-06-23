'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch } from 'react-icons/fa';

export default function GlobalSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

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
              <div>
                <button
                  type="submit"
                  disabled={!searchQuery.trim()}
                  className="w-full bg-primary hover:bg-secondary disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors px-6 py-3 rounded-lg font-medium flex items-center justify-center"
                >
                  <FaSearch className="mr-2" /> Search
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
} 