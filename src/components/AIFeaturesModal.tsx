'use client'
import { useEffect } from 'react'
import { FaTimes, FaLightbulb, FaFileAlt, FaStar, FaCalendar } from 'react-icons/fa'
import { useRouter } from 'next/navigation'

interface AIFeaturesModalProps {
  isOpen: boolean
  onClose: () => void
}

const aiFeatures = [
  {
    id: 'mood-recommendation',
    name: '今の気分に合う作品を提案',
    description: '気分に合わせて映画・アニメ・ドラマを提案',
    icon: FaLightbulb,
    available: true
  },
  {
    id: 'summary',
    name: 'あらすじ要約・ネタバレ解説',
    description: '作品の内容をAIが要約・解説',
    icon: FaFileAlt,
    available: false
  },
  {
    id: 'review',
    name: 'AIレビュー要約・比較',
    description: '複数のレビューをAIが分析・比較',
    icon: FaStar,
    available: false
  },
  {
    id: 'schedule',
    name: '映画スケジュール提案',
    description: '時間に合わせた視聴スケジュールを提案',
    icon: FaCalendar,
    available: false
  },
]

export default function AIFeaturesModal({ isOpen, onClose }: AIFeaturesModalProps) {
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

  const handleFeatureClick = (featureId: string) => {
    if (featureId === 'mood-recommendation') {
      onClose();
      setTimeout(() => {
        router.push('/ai/recommendation');
      }, 0);
    } else {
      console.log('開発中の機能です:', featureId)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-darkgray rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">
            AI機能
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiFeatures.map((feature) => {
              const IconComponent = feature.icon
              return (
                <button
                  key={feature.id}
                  onClick={() => feature.available && handleFeatureClick(feature.id)}
                  disabled={!feature.available}
                  className={`p-6 rounded-lg transition-all duration-300 ${feature.available
                    ? 'bg-lightgray hover:bg-gray-600 cursor-pointer hover:shadow-lg hover:shadow-primary/20'
                    : 'bg-gray-800 cursor-not-allowed opacity-50'
                    }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <IconComponent className="text-3xl text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-white font-semibold text-lg mb-2">{feature.name}</div>
                      <div className="text-gray-400 text-sm">{feature.description}</div>
                      {!feature.available && (
                        <div className="text-yellow-500 text-xs mt-2 font-medium">開発中</div>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
} 