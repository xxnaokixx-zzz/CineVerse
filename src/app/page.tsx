import HeroCarousel from "@/components/HeroCarousel";
import TrendingSection from "@/components/TrendingSection";
import NowPlayingSection from "@/components/NowPlayingSection";
import { getTrendingMovies } from "@/services/movieService";
import Link from "next/link";
import { FaSearch } from "react-icons/fa";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  // 認証チェック
  const supabase = await createClient();
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Auth error in page:', error);
    redirect('/login?session_expired=true');
  }

  if (!session) {
    console.log('No session found in page, redirecting to login');
    redirect('/login');
  }

  // セッションが有効期限切れの場合はログインページにリダイレクト
  if (session.expires_at && new Date(session.expires_at * 1000) < new Date()) {
    console.log('Session expired in page, redirecting to login');
    redirect('/login?session_expired=true');
  }

  const trendingMovies = await getTrendingMovies();

  return (
    <main className="-mt-20">
      <HeroCarousel movies={trendingMovies} />
      <section className="py-8 bg-darkgray">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-6">Discover Your Next Favorite</h2>
            <p className="text-gray-400 mb-6">作品名、俳優、監督で検索して、あなたの次のお気に入りを見つけましょう</p>
            <Link
              href="/search"
              className="inline-flex items-center bg-primary hover:bg-secondary transition-colors px-8 py-3 rounded-lg font-medium text-white"
            >
              <FaSearch className="mr-2" />
              検索ページへ
            </Link>
          </div>
        </div>
      </section>
      <TrendingSection movies={trendingMovies} />
      <NowPlayingSection />
    </main>
  );
}
