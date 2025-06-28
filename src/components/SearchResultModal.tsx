import React from 'react';

interface SearchResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const SearchResultModal: React.FC<SearchResultModalProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景ぼかし */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-darkgray rounded-xl shadow-2xl w-full max-w-7xl mx-auto p-10 z-10 animate-fadeIn">
        {/* 閉じるボタン */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-300 hover:text-white text-2xl font-bold">×</button>
        {/* 検索結果表示 */}
        <div className="max-h-[90vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SearchResultModal; 