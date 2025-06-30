import { useState, useEffect } from 'react';
import { useCloudSearchHistory } from './useCloudSearchHistory';
import { createClient } from '@/lib/supabase/client';

const SEARCH_HISTORY_KEY = 'cineverse_search_history';
const MAX_HISTORY_ITEMS = 10;

export interface SearchHistoryItem {
  query: string;
  officialTitle?: string;
  timestamp: number;
  imageUrl?: string;
  rating?: string;
  year?: string;
  cast?: string[];
  crew?: string[];
  id?: number;
  tmdb_id?: number;
  mediaType?: string;
  // 人物検索用のフィールド
  personId?: number;
  personName?: string;
  personDepartment?: string;
  personKnownFor?: Array<{
    id: number;
    title: string;
    mediaType: string;
    posterPath?: string;
  }>;
  profilePath?: string;
}

// localStorage版
function useLocalSearchHistory() {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);

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

  const addToHistory = (
    query: string,
    imageUrl?: string,
    rating?: string,
    year?: string,
    officialTitle?: string,
    cast?: string[],
    crew?: string[],
    id?: number,
    mediaType?: string
  ) => {
    if (!query.trim()) return;
    const newItem: SearchHistoryItem = {
      query: query.trim(),
      officialTitle,
      timestamp: Date.now(),
      imageUrl,
      rating,
      year,
      cast,
      crew,
      id,
      mediaType,
    };
    setSearchHistory(prevHistory => {
      const filteredHistory = prevHistory.filter(item => item.query !== query);
      const newHistory = [newItem, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const addPersonToHistory = (
    personId: number,
    personName: string,
    personDepartment: string,
    personKnownFor?: Array<{
      id: number;
      title: string;
      mediaType: string;
      posterPath?: string;
    }>,
    profilePath?: string
  ) => {
    if (!personName.trim()) return;
    const newItem: SearchHistoryItem = {
      query: personName.trim(),
      timestamp: Date.now(),
      personId,
      personName: personName.trim(),
      personDepartment,
      personKnownFor,
      profilePath,
    };
    setSearchHistory(prevHistory => {
      const filteredHistory = prevHistory.filter(item => !(item.personId === personId && item.query === personName.trim()));
      const newHistory = [newItem, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const removeFromHistory = (timestamp: number) => {
    setSearchHistory(prevHistory => {
      const newHistory = prevHistory.filter(item => item.timestamp !== timestamp);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  };

  return {
    searchHistory,
    addToHistory,
    addPersonToHistory,
    removeFromHistory,
    clearHistory,
    loading: false,
  };
}

// Supabaseクラウド履歴のみを返す
export const useSearchHistory = () => {
  return useCloudSearchHistory();
}; 