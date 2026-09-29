import { Suspense } from "react";
import WatchClient from "../../components/WatchClient";
import { WatchSkeleton } from "../../components/Skeletons";

export default function WatchPage() {
  return (
    <Suspense fallback={<WatchSkeleton />}>
      <WatchClient />
    </Suspense>
  );
}
