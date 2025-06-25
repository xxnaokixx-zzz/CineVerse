import { Suspense } from 'react';
import SignupSuccessClient from './SignupSuccessClient';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupSuccessClient />
    </Suspense>
  );
} 