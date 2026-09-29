import { Suspense } from "react";
import ResultsClient from "../../components/ResultsClient";

// useSearchParams requires a Suspense boundary in the App Router.
export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="results"><div className="empty">Searching…</div></div>}>
      <ResultsClient />
    </Suspense>
  );
}
