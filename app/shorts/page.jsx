import { Suspense } from "react";
import ShortsClient from "../../components/ShortsClient";

export const metadata = {
  title: "Shorts - MyTube",
};

export default function ShortsPage() {
  return (
    <Suspense>
      <ShortsClient />
    </Suspense>
  );
}
