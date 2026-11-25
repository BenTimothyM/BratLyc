import type { LyricLine } from '../../types/lyrics.types';
import { WordAnimator } from './WordAnimator';

interface Props {
  line: LyricLine | null;
  index: number;
}

/** Only the active line is mounted. Changing `index` remounts it, which clears the previous sentence. */
export function BratLyricStage({ line, index }: Props) {
  return (
    <main className="pointer-events-none fixed inset-0 z-[1] grid place-items-center">
      <div className="stage-square">
        <div className="brat-text w-full text-left" style={{ fontSize: 'clamp(30px, 6.2vw, 58px)' }} aria-live="polite">
          {line ? <WordAnimator key={index} text={line.text} /> : <span className="font-normal opacity-35">press play</span>}
        </div>
      </div>
    </main>
  );
}
