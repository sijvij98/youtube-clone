// Built-in demo dataset, served by every API route when YOUTUBE_API_KEY is missing.
// Video IDs are real public YouTube videos, so thumbnails (i.ytimg.com) and
// embeds keep working in demo mode. Stats (views/likes) are illustrative
// placeholders — the UI marks everything as demo and never shows fabricated
// channel subscriber counts.

export const DEMO_CHANNELS = [
  { id: "ch-blender", name: "Blender Foundation", handle: "@blenderfoundation", color: "#e8750a", description: "The Blender Foundation steers the development of Blender, the free and open-source 3D creation suite — and produces open movies like Big Buck Bunny." },
  { id: "ch-psy", name: "PSY", handle: "@psy", color: "#c0a062", description: "Demo channel entry. Connect a YouTube Data API v3 key for the real channel." },
  { id: "ch-ed", name: "Ed Sheeran", handle: "@edsheeran", color: "#3b82f6", description: "Demo channel entry. Connect a YouTube Data API v3 key for the real channel." },
  { id: "ch-luis", name: "Luis Fonsi", handle: "@luisfonsi", color: "#ef4444", description: "Demo channel entry. Connect a YouTube Data API v3 key for the real channel." },
  { id: "ch-alan", name: "Alan Walker", handle: "@alanwalker", color: "#22d3ee", description: "Demo channel entry. Connect a YouTube Data API v3 key for the real channel." },
  { id: "ch-wiz", name: "Wiz Khalifa", handle: "@wizkhalifa", color: "#a3e635", description: "Demo channel entry. Connect a YouTube Data API v3 key for the real channel." },
  { id: "ch-ytdev", name: "YouTube Developers", handle: "@youtubedevelopers", color: "#0ea5e9", description: "Demo channel entry. Connect a YouTube Data API v3 key for the real channel." },
  { id: "ch-taylor", name: "Taylor Swift", handle: "@taylorswift", color: "#ec4899", description: "Demo channel entry. Connect a YouTube Data API v3 key for the real channel." },
  { id: "ch-adele", name: "Adele", handle: "@adele", color: "#8b5cf6", description: "Demo channel entry. Connect a YouTube Data API v3 key for the real channel." },
  { id: "ch-rick", name: "Rick Astley", handle: "@rickastley", color: "#14b8a6", description: "Demo channel entry. Connect a YouTube Data API v3 key for the real channel." },
  { id: "ch-nirvana", name: "Nirvana", handle: "@nirvana", color: "#facc15", description: "Demo channel entry. Connect a YouTube Data API v3 key for the real channel." },
  { id: "ch-queen", name: "Queen", handle: "@queen", color: "#f97316", description: "Demo channel entry. Connect a YouTube Data API v3 key for the real channel." },
];

