"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import TrendingSection from "@/components/TrendingSection";
import { getTrendingMovies, Movie, multiSearch, getImageUrl, TVShow } from "@/services/movieService";
import type { MediaItem } from '@/services/movieService';
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import SearchResultModal from '@/components/SearchResultModal';

const SearchPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  const initialType = searchParams.get('type') as 'work' | 'person_works' | 'person_search' | null;
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<MediaItem[]>([]);
  const [searched, setSearched] = useState(false);
  const [trending, setTrending] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchType, setSearchType] = useState<'work' | 'person_works' | 'person_search' | 'director_works'>('work');
  const [personWorks, setPersonWorks] = useState<MediaItem[]>([]);
  const [personWorksError, setPersonWorksError] = useState('');
  const [personCandidates, setPersonCandidates] = useState<any[]>([]);
  const [personWorksTarget, setPersonWorksTarget] = useState<any | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    getTrendingMovies().then(setTrending);
  }, []);

  useEffect(() => {
    if (initialQuery) {
      handleSearch(undefined, initialQuery);
    }
    // eslint-disable-next-line
  }, [initialQuery]);

  // URLパラメータから検索種別を設定
  useEffect(() => {
    if (initialType) {
      setSearchType(initialType);
    }
  }, [initialType]);

  const handleSearch = async (e?: React.FormEvent, overrideQuery?: string) => {
    if (e) e.preventDefault();
    const searchTerm = overrideQuery !== undefined ? overrideQuery : query;
    if (!searchTerm.trim()) return;
    setIsLoading(true);
    setSearched(false);
    setPersonWorks([]);
    setPersonWorksError('');
    setIsModalOpen(true);
    try {
      if (searchType === 'work') {
        const data = await multiSearch(searchTerm.trim());
        setResults(data.results);
      } else if (searchType === 'person_works') {
        const personRes = await fetch(`https://api.themoviedb.org/3/search/person?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&query=${encodeURIComponent(searchTerm.trim())}&language=ja-JP`);
        const personData = await personRes.json();
        if (personData.results && personData.results.length > 0) {
          if (personData.results.length === 1) {
            const person = personData.results[0];
            setPersonWorksTarget(person);
            // 出演作のみ取得
            const creditsRes = await fetch(`https://api.themoviedb.org/3/person/${person.id}/combined_credits?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=ja-JP`);
            const creditsData = await creditsRes.json();
            const castWorks = (creditsData.cast || [])
              .filter((item: any, idx: number, arr: any[]) => item.poster_path && arr.findIndex(x => x.id === item.id) === idx)
              .sort((a: any, b: any) => (b.vote_count || 0) - (a.vote_count || 0));
            setPersonWorks(castWorks);
            setPersonCandidates([]);
            setPersonWorksError('');
          } else {
            setPersonCandidates(personData.results);
            setPersonWorksTarget(null);
            setPersonWorks([]);
            setPersonWorksError('');
          }
        } else {
          setPersonCandidates([]);
          setPersonWorksTarget(null);
          setPersonWorks([]);
          setPersonWorksError('該当する人物が見つかりませんでした');
        }
      } else if (searchType === 'person_search') {
        // 出演者検索: 人物名で検索→候補リスト表示 or 1件なら自動遷移
        const personRes = await fetch(`https://api.themoviedb.org/3/search/person?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&query=${encodeURIComponent(searchTerm.trim())}&language=ja-JP`);
        const personData = await personRes.json();
        if (personData.results && personData.results.length > 0) {
          if (personData.results.length === 1) {
            const personId = personData.results[0].id;
            router.push(`/person/${personId}`);
            return;
          } else {
            setPersonCandidates(personData.results);
            setPersonWorksError('');
          }
        } else {
          setPersonCandidates([]);
          setPersonWorksError('該当する人物が見つかりませんでした');
        }
      } else if (searchType === 'director_works') {
        // 監督作品検索: 人物名で検索→crewからjob==='Director'のみ抽出
        const personRes = await fetch(`https://api.themoviedb.org/3/search/person?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&query=${encodeURIComponent(searchTerm.trim())}&language=ja-JP`);
        const personData = await personRes.json();
        if (personData.results && personData.results.length > 0) {
          if (personData.results.length === 1) {
            const person = personData.results[0];
            setPersonWorksTarget(person);
            // 監督作のみ取得
            const creditsRes = await fetch(`https://api.themoviedb.org/3/person/${person.id}/combined_credits?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=ja-JP`);
            const creditsData = await creditsRes.json();
            const directorWorks = (creditsData.crew || []).filter((item: any) => item.job === 'Director' && item.poster_path)
              .filter((item: any, idx: number, arr: any[]) => arr.findIndex(x => x.id === item.id) === idx)
              .sort((a: any, b: any) => (b.vote_count || 0) - (a.vote_count || 0));
            setPersonWorks(directorWorks);
            setPersonCandidates([]);
            setPersonWorksError('');
          } else {
            setPersonCandidates(personData.results);
            setPersonWorksTarget(null);
            setPersonWorks([]);
            setPersonWorksError('');
          }
        } else {
          setPersonCandidates([]);
          setPersonWorksTarget(null);
          setPersonWorks([]);
          setPersonWorksError('該当する人物が見つかりませんでした');
        }
      }
    } catch (err) {
      setResults([]);
      setPersonWorks([]);
      setPersonWorksError('検索中にエラーが発生しました');
    } finally {
      setSearched(true);
      setIsLoading(false);
    }
  };

  // 入力時のサジェスト取得
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    const value = e.target.value.trim();
    if (!value) {
      setSuggestions([]);
      return;
    }
    debounceTimeout.current = setTimeout(async () => {
      if (searchType === 'person_works' || searchType === 'person_search' || searchType === 'director_works') {
        const res = await fetch(`https://api.themoviedb.org/3/search/person?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&query=${encodeURIComponent(value)}&language=ja-JP`);
        const data = await res.json();
        setSuggestions(data.results || []);
      } else if (searchType === 'work') {
        const data = await multiSearch(value);
        setSuggestions(data.results || []);
      }
    }, 300);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">作品検索</h1>
        <p className="text-center text-gray-400 mb-8">
          映画・アニメ・ドラマなどを検索できます。
        </p>

        {/* 検索種別タブ */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            className={`px-4 py-2 rounded-t-md font-bold border-b-2 ${searchType === 'work' ? 'border-primary text-primary' : 'border-transparent text-gray-400'}`}
            onClick={() => {
              setSearchType('work');
              setQuery('');
              setPersonWorks([]);
              setPersonWorksTarget(null);
              setPersonCandidates([]);
              setPersonWorksError('');
              setResults([]);
              setSearched(false);
              setSuggestions([]);
            }}
          >
            作品検索
          </button>
          <button
            className={`px-4 py-2 rounded-t-md font-bold border-b-2 ${searchType === 'person_works' ? 'border-primary text-primary' : 'border-transparent text-gray-400'}`}
            onClick={() => {
              setSearchType('person_works');
              setQuery('');
              setPersonWorks([]);
              setPersonWorksTarget(null);
              setPersonCandidates([]);
              setPersonWorksError('');
              setResults([]);
              setSearched(false);
              setSuggestions([]);
            }}
          >
            出演作品検索
          </button>
          <button
            className={`px-4 py-2 rounded-t-md font-bold border-b-2 ${searchType === 'director_works' ? 'border-primary text-primary' : 'border-transparent text-gray-400'}`}
            onClick={() => {
              setSearchType('director_works');
              setQuery('');
              setPersonWorks([]);
              setPersonWorksTarget(null);
              setPersonCandidates([]);
              setPersonWorksError('');
              setResults([]);
              setSearched(false);
              setSuggestions([]);
            }}
          >
            監督作品検索
          </button>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col items-center gap-4 mb-8" autoComplete="off">
          <div className="relative w-full max-w-lg">
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder={searchType === 'work' ? '作品名を入力...' : '人物名を入力...'}
              className="w-full px-4 py-2 rounded-md bg-darkgray text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
              autoComplete="off"
            />
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
                className={`w-full mt-2 px-6 py-2 rounded-md bg-red-600 hover:bg-red-700 transition-colors font-bold text-white border border-gray-600 ${!query.trim() ? 'disabled:bg-gray-600 disabled:cursor-not-allowed pointer-events-none' : ''}`}
                disabled={isLoading || !query.trim()}
                style={{ minWidth: 100 }}
              >
                {isLoading ? '検索中...' : '検索'}
              </button>
              {isButtonHovered && !query.trim() && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 bg-red-600 text-white text-xs rounded px-3 py-2 shadow-lg z-20 whitespace-nowrap">
                  検索欄に何も入力されていません
                </div>
              )}
            </div>
            {/* サジェスト候補 */}
            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-black bg-opacity-90 border border-gray-700 rounded-b-md shadow-lg max-h-72 overflow-y-auto z-10">
                {searchType === 'work' ? (
                  // 作品検索のサジェスト
                  suggestions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={async () => {
                        setQuery(item.media_type === 'movie' ? item.title : item.media_type === 'tv' ? item.name : item.name);
                        setSuggestions([]);
                        setIsLoading(true);
                        try {
                          const data = await multiSearch(item.media_type === 'movie' ? item.title : item.media_type === 'tv' ? item.name : item.name);
                          setResults(data.results);
                        } catch (e) {
                          // 必要ならエラー表示
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 transition-colors border-b border-gray-700 last:border-b-0 hover:bg-primary/20 focus:bg-primary/20"
                    >
                      <div className="w-10 h-14 rounded overflow-hidden flex-shrink-0 bg-gray-800 flex items-center justify-center">
                        {item.poster_path ? (
                          <img src={getImageUrl(item.poster_path)} alt={item.media_type === 'movie' ? item.title : item.media_type === 'tv' ? item.name : item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-gray-400">No Image</span>
                        )}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="font-semibold text-white truncate">
                          {item.media_type === 'movie' ? item.title : item.media_type === 'tv' ? item.name : item.name}
                        </div>
                        <div className="text-xs text-gray-300 truncate">
                          {item.media_type === 'movie' ? '映画' : item.media_type === 'tv' ? 'アニメ/ドラマ' : item.media_type === 'person' ? '人物' : ''}
                          {item.media_type === 'movie' && item.release_date && ` • ${new Date(item.release_date).getFullYear()}`}
                          {item.media_type === 'tv' && item.first_air_date && ` • ${new Date(item.first_air_date).getFullYear()}`}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  // 人物検索のサジェスト
                  suggestions.map((person) => (
                    <button
                      key={person.id}
                      type="button"
                      onClick={async () => {
                        setQuery(person.name);
                        setSuggestions([]);
                        setIsLoading(true);
                        try {
                          if (searchType === 'person_works') {
                            setPersonWorksTarget(person);
                            // 出演作取得
                            const creditsRes = await fetch(`https://api.themoviedb.org/3/person/${person.id}/combined_credits?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=ja-JP`);
                            const creditsData = await creditsRes.json();
                            const castWorks = (creditsData.cast || [])
                              .filter((item: any, idx: number, arr: any[]) => item.poster_path && arr.findIndex(x => x.id === item.id) === idx)
                              .sort((a: any, b: any) => (b.vote_count || 0) - (a.vote_count || 0));
                            setPersonWorks(castWorks);
                          } else if (searchType === 'director_works') {
                            setPersonWorksTarget(person);
                            // 監督作のみ取得
                            const creditsRes = await fetch(`https://api.themoviedb.org/3/person/${person.id}/combined_credits?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=ja-JP`);
                            const creditsData = await creditsRes.json();
                            const directorWorks = (creditsData.crew || []).filter((item: any) => item.job === 'Director' && item.poster_path)
                              .filter((item: any, idx: number, arr: any[]) => arr.findIndex(x => x.id === item.id) === idx)
                              .sort((a: any, b: any) => (b.vote_count || 0) - (a.vote_count || 0));
                            setPersonWorks(directorWorks);
                          } else if (searchType === 'person_search') {
                            router.push(`/person/${person.id}`);
                          }
                        } catch (e) {
                          // 必要ならエラー表示
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 transition-colors border-b border-gray-700 last:border-b-0 hover:bg-primary/20 focus:bg-primary/20"
                    >
                      <div className="w-10 h-14 rounded overflow-hidden flex-shrink-0 bg-gray-800 flex items-center justify-center">
                        {person.profile_path ? (
                          <img src={getImageUrl(person.profile_path)} alt={person.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-gray-400">No Image</span>
                        )}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="font-semibold text-white truncate">{person.name}</div>
                        {person.known_for && Array.isArray(person.known_for) && person.known_for.length > 0 && (
                          <div className="text-xs text-gray-300 truncate whitespace-normal">
                            代表作: {person.known_for.slice(0, 2).map((work: any) => work.title || work.name).join(', ')}
                          </div>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </form>

        {/* Trending Nowセクション（作品検索時のみ） */}
        {searchType === 'work' && !searched && (
          <div className="w-full max-w-4xl mx-auto">
            <TrendingSection movies={trending} />
          </div>
        )}

        <SearchResultModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        >
          {searchType === 'work' && (
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {results.map((item, idx) => item.media_type !== 'person' && (
                <Link key={item.id} href={`/${item.media_type}/${item.id}`} className="bg-darkgray rounded-lg p-2 flex flex-col items-center hover:bg-primary/20 transition-colors">
                  <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden mb-2" style={{ maxWidth: 120 }}>
                    {item.poster_path ? (
                      <img src={getImageUrl(item.poster_path)} alt={item.media_type === 'movie' ? item.title : item.media_type === 'tv' ? item.name : ''} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-800">No Image</div>
                    )}
                  </div>
                  <div className="text-white text-sm font-semibold text-center truncate w-full">{item.media_type === 'movie' ? item.title : item.media_type === 'tv' ? item.name : ''}</div>
                  <div className="text-xs text-gray-400 mt-1">{item.media_type === 'movie' ? '映画' : item.media_type === 'tv' ? 'アニメ/ドラマ' : ''}</div>
                </Link>
              )).filter(Boolean)}
            </div>
          )}
          {searchType === 'person_works' && (
            <div>
              {personWorksTarget && (
                <div className="mb-6 flex justify-center">
                  <Link href={`/person/${personWorksTarget.id}`} className="bg-darkgray rounded-lg p-4 flex flex-col items-center hover:bg-primary/20 transition-colors max-w-xs">
                    <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden mb-2" style={{ maxWidth: 160 }}>
                      {personWorksTarget.profile_path ? (
                        <img src={getImageUrl(personWorksTarget.profile_path)} alt={personWorksTarget.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-800">No Image</div>
                      )}
                    </div>
                    <div className="text-white text-lg font-semibold text-center truncate w-full">{personWorksTarget.name}</div>
                    {personWorksTarget.known_for && Array.isArray(personWorksTarget.known_for) && personWorksTarget.known_for.length > 0 && (
                      <div className="mt-2 w-full">
                        <div className="text-xs text-gray-400 mb-1">代表作:</div>
                        <ul className="text-xs text-gray-300 space-y-1">
                          {personWorksTarget.known_for.slice(0, 3).map((work: any, i: number) => (
                            <li key={i} className="truncate">
                              {work.media_type === 'movie'
                                ? work.title
                                : work.media_type === 'tv'
                                  ? work.name
                                  : ''}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Link>
                </div>
              )}
              <div className="text-lg font-bold text-primary mb-4">出演作</div>
              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {personWorks.length === 0 ? (
                  <div className="text-gray-400 col-span-full text-center">出演作が見つかりませんでした</div>
                ) : (
                  personWorks.map((item, idx) => (
                    <Link key={item.id + '-' + item.media_type} href={`/${item.media_type}/${item.id}`} className="bg-darkgray rounded-lg p-2 flex flex-col items-center hover:bg-primary/20 transition-colors">
                      <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden mb-2" style={{ maxWidth: 120 }}>
                        {('poster_path' in item && item.poster_path) ? (
                          <img src={getImageUrl(item.poster_path)} alt={item.media_type === 'movie' ? item.title : item.media_type === 'tv' ? item.name : ''} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-800">No Image</div>
                        )}
                      </div>
                      <div className="text-white text-sm font-semibold text-center truncate w-full">{item.media_type === 'movie' ? item.title : item.media_type === 'tv' ? item.name : ''}</div>
                      <div className="text-xs text-gray-400 mt-1">{item.media_type === 'movie' ? '映画' : item.media_type === 'tv' ? 'アニメ/ドラマ' : ''}</div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
          {searchType === 'director_works' && (
            <div>
              {personWorksTarget && (
                <div className="mb-6 flex justify-center">
                  <Link href={`/person/${personWorksTarget.id}`} className="bg-darkgray rounded-lg p-4 flex flex-col items-center hover:bg-primary/20 transition-colors max-w-xs">
                    <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden mb-2" style={{ maxWidth: 160 }}>
                      {personWorksTarget.profile_path ? (
                        <img src={getImageUrl(personWorksTarget.profile_path)} alt={personWorksTarget.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-800">No Image</div>
                      )}
                    </div>
                    <div className="text-white text-lg font-semibold text-center truncate w-full">{personWorksTarget.name}</div>
                    {personWorksTarget.known_for && Array.isArray(personWorksTarget.known_for) && personWorksTarget.known_for.length > 0 && (
                      <div className="mt-2 w-full">
                        <div className="text-xs text-gray-400 mb-1">代表作:</div>
                        <ul className="text-xs text-gray-300 space-y-1">
                          {personWorksTarget.known_for.slice(0, 3).map((work: any, i: number) => (
                            <li key={i} className="truncate">
                              {work.media_type === 'movie'
                                ? work.title
                                : work.media_type === 'tv'
                                  ? work.name
                                  : ''}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Link>
                </div>
              )}
              <div className="text-lg font-bold text-primary mb-4">監督作品</div>
              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {personWorks.length === 0 ? (
                  <div className="text-gray-400 col-span-full text-center">監督作品が見つかりませんでした</div>
                ) : (
                  personWorks.map((item, idx) => (
                    <Link key={item.id + '-' + item.media_type} href={`/${item.media_type}/${item.id}`} className="bg-darkgray rounded-lg p-2 flex flex-col items-center hover:bg-primary/20 transition-colors">
                      <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden mb-2" style={{ maxWidth: 120 }}>
                        {('poster_path' in item && item.poster_path) ? (
                          <img src={getImageUrl(item.poster_path)} alt={item.media_type === 'movie' ? item.title : item.media_type === 'tv' ? item.name : ''} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-800">No Image</div>
                        )}
                      </div>
                      <div className="text-white text-sm font-semibold text-center truncate w-full">{item.media_type === 'movie' ? item.title : item.media_type === 'tv' ? item.name : ''}</div>
                      <div className="text-xs text-gray-400 mt-1">{item.media_type === 'movie' ? '映画' : item.media_type === 'tv' ? 'アニメ/ドラマ' : ''}</div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </SearchResultModal>
      </div>
    </div>
  );
};

export default function SearchPageWithSuspense() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchPage />
    </Suspense>
  );
} 