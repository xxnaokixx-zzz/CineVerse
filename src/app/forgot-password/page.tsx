"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from '@/lib/supabase/client';
import { FaKey, FaEnvelope, FaExclamationCircle, FaExclamationTriangle, FaCheckCircle, FaArrowLeft, FaQuestionCircle, FaClock, FaShieldAlt } from "react-icons/fa";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setGeneralError("");
    setSuccess(false);

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setEmailError("有効なメールアドレスを入力してください");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      setGeneralError("このメールアドレスは登録されていません、または送信に失敗しました。");
    } else {
      setSuccess(true);
    }
  };

  return (
    <div className="bg-dark text-white font-sans min-h-screen">

      {/* Forgot Password Section */}
      <section className="min-h-screen flex items-center justify-center py-4 px-4">
        <div className="max-w-md w-full">
          {/* Reset Password Card */}
          <div className="bg-darkgray rounded-2xl shadow-2xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaKey className="text-primary text-2xl" />
              </div>
              <h1 className="text-3xl font-bold mb-2">パスワード再設定</h1>
              <p className="text-gray-400">メールアドレスを入力してください。パスワード再設定用のリンクをお送りします。</p>
            </div>

            {/* Reset Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">メールアドレス</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full bg-lightgray border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="メールアドレスを入力"
                  />
                  <FaEnvelope className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                {emailError && (
                  <div className="text-red-400 text-sm mt-1 flex items-center">
                    <FaExclamationCircle className="mr-1" /> {emailError}
                  </div>
                )}
              </div>

              {/* General Error Message */}
              {generalError && (
                <div className="bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded-lg flex items-center">
                  <FaExclamationTriangle className="mr-2" />
                  <span>{generalError}</span>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="bg-green-900 border border-green-600 text-green-200 px-4 py-3 rounded-lg flex items-center">
                  <FaCheckCircle className="mr-2" />
                  <span>パスワード再設定用リンクを送信しました。メールをご確認ください。</span>
                </div>
              )}

              {/* Submit Button */}
              <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-secondary text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center disabled:opacity-50">
                {loading ? (
                  <>
                    <span>送信中...</span>
                    <svg className="animate-spin ml-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                  </>
                ) : (
                  <span>リセットリンクを送信</span>
                )}
              </button>
            </form>

            {/* Back to Login */}
            <div className="text-center mt-6 pt-6 border-t border-gray-600">
              <button className="text-primary hover:text-secondary transition-colors font-medium flex items-center justify-center mx-auto" onClick={() => router.push('/login')}>
                <FaArrowLeft className="mr-2" />
                サインインに戻る
              </button>
            </div>
          </div>

          {/* Additional Help */}
          <div className="bg-darkgray/50 rounded-xl p-6 mt-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <FaQuestionCircle className="text-primary mr-2" />
              お困りですか？
            </h3>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-start">
                <FaClock className="text-gray-500 mr-2 mt-0.5" />
                <span>リセットリンクはセキュリティのため1時間で失効します</span>
              </div>
              <div className="flex items-start">
                <FaShieldAlt className="text-gray-500 mr-2 mt-0.5" />
                <span>メールが届かない場合は迷惑メールフォルダもご確認ください</span>
              </div>
              <div className="flex items-start">
                <FaEnvelope className="text-gray-500 mr-2 mt-0.5" />
                <span>それでも届かない場合は <span className="text-primary cursor-pointer hover:underline" onClick={() => alert('サポート機能は今後実装予定です')}>サポートに連絡</span></span>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="text-center mt-6">
            <p className="text-gray-500 text-sm">
              続行することで
              <span className="text-primary hover:underline cursor-pointer">利用規約</span>
              と
              <span className="text-primary hover:underline cursor-pointer">プライバシーポリシー</span>
              に同意したものとみなされます。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
} 