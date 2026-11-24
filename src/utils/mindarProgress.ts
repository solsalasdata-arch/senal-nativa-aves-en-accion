import { BIRDS_DATA, CATALOG_BIRDS_DATA } from '../data/birdsData';
import type { PlayerProfile } from '../types/game';

export const MINDAR_TARGETS = [
  { targetIndex: 0, speciesId: '001-chingolo' },
  { targetIndex: 1, speciesId: 'tucan-grande' },
  { targetIndex: 2, speciesId: '007-benteveo' },
  { targetIndex: 3, speciesId: '014-hornero' }
] as const;
export const MINDAR_INITIAL_UNLOCKS = ['001-chingolo', 'tucan-grande'] as const;
export const MINDAR_TARGET_ID = 'tucan-grande#1';
export const MINDAR_SPECIES_ID = 'tucan-grande';
const LEGACY_TOUCAN_TARGET_ID = 'tucan-grande#0';
export const MINDAR_REWARD_XP = 40;
export type MindARStatus = 'registered' | 'already-registered' | 'not-registered' | 'rewarded' | 'already-rewarded';
export type MindARResult = { updates: Partial<PlayerProfile>; status: MindARStatus };
export type MindARActionResult = { status: MindARStatus; saved: boolean };

function targetForIndex(targetIndex: number) {
  return MINDAR_TARGETS.find(target => target.targetIndex === targetIndex);
}

function discoveryForTarget(profile: PlayerProfile, targetIndex: number) {
  const target = targetForIndex(targetIndex);
  if (!target) return undefined;
  return profile.mindarDiscoveries?.find(d => d.profileId === profile.id && (
    d.targetId === `${target.speciesId}#${targetIndex}` ||
    (target.speciesId === MINDAR_SPECIES_ID && d.targetId === LEGACY_TOUCAN_TARGET_ID)
  ));
}

export function getMindARStatus(profile: PlayerProfile, targetIndex = 1): 'none' | 'registered' | 'rewarded' {
  const discovery = discoveryForTarget(profile, targetIndex);
  return !discovery ? 'none' : discovery.challengeCompletedAt !== undefined ? 'rewarded' : 'registered';
}

export function isMindARTargetUnlocked(profile: PlayerProfile, targetIndex: number): boolean {
  const target = targetForIndex(targetIndex);
  if (!target) return false;
  if (getMindARStatus(profile, targetIndex) !== 'none') return true;
  if (targetIndex <= 1) return true;
  return getMindARStatus(profile, targetIndex - 1) !== 'none';
}

// One discovery and one reward per target per profile; rescanning never grants XP.
export function registerMindARDiscovery(profile: PlayerProfile, now: number, targetIndex = 1): MindARResult {
  const target = targetForIndex(targetIndex);
  if (!target) return { updates: {}, status: 'not-registered' };
  if (getMindARStatus(profile, targetIndex) !== 'none') return { updates: {}, status: 'already-registered' };
  if (!isMindARTargetUnlocked(profile, targetIndex)) return { updates: {}, status: 'not-registered' };
  const bird = CATALOG_BIRDS_DATA.find(b => b.id === target.speciesId)
    ?? BIRDS_DATA.find(b => b.id === target.speciesId);
  if (!bird) return { updates: {}, status: 'not-registered' };
  const targetId = `${target.speciesId}#${targetIndex}`;
  return { status: 'registered', updates: {
    mindarDiscoveries: [...(profile.mindarDiscoveries || []), {
      targetId, speciesId: target.speciesId, profileId: profile.id, discoveredAt: now, xpAwarded: 0
    }],
    unlockedSilhouettes: Array.from(new Set([...(profile.unlockedSilhouettes || []), target.speciesId,
      ...(MINDAR_TARGETS.find(candidate => candidate.targetIndex === targetIndex + 1)?.speciesId
        ? [MINDAR_TARGETS.find(candidate => candidate.targetIndex === targetIndex + 1)!.speciesId]
        : [])])),
    fieldJournal: [{ id: `mindar-${targetId}-${now}`, source: 'mindar-signal' as const, speciesId: target.speciesId,
      birdName: bird.commonName, scientificName: bird.scientificName, trailName: 'Señal MindAR · Señal Nativa',
      notes: 'Descubrimiento mediante señal MindAR (imagen escaneada). No es un avistamiento de ave real.', timestamp: now
    }, ...(profile.fieldJournal || [])]
  } };
}

export function completeMindARChallenge(profile: PlayerProfile, now: number, targetIndex = 1): MindARResult {
  const status = getMindARStatus(profile, targetIndex);
  if (status === 'none') return { updates: {}, status: 'not-registered' };
  if (status === 'rewarded') return { updates: {}, status: 'already-rewarded' };
  return { status: 'rewarded', updates: {
    xp: profile.xp + MINDAR_REWARD_XP,
    mindarDiscoveries: profile.mindarDiscoveries!.map(d => discoveryForTarget({ ...profile, mindarDiscoveries: [d] }, targetIndex)
      ? { ...d, challengeCompletedAt: now, xpAwarded: MINDAR_REWARD_XP } : d)
  } };
}
