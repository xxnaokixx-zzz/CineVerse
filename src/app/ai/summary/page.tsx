import { Suspense } from 'react';
import AISummaryPageClient from './AISummaryPageClient';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AISummaryPageClient />
    </Suspense>
  );
} 