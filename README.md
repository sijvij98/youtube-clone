# MyTube — a working YouTube clone

A Next.js 14 (App Router) app that works like real YouTube: a home feed of trending
videos, a search bar that finds real videos **and** channels, a watch page with a
playable embedded player, and channel pages. All YouTube Data API v3 calls go
through server-side API routes, so the API key never reaches the browser.

## Features

- **Home (`/`)** — trending videos (`videos.list` chart=mostPopular, region IN),
  category chips, responsive grid, dark YouTube-style theme.
- **Search (`/results?search_query=...`)** — mixed results via `search.list`
  (type=video,channel): channel rows first, then video rows.
- **Watch (`/watch?v=VIDEO_ID`)** — embedded YouTube player, channel row with
  local subscribe toggle, like/dislike (local state), expandable description,
  comments (`commentThreads.list`), related videos sidebar.
- **Channel (`/channel/CHANNEL_ID` or `/channel/@handle`)** — banner, avatar,
  stats, Videos / About tabs, latest uploads.
- **Extras** — collapsible sidebar, watch history (localStorage), subscriptions
  (localStorage), loading skeletons, error states, fully responsive.

## Demo mode (no API key needed)

If `YOUTUBE_API_KEY` is not set, every API route serves a built-in demo dataset
(~12 real public YouTube video IDs, so thumbnails and embeds actually work).
A banner and a DEMO pill make it obvious; demo stats are illustrative and demo
channels show no fabricated subscriber counts.

## Getting a free YouTube Data API v3 key

The free quota is **10,000 units/day** (a `search.list` call costs 100 units,
`videos.list` / `channels.list` cost 1 unit).

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) and create
   (or select) a project.
2. **APIs & Services → Library** → search **"YouTube Data API v3"** → **Enable**.
3. **APIs & Services → Credentials** → **Create Credentials → API key**.
4. Click the key → **Restrict key** → under *API restrictions* choose
   **"YouTube Data API v3"** only (and optionally restrict by HTTP referrer).
5. Copy the key into `.env.local` (never commit it):

```bash
cp .env.example .env.local
# then edit .env.local and set YOUTUBE_API_KEY=your_key_here
```

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build check
```

## Deploy on Vercel

1. Push this folder to a GitHub repo (do **not** commit `.env.local`).
2. Import the repo in Vercel → framework preset **Next.js**.
3. In **Project Settings → Environment Variables** add `YOUTUBE_API_KEY`
   with your key (all environments).
4. Deploy. The app reads the key server-side at request time — no rebuild
   needed when you rotate it.

## Project layout

```
app/
  layout.jsx            # root layout + AppShell (header/sidebar)
  page.jsx              # home feed
  results/page.jsx      # search results
  watch/page.jsx        # watch page
  channel/[id]/page.jsx # channel page (@handle supported)
  history/page.jsx      # localStorage watch history
  subscriptions/page.jsx
  api/
    _lib/youtube.js     # server helper: live API <-> demo fallback
    _lib/demo-data.js   # demo dataset
    trending|search|video|comments|related|channel|channel-videos|config
components/             # Header, Sidebar, VideoCard, WatchClient, ...
lib/format.js           # view counts, relative time, durations
```
