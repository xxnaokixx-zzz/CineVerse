'use client'
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaPlay, FaInfoCircle, FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Movie, getImageUrl, getMovieVideos, Video } from '@/services/movieService';
import Link from 'next/link';
import TrailerModal from './TrailerModal';

interface HeroCarouselProps {
  movies: Movie[];
}

interface MovieWithTrailer extends Movie {
  trailer?: Video;
}

function getBadge(index: number): { text: string; color: string } {
  switch (index) {
    case 0:
      return { text: 'Top Trending', color: 'bg-primary' };
    case 1:
      return { text: 'Highly Rated', color: 'bg-red-600' };
    case 2:
      return { text: 'Popular Choice', color: 'bg-gray-600' };
    default:
      return { text: 'Featured', color: 'bg-primary' };
  }
}

export default function HeroCarousel({ movies }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [moviesWithTrailers, setMoviesWithTrailers] = useState<MovieWithTrailer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTrailerKey, setCurrentTrailerKey] = useState<string | null>(null);

  const slides = moviesWithTrailers.slice(0, 3); // Use top 3 movies for the carousel

  useEffect(() => {
    async function fetchTrailers() {
      const topMovies = movies.slice(0, 3);
      const moviesWithTrailerData: MovieWithTrailer[] = [];

      for (const movie of topMovies) {
        try {
          const videos = await getMovieVideos(movie.id.toString());
          const trailer = videos.find(video => video.site === 'YouTube' && video.type === 'Trailer');
          moviesWithTrailerData.push({
            ...movie,
            trailer
          });
        } catch (error) {
          console.error(`Failed to fetch trailer for movie ${movie.id}:`, error);
          moviesWithTrailerData.push({
            ...movie,
            trailer: undefined
          });
        }
      }

      setMoviesWithTrailers(moviesWithTrailerData);
    }

    if (movies.length > 0) {
      fetchTrailers();
    }
  }, [movies]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleTrailerClick = (trailerKey: string) => {
    setCurrentTrailerKey(trailerKey);
    setIsModalOpen(true);
  };

  useEffect(() => {
    const slideInterval = setInterval(nextSlide, 7000); // Auto-scroll every 7 seconds
    return () => clearInterval(slideInterval);
  }, [slides.length]);

  if (slides.length === 0) {
    return <div className="h-[500px] md:h-[600px] bg-darkgray flex items-center justify-center">Loading movies...</div>;
  }

  return (
    <>
      <section className="relative h-[600px] md:h-[700px] overflow-hidden">
        <div className="relative w-full h-full">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${currentSlide === index ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            >
              <Image
                src={getImageUrl(slide.backdrop_path, 'original')}
                alt={slide.title}
                fill
                className="object-cover object-[center_-50%]"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/70 to-transparent"></div>
              <div className="absolute inset-0 flex items-end pb-12 md:pb-16">
                <div className="container mx-auto px-4">
                  <div className="max-w-2xl">
                    <span className={`${getBadge(index).color} text-white px-2 py-1 text-sm rounded-md mb-2 inline-block`}>{getBadge(index).text}</span>
                    <h1 className="text-4xl md:text-5xl font-bold mb-3">{slide.title}</h1>
                    <div className="flex items-center space-x-4 mb-4">
                      <span className="flex items-center"><FaStar className="text-yellow-400 mr-1" /> {slide.vote_average.toFixed(1)}/10</span>
                      <span>{slide.release_date.split('-')[0]}</span>
                    </div>
                    <p className="text-gray-300 mb-6 line-clamp-3">{slide.overview}</p>
                    <div className="flex flex-wrap gap-3">
                      {slide.trailer && (
                        <button
                          onClick={() => handleTrailerClick(slide.trailer!.key)}
                          className="bg-white/10 hover:bg-white/20 transition-colors px-6 py-3 rounded-full flex items-center font-semibold text-sm opacity-100"
                        >
                          <FaPlay className="mr-2" /> Watch Trailer
                        </button>
                      )}
                      <Link href={`/movie/${slide.id}`} className="bg-transparent border border-white hover:bg-white hover:text-dark transition-colors px-6 py-3 rounded-full flex items-center">
                        <FaInfoCircle className="mr-2" /> More Info
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full bg-white transition-opacity ${currentSlide === index ? 'opacity-100' : 'opacity-50'}`}
            ></button>
          ))}
        </div>

        <button onClick={prevSlide} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-colors z-10">
          <FaChevronLeft />
        </button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-colors z-10">
          <FaChevronRight />
        </button>
      </section>

      <TrailerModal
        isOpen={isModalOpen}
        videoKey={currentTrailerKey}
        onClose={() => {
          setIsModalOpen(false);
          setCurrentTrailerKey(null);
        }}
      />
    </>
  );
}