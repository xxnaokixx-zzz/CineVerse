'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

interface AccountClientProps {
  user: User;
  avatarUrl: string | null;
  counts: {
    watchlist: number;
    watched: number;
    toWatch: number;
    watching: number;
    favorites: number;
  };
  firstName: string;
  lastName: string;
}

export default function AccountClient({ user, avatarUrl, counts, firstName: initialFirstName, lastName: initialLastName }: AccountClientProps) {
  const [uploading, setUploading] = useState(false);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(avatarUrl);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState(firstName);
  const [editLastName, setEditLastName] = useState(lastName);
  const [showNameModal, setShowNameModal] = useState(!initialFirstName || !initialLastName);

  // セッション監視を追加
  useEffect(() => {
    const supabase = createClient();

    // 初期セッション確認
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      }
    };
    checkSession();

    // セッション変更の監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // 5秒後に保存メッセージを自動で消す
  useEffect(() => {
    if (saveMsg) {
      const timer = setTimeout(() => setSaveMsg(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [saveMsg]);

  useEffect(() => {
    setShowNameModal(!firstName && !lastName);
  }, [firstName, lastName]);

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setError(null);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('No file selected');
      }

      const file = event.target.files[0];

      // ファイルサイズチェック (2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('File size must be less than 2MB');
      }

      // ファイル形式チェック
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('File type must be JPEG, PNG, or GIF');
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase();
      // ファイルパスを userId/filename の形式に変更
      const fileName = `${user.id}/${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const supabase = createClient();

      // 古いアバター画像を削除
      if (currentAvatarUrl) {
        try {
          const oldPath = currentAvatarUrl.split('/').pop();
          if (oldPath) {
            const { error: removeError } = await supabase.storage
              .from('avatars')
              .remove([`${user.id}/${oldPath}`]);

            if (removeError) {
              console.warn('Error removing old avatar:', removeError);
            }
          }
        } catch (error) {
          console.warn('Error removing old avatar:', error);
        }
      }

      // 新しいアバター画像をアップロード
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // 同じパスに既存のファイルがある場合は上書き
        });

      console.log('Upload attempt result:', { error: uploadError, data: uploadData });

      if (uploadError) {
        console.error('Detailed upload error:', {
          message: uploadError.message,
          name: uploadError.name
        });
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // プロフィールを更新
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: filePath })
        .eq('id', user.id);

      if (updateError) {
        // アップロードしたファイルを削除（ロールバック）
        await supabase.storage.from('avatars').remove([filePath]);
        throw new Error(`Profile update failed: ${updateError.message}`);
      }

      // 画像URLを更新
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setCurrentAvatarUrl(publicUrl);
      router.refresh();
      window.location.reload();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = () => {
    setEditFirstName(firstName);
    setEditLastName(lastName);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditFirstName(firstName);
    setEditLastName(lastName);
    setIsEditing(false);
  };

  const handleSaveName = async () => {
    setSaving(true);
    setSaveMsg('');
    const supabase = createClient();
    const { error } = await supabase
      .from('profiles')
      .update({ first_name: editFirstName, last_name: editLastName })
      .eq('id', user.id);
    setSaving(false);
    setSaveMsg(error ? (error.message || '保存に失敗しました') : '保存しました');
    if (!error) {
      setFirstName(editFirstName);
      setLastName(editLastName);
      setIsEditing(false);
      setShowNameModal(false);
      router.refresh();
    }
  };

  // User欄の表示を「Last Name + First Name」に
  const fullName = [lastName, firstName].filter(Boolean).join(' ') || 'User';
  const email = user.email;
  const joined = user.created_at ? new Date(user.created_at).toLocaleDateString() : '';

  return (
    <main className="bg-dark text-white font-sans min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary py-12 iphonepro:py-6">
        <div className="container mx-auto px-4 iphonepro:px-2 iphonepro:max-w-[430px]">
          <div className="flex flex-col md:flex-row items-center iphonepro:gap-2">
            <div className="relative group">
              <div className="w-24 h-24 md:w-32 md:h-32 iphonepro:w-20 iphonepro:h-20 rounded-full overflow-hidden border-4 border-white mb-4 md:mb-0 md:mr-6">
                <Image
                  src={currentAvatarUrl || '/default-avatar.svg'}
                  alt="User Avatar"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                <span className="text-white text-sm font-medium">
                  {uploading ? 'Uploading...' : 'Change Photo'}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handleAvatarChange}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl iphonepro:text-2xl font-bold mb-2">{fullName}</h1>
              <p className="text-lg iphonepro:text-base opacity-90 mb-2">{email}</p>
              <p className="opacity-80 iphonepro:text-sm">Member since {joined}</p>
            </div>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-600 text-red-200 rounded-lg">
              {error}
            </div>
          )}
          {saveMsg && (
            <div className="mt-4 p-3 bg-green-700/80 border border-green-500 text-green-100 rounded-lg text-center font-semibold shadow">
              {saveMsg}
            </div>
          )}
        </div>
      </section>

      {/* Account Navigation */}
      <section className="bg-darkgray py-4 sticky top-[73px] z-40 iphonepro:py-2">
        <div className="container mx-auto px-4 iphonepro:px-2 iphonepro:max-w-[430px]">
          <div className="flex space-x-6 iphonepro:space-x-3 overflow-x-auto">
            <button className="tab-btn active whitespace-nowrap py-2 px-4 iphonepro:px-2 iphonepro:py-1 font-medium border-b-2 border-primary text-white" data-tab="profile">Profile</button>
            <Link
              href="/watchlist"
              className="tab-btn whitespace-nowrap py-2 px-4 iphonepro:px-2 iphonepro:py-1 font-medium border-b-2 border-transparent text-gray-400 hover:text-white"
              data-tab="watchlist"
            >
              Watchlist
            </Link>
          </div>
        </div>
      </section>

      {/* Account Content */}
      <section className="py-0 mb-8">
        <div className="container mx-auto px-4">
          {/* Profile Tab */}
          <div id="profile-tab" className="tab-content">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="bg-darkgray rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-6">Personal Information</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-400 mb-1">First Name</div>
                      {!isEditing ? (
                        <div className="text-lg">{firstName || '-'}</div>
                      ) : (
                        <input
                          type="text"
                          value={editFirstName}
                          onChange={e => setEditFirstName(e.target.value)}
                          className="bg-gray-300 text-black rounded px-3 py-2 w-full border border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="First Name"
                        />
                      )}
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Last Name</div>
                      {!isEditing ? (
                        <div className="text-lg">{lastName || '-'}</div>
                      ) : (
                        <input
                          type="text"
                          value={editLastName}
                          onChange={e => setEditLastName(e.target.value)}
                          className="bg-gray-300 text-black rounded px-3 py-2 w-full border border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Last Name"
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Email</div>
                    <div className="text-lg">{email}</div>
                  </div>
                  <div className="flex gap-2 mt-6">
                    {!isEditing ? (
                      <button
                        onClick={handleEdit}
                        className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold py-2 px-6 rounded-lg shadow-lg transition-colors"
                      >
                        編集
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleSaveName}
                          disabled={saving}
                          className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold py-2 px-6 rounded-lg shadow-lg transition-colors disabled:opacity-60"
                        >
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={saving}
                          className="bg-gray-300 hover:bg-gray-200 text-black font-semibold py-2 px-6 rounded-lg shadow-lg transition-colors disabled:opacity-60 ml-2"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Stats */}
              <div className="space-y-6">
                <div className="bg-darkgray rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-4">Account Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-500 mb-1">{counts.watched}</div>
                      <div className="text-sm text-gray-400">Watched</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-500 mb-1">{counts.toWatch}</div>
                      <div className="text-sm text-gray-400">To Watch</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-500 mb-1">{counts.watching}</div>
                      <div className="text-sm text-gray-400">Watching</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-pink-500 mb-1">{counts.favorites}</div>
                      <div className="text-sm text-gray-400">Favorites</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* プロフィール名未登録時のモーダル */}
          {showNameModal && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
              <div className="bg-darkgray p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">プロフィール名を登録してください</h2>
                <div className="mb-4">
                  <label className="block text-gray-300 mb-1">First Name</label>
                  <input
                    type="text"
                    value={editFirstName}
                    onChange={e => setEditFirstName(e.target.value)}
                    className="bg-gray-300 text-black rounded px-3 py-2 w-full border border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="First Name"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={editLastName}
                    onChange={e => setEditLastName(e.target.value)}
                    className="bg-gray-300 text-black rounded px-3 py-2 w-full border border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Last Name"
                  />
                </div>
                <button
                  onClick={handleSaveName}
                  disabled={saving || !editFirstName || !editLastName}
                  className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold py-2 px-6 rounded-lg shadow-lg transition-colors disabled:opacity-60 w-full"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                {saveMsg && <div className="mt-4 text-green-400 text-center">{saveMsg}</div>}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
} 