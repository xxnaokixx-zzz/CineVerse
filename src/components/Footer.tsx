import Link from 'next/link';
import { FaFilm, FaTwitter, FaFacebook, FaInstagram, FaYoutube, FaPaperPlane } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer id="footer" className="bg-darkgray pt-10 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/careers" className="text-gray-400 hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link href="/help" className="text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Discover</h3>
            <ul className="space-y-2">
              <li><Link href="/movies" className="text-gray-400 hover:text-white transition-colors">Movies</Link></li>
              <li><Link href="/anime" className="text-gray-400 hover:text-white transition-colors">Anime</Link></li>
              <li><Link href="/tv-shows" className="text-gray-400 hover:text-white transition-colors">TV Shows</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4 mb-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><FaTwitter className="text-xl" /></a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><FaFacebook className="text-xl" /></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><FaInstagram className="text-xl" /></a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><FaYoutube className="text-xl" /></a>
            </div>
            <p className="text-gray-400 text-sm">Subscribe to our newsletter</p>
            <div className="flex mt-2">
              <input type="email" placeholder="Email address" className="bg-lightgray rounded-l-md px-3 py-2 w-full focus:outline-none text-white" />
              <button className="bg-primary hover:bg-secondary px-4 py-2 rounded-r-md">
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <FaFilm className="text-primary text-2xl mr-2" />
            <span className="text-xl font-bold">CineVerse</span>
          </div>
          <p className="text-gray-400 text-sm">© 2024 CineVerse. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 