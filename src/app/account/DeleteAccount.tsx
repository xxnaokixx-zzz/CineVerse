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

  const isTextValid = confirmText.toUpperCase() === "DELETE";
  const isFormValid = isTextValid && checked && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      // ここでAPI呼び出し（例: /api/delete-account）
      const res = await fetch("/api/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, reason }),
      });
      if (!res.ok) throw new Error("Failed to delete account");
      setSuccess(true);
      // 必要ならリダイレクトやログアウト処理
    } catch (err: any) {
      setError(err.message || "Failed to delete account");
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
            <i className="fa-solid fa-exclamation-triangle text-3xl text-white"></i>
          </div>
          <h1 className="text-3xl font-bold mb-2">Delete Your Account</h1>
          <p className="text-gray-400 text-lg">This action cannot be undone. Please read carefully before proceeding.</p>
        </div>

        {/* What Will Be Deleted */}
        <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center">
            <i className="fa-solid fa-trash mr-2"></i>
            What will be permanently deleted
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start">
              <i className="fa-solid fa-circle text-red-400 text-xs mt-2 mr-3"></i>
              <span>Your profile information and account details</span>
            </li>
            <li className="flex items-start">
              <i className="fa-solid fa-circle text-red-400 text-xs mt-2 mr-3"></i>
              <span>All your watchlists and saved movies/anime</span>
            </li>
            <li className="flex items-start">
              <i className="fa-solid fa-circle text-red-400 text-xs mt-2 mr-3"></i>
              <span>Your reviews and ratings</span>
            </li>
            <li className="flex items-start">
              <i className="fa-solid fa-circle text-red-400 text-xs mt-2 mr-3"></i>
              <span>Your viewing history and preferences</span>
            </li>
            <li className="flex items-start">
              <i className="fa-solid fa-circle text-red-400 text-xs mt-2 mr-3"></i>
              <span>Any premium subscription benefits</span>
            </li>
          </ul>
        </div>

        {/* Alternative Options */}
        <div className="bg-darkgray rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <i className="fa-solid fa-lightbulb text-yellow-400 mr-2"></i>
            Consider these alternatives
          </h2>
          <div className="space-y-4">
            <div className="flex items-start p-4 bg-lightgray rounded-lg">
              <i className="fa-solid fa-pause text-blue-400 mt-1 mr-3"></i>
              <div>
                <h3 className="font-semibold mb-1">Temporarily deactivate your account</h3>
                <p className="text-gray-400 text-sm">Hide your profile while keeping your data safe. You can reactivate anytime.</p>
                <button className="text-blue-400 hover:text-blue-300 text-sm mt-2">Learn more</button>
              </div>
            </div>
            <div className="flex items-start p-4 bg-lightgray rounded-lg">
              <i className="fa-solid fa-download text-green-400 mt-1 mr-3"></i>
              <div>
                <h3 className="font-semibold mb-1">Download your data</h3>
                <p className="text-gray-400 text-sm">Export your watchlists, reviews, and preferences before deletion.</p>
                <button className="text-green-400 hover:text-green-300 text-sm mt-2">Download data</button>
              </div>
            </div>
          </div>
        </div>

        {/* Deletion Form */}
        <div className="bg-darkgray rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-red-400">Confirm Account Deletion</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-2">Type "DELETE" to confirm</label>
              <input
                type="text"
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                placeholder="Type DELETE here"
                className="w-full bg-lightgray rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Enter your password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full bg-lightgray rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Reason for leaving (optional)</label>
              <select
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full bg-lightgray rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select a reason</option>
                <option>Not using the service enough</option>
                <option>Found a better alternative</option>
                <option>Privacy concerns</option>
                <option>Too expensive</option>
                <option>Technical issues</option>
                <option>Other</option>
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
                I understand that this action is permanent and cannot be undone. All my data will be permanently deleted.
              </label>
            </div>
            {error && (
              <div className="text-red-400 text-sm">
                {error === 'Unauthorized'
                  ? 'セッションが切れています。再度ログインしてください。'
                  : error}
              </div>
            )}
            {success && <div className="text-green-400 text-sm">Account deleted successfully.</div>}
            <div className="flex space-x-4 pt-4">
              <button type="button" className="flex-1 bg-gray-600 hover:bg-gray-500 transition-colors py-3 rounded-lg font-medium">
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isFormValid || loading}
                className="flex-1 bg-red-600 hover:bg-red-700 transition-colors py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
} 