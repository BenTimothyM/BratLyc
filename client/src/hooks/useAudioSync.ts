import { useEffect, useRef, useState } from 'react';
import type { LyricLine } from '../types/lyrics.types';

/**
 * Polls the current playback time each animation frame and returns the index of
 * the last line whose timestamp has passed. `getTime` abstracts over the audio
 * element and the demo clock.
 */
export function useAudioSync(getTime: () => number, lines: LyricLine[]) {
  const [index, setIndex] = useState(-1);
  const [time, setTime] = useState(0);
  const getRef = useRef(getTime);
  getRef.current = getTime;

  useEffect(() => {
    let raf = 0;
    let last = -2;
    const tick = () => {
      const t = getRef.current();
      setTime(t);
      let idx = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].time <= t) idx = i;
        else break;
      }
      if (idx !== last) {
        last = idx;
        setIndex(idx);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [lines]);

  return { index, time };
}
