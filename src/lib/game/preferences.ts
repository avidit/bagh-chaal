import type { GameVariant, PlayerSide } from './types';

const STORAGE_KEY = 'bagh-chaal-setup';

export type SetupPreferences = {
  variant: GameVariant;
  side: PlayerSide;
};

export function loadSetupPreferences(): SetupPreferences | null {
  if (typeof localStorage === 'undefined') return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;

    const { variant, side } = parsed as Partial<SetupPreferences>;
    if (variant !== 'mini' && variant !== 'standard') return null;
    if (side !== 'tiger' && side !== 'goat') return null;

    return { variant, side };
  } catch {
    return null;
  }
}

export function saveSetupPreferences(prefs: SetupPreferences): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}
