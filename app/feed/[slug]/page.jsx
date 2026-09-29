import FeedClient from "../../../components/FeedClient";

export default function FeedPage({ params }) {
  return <FeedClient slug={params.slug} />;
}
