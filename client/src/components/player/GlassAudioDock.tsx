import type { ChangeEvent } from 'react';

interface Props {
  visible: boolean;
  playing: boolean;
  time: number;
  duration: number;
  trackName: string;
  focus: boolean;
  error: string;
  onToggle: () => void;
  onSeek: (t: number) => void;
  onFile: (f: File) => void;
  onOpenLyrics: () => void;
  onDemo: () => void;
  onFocus: () => void;
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const chip = 'rounded-full border px-3.5 py-2 text-[13px] font-medium transition hover:bg-black/5 active:scale-95';

export function GlassAudioDock(p: Props) {
  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) p.onFile(f);
    e.target.value = '';
  };

  return (
    <footer
      className="glass fixed bottom-4 left-1/2 z-10 flex w-[min(94vw,720px)] -translate-x-1/2 flex-wrap items-center gap-2.5 p-3 transition-opacity duration-500"
      style={{ opacity: p.visible ? 1 : 0, pointerEvents: p.visible ? 'auto' : 'none' }}
    >
      <button
        onClick={p.onToggle}
        aria-label={p.playing ? 'Pause' : 'Play'}
        className="grid h-[46px] w-[46px] place-items-center rounded-full bg-[var(--ink)] text-[var(--bg)]"
      >
        {p.playing ? '❚❚' : '▶'}
      </button>

      <div className="flex min-w-[220px] flex-1 flex-col gap-1">
        <input
          type="range"
          min={0}
          max={p.duration || 1}
          step={0.05}
          value={Math.min(p.time, p.duration || 1)}
          onChange={(e) => p.onSeek(Number(e.target.value))}
          aria-label="Seek"
          className="w-full accent-[var(--ink)]"
        />
        <div className="flex justify-between gap-2 text-xs opacity-75">
          <span className="truncate">{p.trackName}</span>
          <span className="tabular-nums">{fmt(p.time)} / {fmt(p.duration)}</span>
        </div>
      </div>

      <label className={`${chip} cursor-pointer`}>
        + audio
        <input type="file" accept="audio/*,.mp3,.wav,.ogg,.m4a" onChange={onPick} className="sr-only" />
      </label>
      <button className={chip} onClick={p.onOpenLyrics}>lyrics</button>
      <button className={chip} onClick={p.onDemo}>demo</button>
      <button
        className={`${chip} ${p.focus ? 'bg-[var(--ink)] text-[var(--bg)]' : ''}`}
        aria-pressed={p.focus}
        onClick={p.onFocus}
      >
        focus
      </button>

      {p.error && <p className="w-full text-xs text-red-600">{p.error}</p>}
    </footer>
  );
}