// durationSec / views / likes are illustrative demo placeholders.
export const DEMO_VIDEOS = [
  { id: "aqz-KE-bpKQ", title: "Big Buck Bunny", channelId: "ch-blender", durationSec: 596, views: 12500000, likes: 340000, publishedAt: "2008-04-10T12:00:00Z", description: "A giant rabbit takes revenge on three bullying rodents in this classic open-source short film by the Blender Foundation.\n\nDemo dataset: add a YouTube Data API v3 key for live trending videos." },
  { id: "9bZkp7q19f0", title: "PSY - GANGNAM STYLE (Official M/V)", channelId: "ch-psy", durationSec: 253, views: 4800000000, likes: 27000000, publishedAt: "2012-07-15T12:00:00Z", description: "The viral hit that broke YouTube's view counter.\n\nDemo dataset: add a YouTube Data API v3 key for live data." },
  { id: "JGwWNGJdvx8", title: "Ed Sheeran - Shape of You (Official Music Video)", channelId: "ch-ed", durationSec: 264, views: 6100000000, likes: 32000000, publishedAt: "2017-01-30T12:00:00Z", description: "One of the most-watched music videos of all time.\n\nDemo dataset: add a YouTube Data API v3 key for live data." },
  { id: "kJQP7kiw5Fk", title: "Luis Fonsi - Despacito ft. Daddy Yankee", channelId: "ch-luis", durationSec: 282, views: 8600000000, likes: 51000000, publishedAt: "2017-01-12T12:00:00Z", description: "The reggaeton-pop anthem that dominated the world.\n\nDemo dataset: add a YouTube Data API v3 key for live data." },
  { id: "60ItHLz5WEA", title: "Alan Walker - Faded", channelId: "ch-alan", durationSec: 213, views: 3700000000, likes: 27000000, publishedAt: "2015-12-03T12:00:00Z", description: "Alan Walker's breakout electronic hit.\n\nDemo dataset: add a YouTube Data API v3 key for live data." },
  { id: "RgKAFK5djSk", title: "Wiz Khalifa - See You Again ft. Charlie Puth (Furious 7 Soundtrack)", channelId: "ch-wiz", durationSec: 238, views: 6300000000, likes: 44000000, publishedAt: "2015-04-06T12:00:00Z", description: "A tribute anthem from the Furious 7 soundtrack.\n\nDemo dataset: add a YouTube Data API v3 key for live data." },
  { id: "M7lc1UVf-VE", title: "YouTube Developers Live: Embedded Web Player Customization", channelId: "ch-ytdev", durationSec: 3581, views: 2100000, likes: 18000, publishedAt: "2013-08-27T12:00:00Z", description: "The official YouTube Developers demo video — a fitting 12th entry for this YouTube clone's demo dataset.\n\nDemo dataset: add a YouTube Data API v3 key for live data." },
  { id: "e-ORhEE9VVg", title: "Taylor Swift - Blank Space", channelId: "ch-taylor", durationSec: 273, views: 3100000000, likes: 16000000, publishedAt: "2014-11-10T12:00:00Z", description: "The satirical pop masterpiece from the 1989 era.\n\nDemo dataset: add a YouTube Data API v3 key for live data." },
  { id: "2g811Eo7K8U", title: "Adele - Hello (Official Music Video)", channelId: "ch-adele", durationSec: 367, views: 3300000000, likes: 19000000, publishedAt: "2015-10-22T12:00:00Z", description: "Adele's record-shattering comeback single.\n\nDemo dataset: add a YouTube Data API v3 key for live data." },
  { id: "dQw4w9WgXcQ", title: "Rick Astley - Never Gonna Give You Up (Official Music Video)", channelId: "ch-rick", durationSec: 213, views: 1600000000, likes: 17000000, publishedAt: "2009-10-25T12:00:00Z", description: "The most famous 80s pop song on the internet.\n\nDemo dataset: add a YouTube Data API v3 key for live data." },
  { id: "hTWKbfoikeg", title: "Nirvana - Smells Like Teen Spirit (Official Music Video)", channelId: "ch-nirvana", durationSec: 279, views: 2100000000, likes: 14000000, publishedAt: "2009-06-16T12:00:00Z", description: "The grunge anthem that defined a generation.\n\nDemo dataset: add a YouTube Data API v3 key for live data." },
  { id: "fJ9rUzIMcZQ", title: "Queen – Bohemian Rhapsody (Official Video Remastered)", channelId: "ch-queen", durationSec: 359, views: 1900000000, likes: 12000000, publishedAt: "2008-08-01T12:00:00Z", description: "Queen's legendary six-minute suite, remastered.\n\nDemo dataset: add a YouTube Data API v3 key for live data." },
];

export const DEMO_COMMENTS = [
  { id: "dc1", author: "Demo Viewer", authorColor: "#3b82f6", text: "Demo comment — connect a YouTube Data API v3 key to see real comments.", likes: 128, publishedAt: "2026-09-20T10:00:00Z" },
  { id: "dc2", author: "Music Fan 99", authorColor: "#ec4899", text: "This never gets old. Absolute classic!", likes: 86, publishedAt: "2026-09-18T14:30:00Z" },
  { id: "dc3", author: "Night Owl", authorColor: "#22d3ee", text: "Watching this in 2026 and it still hits the same.", likes: 54, publishedAt: "2026-09-15T08:12:00Z" },
  { id: "dc4", author: "Curious Cat", authorColor: "#a3e635", text: "The thumbnail brought me here, the video kept me here.", likes: 21, publishedAt: "2026-09-10T19:45:00Z" },
];
