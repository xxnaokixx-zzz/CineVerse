'use client'
import { useState, useEffect } from 'react'
import { FaFilm, FaChevronDown, FaBars, FaSearch, FaSignOutAlt, FaUserCircle, FaTrash } from 'react-icons/fa'
import { FaRegUser } from 'react-icons/fa6'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import GenreModal from './GenreModal'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileSearchQuery, setMobileSearchQuery] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [genreModalOpen, setGenreModalOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        // プロフィール情報を取得
        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single()

        if (profile?.avatar_url) {
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(profile.avatar_url)
          setAvatarUrl(publicUrl)
        } else {
          setAvatarUrl(null)
        }
      } else {
        setUser(null)
        setAvatarUrl(null)
      }
    }

    fetchUserData()

    // onAuthStateChangeで自動反映
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUserData()
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // ドロップダウン外クリックで閉じる
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('account-dropdown');
      const avatarBtn = document.getElementById('account-avatar-btn');
      if (
        dropdown &&
        !dropdown.contains(event.target as Node) &&
        avatarBtn &&
        !avatarBtn.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen)
  const toggleMobileSearch = () => setMobileSearchOpen(!mobileSearchOpen)
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen)
  const toggleGenreModal = () => setGenreModalOpen(!genreModalOpen)

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // Clear any cached data
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if logout fails
      router.push('/login');
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

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Watchlist', href: '/watchlist' },
  ]

  // ジャンルページかどうかを判定する関数
  const isGenrePage = (path: string) => {
    return ['/movies', '/anime', '/drama'].includes(path)
  }

  return (
    <header className="bg-darkgray sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-3 iphonepro:px-2 iphonepro:max-w-[430px]">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center cursor-pointer">
            <FaFilm className="text-primary text-2xl mr-2" />
            <span className="text-xl font-bold">CineVerse</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map(link => (
              <Link
                key={link.name}
                href={link.href}
                className={`font-medium hover:text-primary transition-colors ${pathname === link.href ? 'text-primary' : ''
                  }`}
              >
                {link.name}
              </Link>
            ))}

            {/* ジャンルボタン */}
            <button
              onClick={toggleGenreModal}
              className={`font-medium hover:text-primary transition-colors flex items-center space-x-1 ${isGenrePage(pathname) ? 'text-primary' : ''
                }`}
            >
              <span>Genre</span>
              <FaChevronDown className="text-sm" />
            </button>
          </nav>

          <div className="flex items-center space-x-4">
            <form onSubmit={(e) => handleSearch(e, false)} className="relative hidden md:block">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-lightgray rounded-full py-2 pl-10 pr-4 w-64 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </form>
            <button onClick={toggleMobileSearch} className="md:hidden text-gray-300 hover:text-white">
              <FaSearch className="text-xl" />
            </button>

            {user ? (
              <div className="relative">
                <button
                  id="account-avatar-btn"
                  className="flex items-center space-x-2 focus:outline-none"
                  onClick={toggleDropdown}
                  type="button"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-primary flex items-center justify-center">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt="Profile"
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaRegUser />
                    )}
                  </div>
                </button>

                {dropdownOpen && (
                  <div id="account-dropdown" className="absolute right-0 mt-2 w-48 bg-darkgray rounded-lg shadow-lg py-2 border border-gray-700">
                    <Link
                      href="/account"
                      className="flex items-center px-4 py-2 text-sm hover:bg-gray-700 cursor-pointer"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FaUserCircle className="mr-2" />
                      プロフィール
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-700 cursor-pointer"
                    >
                      <FaSignOutAlt className="mr-2" />
                      ログアウト
                    </button>
                    <Link
                      href="/account/delete"
                      className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-gray-700 cursor-pointer"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FaTrash className="mr-2" />
                      退会
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Link href="/login" className="font-medium hover:text-primary transition-colors">
                  Login
                </Link>
                <Link href="/signup" className="bg-primary px-4 py-2 rounded-full font-medium hover:bg-primary/80 transition-colors">
                  Sign Up
                </Link>
              </div>
            )}

            <button onClick={toggleMobileMenu} className="md:hidden">
              <FaBars className="text-xl" />
            </button>
          </div>
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
            <nav className="flex flex-col space-y-3 pb-3">
              {navLinks.map(link => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`font-medium hover:text-primary transition-colors cursor-pointer ${pathname === link.href ? 'text-primary' : ''
                    }`}
                >
                  {link.name}
                </Link>
              ))}

              {/* モバイル用ジャンルボタン */}
              <button
                onClick={toggleGenreModal}
                className={`font-medium hover:text-primary transition-colors text-left ${isGenrePage(pathname) ? 'text-primary' : ''
                  }`}
              >
                Genre
              </button>

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
            </nav>
          </div>
        )}
      </div>

      {/* ジャンル選択モーダル */}
      <GenreModal isOpen={genreModalOpen} onClose={() => setGenreModalOpen(false)} />
    </header>
  )
} 