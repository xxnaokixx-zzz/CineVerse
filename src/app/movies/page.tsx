'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getAllMovies, getMoviesByGenre, getGenres, Movie, Genre, getImageUrl } from '@/services/movieService';
import { FaStar, FaPlay, FaPlus, FaInfo, FaChevronDown, FaThLarge, FaList, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import MovieCard from '@/components/MovieCard';

// 映画に関係あるジャンルIDリスト
const MOVIE_GENRE_IDS = [28, 12, 16, 35, 80, 99, 18, 10751, 14, 36, 27, 10402, 9648, 10749, 878, 10770, 53, 10752, 37];

export default function AllMoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortBy, setSortBy] = useState('Popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    loadMovies();
    loadGenres();
  }, [currentPage, selectedGenre, sortBy]);

  const loadMovies = async () => {
    try {
      setLoading(true);
      let result;

      // Convert sortBy to TMDb API format
      const getSortByParam = (sortBy: string) => {
        switch (sortBy) {
          case 'Popular':
            return 'popularity.desc';
          case 'Latest':
            return 'release_date.desc';
          case 'Rating':
            return 'vote_average.desc';
          case 'A-Z':
            return 'title.asc';
          default:
            return 'popularity.desc';
        }
      };

      const sortByParam = getSortByParam(sortBy);

      if (selectedGenre) {
        const genre = genres.find(g => g.name === selectedGenre);
        if (genre) {
          result = await getMoviesByGenre(genre.id, currentPage, sortByParam);
        } else {
          result = { results: [], total_pages: 0, total_results: 0 };
        }
      } else {
        result = await getAllMovies(currentPage, sortByParam);
      }

      setMovies(result.results);
      setTotalPages(result.total_pages);
      setTotalResults(result.total_results);
    } catch (error) {
      console.error('Failed to load movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGenres = async () => {
    try {
      const genresData = await getGenres();
      // 映画向けジャンルだけにフィルタ
      setGenres(genresData.filter(g => MOVIE_GENRE_IDS.includes(g.id)));
    } catch (error) {
      console.error('Failed to load genres:', error);
    }
  };

  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  if (loading && movies.length === 0) {
    return (
      <div className="min-h-screen bg-dark text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark text-white">
      {/* Page Header */}
      <section className="py-8 bg-darkgray">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-6">映画一覧</h1>
              <p className="text-gray-400">
                Discover thousands of movies from every genre
                {totalResults > 0 && (
                  <span className="ml-2 text-sm">({totalResults.toLocaleString()} movies)</span>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              {/* ジャンル選択リストを一旦非表示に */}
              {/*
              <div className="relative">
                <select
                  value={selectedGenre}
                  onChange={(e) => handleGenreChange(e.target.value)}
                  className="bg-lightgray rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                >
                  <option value="">All Genres</option>
                  {genres.map((genre) => (
                    <option key={genre.id} value={genre.name}>
                      {genre.name}
                    </option>
                  ))}
                </select>
              </div>
              */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="bg-lightgray rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                >
                  <option value="Popular">Popular</option>
                  <option value="Latest">Latest</option>
                  <option value="Rating">Rating</option>
                  <option value="A-Z">A-Z</option>
                </select>
                <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary' : 'bg-lightgray hover:bg-gray-600'
                  }`}
              >
                <FaThLarge />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary' : 'bg-lightgray hover:bg-gray-600'
                  }`}
              >
                <FaList />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Movies Grid */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {loading && movies.length > 0 && (
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
              {movies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  id={movie.id}
                  imageUrl={getImageUrl(movie.poster_path)}
                  title={movie.title}
                  rating={movie.vote_average.toFixed(1)}
                  year={movie.release_date.substring(0, 4)}
                  mediaType="movie"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {movies.map((movie) => (
                <div key={movie.id} className="flex bg-darkgray rounded-lg overflow-hidden hover:bg-lightgray transition-colors">
                  <div className="w-24 md:w-32 flex-shrink-0">
                    <Image
                      src={getImageUrl(movie.poster_path)}
                      alt={`${movie.title} movie poster`}
                      width={128}
                      height={192}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{movie.title}</h3>
                        <p className="text-gray-400 text-sm mb-2 line-clamp-2">{movie.overview}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-300">
                          <div className="flex items-center">
                            <FaStar className="text-yellow-400 mr-1" />
                            <span>{movie.vote_average.toFixed(1)}/10</span>
                          </div>
                          <span>{movie.release_date.substring(0, 4)}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Link href={`/movie/${movie.id}`}>
                          <button className="bg-primary hover:bg-secondary p-2 rounded-full transition-colors">
                            <FaPlay className="text-sm" />
                          </button>
                        </Link>
                        <button className="bg-darkgray hover:bg-gray-600 p-2 rounded-full transition-colors">
                          <FaPlus className="text-sm" />
                        </button>
                        <Link href={`/movie/${movie.id}`}>
                          <button className="bg-darkgray hover:bg-gray-600 p-2 rounded-full transition-colors">
                            <FaInfo className="text-sm" />
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {movies.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No movies found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex justify-center items-center space-x-2">
              {/* Previous Page */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg bg-lightgray hover:bg-gray-600 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
              >
                <FaChevronLeft className="text-sm" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              {/* Page Numbers */}
              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded-lg transition-colors ${currentPage === page
                    ? 'bg-primary text-white'
                    : 'bg-lightgray hover:bg-gray-600'
                    }`}
                >
                  {page}
                </button>
              ))}

              {/* Next Page */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg bg-lightgray hover:bg-gray-600 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
              >
                <span className="hidden sm:inline">Next</span>
                <FaChevronRight className="text-sm" />
              </button>
            </div>

            {/* Page Info */}
            <div className="text-center mt-4 text-gray-400 text-sm">
              Page {currentPage} of {totalPages} • {totalResults.toLocaleString()} movies total
            </div>
          </div>
        </section>
      )}
    </div>
  );
} 