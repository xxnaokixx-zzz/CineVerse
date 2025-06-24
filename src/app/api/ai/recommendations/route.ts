import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('API Route called')

    const { mood } = await request.json()
    console.log('Received mood:', mood)

    if (!mood || mood.trim() === '') {
      console.log('Empty mood received')
      return NextResponse.json(
        { error: '気分の入力が必要です' },
        { status: 400 }
      )
    }

    const openaiApiKey = process.env.OPENAI_API_KEY
    console.log('OpenAI API Key exists:', !!openaiApiKey)

    if (!openaiApiKey) {
      console.log('OpenAI API Key not found')
      return NextResponse.json(
        { error: 'OpenAI API Keyが設定されていません' },
        { status: 500 }
      )
    }

    console.log('Making request to OpenAI API...')

    // OpenAI APIにリクエスト
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `あなたは映画・アニメ・ドラマの専門家です。ユーザーの気分に合わせて、適切な作品を3つ推薦してください。
            
            回答形式：
            {
              "recommendations": [
                "作品名1（ジャンル）",
                "作品名2（ジャンル）", 
                "作品名3（ジャンル）"
              ],
              "explanation": "なぜこれらの作品を推薦したかの説明"
            }
            
            注意：
            - 日本語で回答してください
            - 実際に存在する作品を推薦してください
            - ユーザーの気分に合った作品を選んでください
            - 映画・アニメ・ドラマのジャンルを混ぜて推薦してください`
          },
          {
            role: 'user',
            content: `今の気分：${mood}`
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    console.log('OpenAI response status:', openaiResponse.status)

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json()
      console.error('OpenAI API Error:', errorData)

      // クォータ超過時はモックデータを返す
      if (openaiResponse.status === 429) {
        console.log('Using mock data due to quota exceeded')
        return NextResponse.json({
          recommendations: [
            "千と千尋の神隠し（アニメ）",
            "ショーシャンクの空に（映画）",
            "深夜食堂（ドラマ）"
          ],
          explanation: "あなたの気分「" + mood + "」に合わせて、心が癒される作品を選びました。これらの作品は、疲れた心を優しく包み込み、新しい希望や感動を与えてくれるでしょう。特に「千と千尋の神隠し」は、不思議な世界観で心をリフレッシュさせ、「ショーシャンクの空に」は人間の希望と友情の力を描き、「深夜食堂」は温かい人間関係の大切さを教えてくれます。"
        })
      }

      return NextResponse.json(
        { error: 'AIからの推薦を取得できませんでした', details: errorData },
        { status: 500 }
      )
    }

    const openaiData = await openaiResponse.json()
    console.log('OpenAI response data:', openaiData)

    const content = openaiData.choices[0]?.message?.content
    console.log('OpenAI content:', content)

    if (!content) {
      console.log('No content received from OpenAI')
      return NextResponse.json(
        { error: 'AIからの回答を取得できませんでした' },
        { status: 500 }
      )
    }

    // JSONレスポンスをパース
    try {
      const parsedContent = JSON.parse(content)
      console.log('Parsed content:', parsedContent)
      return NextResponse.json(parsedContent)
    } catch (parseError) {
      console.log('JSON parse error:', parseError)
      // JSONパースに失敗した場合、テキストとして返す
      return NextResponse.json({
        recommendations: ['AIからの推薦を解析中です...'],
        explanation: content
      })
    }

  } catch (error) {
    console.error('Error in recommendations API:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 