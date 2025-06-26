import React, { useState } from 'react';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  contextType: 'movie' | 'person';
}

type Mode = 'summary' | 'question';
type Spoiler = 'with' | 'without';

const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose, title, contextType }) => {
  const [mode, setMode] = useState<Mode>('summary');
  const [spoiler, setSpoiler] = useState<Spoiler>('without');
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setResponse('');
    try {
      const endpoint = contextType === 'person' ? '/api/ai/person-assistant' : '/api/ai/summary-or-question';
      const payload: any = {
        mode,
        title,
      };
      if (contextType === 'movie') {
        payload.spoiler = spoiler;
      }
      if (mode === 'question') {
        payload.question = question;
      }
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'AIからの回答取得に失敗しました');
      } else {
        setResponse(data.result);
      }
    } catch (err) {
      setError('サーバーエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[400px] max-w-2xl w-full relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
          onClick={onClose}
          aria-label="閉じる"
        >
          ×
        </button>
        <h2 className="text-lg font-bold mb-4 text-gray-900 text-center">AIアシスタント</h2>
        <form onSubmit={handleSubmit}>
          {/* 実行モードグループ */}
          <div className="mb-6 flex flex-col items-center">
            <div className="text-gray-700 font-semibold mb-2 text-center">AIに依頼する内容</div>
            <div className="flex flex-col gap-2 items-center">
              <label className="flex items-center gap-2 text-gray-800 font-medium">
                <input
                  type="radio"
                  name="mode"
                  value="summary"
                  checked={mode === 'summary'}
                  onChange={() => setMode('summary')}
                />
                要約する
              </label>
              <label className="flex items-center gap-2 text-gray-800 font-medium">
                <input
                  type="radio"
                  name="mode"
                  value="question"
                  checked={mode === 'question'}
                  onChange={() => setMode('question')}
                />
                質問する
              </label>
            </div>
          </div>

          {/* 要約オプション（映画の場合のみ表示） */}
          {contextType === 'movie' && mode === 'summary' && (
            <div className="mb-6 flex flex-col items-center">
              <div className="text-gray-700 font-semibold mb-2 text-center">要約オプション</div>
              <div className="flex flex-col gap-2 items-center">
                <label className="flex items-center gap-2 text-gray-800 font-medium">
                  <input
                    type="radio"
                    name="spoiler"
                    value="without"
                    checked={spoiler === 'without'}
                    onChange={() => setSpoiler('without')}
                  />
                  ネタバレなし
                </label>
                <label className="flex items-center gap-2 text-gray-800 font-medium">
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
            </div>
          )}

          {/* 質問モード時の入力欄 */}
          {mode === 'question' && (
            <div className="mb-6 flex flex-col items-center">
              <div className="text-gray-700 font-semibold mb-2 text-center">質問内容</div>
              <textarea
                className="w-full border rounded p-3 text-gray-900 text-base"
                style={{ minWidth: '350px' }}
                rows={5}
                placeholder="質問を入力してください"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50 font-bold text-lg"
            disabled={isLoading || (mode === 'question' && !question)}
          >
            {isLoading ? 'AIが考え中…' : 'AIに聞く'}
          </button>
        </form>

        {/* エラー表示 */}
        {error && (
          <div className="mt-4 text-red-600 font-bold text-center">{error}</div>
        )}

        {/* ネタバレ警告ラベル */}
        {contextType === 'movie' && mode === 'summary' && spoiler === 'with' && (
          <div className="mt-4 text-red-600 font-bold text-center">⚠ ネタバレを含みます</div>
        )}

        {/* レスポンス表示欄 */}
        {response && (
          <div className="mt-6 p-4 bg-gray-100 rounded whitespace-pre-line text-gray-900">
            {response}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistantModal; 