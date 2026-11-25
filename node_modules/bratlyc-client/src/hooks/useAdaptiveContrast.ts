import { useMemo } from 'react';
import { isLightColor } from '../utils/colorLuminance';

export interface Contrast {
  ink: string;
  glass: string;
  edge: string;
}

export function useAdaptiveContrast(bg: string): Contrast {
  return useMemo(
    () =>
      isLightColor(bg)
        ? { ink: '#000000', glass: 'rgba(255,255,255,0.55)', edge: 'rgba(0,0,0,0.12)' }
        : { ink: '#FFFFFF', glass: 'rgba(18,18,18,0.45)', edge: 'rgba(255,255,255,0.18)' },
    [bg],
  );
}
