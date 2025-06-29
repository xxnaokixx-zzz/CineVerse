import { useState, useEffect, useCallback } from 'react';

export interface SearchHistoryItem {
  id?: number;
  query: string;
  officialTitle?: string;
  timestamp: number;
  imageUrl?: string;
  rating?: string;
  year?: string;
  cast?: string[];
  crew?: string[];
  mediaType?: string;
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

export const useCloudSearchHistory = () => {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 履歴取得
  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/search-history');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      // timestampがundefined/nullの場合は0に変換
      const normalized = (data.history || []).map((item: any) => ({
        ...item,
        timestamp: typeof item.timestamp === 'number' ? item.timestamp : 0,
      }));
      setSearchHistory(normalized);
    } catch (e) {
      setSearchHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // 履歴追加
  const addToHistory = async (
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
    await fetch('/api/search-history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    });
    fetchHistory();
  };

  // 人物検索履歴追加
  const addPersonToHistory = async (
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
    await fetch('/api/search-history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    });
    fetchHistory();
  };

  // 履歴削除
  const removeFromHistory = async (query: string) => {
    const target = searchHistory.find(item => item.query === query);
    if (!target || !target.id) return;
    await fetch(`/api/search-history?id=${target.id}`, { method: 'DELETE' });
    fetchHistory();
  };

  // 全履歴削除
  const clearHistory = async () => {
    await fetch('/api/search-history?all=true', { method: 'DELETE' });
    fetchHistory();
  };

  return {
    searchHistory,
    addToHistory,
    addPersonToHistory,
    removeFromHistory,
    clearHistory,
    loading,
  };
}; 