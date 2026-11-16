import type { JournalEntry, PlayerProfile } from '../types/game';
import { countsTowardDetailBadge, getEntryCategory, isWelcomeSeed } from './journal';

export type RewardResult = { updates: Partial<PlayerProfile>; status: 'awarded' | 'already-awarded' };
export function awardDetailBadge(profile: PlayerProfile): RewardResult {
  if (profile.hasDetailObserverBadge || profile.rewardLedger?.includes('badge:detail') || profile.fieldJournal.filter(countsTowardDetailBadge).length < 10)
    return { updates: {}, status: 'already-awarded' };
  return { status: 'awarded', updates: { xp: profile.xp + 100, hasDetailObserverBadge: true, rewardLedger: [...(profile.rewardLedger || []), 'badge:detail'] } };
}
function speciesKey(entry: JournalEntry): string { return entry.scientificName || entry.speciesId || entry.birdName; }
export function awardJournalEntry(profile: PlayerProfile, entry: JournalEntry): RewardResult {
  if (profile.fieldJournal.some(e => e.id === entry.id)) return { updates: {}, status: 'already-awarded' };
  const category = getEntryCategory(entry);
  const ai = category === 'ai';
  const identity = speciesKey(entry);
  const key = `${ai ? 'ai' : 'field'}-species:${identity}`;
  const eligible = (category === 'field' || ai) && !isWelcomeSeed(entry);
  const older = profile.fieldJournal.some(e => !isWelcomeSeed(e) && getEntryCategory(e) === category &&
    speciesKey(e) === identity);
  const awarded = eligible && !older && !profile.rewardLedger?.includes(key);
  const next: PlayerProfile = { ...profile, fieldJournal: [entry, ...profile.fieldJournal],
    xp: profile.xp + (awarded ? ai ? 50 : 30 : 0),
    rewardLedger: eligible ? Array.from(new Set([...(profile.rewardLedger || []), key])) : profile.rewardLedger,
    sightingsCompleted: profile.sightingsCompleted + (ai ? 1 : 0),
    birdPhotoStars: ai ? { ...profile.birdPhotoStars, [entry.speciesId || identity]: Math.max(profile.birdPhotoStars[entry.speciesId || identity] || 0, entry.selfAssessment?.stars || entry.stars || 0) } : profile.birdPhotoStars };
  const badge = awardDetailBadge(next);
  return { status: awarded || badge.status === 'awarded' ? 'awarded' : 'already-awarded', updates: {
    fieldJournal: next.fieldJournal, xp: next.xp, rewardLedger: next.rewardLedger,
    sightingsCompleted: next.sightingsCompleted, birdPhotoStars: next.birdPhotoStars, ...badge.updates
  } };
}
export function awardCompanionPhoto(profile: PlayerProfile, bird: string): RewardResult {
  const key = `companion-photo:${bird}`;
  if (profile.rewardLedger?.includes(key)) return { updates: {}, status: 'already-awarded' };
  return { status: 'awarded', updates: { xp: profile.xp + 25, rewardLedger: [...(profile.rewardLedger || []), key] } };
}
export function awardQuizLevelUp(profile: PlayerProfile): RewardResult {
  if (profile.hasRisingObserverBadge) return { updates: {}, status: 'already-awarded' };
  return { status: 'awarded', updates: { xp: profile.xp + 150, level: profile.level + 1, hasRisingObserverBadge: true,
    questionsAnswered: Math.max(5, profile.questionsAnswered),
    missions: profile.missions.map(m => m.id === 'm-desafiante' ? { ...m, progress: Math.max(5, m.progress), completed: true } : m) } };
}
