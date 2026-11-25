import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { BratLyricStage } from './components/stage/BratLyricStage';
import { GlassAudioDock } from './components/player/GlassAudioDock';
import { LyricsManagerModal } from './components/controls/LyricsManagerModal';
import { useAdaptiveContrast } from './hooks/useAdaptiveContrast';
import { useAudioSync } from './hooks/useAudioSync';
import { api } from './services/apiClient';
import type { LyricLine, TrackMeta } from './types/lyrics.types';
import { parseLrcText } from './utils/lrcParser';
import { ColorPicker } from './components/controls/ColorPicker';
import { Credit } from './components/ui/Credit';

const THEMES = [
  { label: 'White', hex: '#FFFFFF' },
  { label: 'Brat Green', hex: '#8ACE00' },
];

const DEMO = `[00:00.50]lights down low, the room is humming
[00:04.00]every window hums a little too loud
[00:07.50]you're the static in my lime green dream
[00:11.00]still glowing after the balcony fall
[00:14.50]sorry about the bass, it's not my fault
[00:18.00]we are the afterparty, kind of a mess
[00:22.00]wake up in the sun and call it the grade
[00:26.00]bright and blurry, that's the whole vibe
[00:30.00]okay, that's the ending. go home now.`;

const hudStyle = (visible: boolean): CSSProperties => ({
  opacity: visible ? 1 : 0,
  pointerEvents: visible ? 'auto' : 'none',
  transition: 'opacity 0.5s ease',
});

export default function App() {
  const [bg, setBg] = useState('#FFFFFF');
  const contrast = useAdaptiveContrast(bg);

  const [lines, setLines] = useState<LyricLine[]>(() => parseLrcText(DEMO));
  const [mode, setMode] = useState<'demo' | 'audio'>('demo');
  const [playing, setPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioDur, setAudioDur] = useState(0);
  const [meta, setMeta] = useState<TrackMeta | null>(null);
  const [trackName, setTrackName] = useState('Demo · sample lyrics');
  const [focus, setFocus] = useState(false);
  const [wake, setWake] = useState(0);
  const [hudOn, setHudOn] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [error, setError] = useState('');

  const audioRef = useRef<HTMLAudioElement>(null);
  const demo = useRef({ base: 0, start: null as number | null });

  const lastTime = lines.length ? lines[lines.length - 1].time : 0;
  const duration = mode === 'audio' && audioDur > 0 ? audioDur : lastTime + 5;

  const demoTime = () =>
    demo.current.start === null ? demo.current.base : demo.current.base + (performance.now() - demo.current.start) / 1000;
  const getTime = () => (mode === 'audio' ? audioRef.current?.currentTime ?? 0 : demoTime());
  const { index, time } = useAudioSync(getTime, lines);

  // Demo stops at its end.
  useEffect(() => {
    if (mode === 'demo' && playing && duration > 0 && time >= duration) {
      demo.current = { base: duration, start: null };
      setPlaying(false);
    }
  }, [time, duration, mode, playing]);

  // Show the HUD on movement; hide it after 2.6s while playing or in focus mode.
  useEffect(() => {
    setHudOn(true);
    if (!(playing || focus)) return;
    const t = setTimeout(() => setHudOn(false), 2600);
    return () => clearTimeout(t);
  }, [playing, focus, wake]);

  // Apply the adaptive theme to CSS variables.
  useEffect(() => {
    const s = document.documentElement.style;
    s.setProperty('--bg', bg);
    s.setProperty('--ink', contrast.ink);
    s.setProperty('--glass', contrast.glass);
    s.setProperty('--edge', contrast.edge);
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', bg);
  }, [bg, contrast]);

  const togglePlay = () => {
    if (mode === 'audio') {
      const a = audioRef.current;
      if (a) a.paused ? a.play() : a.pause();
      return;
    }
    if (playing) {
      demo.current = { base: demoTime(), start: null };
      setPlaying(false);
    } else {
      demo.current = { base: demo.current.base, start: performance.now() };
      setPlaying(true);
    }
  };

  // Space toggles playback everywhere except text fields.
  useEffect(() => {
    const isField = (t: EventTarget | null) => /INPUT|TEXTAREA/.test((t as HTMLElement).tagName);
    const down = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || isField(e.target)) return;
      e.preventDefault();
      togglePlay();
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isField(e.target)) e.preventDefault();
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  });

  const seek = (t: number) => {
    if (mode === 'audio' && audioRef.current) audioRef.current.currentTime = t;
    else demo.current = { base: t, start: playing ? performance.now() : null };
  };

