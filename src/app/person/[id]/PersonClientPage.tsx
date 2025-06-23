'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PersonDetails, PersonCombinedCredits, PersonExternalIds, PersonCredit, getImageUrl } from '@/services/movieService';
import MovieCard from '@/components/MovieCard';
import { FaStar, FaInstagram, FaTwitter, FaGlobe, FaUser, FaFilm } from 'react-icons/fa';

interface PersonClientPageProps {
  person: PersonDetails;
  credits: PersonCombinedCredits;
  externalIds: PersonExternalIds;
  knownFor: PersonCredit[];
}

export default function PersonClientPage({ person, credits, externalIds, knownFor }: PersonClientPageProps) {
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [filmographyFilter, setFilmographyFilter] = useState<'all' | 'movie' | 'tv'>('all');

  const filteredFilmography = (credits?.cast || [])
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
                  <button onClick={() => setFilmographyFilter('all')} className={`${filmographyFilter === 'all' ? 'bg-primary text-white' : 'bg-lightgray text-gray-300 hover:bg-gray-600'} px-3 py-1 rounded-md text-sm transition-colors`}>すべて</button>
                  <button onClick={() => setFilmographyFilter('movie')} className={`${filmographyFilter === 'movie' ? 'bg-primary text-white' : 'bg-lightgray text-gray-300 hover:bg-gray-600'} px-3 py-1 rounded-md text-sm transition-colors`}>映画</button>
                  <button onClick={() => setFilmographyFilter('tv')} className={`${filmographyFilter === 'tv' ? 'bg-primary text-white' : 'bg-lightgray text-gray-300 hover:bg-gray-600'} px-3 py-1 rounded-md text-sm transition-colors`}>テレビ</button>
                </div>
              </div>
              <div className="space-y-4">
                {filteredFilmography.slice(0, 10).map((credit) => (
                  <Link key={`${credit.id}-${credit.character}`} href={`/${credit.media_type}/${credit.id}`}>
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
              {filteredFilmography.length > 10 && (
                <button className="w-full py-3 bg-lightgray hover:bg-gray-700 transition-colors rounded-lg mt-4 text-center">
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
                <div className="flex gap-3">
                  {externalIds.instagram_id && <a href={`https://instagram.com/${externalIds.instagram_id}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-lightgray hover:bg-gray-600 transition-colors p-3 rounded-lg flex items-center justify-center"><FaInstagram className="text-xl" /></a>}
                  {externalIds.twitter_id && <a href={`https://twitter.com/${externalIds.twitter_id}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-lightgray hover:bg-gray-600 transition-colors p-3 rounded-lg flex items-center justify-center"><FaTwitter className="text-xl" /></a>}
                  {externalIds.facebook_id && <a href={`https://facebook.com/${externalIds.facebook_id}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-lightgray hover:bg-gray-600 transition-colors p-3 rounded-lg flex items-center justify-center"><FaGlobe className="text-xl" /></a>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
} 