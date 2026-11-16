import { CHECKPOINTS_DATA } from '../data/birdsData';
import type { PlayerProfile } from '../types/game';
import { parseStationQr } from './stationQr';

export const STATION_REWARD_XP = 25;
export const STATION_PENDING_KEY = 'senial_nativa_pending_station_v1';

export function completeStation(profile: PlayerProfile, input: {
  stationId: number; scannedToken?: string | null; answerIndex: number;
}): { status: 'completed' | 'already-completed' | 'not-scanned' | 'wrong-answer'; updates: Partial<PlayerProfile> } {
  const existing = profile.completedCheckpoints || [];
  if (existing.includes(input.stationId)) return { status: 'already-completed', updates: {} };
  const scan = parseStationQr(input.scannedToken || '');
  if (!scan.ok || scan.stationId !== input.stationId) return { status: 'not-scanned', updates: {} };
  const station = CHECKPOINTS_DATA.find(item => item.id === input.stationId)!;
  if (input.answerIndex !== station.challenge.correctIndex) return { status: 'wrong-answer', updates: {} };
  const completedCheckpoints = [...existing, input.stationId];
  const routeComplete = CHECKPOINTS_DATA.every(item => completedCheckpoints.includes(item.id));
  return { status: 'completed', updates: {
    xp: profile.xp + STATION_REWARD_XP,
    fieldJournal: [{ id: `station-${station.id}`, source: 'station-activity', stationId: station.id,
      birdName: station.name, scientificName: '', trailName: '', notes: 'Actividad de estación completada', timestamp: Date.now()
    }, ...profile.fieldJournal.filter(entry => entry.id !== `station-${station.id}`)],
    completedCheckpoints,
    hasRouteCompleteSeal: routeComplete || profile.hasRouteCompleteSeal,
    unlockedRareBirds: routeComplete
      ? Array.from(new Set([...(profile.unlockedRareBirds || []), 'urutau', 'jote-real']))
      : profile.unlockedRareBirds || []
  } };
}

export function savePendingStationToken(token: string): void {
  try { localStorage.setItem(STATION_PENDING_KEY, token); } catch { /* storage unavailable */ }
}

export function readPendingStationToken(): string | null {
  try { return localStorage.getItem(STATION_PENDING_KEY); } catch { return null; }
}

export function clearPendingStationToken(): void {
  try { localStorage.removeItem(STATION_PENDING_KEY); } catch { /* storage unavailable */ }
}
