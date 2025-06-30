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

    // 作品系（tmdb_id+mediaTypeが存在する場合）は同じtmdb_id+mediaTypeの履歴を全て削除
    if (target.tmdb_id && target.mediaType) {
      // 同じtmdb_id+mediaTypeの履歴を全て取得
      const sameItems = searchHistory.filter(item => item.tmdb_id === target.tmdb_id && item.mediaType === target.mediaType);
      for (const item of sameItems) {
        let identifier = `tmdb_id=${item.tmdb_id}&media_type=${item.mediaType}`;
        console.log('Deleting by tmdb_id+mediaType:', identifier);
        try {
          const response = await fetch(`/api/search-history?${identifier}`, { method: 'DELETE' });
          const result = await response.json();
          console.log('Delete API response:', { ok: response.ok, status: response.status, result });
        } catch (error) {
          console.error('Error deleting history item:', error);
        }
      }
      await fetchHistory();
      return;
    }

    // 人物系やその他はpersonId→id→tmdb_id→timestampの順で削除
    let identifier;
    if (target.personId) {
      identifier = `personId=${target.personId}`;
    } else if (target.id) {
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
      await fetchHistory();
    } catch (error) {
      console.error('Error deleting history item:', error);
      return;
    }
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