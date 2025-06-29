import { useState, useEffect } from 'react';

const SEARCH_HISTORY_KEY = 'cineverse_search_history';
const MAX_HISTORY_ITEMS = 10;

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

export const useSearchHistory = () => {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);

  // 初期化時にlocalStorageから履歴を読み込み
  useEffect(() => {
    const savedHistory = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setSearchHistory(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        console.error('Failed to parse search history:', error);
        setSearchHistory([]);
      }
    }
  }, []);

  // 検索履歴を保存
  const addToHistory = (query: string) => {
    if (!query.trim()) return;

    const newItem: SearchHistoryItem = {
      query: query.trim(),
      timestamp: Date.now(),
    };

    setSearchHistory(prevHistory => {
      // 重複を除外し、新しいアイテムを先頭に追加
      const filteredHistory = prevHistory.filter(item => item.query !== query);
      const newHistory = [newItem, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);

      // localStorageに保存
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));

      return newHistory;
    });
  };

  // 特定の検索履歴を削除
  const removeFromHistory = (query: string) => {
    setSearchHistory(prevHistory => {
      const newHistory = prevHistory.filter(item => item.query !== query);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  };

  // 全検索履歴を削除
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  };

  return {
    searchHistory,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };
}; 