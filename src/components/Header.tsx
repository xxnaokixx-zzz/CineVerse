'use client'
import { useState } from 'react'
import { FaFilm, FaChevronDown, FaBars, FaSearch } from 'react-icons/fa'
import { FaRegUser } from 'react-icons/fa6'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileSearchQuery, setMobileSearchQuery] = useState('')
  const router = useRouter()
  const pathname = usePathname()

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen)
  const toggleMobileSearch = () => setMobileSearchOpen(!mobileSearchOpen)

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
    { name: 'Movies', href: '/movies' },
    { name: 'Anime', href: '/anime' },
    { name: 'Drama', href: '/drama' },
    { name: 'Watchlist', href: '/watchlist' },
  ]

  const categories = ['Action', 'Comedy', 'Drama', 'Sci-Fi', 'Horror']
  const accountLinks = ['Profile', 'Favorites', 'Settings', 'Sign Out']

  return (
    <header className="bg-darkgray sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-3">
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
            <div className="relative group">
              <button className="font-medium hover:text-primary transition-colors flex items-center">
                Categories <FaChevronDown className="ml-1 text-xs" />
              </button>
              <div className="absolute left-0 mt-2 w-48 bg-darkgray rounded-md shadow-lg hidden group-hover:block">
                <div className="py-1">
                  {categories.map(cat => (
                    <Link key={cat} href={`/category/${cat.toLowerCase()}`} className="block px-4 py-2 hover:bg-lightgray cursor-pointer">
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
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
            <div className="relative group">
              <button className="flex items-center space-x-2 focus:outline-none">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <FaRegUser />
                </div>
                <span className="hidden md:inline-block">Account</span>
                <FaChevronDown className="hidden md:inline-block text-xs" />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-darkgray rounded-md shadow-lg hidden group-hover:block">
                <div className="py-1">
                  {accountLinks.map(item => (
                    <Link key={item} href={`/${item.toLowerCase().replace(' ', '-')}`} className="block px-4 py-2 hover:bg-lightgray cursor-pointer">
                      {item}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
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
              <div className="relative group">
                <button className="font-medium hover:text-primary transition-colors text-left flex items-center justify-between w-full">
                  Categories
                  <FaChevronDown className="text-xs" />
                </button>
                <div className="pl-4 space-y-2 mt-1 hidden group-focus-within:block">
                  {categories.map(cat => (
                    <Link key={cat} href={`/category/${cat.toLowerCase()}`} className="block hover:text-primary cursor-pointer">
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
} 