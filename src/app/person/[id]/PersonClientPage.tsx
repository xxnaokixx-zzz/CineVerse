'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PersonDetails, PersonCombinedCredits, PersonExternalIds, PersonCredit, getImageUrl } from '@/services/movieService';
import MovieCard from '@/components/MovieCard';
import { FaStar, FaInstagram, FaTwitter, FaGlobe, FaUser, FaFilm, FaBookmark, FaShare, FaSearch } from 'react-icons/fa';
import AIAssistantButton from '@/components/AIAssistantButton';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSearchHistory } from '@/lib/hooks/useSearchHistory';

interface PersonClientPageProps {
  person: PersonDetails;
  credits: PersonCombinedCredits;
  externalIds: PersonExternalIds;
  knownFor: PersonCredit[];
}

export default function PersonClientPage({ person, credits, externalIds, knownFor }: PersonClientPageProps) {
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const searchParams = useSearchParams();
  const initialTab = searchParams?.get('role') === 'director' ? 'director' : 'cast';
  const [filmographyTab, setFilmographyTab] = useState<'cast' | 'director' | 'crew'>(initialTab);
  const [filmographyFilter, setFilmographyFilter] = useState<'all' | 'movie' | 'tv'>('all');
  const [showAll, setShowAll] = useState(false);
  const router = useRouter();
  const { addPersonToHistory } = useSearchHistory();

  useEffect(() => {
    const personKnownFor = knownFor.map(credit => ({
      id: credit.id,
      title: credit.title || credit.name || '',
      mediaType: credit.media_type,
      posterPath: credit.poster_path || undefined,
    }));

    addPersonToHistory(
      person.id,
      person.name,
      person.known_for_department,
      personKnownFor,
      person.profile_path || undefined
    );
  }, [person, knownFor]);

  let filmographyList: PersonCredit[] = [];
  if (filmographyTab === 'cast') {
    filmographyList = credits?.cast || [];
  } else if (filmographyTab === 'director') {
    filmographyList = (credits?.crew || []).filter(c => c.job === 'Director');
  } else if (filmographyTab === 'crew') {
    filmographyList = (credits?.crew || []).filter(c => c.job !== 'Director');
  }
  const filteredFilmography = filmographyList
    .filter(credit => filmographyFilter === 'all' || credit.media_type === filmographyFilter)
    .sort((a, b) => {
      const dateA = new Date(a.release_date || a.first_air_date || 0).getTime();
      const dateB = new Date(b.release_date || b.first_air_date || 0).getTime();
      return dateB - dateA;
    });

  const getAge = (birthday: string | null, deathday: string | null) => {
    if (!birthday) return '';
    const birthDate = new Date(birthday);
    const endDate = deathday ? new Date(deathday) : new Date();
    let age = endDate.getFullYear() - birthDate.getFullYear();
    const m = endDate.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && endDate.getDate() < birthDate.getDate())) {
      age--;
    }
    return `(${age}歳)`;
  };

  return (
    <>
      <div className="bg-dark text-white font-sans">
        <section className="relative h-[400px] md:h-[500px]">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/30"></div>
          <div className="absolute inset-0 flex items-end pb-8">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
                <div className="w-32 md:w-48 h-48 md:h-72 rounded-lg overflow-hidden shadow-xl flex-shrink-0 -mt-16 md:mt-0 bg-darkgray flex items-center justify-center">
                  {person.profile_path ? (
                    <Image
                      className="w-full h-full object-cover"
                      src={getImageUrl(person.profile_path)}
                      alt={person.name}
                      width={200}
                      height={300}
                      priority
                    />
                  ) : (
                    <FaUser className="text-6xl text-gray-500" />
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl md:text-5xl font-bold mb-2">{person.name}</h1>
                  <div className="mb-4 flex gap-4">
                    <AIAssistantButton onClick={() => router.push(`/ai/summary/person/${person.id}`)} />
                    <button
                      className="bg-white/10 hover:bg-white/20 transition-colors px-6 py-3 rounded-full flex items-center font-semibold text-sm opacity-100"
                      onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(person.name + ' 俳優')}`, '_blank', 'noopener,noreferrer')}
                    >
                      <FaSearch className="mr-2" /> 検索
                    </button>
                  </div>
                  <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mb-4">
                    <span className="text-gray-300">{person.known_for_department}</span>
                    {person.birthday && <span className="text-gray-300">•</span>}
                    {person.birthday && <span className="text-gray-300">Born {new Date(person.birthday).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>}
                    {person.place_of_birth && <span className="text-gray-300">•</span>}
                    {person.place_of_birth && <span className="text-gray-300">{person.place_of_birth}</span>}
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center">
                      <FaStar className="text-yellow-400 mr-1" />
                      <span className="font-medium">{person.popularity.toFixed(1)}</span>
                      <span className="text-gray-400 ml-1">Popularity</span>
                    </div>
                    <div className="flex items-center">
                      <FaFilm className="text-primary mr-1" />
                      <span className="font-medium">{credits.cast.length || 0}</span>
                      <span className="text-gray-400 ml-1">Credits</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-4">経歴</h2>
                  <p className={`text-gray-300 mb-4 ${isBioExpanded ? '' : 'line-clamp-4'}`}>{person.biography || '経歴情報がありません。'}</p>
                  {person.biography && person.biography.length > 300 && (
                    <button onClick={() => setIsBioExpanded(!isBioExpanded)} className="text-primary hover:text-secondary transition-colors mt-2">
                      {isBioExpanded ? '閉じる' : '続きを読む'}
                    </button>
                  )}
                </div>

                {knownFor.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">主な作品</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {knownFor.map((credit) => (
                        <MovieCard
                          key={credit.id}
                          id={credit.id}
                          imageUrl={getImageUrl(credit.poster_path)}
                          title={credit.title || credit.name || ''}
                          rating={credit.vote_average.toFixed(1)}
                          year={new Date(credit.release_date || credit.first_air_date || '').getFullYear().toString()}
                          mediaType={credit.media_type}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">フィルモグラフィー</h2>
                    <div className="flex gap-2">
                      <button onClick={() => setFilmographyTab('cast')} className={`${filmographyTab === 'cast' ? 'bg-primary text-white' : 'bg-lightgray text-gray-300 hover:bg-gray-600'} px-3 py-1 rounded-md text-sm transition-colors`}>出演作</button>
                      <button onClick={() => setFilmographyTab('director')} className={`${filmographyTab === 'director' ? 'bg-primary text-white' : 'bg-lightgray text-gray-300 hover:bg-gray-600'} px-3 py-1 rounded-md text-sm transition-colors`}>監督作</button>
                      <button onClick={() => setFilmographyTab('crew')} className={`${filmographyTab === 'crew' ? 'bg-primary text-white' : 'bg-lightgray text-gray-300 hover:bg-gray-600'} px-3 py-1 rounded-md text-sm transition-colors`}>その他スタッフ作</button>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setFilmographyFilter('all')} className={`${filmographyFilter === 'all' ? 'bg-primary text-white' : 'bg-lightgray text-gray-300 hover:bg-gray-600'} px-3 py-1 rounded-md text-sm transition-colors`}>すべて</button>
                      <button onClick={() => setFilmographyFilter('movie')} className={`${filmographyFilter === 'movie' ? 'bg-primary text-white' : 'bg-lightgray text-gray-300 hover:bg-gray-600'} px-3 py-1 rounded-md text-sm transition-colors`}>映画</button>
                      <button onClick={() => setFilmographyFilter('tv')} className={`${filmographyFilter === 'tv' ? 'bg-primary text-white' : 'bg-lightgray text-gray-300 hover:bg-gray-600'} px-3 py-1 rounded-md text-sm transition-colors`}>テレビ</button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {(showAll ? filteredFilmography : filteredFilmography.slice(0, 10)).map((credit) => (
                      <Link key={`${credit.id}-${credit.job || credit.character || ''}`} href={`/${credit.media_type}/${credit.id}`}>
                        <div className="flex items-center gap-4 p-4 bg-darkgray rounded-lg hover:bg-lightgray transition-colors cursor-pointer">
                          <div className="w-16 h-20 rounded overflow-hidden flex-shrink-0 bg-lightgray flex items-center justify-center">
                            {credit.poster_path ? (
                              <Image src={getImageUrl(credit.poster_path)} alt={credit.title || credit.name || ''} width={64} height={80} className="w-full h-full object-cover" />
                            ) : (
                              <FaFilm className="text-3xl text-gray-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{credit.title || credit.name}</h3>
                            {credit.job && <p className="text-gray-400 text-sm">{credit.job}</p>}
                            <p className="text-gray-400 text-sm">{credit.character}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-sm text-gray-300">{(credit.release_date || credit.first_air_date) ? new Date(credit.release_date || credit.first_air_date || '').getFullYear() : 'N/A'}</span>
                              <div className="flex items-center">
                                <FaStar className="text-yellow-400 mr-1 text-xs" />
                                <span className="text-sm">{credit.vote_average.toFixed(1)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  {filteredFilmography.length > 10 && !showAll && (
                    <button
                      className="w-full py-3 bg-lightgray hover:bg-gray-700 transition-colors rounded-lg mt-4 text-center"
                      onClick={() => setShowAll(true)}
                    >
                      全作品を表示
                    </button>
                  )}
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-darkgray p-4 rounded-lg mb-6">
                  <h2 className="text-xl font-bold mb-4">プロフィール</h2>
                  <div className="space-y-3 text-gray-300 text-sm">
                    <div><strong className="text-white font-medium block">職業</strong>{person.known_for_department}</div>
                    {person.birthday && <div><strong className="text-white font-medium block">生年月日</strong>{new Date(person.birthday).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })} {getAge(person.birthday, person.deathday)}</div>}
                    {person.place_of_birth && <div><strong className="text-white font-medium block">出身地</strong>{person.place_of_birth}</div>}
                    {person.deathday && <div><strong className="text-white font-medium block">没年月日</strong>{new Date(person.deathday).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}</div>}
                  </div>
                </div>

                {(externalIds?.instagram_id || externalIds?.twitter_id || externalIds?.facebook_id) && (
                  <div className="bg-darkgray p-4 rounded-lg">
                    <h2 className="text-xl font-bold mb-4">フォロー</h2>
                    <div className="flex flex-col gap-3">
                      {externalIds.instagram_id && <a href={`https://instagram.com/${externalIds.instagram_id}`} target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 transition-colors px-6 py-3 rounded-full flex items-center justify-center font-semibold text-sm opacity-100"><FaInstagram className="mr-2" /> Instagram</a>}
                      {externalIds.twitter_id && <a href={`https://twitter.com/${externalIds.twitter_id}`} target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 transition-colors px-6 py-3 rounded-full flex items-center justify-center font-semibold text-sm opacity-100"><FaTwitter className="mr-2" /> Twitter</a>}
                      {externalIds.facebook_id && <a href={`https://facebook.com/${externalIds.facebook_id}`} target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 transition-colors px-6 py-3 rounded-full flex items-center justify-center font-semibold text-sm opacity-100"><FaGlobe className="mr-2" /> Website</a>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
} 