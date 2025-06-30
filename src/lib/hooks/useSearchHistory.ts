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

// ラッパーフック
export const useSearchHistory = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const cloud = useCloudSearchHistory();
  const local = useLocalSearchHistory();
  const [migrated, setMigrated] = useState(false);

  useEffect(() => {
    const checkLoginAndMigrate = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const loggedIn = !!session?.user;
      setIsLoggedIn(loggedIn);

      // ログイン直後かつ未マイグレーションならlocalStorage→Supabaseへ移行
      if (loggedIn && !migrated) {
        console.log('Migration disabled for debugging - skipping localStorage to Supabase migration');
        setMigrated(true);

        // マイグレーション処理を一時的にコメントアウト
        /*
        const localHistoryRaw = localStorage.getItem(SEARCH_HISTORY_KEY);
        if (localHistoryRaw) {
          try {
            const localHistory = JSON.parse(localHistoryRaw);
            if (Array.isArray(localHistory) && localHistory.length > 0) {
              console.log('Starting migration of', localHistory.length, 'items to Supabase');

              // 1件ずつSupabaseへPOSTし、全て成功した場合のみlocalStorageを消す
              const results = await Promise.all(localHistory.map(async (item, index) => {
                try {
                  console.log(`Migrating item ${index + 1}:`, item);
                  const response = await fetch('/api/search-history', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item),
                  });

                  if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`Migration failed for item ${index + 1}:`, {
                      status: response.status,
                      statusText: response.statusText,
                      error: errorText,
                      item: item
                    });
                  } else {
                    console.log(`Successfully migrated item ${index + 1}`);
                  }

                  return response;
                } catch (error) {
                  console.error(`Migration error for item ${index + 1}:`, error);
                  return { ok: false, error };
                }
              }));

              const allSuccess = results.every(res => res.ok);
              console.log('Migration results:', {
                total: results.length,
                successful: results.filter(res => res.ok).length,
                failed: results.filter(res => !res.ok).length
              });

              if (allSuccess) {
                localStorage.removeItem(SEARCH_HISTORY_KEY);
                console.log('Migration completed successfully, localStorage cleared');
              } else {
                // 失敗時はlocalStorageを残す
                console.error('Some search history items failed to migrate to Supabase.');
              }
            }
          } catch (e) {
            console.error('Migration parsing error:', e);
          }
        }
        */
      }
    };
    checkLoginAndMigrate();
    // eslint-disable-next-line
  }, [isLoggedIn, migrated]);

  if (isLoggedIn === null || (isLoggedIn && !migrated)) {
    // ログイン判定中やマイグレーション中はlocalStorage版を返す
    return local;
  }
  return isLoggedIn ? cloud : local;
}; 