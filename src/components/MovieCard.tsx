import Image from 'next/image';
import Link from 'next/link';
import { FaStar, FaFilm, FaTv } from 'react-icons/fa';

type MovieCardProps = {
  id: number;
  imageUrl: string;
  title: string;
  rating: string;
  year: string;
  mediaType: 'movie' | 'tv';
};

export default function MovieCard({ id, imageUrl, title, rating, year, mediaType }: MovieCardProps) {
  return (
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
          {mediaType === 'tv' && (
            <div className="absolute top-2 left-2 bg-primary text-white text-xs font-bold py-1 px-2 rounded-full flex items-center gap-1">
              <FaTv />
              <span>TV</span>
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-sm truncate text-white transition-colors group-hover:text-primary">{title}</h3>
          <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
            <span>{year}</span>
            <div className="flex items-center">
              <FaStar className="text-yellow-400 mr-1" />
              <span>{rating}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
} 