import { notFound } from 'next/navigation';
import { getPersonDetails, getPersonCombinedCredits, getPersonExternalIds } from '@/services/movieService';
import PersonClientPage from './PersonClientPage';

export default async function PersonPage({ params }: any) {
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
      <PersonClientPage person={person} credits={credits} externalIds={externalIds} knownFor={knownFor} />
    );
  } catch (error) {
    console.error("Failed to fetch person details:", error);
    notFound();
  }
} 