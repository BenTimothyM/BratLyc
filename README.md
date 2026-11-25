# BratLyc

Synced lyric visualizer with a glassmorphic UI. React + Vite + Tailwind + Framer Motion on the client, Express 5 + TypeScript on the server.

## Run

```bash
npm install            # installs both workspaces
npm run dev            # API on :5174, client on :5173
```

Optional server env (`server/.env`): `PORT`, `CLIENT_ORIGIN`, `MAX_UPLOAD_MB`.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/lyrics/search?q=` or `?track=&artist=` | LRCLIB search, cached 6h |
| GET | `/api/lyrics/get?track=&artist=&duration=` | Single track lookup, returns parsed lines |
| POST | `/api/lyrics/parse` `{ text, duration? }` | Parses LRC or plain text into timed lines |
| POST | `/api/lyrics/format` `{ lines, title?, artist? }` | Returns a valid `.lrc` string |
| POST | `/api/metadata` (multipart `audio`) | ID3 title, artist, album, duration |

## Not yet included

Tap-to-Sync studio, a separate ThemeSwitcher component, GlassPanel wrapper, Zen mode beyond the focus toggle, Express type declarations, and automated tests.
