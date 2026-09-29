import PlaylistDetailClient from "../../../components/PlaylistDetailClient";

export const metadata = { title: "Playlist - MyTube" };

export default function PlaylistDetailPage({ params }) {
  return <PlaylistDetailClient id={decodeURIComponent(params.id)} />;
}
