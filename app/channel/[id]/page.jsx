import ChannelClient from "../../../components/ChannelClient";

// Handles both /channel/CHANNEL_ID and /channel/@handle — the API route
// resolves @handles via channels.list(forHandle=...).
export default function ChannelPage({ params }) {
  return <ChannelClient channelId={decodeURIComponent(params.id)} />;
}
