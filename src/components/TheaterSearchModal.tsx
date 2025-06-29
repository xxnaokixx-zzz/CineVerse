'use client';

import React from 'react';
import { FaSearch, FaMapMarkerAlt, FaTimes } from 'react-icons/fa';

// 主要映画館チェーンのリンク
const THEATER_LINKS = {
  'TOHO': {
    name: 'TOHOシネマズ',
    url: 'https://hlo.tohotheater.jp/net/movie/TNPI3060J01.do',
    searchUrl: (title: string) => `https://hlo.tohotheater.jp/net/movie/TNPI3060J01.do?search=${encodeURIComponent(title)}`
  },
  '109': {
    name: '109シネマズ',
    url: 'https://109cinemas.net/',
    searchUrl: (title: string) => `https://109cinemas.net/search?q=${encodeURIComponent(title)}`
  },
  'United': {
    name: 'ユナイテッド・シネマ',
    url: 'https://www.unitedcinemas.jp/',
    searchUrl: (title: string) => `https://www.unitedcinemas.jp/search?keyword=${encodeURIComponent(title)}`
  },
  'Aeon': {
    name: 'イオンシネマ',
    url: 'https://aeoncinema.com/',
    searchUrl: (title: string) => `https://aeoncinema.com/search?q=${encodeURIComponent(title)}`
  },
  'Filmarks': {
    name: 'Filmarks',
    url: 'https://filmarks.com/',
    searchUrl: (title: string) => `https://filmarks.com/search/movies?q=${encodeURIComponent(title)}`
  }
};

interface TheaterSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  movieTitle: string;
}

export default function TheaterSearchModal({ isOpen, onClose, movieTitle }: TheaterSearchModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-6 min-w-[320px] max-w-[95vw] max-h-[80vh] overflow-y-auto relative">
        <button
          className="absolute top-4 right-4 bg-white/90 text-gray-900 hover:bg-gray-200 text-2xl font-bold rounded-full w-10 h-10 flex items-center justify-center shadow transition-colors z-10"
          onClick={onClose}
          aria-label="閉じる"
        >
          ×
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">映画館で探す</h2>
          <p className="text-gray-300 text-sm">「{movieTitle}」を上映している映画館を探す</p>
        </div>

        {/* 主要映画館チェーン */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">主要映画館チェーン</h3>
          <div className="grid gap-3">
            {Object.entries(THEATER_LINKS).map(([key, theater]) => (
              <div key={key} className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white">{theater.name}</h4>
                    <p className="text-gray-400 text-sm">公式サイトで上映情報を確認</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(theater.name + ' ' + movieTitle)}`, '_blank', 'noopener,noreferrer')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                    >
                      <FaSearch className="text-xs" />
                      検索
                    </button>
                    <button
                      onClick={() => window.open(theater.url, '_blank', 'noopener,noreferrer')}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      サイト
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* その他の検索オプション */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white mb-3">その他の検索方法</h3>

          {/* Google検索 */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-white">Google検索</h4>
                <p className="text-gray-400 text-sm">「{movieTitle} 上映館」で検索</p>
              </div>
              <button
                onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(`${movieTitle} 上映館`)}`, '_blank', 'noopener,noreferrer')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <FaSearch className="text-xs" />
                検索
              </button>
            </div>
          </div>

          {/* Googleマップ */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-white">Googleマップ</h4>
                <p className="text-gray-400 text-sm">近くの映画館を地図で探す</p>
              </div>
              <button
                onClick={() => window.open('https://www.google.com/maps/search/映画館', '_blank', 'noopener,noreferrer')}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <FaMapMarkerAlt className="text-xs" />
                地図
              </button>
            </div>
          </div>
        </div>

        {/* 注意事項 */}
        <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
          <p className="text-yellow-200 text-sm">
            <strong>注意:</strong> 上映情報は各映画館の公式サイトで最新の情報をご確認ください。
            上映スケジュールは変更される場合があります。
          </p>
        </div>
      </div>
    </div>
  );
} 