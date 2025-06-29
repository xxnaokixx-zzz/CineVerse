'use client'
import { useState, useEffect } from 'react'
import { FaFilm, FaChevronDown, FaBars, FaSearch, FaSignOutAlt, FaUserCircle, FaTrash, FaRobot } from 'react-icons/fa'
import { FaRegUser } from 'react-icons/fa6'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import GenreModal from './GenreModal'
import AccountModal from './AccountModal'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileSearchQuery, setMobileSearchQuery] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [genreModalOpen, setGenreModalOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [firstName, setFirstName] = useState<string>('')
  const [lastName, setLastName] = useState<string>('')
  const [accountModalOpen, setAccountModalOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Watchlist', href: '/watchlist' },
  ]

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error) {
          console.error('Auth error:', error)
          // エラーが発生した場合はログアウト状態にする
          setUser(null)
          setAvatarUrl(null)
          setFirstName('')
          setLastName('')
          return
        }

        if (user) {
          setUser(user)
          // プロフィール情報を取得
          let { data: profile } = await supabase
            .from('profiles')
            .select('avatar_url, first_name, last_name')
            .eq('id', user.id)
            .single()

          if (!profile) {
            // レコードがなければinsert
            await supabase.from('profiles').insert({
              id: user.id,
              avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
              first_name: user.user_metadata?.given_name || (user.user_metadata?.name ? user.user_metadata.name.split(' ')[0] : null),
              last_name: user.user_metadata?.family_name || (user.user_metadata?.name ? user.user_metadata.name.split(' ')[1] : null),
              email: user.email
            });
            // insert後に再度select
            const { data: insertedProfile } = await supabase
              .from('profiles')
              .select('avatar_url, first_name, last_name')
              .eq('id', user.id)
              .single();
            profile = insertedProfile;
          } else if (!profile?.avatar_url || !profile?.first_name || !profile?.last_name) {
            // 既存ロジック: update
            const oauthAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;
            const givenName = user.user_metadata?.given_name || (user.user_metadata?.name ? user.user_metadata.name.split(' ')[0] : null);
            const familyName = user.user_metadata?.family_name || (user.user_metadata?.name ? user.user_metadata.name.split(' ')[1] : null);

            const updateData: any = {};
            if (oauthAvatar && !profile?.avatar_url) updateData.avatar_url = oauthAvatar;
            if (givenName && !profile?.first_name) updateData.first_name = givenName;
            if (familyName && !profile?.last_name) updateData.last_name = familyName;

            if (Object.keys(updateData).length > 0) {
              await supabase
                .from('profiles')
                .update(updateData)
                .eq('id', user.id);
              // update後に再度select
              const { data: updatedProfile } = await supabase
                .from('profiles')
                .select('avatar_url, first_name, last_name')
                .eq('id', user.id)
                .single();
              profile = updatedProfile;
            }
          }

          if (profile?.avatar_url) {
            setAvatarUrl(profile.avatar_url)
          } else {
            setAvatarUrl(null)
          }
          // 名前情報も設定
          setFirstName(profile?.first_name || '')
          setLastName(profile?.last_name || '')
        } else {
          setUser(null)
          setAvatarUrl(null)
          setFirstName('')
          setLastName('')
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        setUser(null)
        setAvatarUrl(null)
        setFirstName('')
        setLastName('')
      }
    }

    // 初期データ取得
    fetchUserData()

    // onAuthStateChangeで自動反映
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)

      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' || !session) {
        setUser(null)
        setAvatarUrl(null)
        setFirstName('')
        setLastName('')
      } else if (event === 'SIGNED_IN' && session?.user) {
        fetchUserData()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (pathname === '/' && (searchParams?.get('openAIModal') || '') === '1') {
      router.push('/ai')
    }
  }, [pathname, searchParams])

  useEffect(() => { setMounted(true); }, []);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen)
  const toggleMobileSearch = () => setMobileSearchOpen(!mobileSearchOpen)
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen)
  const toggleGenreModal = () => setGenreModalOpen(!genreModalOpen)

  const handleLogout = async () => {
    try {
      console.log('Logging out...')

      // ローカルストレージをクリア
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }

      // Supabaseからログアウト
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('Logout error:', error)
      }

      // 状態をリセット
      setUser(null)
      setAvatarUrl(null)
      setFirstName('')
      setLastName('')
      setAccountModalOpen(false)

      // ログインページにリダイレクト
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      // エラーが発生しても強制的にリダイレクト
      router.push('/login')
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('本当にアカウントを削除しますか？この操作は取り消せません。')) {
      try {
        // アバターの削除
        if (avatarUrl) {
          const oldPath = avatarUrl.split('/').pop()
          if (oldPath) {
            await supabase.storage
              .from('avatars')
              .remove([`${user.id}/${oldPath}`])
          }
        }

        // アカウントの削除
        const response = await fetch('/api/delete-account', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('アカウントの削除に失敗しました')
        }

        await supabase.auth.signOut()
        router.push('/login')
      } catch (error) {
        console.error('Error deleting account:', error)
        alert('アカウントの削除中にエラーが発生しました。')
      }
    }
  }

  const handleSearch = (e: React.FormEvent, isMobile = false) => {
    e.preventDefault()
    const query = isMobile ? mobileSearchQuery : searchQuery
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      setSearchQuery('')
      setMobileSearchQuery('')
      setMobileSearchOpen(false)
    }
  }

  // ジャンルページかどうかを判定する関数
  const isGenrePage = (path: string) => {
    return ['/movies', '/anime', '/drama'].includes(path)
  }

  // avatarUrlの表示用URLを判定
  console.log('avatarUrl:', avatarUrl);
  let displayAvatarUrl: string = '/default-avatar.svg';
  if (avatarUrl && avatarUrl.startsWith('http')) {
    displayAvatarUrl = avatarUrl;
  } else if (avatarUrl) {
    displayAvatarUrl = supabase.storage.from('avatars').getPublicUrl(avatarUrl).data.publicUrl || '/default-avatar.svg';
  }
  console.log('displayAvatarUrl:', displayAvatarUrl);

  // デバッグ用：セッション状態を定期的にチェック
  useEffect(() => {
    const debugSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('Debug - Session state:', {
          hasSession: !!session,
          userEmail: session?.user?.email,
          expiresAt: session?.expires_at,
          error: error?.message
        });
      } catch (error) {
        console.error('Debug - Session check failed:', error);
      }
    };

    // 初回チェック
    debugSession();

    // 5秒ごとにチェック（デバッグ用）
    const interval = setInterval(debugSession, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-black sticky top-0 z-50 shadow-lg border-b border-gray-800">
      <div className="w-full pl-4 pr-0 py-3">
        <div className="flex items-center w-full">
          <Link href="/" className="flex items-center cursor-pointer flex-shrink-0">
            <FaFilm className="text-primary text-2xl mr-2" />
            <span className="text-xl font-bold">CineVerse</span>
          </Link>
          <div className="flex-1"></div>

          {/* mounted後のみユーザー依存のUIを描画 */}
          {mounted ? (
            <>
              {user && (
                <nav className="hidden md:flex items-center space-x-8 mr-6">
                  {navLinks.map(link => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`font-medium hover:text-primary transition-colors ${pathname === link.href ? 'text-primary' : ''}`}
                    >
                      {link.name}
                    </Link>
                  ))}
                  {/* ジャンルボタン */}
                  <button
                    onClick={toggleGenreModal}
                    className={`font-medium hover:text-primary transition-colors ${isGenrePage(pathname || "") ? 'text-primary' : ''}`}
                  >
                    <span>Genre</span>
                  </button>
                  {/* AI機能ボタン */}
                  <button
                    onClick={() => router.push('/ai')}
                    className="font-medium hover:text-primary transition-colors"
                  >
                    <span>AI機能</span>
                  </button>
                  {/* Searchページへのリンク */}
                  <Link
                    href="/search"
                    className={`font-medium hover:text-primary transition-colors ${pathname === '/search' ? 'text-primary' : ''}`}
                  >
                    Search
                  </Link>
                </nav>
              )}
              {/* アバター/ログインボタンをヘッダーの一番右端に配置 */}
              <div className="flex-shrink-0 flex items-center ml-auto pr-2">
                {user ? (
                  <div className="relative">
                    <button
                      id="account-avatar-btn"
                      className="flex items-center space-x-2 focus:outline-none"
                      onClick={() => setAccountModalOpen(true)}
                      type="button"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-primary flex items-center justify-center">
                        {avatarUrl ? (
                          <>
                            <Image
                              src={displayAvatarUrl}
                              alt="Profile"
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          </>
                        ) : (
                          <FaRegUser />
                        )}
                      </div>
                    </button>
                    <AccountModal
                      isOpen={accountModalOpen}
                      onClose={() => setAccountModalOpen(false)}
                      onLogout={handleLogout}
                      user={user}
                      avatarUrl={displayAvatarUrl}
                      firstName={firstName}
                      lastName={lastName}
                    />
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Link href="/login" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">ログイン</Link>
                    <Link href="/signup" className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium transition-colors">新規登録</Link>
                  </div>
                )}
              </div>
            </>
          ) : (
            // SSR時は空divでプレースホルダー
            <div style={{ width: 200 }}></div>
          )}
          <button onClick={toggleMobileMenu} className="md:hidden">
            <FaBars className="text-xl" />
          </button>
        </div>

        {mobileSearchOpen && (
          <div className="mt-3 md:hidden">
            <form onSubmit={(e) => handleSearch(e, true)} className="relative">
              <input
                type="text"
                placeholder="Search movies, anime..."
                value={mobileSearchQuery}
                onChange={(e) => setMobileSearchQuery(e.target.value)}
                className="bg-lightgray rounded-full py-2 pl-10 pr-4 w-full focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </form>
          </div>
        )}

        {mobileMenuOpen && (
          <div className="md:hidden mt-3">
            {user && (
              <nav className="flex flex-col space-y-3 pb-3">
                {navLinks.map(link => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`font-medium hover:text-primary transition-colors cursor-pointer ${pathname === link.href ? 'text-primary' : ''}`}
                  >
                    {link.name}
                  </Link>
                ))}

                {/* モバイル用ジャンルボタン */}
                <button
                  onClick={toggleGenreModal}
                  className={`font-medium hover:text-primary transition-colors text-left ${isGenrePage(pathname || "") ? 'text-primary' : ''}`}
                >
                  Genre
                </button>

                {/* モバイル用AI機能ボタン */}
                <button
                  onClick={() => { setMobileMenuOpen(false); router.push('/ai') }}
                  className="font-medium hover:text-primary transition-colors text-left flex items-center space-x-2"
                >
                  <span>AI機能</span>
                </button>
              </nav>
            )}

            {!user && (
              <div className="flex flex-col space-y-3 pt-3 border-t border-gray-700">
                <Link href="/login" className="font-medium hover:text-primary transition-colors">
                  Login
                </Link>
                <Link href="/signup" className="font-medium hover:text-primary transition-colors">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ジャンル選択モーダル */}
      <GenreModal isOpen={genreModalOpen} onClose={() => setGenreModalOpen(false)} />
    </header >
  )
} 