import { FaTimes, FaUserCircle } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  user?: { email?: string } | null;
  avatarUrl?: string | null;
}

export default function AccountModal({ isOpen, onClose, onLogout, user, avatarUrl }: AccountModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-darkgray rounded-lg shadow-xl max-w-sm w-full mx-4">
        <div className="flex flex-col items-center justify-center p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white text-center w-full">アカウント</h2>
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
            <div className="text-white font-semibold text-center">{user?.email || 'ゲスト'}</div>
          </div>
          <div className="space-y-3 w-full flex flex-col items-center">
            <Link href="/account" className="block w-full bg-lightgray hover:bg-primary/80 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors">プロフィール</Link>
            <button onClick={onLogout} className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors">ログアウト</button>
            <Link href="/account/delete" className="block w-full bg-red-700 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors">退会</Link>
          </div>
        </div>
      </div>
    </div>
  );
} 