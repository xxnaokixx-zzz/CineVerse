import HeroCarousel from "@/components/HeroCarousel";
import GlobalSearch from "@/components/GlobalSearch";
import TrendingSection from "@/components/TrendingSection";
import { getTrendingMovies } from "@/services/movieService";

export default async function Home() {
  const trendingMovies = await getTrendingMovies();

  return (
    <main className="-mt-20">
      <HeroCarousel movies={trendingMovies} />
      <GlobalSearch />
      <TrendingSection movies={trendingMovies} />
    </main>
  );
}
