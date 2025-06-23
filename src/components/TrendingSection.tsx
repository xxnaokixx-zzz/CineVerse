import MovieCard from './MovieCard';
import Link from 'next/link';
import { FaChevronRight } from 'react-icons/fa';
import { Movie, getImageUrl } from '@/services/movieService';

interface TrendingSectionProps {
  movies: Movie[];
}

export default function TrendingSection({ movies }: TrendingSectionProps) {
  return (
    <section id="trending-section" className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Trending Now</h2>
          <Link href="/movies" className="text-primary hover:underline flex items-center cursor-pointer">
            View All <FaChevronRight className="ml-1 text-xs" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {movies.slice(0, 5).map((movie, index) => (
            <MovieCard
              key={movie.id}
              id={movie.id}
              imageUrl={getImageUrl(movie.poster_path)}
              title={movie.title}
              rating={movie.vote_average.toFixed(1)}
              year={movie.release_date.split('-')[0]}
              trendingRank={index + 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
} 