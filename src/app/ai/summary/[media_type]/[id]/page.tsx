'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getMovieDetails, getTVShowDetails, getImageUrl, MovieDetails, TVShowDetails } from '@/services/movieService';
import Image from 'next/image';
import Link from 'next/link';

export default function AISummaryDetailPage() {
  const params = useParams();
  const { media_type, id } = params as { media_type: string; id: string };
  const [media, setMedia] = useState<MovieDetails | TVShowDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'summary' | 'question'>('summary');
  const [spoiler, setSpoiler] = useState<'with' | 'without'>('without');
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function fetchMedia() {
      setLoading(true);
      try {
        let data;
        if (media_type === 'movie') {
          data = await getMovieDetails(id);
        } else if (media_type === 'tv') {
          data = await getTVShowDetails(id);
        } else {
          data = null;
        }
        setMedia(data);
      } catch (e) {
        setMedia(null);
      } finally {
        setLoading(false);
      }
    }
    fetchMedia();
  }, [id, media_type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setResult('');
    try {
      const res = await fetch('/api/ai/summary-or-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          title: media_type === 'movie' ? (media as MovieDetails).title : (media as TVShowDetails).name,
          spoiler,
          question: mode === 'question' ? question : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'AIからの回答取得に失敗しました');
      } else {
        setResult(data.result);
      }
    } catch (err) {
      setError('サーバーエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
  }

  if (!media) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">作品情報が見つかりません</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="w-full max-w-2xl mx-auto pt-6 px-2">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-300 hover:text-white font-bold mb-4"
        >
          <span className="text-xl">←</span> 戻る
        </button>
      </div>
      <div className="w-full flex flex-col items-center py-8">
        <div className="flex flex-col items-center">
          {media_type === 'movie' ? (
            <Link href={`/movie/${id}`} className="relative w-40 h-60 mb-4 block group">
              <Image
                src={getImageUrl(media.poster_path)}
                alt={(media as MovieDetails).title}
                layout="fill"
                objectFit="cover"
                className="rounded-lg shadow-lg group-hover:opacity-90 cursor-pointer"
              />
            </Link>
          ) : (
            <Link href={`/tv/${id}`} className="relative w-40 h-60 mb-4 block group">
              <Image
                src={getImageUrl(media.poster_path)}
                alt={(media as TVShowDetails).name}
                layout="fill"
                objectFit="cover"
                className="rounded-lg shadow-lg group-hover:opacity-90 cursor-pointer"
              />
            </Link>
          )}
          <h1 className="text-2xl font-bold mb-2 text-center">{media_type === 'movie' ? (media as MovieDetails).title : (media as TVShowDetails).name}</h1>
          <div className="flex flex-col items-center gap-1 mb-4">
            <div className="text-gray-400 text-sm">公開日: {media_type === 'movie' ? (media as MovieDetails).release_date || 'N/A' : (media as TVShowDetails).first_air_date || 'N/A'}</div>
            <div className="flex items-center text-gray-400 text-sm">
              <span className="mr-2">⭐ {media.vote_average?.toFixed(1) || 'N/A'}</span>
              {media_type === 'movie' ? (
                <span>/ {(media as MovieDetails).vote_count || 0}件</span>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex gap-4 mb-8">
          <button
            className={`px-6 py-2 rounded-full font-bold transition-colors ${mode === 'summary' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => setMode('summary')}
          >
            要約する
          </button>
          <button
            className={`px-6 py-2 rounded-full font-bold transition-colors ${mode === 'question' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => setMode('question')}
          >
            質問する
          </button>
        </div>
        <form onSubmit={handleSubmit} className="w-full max-w-2xl flex flex-col items-center gap-4 mb-8">
          {mode === 'summary' && (
            <div className="flex gap-6 mb-2">
              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="radio"
                  name="spoiler"
                  value="without"
                  checked={spoiler === 'without'}
                  onChange={() => setSpoiler('without')}
                />
                ネタバレなし
              </label>
              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="radio"
                  name="spoiler"
                  value="with"
                  checked={spoiler === 'with'}
                  onChange={() => setSpoiler('with')}
                />
                ネタバレあり
              </label>
            </div>
          )}
          {mode === 'question' && (
            <textarea
              className="w-full border rounded p-3 text-black bg-white text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
              style={{ minWidth: '350px' }}
              rows={4}
              placeholder="質問を入力してください"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              required
            />
          )}
          <button
            type="submit"
            className="w-full max-w-lg px-6 py-2 rounded-md bg-red-600 hover:bg-red-700 transition-colors font-bold"
            disabled={isLoading || (mode === 'question' && !question)}
          >
            {isLoading ? 'AIが考え中…' : 'AIに聞く'}
          </button>
        </form>
        {error && (
          <div className="mt-4 text-red-600 font-bold text-center">{error}</div>
        )}
        {result && (
          <div className="mt-8 w-full max-w-2xl mx-auto p-6 bg-gray-900 rounded-lg shadow-lg">
            <div className="text-xl font-bold mb-2">
              {mode === 'summary' ? '要約' : '回答'}
            </div>
            <div className="whitespace-pre-line text-gray-100 text-lg">
              {result}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 