import type { JournalEntry, PlayerProfile } from '../types/game';
import { CHECKPOINTS_DATA } from '../data/birdsData';

export type EntryCategory = 'mindar' | 'field' | 'ai' | 'station';
export function getEntryCategory(entry: JournalEntry): EntryCategory {
  if (entry.source === 'mindar-signal') return 'mindar';
  if (entry.source === 'station-activity') return 'station';
  if (entry.source === 'ai-identification') return 'ai';
  if (!entry.source && (entry.notes?.startsWith('Foto Perfecta XR') || entry.stars !== undefined)) return 'ai';
  return 'field';
}
export const isWelcomeSeed = (entry: JournalEntry): boolean => entry.id === 'j_init';
export const countsTowardDetailBadge = (entry: JournalEntry): boolean => getEntryCategory(entry) === 'field' && !isWelcomeSeed(entry);
export const isRealObservation = (entry: JournalEntry): boolean => ['field', 'ai'].includes(getEntryCategory(entry)) && !isWelcomeSeed(entry);
export const hasPhotoEvidence = (entry: JournalEntry): boolean => getEntryCategory(entry) === 'field' && !!entry.photoId && entry.photoKind === 'user';
export function filterJournal(entries: JournalEntry[], filter: 'all' | EntryCategory | 'photos', order: 'newest' | 'oldest'): JournalEntry[] {
  return entries.filter(e => filter === 'all' || (filter === 'photos' ? !!e.photoId : getEntryCategory(e) === filter))
    .sort((a, b) => (order === 'newest' ? -1 : 1) * ((a.timestamp ?? 0) - (b.timestamp ?? 0)));
}
export function deriveStationEntries(profile: PlayerProfile): (Omit<JournalEntry, 'timestamp'> & { timestamp: undefined })[] {
  return profile.completedCheckpoints.filter(id => !profile.fieldJournal.some(e => e.source === 'station-activity' && e.stationId === id))
    .map(id => ({ id: `station-${id}`, source: 'station-activity', stationId: id,
      birdName: CHECKPOINTS_DATA.find(s => s.id === id)?.name || `Estación ${id}`, scientificName: '',
      trailName: '', notes: 'Actividad de estación completada', timestamp: undefined }));
}
