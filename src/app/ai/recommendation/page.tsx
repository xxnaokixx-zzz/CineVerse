'use client'
import { useState } from 'react'
import { FaSpinner, FaArrowLeft } from 'react-icons/fa'
import { getMovieRecommendations } from '@/services/openaiService'
import AIRecommendationCard from '@/components/AIRecommendationCard'
import { useRouter } from 'next/navigation'

export default function AIRecommendationPage() {
  const [moodInput, setMoodInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<{
    recommendations: Array<{
      id: number
      title: string
      overview: string
      poster_path: string | null
      vote_average: number
      release_date?: string
      media_type: 'movie' | 'tv'
    }>
    explanation: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleMoodSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (moodInput.trim()) {
      setError(null)
      // moodをクエリパラメータで渡して結果ページに遷移
      router.push(`/ai/recommendation/result?mood=${encodeURIComponent(moodInput.trim())}`)
    }
  }

  const handleNewRecommendation = () => {
    setMoodInput('')
    setRecommendations(null)
    setError(null)
  }

  return (
    <div className="bg-dark text-white py-2 px-2">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.push('/?openAIModal=1')}
          className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors mb-2"
        >
          <FaArrowLeft className="text-sm" />
          <span>戻る</span>
        </button>
        <h1 className="text-2xl font-bold text-center w-full mb-4">今の気分に合う作品を提案</h1>

        {!recommendations ? (
          <div className="bg-darkgray rounded-lg p-8 shadow-lg">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold mb-2">今の気分を教えてください</h2>
              <p className="text-gray-400 text-sm">
                例：「疲れてるけど癒されたい」「元気になりたい」「感動したい」など
              </p>
            </div>
            <form onSubmit={handleMoodSubmit} className="space-y-4">
              <textarea
                value={moodInput}
                onChange={(e) => setMoodInput(e.target.value)}
                placeholder="今の気分を自由に書いてください..."
                className="w-full p-4 bg-lightgray border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                rows={4}
              />
              {error && (
                <div className="bg-red-900/20 border border-red-500 text-red-400 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={!moodInput.trim()}
                className="w-full bg-white hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-not-allowed text-black font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <span>AIにおすすめを聞く</span>
              </button>
            </form>
          </div>
        ) : (
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
                  className="bg-white hover:bg-gray-100 text-black px-6 py-3 rounded-lg transition-colors"
                >
                  新しい推薦を求める
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 