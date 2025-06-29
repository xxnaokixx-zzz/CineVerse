"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaStar, FaFilm, FaTv, FaTicketAlt } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import TheaterSearchModal from './TheaterSearchModal';

type MovieCardProps = {
  id: number;
  imageUrl: string;
  title: string;
  rating: string;
  year: string;
  mediaType: 'movie' | 'tv' | 'person';
  releaseDate?: string;
  isNowPlaying?: boolean;
};

export default function MovieCard({
  id,
  imageUrl,
  title,
  rating,
  year,
  mediaType,
  releaseDate,
  isNowPlaying
}: MovieCardProps) {
  const router = useRouter();
  const [theaterModalOpen, setTheaterModalOpen] = useState(false);

  // 上映ステータスを判定
  const getTheaterStatus = () => {
    if (mediaType !== 'movie' || !releaseDate) return null;

    const releaseDateObj = new Date(releaseDate);
    const now = new Date();
    const diffTime = now.getTime() - releaseDateObj.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // 公開から30日以内は上映中とみなす
    if (diffDays >= 0 && diffDays <= 30) {
      return 'now';
    } else if (diffDays > 30) {
      return 'ended';
    }
    return null;
  };

  const theaterStatus = getTheaterStatus();
  const isCurrentlyPlaying = isNowPlaying || theaterStatus === 'now';

  const handleTheaterClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setTheaterModalOpen(true);
  };

  if (id === 0) {
    return (
      <div className="block group">
        <div className="bg-darkgray rounded-lg overflow-hidden transition-transform duration-300 transform group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/30">
          <div className="relative aspect-[2/3] w-full bg-lightgray">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <FaFilm className="text-4xl text-gray-500" />
              </div>
            )}

            {/* メディアタイプラベル */}
            {mediaType === 'tv' && (
              <div className="absolute top-2 left-2 bg-primary text-white text-xs font-bold py-1 px-2 rounded-full flex items-center gap-1">
                <FaTv />
                <span>TV</span>
              </div>
            )}

            {/* 上映ステータスラベル */}
            {isCurrentlyPlaying && (
              <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold py-1 px-2 rounded-full flex items-center gap-1">
                <FaTicketAlt />
                <span>上映中</span>
              </div>
            )}

            {/* 上映終了ラベル */}
            {theaterStatus === 'ended' && (
              <div className="absolute top-2 right-2 bg-gray-600 text-white text-xs font-bold py-1 px-2 rounded-full">
                上映終了
              </div>
            )}

            {/* 上映中の場合の映画館リンクオーバーレイ */}
            {isCurrentlyPlaying && (
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button
                  onClick={handleTheaterClick}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <FaTicketAlt />
                  映画館で見る
                </button>
              </div>
            )}
          </div>
          <div className="p-3">
            <h3 className="mt-2 text-sm font-medium truncate" title={title}>{title}</h3>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <span>⭐ {rating}</span>
              <span>{year}</span>
            </div>
          </div>
        </div>

        {/* 映画館検索モーダル */}
        <TheaterSearchModal
          isOpen={theaterModalOpen}
          onClose={() => setTheaterModalOpen(false)}
          movieTitle={title}
        />
      </div>
    );
  }

  return (
    <>
      <Link href={`/${mediaType}/${id}`} className="block group">
        <div className="bg-darkgray rounded-lg overflow-hidden transition-transform duration-300 transform group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/30">
          <div className="relative aspect-[2/3] w-full bg-lightgray">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <FaFilm className="text-4xl text-gray-500" />
              </div>
            )}

            {/* メディアタイプラベル */}
            {mediaType === 'tv' && (
              <div className="absolute top-2 left-2 bg-primary text-white text-xs font-bold py-1 px-2 rounded-full flex items-center gap-1">
                <FaTv />
                <span>TV</span>
              </div>
            )}

            {/* 上映ステータスラベル */}
            {isCurrentlyPlaying && (
              <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold py-1 px-2 rounded-full flex items-center gap-1">
                <FaTicketAlt />
                <span>上映中</span>
              </div>
            )}

            {/* 上映終了ラベル */}
            {theaterStatus === 'ended' && (
              <div className="absolute top-2 right-2 bg-gray-600 text-white text-xs font-bold py-1 px-2 rounded-full">
                上映終了
              </div>
            )}

            {/* 上映中の場合の映画館リンクオーバーレイ */}
            {isCurrentlyPlaying && (
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button
                  onClick={handleTheaterClick}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <FaTicketAlt />
                  映画館で見る
                </button>
              </div>
            )}
          </div>
          <div className="p-3">
            <h3 className="mt-2 text-sm font-medium truncate" title={title}>{title}</h3>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <span>⭐ {rating}</span>
              <span>{year}</span>
            </div>
          </div>
        </div>
      </Link>

      {/* 映画館検索モーダル */}
      <TheaterSearchModal
        isOpen={theaterModalOpen}
        onClose={() => setTheaterModalOpen(false)}
        movieTitle={title}
      />
    </>
  );
} 