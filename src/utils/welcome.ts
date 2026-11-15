import { PlayerProfile } from '../types/game';

export function getReturningProfile(activeProfile: PlayerProfile, profiles: PlayerProfile[]): PlayerProfile | null {
  const hasProgress = activeProfile.xp > 0 ||
    (activeProfile.mindarDiscoveries?.length ?? 0) > 0 ||
    (activeProfile.fieldJournal ?? []).some(entry => entry.id !== 'j_init');
  return profiles.length > 1 || hasProgress || !['Santi Guardián', 'Explorador Yungas'].includes(activeProfile.name)
    ? activeProfile
    : null;
}
