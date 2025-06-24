import { multiSearch, getImageUrl, Movie, TVShow } from './movieService'

interface MovieRecommendationRequest {
  mood: string
  genre?: string
}

interface MovieRecommendationResponse {
  recommendations: Array<{
    id: number
    title: string
    overview: string
    poster_path: string | null
    vote_average: number
    release_date?: string
    first_air_date?: string
    media_type: 'movie' | 'tv'
  }>
  explanation: string
}

// タイトル正規化関数
function normalizeTitle(title: string): string {
  // （アニメシリーズ）や(アニメ映画)などのサフィックスを除去
  return title.replace(/(（.*?）|\(.*?\))/g, '').trim();
}

export async function getMovieRecommendations(request: MovieRecommendationRequest): Promise<MovieRecommendationResponse> {
  try {
    console.log('Sending request to API:', request)

    const response = await fetch('/api/ai/recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    console.log('Response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('API Error response:', errorData)
      throw new Error(errorData.error || 'Failed to get recommendations')
    }

    const data = await response.json()
    console.log('API success response:', data)

    // AIが推薦した作品名からTMDBで実際の映画情報を取得（正規化）
    const enrichedRecommendations = await Promise.all(
      data.recommendations.map(async (recommendation: any) => {
        // AIレスポンスがすでにTMDBの正規データ（id, poster_path, media_type）を含む場合はそのまま使う
        if (recommendation.id && recommendation.poster_path && recommendation.media_type) {
          return recommendation;
        }
        // そうでなければtitleでTMDB再検索
        const title = typeof recommendation === 'string' ? normalizeTitle(recommendation) : normalizeTitle(recommendation.title);
        try {
          const searchResult = await multiSearch(title, 1);
          if (searchResult.results.length > 0) {
            // 評価が最も高いものを選ぶ
            const sorted = searchResult.results.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
            const movie = sorted[0];
            return {
              id: movie.id,
              title: 'title' in movie ? movie.title : (movie as any).name || title,
              overview: movie.overview || '概要情報がありません',
              poster_path: movie.poster_path,
              vote_average: movie.vote_average,
              release_date: 'release_date' in movie ? movie.release_date : (movie as any).first_air_date,
              media_type: movie.media_type
            }
          } else {
            // TMDBで見つからない場合はデフォルト情報を返す
            return {
              id: Math.floor(Math.random() * 10000),
              title,
              overview: 'TMDBで詳細情報が見つかりませんでした',
              poster_path: null,
              vote_average: 0,
              release_date: undefined,
              media_type: 'movie' as const
            }
          }
        } catch (error) {
          console.error('Error fetching movie details for:', title, error)
          return {
            id: Math.floor(Math.random() * 10000),
            title,
            overview: '映画情報の取得に失敗しました',
            poster_path: null,
            vote_average: 0,
            release_date: undefined,
            media_type: 'movie' as const
          }
        }
      })
    )

    return {
      recommendations: enrichedRecommendations,
      explanation: data.explanation
    }
  } catch (error) {
    console.error('Error getting movie recommendations:', error)
    throw error
  }
} 