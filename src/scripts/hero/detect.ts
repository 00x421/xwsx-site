export type Tier = 1 | 2 | 3;

export function detectTier(): Tier {
  const w = window.screen.width;
  const nav = navigator as Navigator & { deviceMemory?: number };

  // Small screens → tier-3 (CSS only)
  if (w < 768) return 3;

  // Mid-range heuristic
  const cores = navigator.hardwareConcurrency || 2;
  const memory = nav.deviceMemory || 4;

  if (cores <= 4 || memory <= 2) return 2;

  return 1;
}
