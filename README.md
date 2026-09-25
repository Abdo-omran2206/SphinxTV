# 🎬 SphinxTV

> **The Modern Egyptian-Inspired Live Entertainment & Broadcast Streaming Platform**

SphinxTV is a premium, high-performance streaming discovery experience featuring a cinematic dark UI, Egyptian gold & neon cyan visual identity, glassmorphism cards, and resilient HLS streaming.

---

## 🎨 Visual Identity & Palette

- **Background**: `#0B0F1A` (Dark black-blue)
- **Primary / Identity**: Gold `#D4AF37` / `#FFD700` (Sphinx Gold)
- **Secondary**: Deep Blue `#0A1F44`
- **Accent**: Neon Cyan `#00E5FF`
- **UI Style**: Glassmorphism, smooth animations, gold glow accents, and responsive Netflix-level grid design.

---

## 🚀 Key Features

- 🇪🇬 **Egyptian & Global Channels**: Curated Egyptian TV (Rotana, Nile Cinema, etc.) alongside global news, sports, and cinema.
- 📡 **Resilient HLS Streaming Engine**: Auto-switching between direct client HLS and server-side CORS stream proxy with loop prevention.
- 🏺 **Glassmorphic UI**: Ultra-clean dark theme with gold gradients, cyan live beacons, and custom scrollbars.
- ❤️ **Persistent Favorites**: Instant channel bookmarking powered by Zustand and local storage.
- 🔍 **Instant Search & Country/Category Filtering**: Real-time filtering with badge counts and scroll pills.
- 🛡️ **Stream Relay & Error Recovery**: Built-in CORS bypass proxy for live m3u8 playlists and media segments.

---

## 📁 Architecture & File Structure

```text
sphinxtv/
├── app/
│   ├── api/
│   │   ├── channels/
│   │   │   ├── route.ts              # Channels query & search endpoint
│   │   │   └── [id]/route.ts         # Channel detail endpoint
│   │   └── stream/
│   │       └── proxy/
│   │           └── route.ts          # M3U8 & TS CORS stream proxy
│   ├── channel/
│   │   └── [id]/
│   │       ├── error.tsx
│   │       ├── loading.tsx
│   │       └── page.tsx              # SphinxTV watch experience
│   ├── live/
│   │   ├── error.tsx
│   │   ├── loading.tsx
│   │   └── page.tsx                  # SphinxTV live explorer
│   ├── globals.css                   # SphinxTV glassmorphism & gradients
│   ├── layout.tsx                    # Shell layout with SphinxTV logo & navbar
│   └── page.tsx                      # SphinxTV home discovery page
├── components/
│   ├── channel/
│   │   ├── category-filter.tsx
│   │   ├── channel-card.tsx
│   │   └── channel-list.tsx
│   ├── player/
│   │   └── video-player.tsx          # Adaptive HLS player with relay support
│   └── navbar.tsx                    # SphinxTV gold emblem topbar
├── lib/
│   ├── api.ts
│   ├── iptv.ts                       # Stream fetcher with Egypt priority & caching
│   └── utils.ts
├── store/
│   ├── useSphinxStore.ts             # State management with sphinxtv-storage
│   └── useChannelStore.ts            # Backwards compatibility alias
├── types/
│   └── channel.ts
├── tailwind.config.ts                # SphinxTV colors & shadows
└── package.json
```

---

## 🛠️ Run Locally

```bash
cmd /c npm install
cmd /c npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)
