"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FaArrowLeft, FaSpinner } from "react-icons/fa";
import { getMovieRecommendations } from "@/services/openaiService";
import AIRecommendationCard from "@/components/AIRecommendationCard";

export default function AIRecommendationResult() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mood = searchParams?.get("mood") || "";
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<{
    recommendations: Array<{
      id: number;
      title: string;
      overview: string;
      poster_path: string | null;
      vote_average: number;
      release_date?: string;
      media_type: "movie" | "tv";
    }>;
    explanation: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // キャッシュキー
  const cacheKey = `ai-recommendation-${mood}`;

  // 初回・mood変更時はキャッシュ優先
  useEffect(() => {
    if (!mood) return;
    setIsLoading(true);
    setError(null);
    const cached = typeof window !== 'undefined' ? sessionStorage.getItem(cacheKey) : null;
    if (cached) {
      setRecommendations(JSON.parse(cached));
      setIsLoading(false);
    } else {
      getMovieRecommendations({ mood })
        .then((result) => {
          setRecommendations(result);
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(cacheKey, JSON.stringify(result));
          }
        })
        .catch(() => setError("AIからの推薦を取得できませんでした。しばらく時間をおいて再度お試しください。"))
        .finally(() => setIsLoading(false));
    }
  }, [mood]);

  // 新しい推薦を求める（キャッシュを無視して再リクエスト）
  const handleNewRecommendation = () => {
    setIsLoading(true);
    setError(null);
    getMovieRecommendations({ mood })
      .then((result) => {
        setRecommendations(result);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(cacheKey, JSON.stringify(result));
        }
      })
      .catch(() => setError("AIからの推薦を取得できませんでした。しばらく時間をおいて再度お試しください。"))
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="bg-dark text-white py-2 px-2 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors mb-2"
        >
          <FaArrowLeft className="text-sm" />
          <span>戻る</span>
        </button>
        <h1 className="text-2xl font-bold text-center w-full mb-4">AIおすすめ検索結果</h1>
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <FaSpinner className="animate-spin text-2xl mr-2" />
            <span>AIが考え中...</span>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-500 text-red-400 p-3 rounded-lg text-sm text-center my-8">
            {error}
          </div>
        ) : recommendations ? (
          <div className="space-y-4">
            <div className="bg-lightgray p-6 rounded-lg">
              <h3 className="text-white font-semibold text-lg mb-3">推薦理由</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {recommendations.explanation}
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">おすすめ作品</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.recommendations.map((rec, idx) => (
                  <AIRecommendationCard key={idx} {...rec} />
                ))}
              </div>
              <div className="mt-4 text-center">
                <button
                  onClick={handleNewRecommendation}
                  className="bg-primary hover:bg-primary/80 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  新しい推薦を求める
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
} 