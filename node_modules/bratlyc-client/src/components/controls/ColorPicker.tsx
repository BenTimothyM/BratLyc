import { useEffect, useRef, useState } from 'react';

type HSV = { h: number; s: number; v: number };

function hexToHsv(hex: string): HSV {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  return { h, s: max ? d / max : 0, v: max };
}

function hsvToHex({ h, s, v }: HSV): string {
  const c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c;
  const [r, g, b] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x]
    : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return '#' + [r, g, b].map((v) => Math.round((v + m) * 255).toString(16).padStart(2, '0')).join('');
}

interface Props {
  value: string;
  onChange: (hex: string) => void;
}

export function ColorPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [hsv, setHsv] = useState<HSV>(() => hexToHsv(value));
  const wrap = useRef<HTMLDivElement>(null);
  const area = useRef<HTMLDivElement>(null);

  // Sync when the color changes from outside (e.g. the White/Green swatches).
  useEffect(() => {
    if (hsvToHex(hsv) !== value.toLowerCase()) setHsv(hexToHsv(value));
  }, [value]);

  // Close when clicking outside.
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  const update = (next: HSV) => {
    setHsv(next);
    onChange(hsvToHex(next));
  };

  const dragArea = (e: React.PointerEvent) => {
    const rect = area.current!.getBoundingClientRect();
    const s = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const v = Math.min(1, Math.max(0, 1 - (e.clientY - rect.top) / rect.height));
    update({ ...hsv, s, v });
  };

  const hex = hsvToHex(hsv);

  return (
    <div ref={wrap} className="relative flex h-[26px] w-[26px]">
      <button
  aria-label="Pick background color"
  onClick={() => setOpen((o) => !o)}
  className="block h-[26px] w-[26px] rounded-full p-[2px] transition hover:scale-105"
  style={{ background: 'conic-gradient(#f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)' }}
>
  <span
    className="block h-full w-full rounded-full"
    style={{ background: value, boxShadow: 'inset 0 0 0 1px rgba(127,127,127,0.4)' }}
  />
</button>

      {open && (
        <div className="glass absolute right-0 top-10 z-20 flex w-[240px] flex-col gap-3 p-3.5">
          <div
            ref={area}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              dragArea(e);
            }}
            onPointerMove={(e) => e.buttons && dragArea(e)}
            className="relative h-40 w-full cursor-crosshair touch-none overflow-hidden rounded-2xl"
            style={{
              background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hsv.h} 100% 50%))`,
            }}
          >
            <span
              className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
              style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` }}
            />
          </div>

          <input
            type="range"
            min={0}
            max={360}
            value={hsv.h}
            onChange={(e) => update({ ...hsv, h: Number(e.target.value) })}
            aria-label="Hue"
            className="hue-slider"
          />

          <div className="flex items-center gap-2.5">
            <span className="h-7 w-7 shrink-0 rounded-full border" style={{ background: hex, borderColor: 'var(--edge)' }} />
            <input
              value={hex}
              onChange={(e) => {
                if (/^#[0-9a-f]{6}$/i.test(e.target.value)) update(hexToHsv(e.target.value));
              }}
              maxLength={7}
              className="w-full rounded-xl border border-[var(--edge)] bg-white/30 px-3 py-1.5 text-[13px] uppercase outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}