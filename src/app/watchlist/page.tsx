'use client'
import { useState } from 'react';
import { FaPlay, FaHeart, FaEllipsisV, FaGripVertical, FaCalendar, FaStar } from 'react-icons/fa';
import Image from 'next/image';

const watchlistItems = [
  {
    id: 1,
    title: 'Dune: Part Two',
    year: '2024',
    type: 'Movie',
    status: 'Watched',
    statusColor: 'bg-green-500',
    rating: 8.7,
    addedDate: 'Mar 15',
    imageUrl: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/7c4a2c47f8-a7ae3e1cf556af7bab1a.png',
    isFavorite: true,
  },
  {
    id: 2,
    title: 'Your Name',
    year: '2016',
    type: 'Anime',
    status: 'Want to Watch',
    statusColor: 'bg-blue-500',
    rating: 8.4,
    addedDate: 'Feb 28',
    imageUrl: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/486dc81430-797a1e250b726c58386d.png',
    isFavorite: false,
  },
  {
    id: 3,
    title: 'Stranger Things',
    year: '2016',
    type: 'TV Show',
    status: 'Watching',
    statusColor: 'bg-orange-500',
    rating: 8.7,
    addedDate: 'Jan 12',
    imageUrl: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/7444b9eeb5-06c7a6c78361284fe629.png',
    isFavorite: true,
    progress: 67,
    progressText: 'Season 4, Episode 3',
  },
  {
    id: 4,
    title: 'Attack on Titan',
    year: '2013',
    type: 'Anime',
    status: 'On Hold',
    statusColor: 'bg-yellow-500',
    textColor: 'text-black',
    rating: 9.0,
    addedDate: 'Dec 5',
    imageUrl: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/570bd8840a-dafdc40b2254a5b31450.png',
    isFavorite: false,
  },
];

export default function WatchlistPage() {
  const [filter, setFilter] = useState('All');

  return (
    <div className="bg-dark text-white font-sans">
      <section className="bg-gradient-to-r from-primary/20 to-secondary/20 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">My Watchlist</h1>
              <p className="text-gray-300">Track your favorite movies, anime, and TV shows</p>
            </div>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">127</div>
                <div className="text-sm text-gray-400">Total Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">43</div>
                <div className="text-sm text-gray-400">Watched</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">84</div>
                <div className="text-sm text-gray-400">To Watch</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-6 bg-darkgray">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap gap-2">
              {['All', 'Movies', 'Anime', 'TV Shows'].map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`${filter === f ? 'bg-primary text-white' : 'bg-lightgray text-gray-300 hover:bg-gray-600'} px-4 py-2 rounded-lg text-sm font-medium`}>{f}</button>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <select className="bg-lightgray text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option>All Status</option>
                <option>Want to Watch</option>
                <option>Watching</option>
                <option>Watched</option>
                <option>On Hold</option>
                <option>Dropped</option>
              </select>
              <select className="bg-lightgray text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option>Sort by Date Added</option>
                <option>Sort by Rating</option>
                <option>Sort by Title</option>
                <option>Sort by Release Date</option>
              </select>
              <button className="bg-lightgray hover:bg-gray-600 p-2 rounded-lg transition-colors">
                <FaGripVertical />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {watchlistItems.map((item) => (
              <div key={item.id} className="bg-darkgray rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300 group">
                <div className="relative">
                  <Image className="w-full aspect-[2/3] object-cover" src={item.imageUrl} alt={item.title} width={500} height={750} />
                  <div className="absolute top-2 right-2">
                    <div className={`${item.statusColor} ${item.textColor || 'text-white'} px-2 py-1 text-xs rounded-full`}>{item.status}</div>
                  </div>
                  <div className="absolute top-2 left-2">
                    <button className="bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-colors">
                      <FaHeart className={item.isFavorite ? 'text-red-500' : 'text-white'} />
                    </button>
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-lg flex items-center">
                      <FaPlay className="mr-2" />Watch Now
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1 truncate">{item.title}</h3>
                  <p className="text-gray-400 text-sm mb-2">{item.year} • {item.type}</p>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <FaStar className="text-yellow-400 mr-1 text-sm" />
                      <span className="text-sm">{item.rating}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <FaCalendar className="mr-1" />
                      <span>Added {item.addedDate}</span>
                    </div>
                  </div>
                  {item.progress &&
                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>{item.progressText}</span>
                        <span>{item.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-1">
                        <div className="bg-primary h-1 rounded-full" style={{ width: `${item.progress}%` }}></div>
                      </div>
                    </div>
                  }
                  <div className="flex items-center justify-between">
                    <select defaultValue={item.status} className="bg-lightgray text-white px-2 py-1 rounded text-xs focus:outline-none w-3/4">
                      <option>Want to Watch</option>
                      <option>Watching</option>
                      <option>Watched</option>
                      <option>On Hold</option>
                      <option>Dropped</option>
                    </select>
                    <button className="text-gray-400 hover:text-white">
                      <FaEllipsisV />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button className="bg-primary hover:bg-secondary text-white px-8 py-3 rounded-lg font-medium transition-colors">
              Load More Items
            </button>
          </div>
        </div>
      </section>
    </div>
  );
} 