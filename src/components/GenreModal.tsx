'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FaTimes } from 'react-icons/fa'
import { MdMovie, MdAnimation, MdTv } from 'react-icons/md'

interface GenreModalProps {
  isOpen: boolean
  onClose: () => void
}

const genres = [
  { name: 'Movie', href: '/movies', icon: MdMovie, description: '映画の一覧が閲覧できます' },
  { name: 'Anime', href: '/anime', icon: MdAnimation, description: 'アニメの一覧が閲覧できます' },
  { name: 'Drama', href: '/drama', icon: MdTv, description: 'ドラマの一覧が閲覧できます' },
]

export default function GenreModal({ isOpen, onClose }: GenreModalProps) {
  const router = useRouter()

  // Escキーでモーダルを閉じる
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey)
      // スクロールを無効化
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // 背景クリックでモーダルを閉じる
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleGenreClick = (href: string) => {
    router.push(href)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-darkgray rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">ジャンルを選択</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>
        {/* 注意書き */}
        <div className="px-6 pt-4 pb-0">
          <div className="bg-yellow-100 text-yellow-800 text-sm rounded px-4 py-3 mb-2">
            現在ジャンル選択機能はありません（ジャンル機能見直しのため）。<br />
            ただし各ジャンルの一覧は閲覧できます。
          </div>
        </div>

        {/* ジャンルボタン */}
        <div className="p-6 space-y-4">
          {genres.map((genre) => {
            const IconComponent = genre.icon
            return (
              <button
                key={genre.name}
                onClick={() => handleGenreClick(genre.href)}
                className="w-full flex items-center space-x-4 p-4 bg-lightgray hover:bg-gray-600 rounded-lg transition-colors group"
              >
                <div className="flex-shrink-0">
                  <IconComponent className="text-2xl text-primary group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-white font-medium text-lg">{genre.name}</div>
                  <div className="text-gray-400 text-sm">{genre.description}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
} 