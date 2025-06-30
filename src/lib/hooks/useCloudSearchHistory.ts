import { useState, useEffect, useCallback } from 'react';

export interface SearchHistoryItem {
  id?: number;
  tmdb_id?: number;
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

      // timestampが文字列で返ってくる場合も考慮し、数値(ms)に変換する
      const normalized = (data.history || []).map((item: any) => ({
        ...item,
        timestamp: item.timestamp ? new Date(item.timestamp).getTime() : 0,
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
  const removeFromHistory = async (timestamp: number) => {
    console.log('removeFromHistory called with timestamp:', timestamp);

    const target = searchHistory.find(item => item.timestamp === timestamp);
    console.log('Found target item:', target);

    if (!target) {
      console.warn("Could not find item with timestamp:", timestamp);
      return;
    }

    // 削除用のidentifierを決定（優先順位: id > tmdb_id > timestamp）
    let identifier;
    if (target.id) {
      identifier = `id=${target.id}`;
    } else if (target.tmdb_id) {
      identifier = `tmdb_id=${target.tmdb_id}`;
    } else {
      identifier = `timestamp=${timestamp}`;
    }

    console.log('Using identifier for deletion:', identifier);

    try {
      const response = await fetch(`/api/search-history?${identifier}`, { method: 'DELETE' });
      const result = await response.json();
      console.log('Delete API response:', { ok: response.ok, status: response.status, result });

      if (!response.ok) {
        console.error('Failed to delete history item:', result);
        return;
      }

      // 楽観的更新
      setSearchHistory(prev => prev.filter(item => item.timestamp !== timestamp));
    } catch (error) {
      console.error('Error deleting history item:', error);
      return;
    }

    // サーバーからの最新の状態で履歴を再同期
    console.log('Fetching updated history after deletion');
    await fetchHistory();
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