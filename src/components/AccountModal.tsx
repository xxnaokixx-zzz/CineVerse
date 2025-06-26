import { FaTimes, FaUserCircle } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  if (!isOpen) return null;
  const provider = user?.app_metadata?.provider;
  // full name生成（propsのfirstName/lastNameを優先）
  const fullName =
    (lastName || user?.user_metadata?.last_name || '') +
    ((lastName || user?.user_metadata?.last_name) && (firstName || user?.user_metadata?.first_name) ? ' ' : '') +
    (firstName || user?.user_metadata?.first_name || '');
  const displayName = fullName.trim() || user?.email || 'ゲスト';
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
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
            {avatarUrl && (avatarUrl.startsWith('http') || avatarUrl.startsWith('/')) ? (
              <div className="w-24 h-24 md:w-32 md:h-32 iphonepro:w-20 iphonepro:h-20 rounded-full overflow-hidden border-4 border-white mb-6">
                <Image src={avatarUrl} alt="Profile" width={80} height={80} className="object-cover w-full h-full" />
              </div>
            ) : (
              <div className="w-24 h-24 md:w-32 md:h-32 iphonepro:w-20 iphonepro:h-20 rounded-full overflow-hidden border-4 border-white mb-6">
                <Image src="/default-avatar.svg" alt="Profile" width={80} height={80} className="object-cover w-full h-full" />
              </div>
            )}
            <div className="text-white font-semibold text-center">{displayName}</div>
          </div>
          <div className="space-y-3 w-full flex flex-col items-center">
            <button
              className="block w-full bg-lightgray hover:bg-primary/80 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors"
              onClick={() => {
                onClose();
                setTimeout(() => {
                  router.push('/account');
                }, 200);
              }}
            >
              プロフィール
            </button>
            <button onClick={onLogout} className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors">ログアウト</button>
            {provider === 'email' ? (
              <Link href="/account/delete" className="block w-full bg-red-700 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors" onClick={onClose}>退会</Link>
            ) : (
              <div className="w-full flex flex-col items-center">
                <p className="text-xs text-gray-400 mt-4 text-center">
                  GoogleやGitHubの「アプリへのアクセス権」はご自身で解除してください。<br />
                  <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-400">Google連携解除はこちら</a><br />
                  <a href="https://github.com/settings/applications" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-400">GitHubの連携解除はこちら</a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 