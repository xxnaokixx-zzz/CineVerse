import { Suspense } from "react";
import AIRecommendationResult from "./AIRecommendationResult";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AIRecommendationResult />
    </Suspense>
  );
} 