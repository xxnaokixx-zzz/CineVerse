'use client';

import { useState } from 'react';
import { SearchHistoryItem } from '@/lib/hooks/useSearchHistory';
import { FiClock, FiX, FiTrash2 } from 'react-icons/fi';

interface SearchHistoryListProps {
  searchHistory: SearchHistoryItem[];
  onSelectHistory: (query: string) => void;
  onRemoveHistory: (query: string) => void;
  onClearHistory: () => void;
  isVisible: boolean;
}

export default function SearchHistoryList({
  searchHistory,
  onSelectHistory,
  onRemoveHistory,
  onClearHistory,
  isVisible,
}: SearchHistoryListProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (!isVisible || searchHistory.length === 0) {
    return null;
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return '今';
    if (diffInHours < 24) return `${diffInHours}時間前`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}日前`;
    return date.toLocaleDateString('ja-JP');
  };

  return (
    <div
      className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <FiClock size={16} />
          <span>検索履歴</span>
        </div>
        {searchHistory.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
          >
            <FiTrash2 size={14} />
            <span>全削除</span>
          </button>
        )}
      </div>

      <div className="py-1">
        {searchHistory.map((item, index) => (
          <div
            key={`${item.query}-${item.timestamp}`}
            className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer group"
            onClick={() => onSelectHistory(item.query)}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <FiClock size={16} className="text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-900 dark:text-gray-100 truncate">
                  {item.query}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTime(item.timestamp)}
                </div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveHistory(item.query);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all"
            >
              <FiX size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 