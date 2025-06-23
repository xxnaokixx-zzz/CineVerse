"use client";
import { useState } from "react";

export default function DeleteAccount() {
  const [confirmText, setConfirmText] = useState("");
  const [password, setPassword] = useState("");
  const [reason, setReason] = useState("");
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  const isTextValid = confirmText.toUpperCase() === "DELETE";
  const isFormValid = isTextValid && checked && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      if (!isTextValid) {
        setError('confirmText');
      }
      return;
    }
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      // ここでAPI呼び出し（例: /api/delete-account）
      const res = await fetch("/api/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, reason }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "アカウントの削除に失敗しました");
      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      // 必要ならリダイレクトやログアウト処理
    } catch (err: any) {
      setError(err.message || "アカウントの削除に失敗しました");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Warning Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl text-white font-bold animate-bounce-slow">！</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">アカウントを削除する</h1>
          <p className="text-gray-400 text-lg">この操作は元に戻せません。内容をよくご確認のうえ、進めてください。</p>
        </div>

        {/* What Will Be Deleted */}
        <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center">
            <i className="fa-solid fa-trash mr-2"></i>
            完全に削除されるもの
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start">
              <i className="fa-solid fa-circle text-red-400 text-xs mt-2 mr-3"></i>
              <span>あなたのプロフィール情報およびアカウント詳細</span>
            </li>
            <li className="flex items-start">
              <i className="fa-solid fa-circle text-red-400 text-xs mt-2 mr-3"></i>
              <span>すべてのウォッチリストおよび保存した映画・アニメ</span>
            </li>
            <li className="flex items-start">
              <i className="fa-solid fa-circle text-red-400 text-xs mt-2 mr-3"></i>
              <span>あなたのレビューおよび評価</span>
            </li>
            <li className="flex items-start">
              <i className="fa-solid fa-circle text-red-400 text-xs mt-2 mr-3"></i>
              <span>視聴履歴および視聴傾向</span>
            </li>
            <li className="flex items-start">
              <i className="fa-solid fa-circle text-red-400 text-xs mt-2 mr-3"></i>
              <span>プレミアム会員特典</span>
            </li>
          </ul>
        </div>

        {/* Deletion Form */}
        <div className={`bg-darkgray rounded-lg p-6${shake ? ' animate-shake' : ''}`}>
          <h2 className="text-xl font-bold mb-4 text-red-400">アカウント削除の確認</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className={`transition-all${error === 'confirmText' ? ' animate-shake' : ''}`}>
              <label className="block text-sm font-medium mb-2">「DELETE」と入力して確認</label>
              <input
                type="text"
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                placeholder="ここにDELETEと入力してください"
                className="w-full bg-lightgray rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              {error === 'confirmText' && (
                <div className="text-red-400 text-sm mt-1">「DELETE」と入力してください</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">パスワードを入力</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="あなたのパスワード"
                className="w-full bg-lightgray rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              {error === 'Password is incorrect.' && (
                <div className="text-red-400 text-sm mt-1">パスワードが違います</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">退会理由（任意）</label>
              <select
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full bg-lightgray rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">理由を選択してください</option>
                <option>あまり利用しなくなった</option>
                <option>他のサービスの方が良かった</option>
                <option>プライバシーが心配</option>
                <option>料金が高い</option>
                <option>技術的な問題</option>
                <option>その他</option>
              </select>
            </div>
            <div className="flex items-start">
              <input
                type="checkbox"
                id="confirmCheckbox"
                checked={checked}
                onChange={e => setChecked(e.target.checked)}
                className="mt-1 mr-3"
              />
              <label htmlFor="confirmCheckbox" className="text-sm text-gray-300">
                この操作が永久的で元に戻せないこと、すべてのデータが完全に削除されることを理解しました
              </label>
            </div>
            {error && error !== 'Password is incorrect.' && (
              <div className="text-red-400 text-sm">
                {error === 'Unauthorized'
                  ? 'セッションが切れています。再度ログインしてください。'
                  : error === 'Invalid email or password. Please check your credentials.'
                    ? 'メールアドレスまたはパスワードが正しくありません'
                    : error}
              </div>
            )}
            {success && <div className="text-green-400 text-sm">アカウントの削除が完了しました。</div>}
            <div className="flex space-x-4 pt-4">
              <button type="button" className="flex-1 bg-gray-600 hover:bg-gray-500 transition-colors py-3 rounded-lg font-medium">
                キャンセル
              </button>
              <button
                type="submit"
                disabled={!isFormValid || loading}
                className="flex-1 bg-red-600 hover:bg-red-700 transition-colors py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "削除中..." : "アカウントを削除する"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
} 