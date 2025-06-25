"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { FaFilm, FaCheck, FaEnvelope, FaInfoCircle, FaPaperPlane, FaArrowRight, FaSearch, FaHeart, FaStar } from "react-icons/fa";
import { createClient } from '@/lib/supabase/client';

export default function SignupSuccessClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const name = searchParams.get("name") || "";
  const email = searchParams.get("email") || "";
  const avatarPath = searchParams.get("avatar") || "";
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const fetchAvatarUrl = async () => {
      if (avatarPath) {
        const supabase = createClient();
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(avatarPath);
        setAvatarUrl(publicUrl);
      }
    };
    fetchAvatarUrl();
  }, [avatarPath]);

  const handleResend = async () => {
    setResending(true);
    setTimeout(() => {
      setResending(false);
      setModalOpen(true);
    }, 2000);
  };

  const handleCloseModal = () => setModalOpen(false);

  return (
    <div className="bg-dark text-white font-sans min-h-screen">
      {/* Success Confirmation Section */}
      <section className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="max-w-lg w-full text-center">
          {/* Success Animation */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <FaCheck className="text-white text-4xl" />
            </div>
          </div>
          {/* Success Message */}
          <div className="bg-darkgray rounded-2xl shadow-2xl p-8">
            <h1 className="text-3xl font-bold mb-4 text-green-400">CineVerseへようこそ！</h1>
            <p className="text-xl text-gray-300 mb-6">アカウントの作成が完了しました</p>
            {/* User Info Display */}
            <div className="bg-lightgray rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center mb-3">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="User Avatar"
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full mr-4 object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mr-4">
                    <span className="text-2xl font-bold">{name.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <div className="text-left">
                  <h3 className="text-lg font-semibold">{name}</h3>
                  <p className="text-gray-400">{email}</p>
                </div>
              </div>
            </div>
            {/* Email Verification Notice */}
            <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <FaEnvelope className="text-yellow-400 text-xl mr-3 mt-1" />
                <div className="text-left">
                  <h4 className="font-semibold text-yellow-200 mb-2">メールアドレスの確認</h4>
                  <p className="text-yellow-100 text-sm mb-3">
                    <strong>{email}</strong> 宛に確認メールを送信しました。<br />
                    メール内の確認リンクをクリックしてアカウントを有効化してください。
                  </p>
                  <p className="text-yellow-200 text-xs">
                    <FaInfoCircle className="inline mr-1" />
                    メールが届かない場合は、迷惑メールフォルダをご確認いただくか、しばらくお待ちください。
                  </p>
                </div>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="space-y-4">
              <button onClick={handleResend} disabled={resending} className="w-full bg-lightgray hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center">
                {resending ? (
                  <>
                    <svg className="animate-spin mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    送信中...
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="mr-2" />
                    確認メールを再送信
                  </>
                )}
              </button>
            </div>
            {/* Additional Info */}
            <div className="mt-8 pt-6 border-t border-gray-600">
              <h4 className="font-semibold mb-4">次のステップ</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <FaSearch className="text-primary text-2xl mb-2 mx-auto" />
                  <p className="text-gray-300">数千の映画やドラマを発見</p>
                </div>
                <div className="text-center">
                  <FaHeart className="text-primary text-2xl mb-2 mx-auto" />
                  <p className="text-gray-300">お気に入りとウォッチリストを作成</p>
                </div>
                <div className="text-center">
                  <FaStar className="text-primary text-2xl mb-2 mx-auto" />
                  <p className="text-gray-300">視聴した作品の評価とレビュー</p>
                </div>
              </div>
            </div>
            {/* Support Link */}
            <div className="mt-6 pt-4 border-t border-gray-600">
              <p className="text-gray-400 text-sm">
                お困りですか？ <button className="text-primary hover:text-secondary transition-colors">サポートに連絡</button>
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Resend Email Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-darkgray rounded-2xl p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <FaPaperPlane className="text-primary text-3xl mb-4 mx-auto" />
              <h3 className="text-lg font-semibold mb-2">メールを送信しました！</h3>
              <p className="text-gray-300 text-sm mb-4">
                確認メールを再送信しました。受信トレイと迷惑メールフォルダをご確認ください。
              </p>
              <button onClick={handleCloseModal} className="bg-primary hover:bg-secondary text-white py-2 px-4 rounded-lg font-medium transition-colors">
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 