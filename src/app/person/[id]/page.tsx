import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPersonDetails, getPersonCombinedCredits, getPersonExternalIds, getImageUrl } from '@/services/movieService';
import { FaStar, FaFilm, FaBookmark, FaShare, FaUser } from 'react-icons/fa';
import MovieCard from '@/components/MovieCard';
import PersonClientPage from './PersonClientPage';

type PageProps = {
  params: {
    id: string;
  };
};

export default async function PersonDetailPage({ params }: PageProps) {
  const { id } = params;

  try {
    const [person, credits, externalIds] = await Promise.all([
      getPersonDetails(id),
      getPersonCombinedCredits(id),
      getPersonExternalIds(id),
    ]);

    if (!person) {
      notFound();
    }

    const knownFor = credits.cast
      .filter(c => c.poster_path)
      .sort((a, b) => b.vote_average - a.vote_average)
      .slice(0, 4);

    return (
      <div className="bg-dark text-white font-sans">
        <section className="relative h-[400px] md:h-[500px]">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/30"></div>
          <div className="absolute inset-0 flex items-end pb-8">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
                <div className="w-32 md:w-48 h-48 md:h-72 rounded-lg overflow-hidden shadow-xl flex-shrink-0 -mt-16 md:mt-0 bg-darkgray flex items-center justify-center">
                  {person.profile_path ? (
                    <Image
                      className="w-full h-full object-cover"
                      src={getImageUrl(person.profile_path)}
                      alt={person.name}
                      width={200}
                      height={300}
                      priority
                    />
                  ) : (
                    <FaUser className="text-6xl text-gray-500" />
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl md:text-5xl font-bold mb-2">{person.name}</h1>
                  <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mb-4">
                    <span className="text-gray-300">{person.known_for_department}</span>
                    {person.birthday && <span className="text-gray-300">•</span>}
                    {person.birthday && <span className="text-gray-300">Born {new Date(person.birthday).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>}
                    {person.place_of_birth && <span className="text-gray-300">•</span>}
                    {person.place_of_birth && <span className="text-gray-300">{person.place_of_birth}</span>}
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center">
                      <FaStar className="text-yellow-400 mr-1" />
                      <span className="font-medium">{person.popularity.toFixed(1)}</span>
                      <span className="text-gray-400 ml-1">Popularity</span>
                    </div>
                    <div className="flex items-center">
                      <FaFilm className="text-primary mr-1" />
                      <span className="font-medium">{credits.cast.length || 0}</span>
                      <span className="text-gray-400 ml-1">Credits</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button className="bg-primary hover:bg-secondary transition-colors px-5 py-2 rounded-full flex items-center text-sm">
                      <FaBookmark className="mr-2" /> Follow
                    </button>
                    <button className="bg-transparent border border-white hover:bg-white hover:text-dark transition-colors px-5 py-2 rounded-full flex items-center text-sm">
                      <FaShare className="mr-2" /> Share
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <PersonClientPage person={person} credits={credits} externalIds={externalIds} knownFor={knownFor} />
      </div>
    );
  } catch (error) {
    console.error("Failed to fetch person details:", error);
    notFound();
  }
} 