const autoFetchLyrics = async (m: TrackMeta) => {
  try {
    const { results } = await api.searchLyrics({ track: m.title, artist: m.artist || undefined });
    const hit = results.find((r) => r.syncedLyrics) ?? results[0];
    if (!hit) return setSheetOpen(true);
    const got = await api.getLyrics(hit.trackName, hit.artistName, hit.duration);
    if (got.synced) setLines(got.lines);
    else setSheetOpen(true);
  } catch {
    setSheetOpen(true);
  }
};

  const onFile = async (file: File) => {
    try {
      setError('');
      const m = await api.uploadAudio(file);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(URL.createObjectURL(file));
      setMeta(m);
      setTrackName(m.artist ? `${m.artist} — ${m.title}` : m.title);
      setAudioDur(m.duration || 0);
      setMode('audio');
      setPlaying(false);
      setLines([]);
autoFetchLyrics(m);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const loadDemo = () => {
    audioRef.current?.pause();
    setMode('demo');
    setPlaying(false);
    demo.current = { base: 0, start: null };
    setLines(parseLrcText(DEMO));
    setMeta(null);
    setTrackName('Demo · sample lyrics');
  };

  const onLoadLyrics = (next: LyricLine[]) => {
    setLines(next);
    setPlaying(false);
    demo.current = { base: 0, start: null };
  };

  return (
    <div onPointerMove={() => setWake((w) => w + 1)} className="min-h-dvh">
      <header
        className="fixed left-3.5 right-3.5 top-3.5 z-10 flex items-center justify-between gap-2.5"
        style={{ ...hudStyle(hudOn), paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <span className="px-1 py-1.5 text-[15px] font-semibold tracking-wide">bratlyc</span>
        <div className="glass flex items-center gap-2 rounded-full px-2 py-1.5">
          {THEMES.map((t) => (
            <button
              key={t.hex}
              aria-label={t.label}
              onClick={() => setBg(t.hex)}
              className="h-[26px] w-[26px] rounded-full border"
              style={{
                background: t.hex,
                borderColor: 'var(--edge)',
                boxShadow: bg === t.hex ? '0 0 0 2px var(--bg), 0 0 0 3.5px var(--ink)' : 'none',
              }}
            />
          ))}
          <ColorPicker value={bg} onChange={setBg} />
        </div>
      </header>

      <BratLyricStage line={lines[index] ?? null} index={index} />

      {sheetOpen && (
        <LyricsManagerModal
          initialTitle={meta?.title ?? ''}
          initialArtist={meta?.artist ?? ''}
          duration={duration}
          currentLines={lines}
          onLoad={onLoadLyrics}
          onClose={() => setSheetOpen(false)}
        />
      )}

      <GlassAudioDock
        visible={hudOn}
        playing={playing}
        time={time}
        duration={duration}
        trackName={trackName}
        focus={focus}
        error={error}
        onToggle={togglePlay}
        onSeek={seek}
        onFile={onFile}
        onOpenLyrics={() => setSheetOpen((o) => !o)}
        onDemo={loadDemo}
        onFocus={() => setFocus((f) => !f)}
      />
      <Credit visible={hudOn} />
      <audio
        ref={audioRef}
        src={mode === 'audio' ? audioUrl ?? undefined : undefined}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onLoadedMetadata={(e) => setAudioDur(e.currentTarget.duration)}
      />
    </div>
  );
}
