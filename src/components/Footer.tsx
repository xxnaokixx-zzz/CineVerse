'use client';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  const fixed = pathname === '/account';
  return (
    <footer className={`bg-darkgray py-0${fixed ? ' fixed bottom-0 left-0 w-full z-50' : ''}`}>
      <div className="container mx-auto px-4">
        <div className="text-center">
          <p className="text-gray-400 text-sm">© 2025 CineVerse. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 