import { Suspense } from 'react';
import AIFeatureSelectClient from './AIFeatureSelectClient';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AIFeatureSelectClient />
    </Suspense>
  );
} 