import { BIRDS_DATA } from '../data/birdsData';
import type { PlayerProfile } from '../types/game';

export const MINDAR_TARGET_ID = 'tucan-grande#0';
export const MINDAR_SPECIES_ID = 'tucan-grande';
export const MINDAR_REWARD_XP = 40;
export type MindARStatus = 'registered' | 'already-registered' | 'not-registered' | 'rewarded' | 'already-rewarded';
export type MindARResult = { updates: Partial<PlayerProfile>; status: MindARStatus };
export type MindARActionResult = { status: MindARStatus; saved: boolean };

export function getMindARStatus(profile: PlayerProfile, targetId = MINDAR_TARGET_ID): 'none' | 'registered' | 'rewarded' {
  const discovery = profile.mindarDiscoveries?.find(d => d.targetId === targetId && d.profileId === profile.id);
  return !discovery ? 'none' : discovery.challengeCompletedAt !== undefined ? 'rewarded' : 'registered';
}

// One discovery and one reward per target per profile; rescanning never grants XP.
export function registerMindARDiscovery(profile: PlayerProfile, now: number): MindARResult {
  if (getMindARStatus(profile) !== 'none') return { updates: {}, status: 'already-registered' };
  const bird = BIRDS_DATA.find(b => b.id === MINDAR_SPECIES_ID)!;
  return { status: 'registered', updates: {
    mindarDiscoveries: [...(profile.mindarDiscoveries || []), {
      targetId: MINDAR_TARGET_ID, speciesId: MINDAR_SPECIES_ID, profileId: profile.id, discoveredAt: now, xpAwarded: 0
    }],
    fieldJournal: [{ id: `mindar-${MINDAR_TARGET_ID}-${now}`, source: 'mindar-signal' as const, speciesId: MINDAR_SPECIES_ID,
      birdName: bird.commonName, scientificName: bird.scientificName, trailName: 'Señal MindAR · Señal Nativa',
      notes: 'Descubrimiento mediante señal MindAR (imagen escaneada). No es un avistamiento de ave real.', timestamp: now
    }, ...(profile.fieldJournal || [])].slice(0, 10)
  } };
}

export function completeMindARChallenge(profile: PlayerProfile, now: number): MindARResult {
  const status = getMindARStatus(profile);
  if (status === 'none') return { updates: {}, status: 'not-registered' };
  if (status === 'rewarded') return { updates: {}, status: 'already-rewarded' };
  return { status: 'rewarded', updates: {
    xp: profile.xp + MINDAR_REWARD_XP,
    mindarDiscoveries: profile.mindarDiscoveries!.map(d => d.targetId === MINDAR_TARGET_ID && d.profileId === profile.id
      ? { ...d, challengeCompletedAt: now, xpAwarded: MINDAR_REWARD_XP } : d)
  } };
}
