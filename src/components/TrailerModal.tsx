'use client';

import { FaTimes } from 'react-icons/fa';

interface TrailerModalProps {
  isOpen: boolean;
  videoKey: string | null;
  onClose: () => void;
}

export default function TrailerModal({ isOpen, videoKey, onClose }: TrailerModalProps) {
  if (!isOpen || !videoKey) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg shadow-lg">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-primary transition-colors text-3xl"
          aria-label="Close trailer"
        >
          <FaTimes />
        </button>
        <iframe
          src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full rounded-lg"
        ></iframe>
      </div>
    </div>
  );
} 