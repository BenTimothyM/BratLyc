import { useState } from 'react';
import { api } from '../../services/apiClient';
import type { LrclibTrack, LyricLine } from '../../types/lyrics.types';

interface Props {
  initialTitle: string;
  initialArtist: string;
  duration: number;
  currentLines: LyricLine[];
  onLoad: (lines: LyricLine[]) => void;
  onClose: () => void;
}

const btn = 'rounded-full border px-3.5 py-2 text-[13px] font-medium transition hover:bg-black/5';
const field = 'w-full rounded-xl border border-[var(--edge)] bg-white/30 px-3 py-2 text-[13px] outline-none';

export function LyricsManagerModal({ initialTitle, initialArtist, duration, currentLines, onLoad, onClose }: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [artist, setArtist] = useState(initialArtist);
  const [results, setResults] = useState<LrclibTrack[]>([]);
  const [paste, setPaste] = useState('');
  const [exported, setExported] = useState('');
  const [status, setStatus] = useState('');

  const run = async (fn: () => Promise<void>) => {
    try {
      await fn();
    } catch (e) {
      setStatus((e as Error).message);
    }
  };

  const search = () =>
    run(async () => {
      setStatus('');
      const { results } = await api.searchLyrics({ track: title, artist });
      setResults(results);
      if (!results.length) setStatus('No matches found');
    });

  const pick = (r: LrclibTrack) =>
    run(async () => {
      const got = await api.getLyrics(r.trackName, r.artistName, r.duration);
      const lines = got.synced ? got.lines : (await api.parseText(got.plainLyrics ?? '', duration)).lines;
      if (!lines.length) return setStatus('No usable lyrics for that track');
      onLoad(lines);
      setStatus(got.synced ? 'Synced lyrics loaded' : 'Only unsynced lyrics available, spread evenly');
    });

  const loadPaste = () =>
    run(async () => {
      const { lines, warnings } = await api.parseText(paste, duration || undefined);
      if (!lines.length) return setStatus('Nothing to load');
      onLoad(lines);
      setStatus(warnings[0] ?? `${lines.length} lines loaded`);
    });

  const exportLrc = () =>
    run(async () => {
      const { lrc } = await api.formatLrc(currentLines, { title, artist });
      setExported(lrc);
      setStatus('Exported. Copy the text below into a .lrc file.');
    });

  return (
    <section className="glass fixed bottom-[100px] left-1/2 z-[6] flex max-h-[58vh] w-[min(94vw,560px)] -translate-x-1/2 flex-col gap-2.5 overflow-auto p-4">
      <div className="flex items-center justify-between">
        <strong className="text-sm">lyrics</strong>
        <button className={btn} onClick={onClose}>close</button>
      </div>

      <div className="flex gap-2">
        <input className={field} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="track title" />
        <input className={field} value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="artist" />
        <button className={btn} onClick={search}>search</button>
      </div>
      {results.length > 0 && (
        <ul className="flex max-h-32 flex-col gap-1 overflow-auto text-[13px]">
          {results.map((r) => (
            <li key={r.id}>
              <button className="w-full truncate rounded-lg px-2 py-1 text-left hover:bg-black/5" onClick={() => pick(r)}>
                {r.trackName} <span className="opacity-60">— {r.artistName}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <textarea
        className={`${field} min-h-[90px] resize-y`}
        value={paste}
        onChange={(e) => setPaste(e.target.value)}
        placeholder="paste plain lyrics, or LRC lines like [00:12.40] line"
      />
      <div className="flex flex-wrap gap-2">
        <label className={`${btn} cursor-pointer`}>
          upload .lrc / .txt
          <input
            type="file"
            accept=".lrc,.txt,text/plain"
            className="sr-only"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) setPaste(await f.text());
              e.target.value = '';
            }}
          />
        </label>
        <button className={btn} onClick={loadPaste}>load</button>
        <button className={btn} onClick={exportLrc}>export .lrc</button>
      </div>

      {exported && <textarea readOnly className={`${field} min-h-[80px]`} value={exported} />}
      {status && <p className="text-xs opacity-75">{status}</p>}
    </section>
  );
}
