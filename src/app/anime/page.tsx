import { Suspense } from 'react';
import AnimePageClient from './AnimePageClient';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AnimePageClient />
    </Suspense>
  );
} 