import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { mode, title, question } = await request.json();

    if (!mode || !title || (mode === 'question' && !question)) {
      return NextResponse.json(
        { error: '必要な情報が不足しています' },
        { status: 400 }
      );
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json(
        { error: 'OpenAI API Keyが設定されていません' },
        { status: 500 }
      );
    }

    // プロンプト生成
    let userPrompt = '';
    if (mode === 'summary') {
      userPrompt = `俳優・監督『${title}』の経歴や代表作を2〜3行で要約してください。`;
    } else if (mode === 'question') {
      userPrompt = `俳優・監督『${title}』について質問です：${question}`;
    }

    // OpenAI APIリクエスト
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
            content: 'あなたは映画・アニメ・ドラマの専門家です。日本語で簡潔に、分かりやすく回答してください。',
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      return NextResponse.json(
        { error: 'AIからの回答を取得できませんでした', details: errorData },
        { status: 500 }
      );
    }

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'AIからの回答を取得できませんでした' },
        { status: 500 }
      );
    }

    return NextResponse.json({ result: content });
  } catch (error) {
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 