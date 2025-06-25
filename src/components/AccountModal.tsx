import { FaTimes, FaUserCircle } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  user?: any | null; // Supabaseユーザーオブジェクトを想定
  avatarUrl?: string | null;
  firstName?: string;
  lastName?: string;
}

export default function AccountModal({ isOpen, onClose, onLogout, user, avatarUrl, firstName, lastName }: AccountModalProps) {
  if (!isOpen) return null;
  const provider = user?.app_metadata?.provider;
  // full name生成（propsのfirstName/lastNameを優先）
  const fullName =
    (lastName || user?.user_metadata?.last_name || '') +
    ((lastName || user?.user_metadata?.last_name) && (firstName || user?.user_metadata?.first_name) ? ' ' : '') +
    (firstName || user?.user_metadata?.first_name || '');
  const displayName = fullName.trim() || user?.email || 'ゲスト';
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-darkgray rounded-lg shadow-xl max-w-sm w-full mx-4">
        <div className="flex flex-col items-center justify-center p-6 border-b border-gray-700 relative">
          <h2 className="text-xl font-bold text-white text-center w-full">アカウント</h2>
          <button
            className="absolute right-4 top-4 text-gray-400 hover:text-white focus:outline-none"
            onClick={onClose}
            aria-label="閉じる"
          >
            <FaTimes size={20} />
          </button>
        </div>
        <div className="p-6 space-y-6 flex flex-col items-center">
          <div className="flex flex-col items-center space-y-2">
            {avatarUrl ? (
              <div className="w-20 h-20 rounded-full overflow-hidden mb-2 flex items-center justify-center bg-primary/20">
                <Image src={avatarUrl} alt="Profile" width={80} height={80} className="object-cover w-full h-full" />
              </div>
            ) : (
              <FaUserCircle className="text-5xl text-primary mb-2" />
            )}
            <div className="text-white font-semibold text-center">{displayName}</div>
          </div>
          <div className="space-y-3 w-full flex flex-col items-center">
            <Link href="/account" className="block w-full bg-lightgray hover:bg-primary/80 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors" onClick={onClose}>プロフィール</Link>
            <button onClick={onLogout} className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors">ログアウト</button>
            {provider === 'email' ? (
              <Link href="/account/delete" className="block w-full bg-red-700 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors" onClick={onClose}>退会</Link>
            ) : (
              <div className="w-full flex flex-col items-center">
                <p className="text-xs text-gray-400 mb-2 text-center">
                  GoogleやGitHubの「アプリへのアクセス権」はご自身で解除してください。<br />
                  <a
                    href="https://myaccount.google.com/permissions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Google連携解除はこちら
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 