# BratLyc

An interactive music player and synchronized lyric visualizer inspired by the *Brat* album aesthetic, with a glassmorphism interface. Load your own audio, fetch time-synced lyrics automatically, or write and export your own `.lrc` files.

![Status](https://img.shields.io/badge/status-active-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-%3E%3D20-339933)

---

## Features

- **Synchronized lyric display.** Lines appear one at a time, with words revealed in sequence and the previous line cleared when the next one starts.
- **Automatic lyric lookup.** Search the [LRCLIB](https://lrclib.net) database by title and artist, with results cached on the server.
- **Audio metadata detection.** Track title, artist, album, and duration are read from ID3 tags when you upload a file.
- **Three ways to add lyrics:** search online, paste plain text or LRC, or upload a `.lrc` / `.txt` file.
- **Lyric export.** Export lyrics as valid `.lrc` text with title and artist tags.
- **Adaptive theme.** Pick any background color with the built-in picker. Text and glass panels switch between black and white automatically to keep contrast readable.
- **Focus mode.** Hides all controls so only the lyrics remain. Controls also fade automatically while playing.
- **Demo mode.** Try the interface with built-in sample lyrics before loading your own audio.
- **Responsive layout** for phones, tablets, and desktops, with safe-area support for notched devices.

## Tech Stack

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Framer Motion

**Backend:** Node.js, Express 5, TypeScript, Multer, music-metadata, node-cache

## Project Structure

```
bratlyc/
├── client/                  # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── components/      # stage, player, controls, ui
│   │   ├── hooks/           # audio sync, adaptive contrast
│   │   ├── services/        # typed API client
│   │   ├── styles/          # global CSS and typography
│   │   ├── types/
│   │   └── utils/           # LRC parser, color luminance
│   └── vercel.json          # Vercel rewrites for SPA and API
├── server/                  # Express + TypeScript API
│   └── src/
│       ├── config/          # environment variables
│       ├── controllers/     # lyrics and metadata handlers
│       ├── middlewares/     # uploads, error handling
│       ├── routes/
│       └── services/        # LRCLIB integration, LRC formatter
├── LICENSE
├── package.json             # workspace scripts
└── README.md
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 20 or newer
- npm (included with Node.js)

### Installation

```bash
git clone https://github.com/BenTimothyM/bratlyc.git
cd bratlyc
npm install
```

### Development

```bash
npm run dev
```

This starts both services:

- Frontend: http://localhost:5173
- API: http://localhost:5174

Optional server configuration can be placed in `server/.env`:

```env
PORT=5174
CLIENT_ORIGIN=http://localhost:5173
MAX_UPLOAD_MB=60
```

### Production Build

```bash
npm run build
```

This produces `client/dist` and `server/dist`.

## API Reference

All endpoints are prefixed with `/api`.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | Health check. Returns `{ "ok": true }`. |
| `GET` | `/lyrics/search?q=` or `?track=&artist=` | Search LRCLIB. Results are cached for 6 hours. |
| `GET` | `/lyrics/get?track=&artist=&duration=` | Fetch one track and return parsed lyric lines. |
| `POST` | `/lyrics/parse` | Body: `{ "text", "duration?" }`. Parses LRC or plain text into timed lines. |
| `POST` | `/lyrics/format` | Body: `{ "lines", "title?", "artist?" }`. Returns a valid `.lrc` string. |
| `POST` | `/metadata` | Multipart upload with field `audio`. Returns title, artist, album, and duration. |

Accepted audio formats: MP3, WAV, OGG, and M4A.

## Deployment

The frontend is designed for Vercel and the backend for any Node.js host such as Render.

1. **Backend (Render):** create a Web Service with Root Directory `server`, Build Command `npm install && npm run build`, and Start Command `npm start`. Set `CLIENT_ORIGIN` to your frontend URL.
2. **Rewrites:** create `client/vercel.json` and point `/api/:path*` to your backend URL. Add a fallback rule so `/(.*)` serves `/index.html`.
3. **Frontend (Vercel):** import the repository, set Root Directory to `client`, and deploy. Vite is detected automatically.

Pushes to `main` trigger automatic redeploys on both platforms.

## Known Limitations

- Tap-to-Sync, which records line timestamps by pressing Space while the track plays, is not yet implemented in the React version.
- Free-tier hosts may sleep when idle, so the first request can be slow.
- Lyric availability depends on LRCLIB. Tracks without synced lyrics are spread evenly across the song.

## Contributing

Contributions are welcome. Please open an issue to discuss significant changes before submitting a pull request.

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit your changes and open a pull request.

## Credits

Created by **Ben Timothy**

- Portfolio: https://nneb.is-a.dev/
- GitHub: https://github.com/BenTimothyM

Lyrics are provided by [LRCLIB](https://lrclib.net). This project is not affiliated with or endorsed by Charli XCX or her record label.

## License

This project is licensed under the [MIT License](./LICENSE).
