import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultProfile, saveProfilesList, loadProfilesList, commitProfile } from '../src/utils/storage';
import { countsTowardDetailBadge, deriveStationEntries, filterJournal, getEntryCategory, hasPhotoEvidence, isRealObservation } from '../src/utils/journal';
import { awardJournalEntry, awardCompanionPhoto, awardQuizLevelUp } from '../src/utils/rewards';
import { buildBackup, parseBackup } from '../src/utils/backup';
import { completeMindARChallenge, registerMindARDiscovery } from '../src/utils/mindarProgress';
import { completeStation } from '../src/utils/stationProgress';
import { CHECKPOINTS_DATA } from '../src/data/birdsData';
import { buildStationToken } from '../src/utils/stationQr';
import type { JournalEntry } from '../src/types/game';

function storage() {
  const data = new Map<string, string>();
  let fail = false;
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => { if (fail) throw new DOMException('Blocked', 'SecurityError'); data.set(key, value); },
    removeItem: (key: string) => data.delete(key),
    get length() { return data.size; },
    key: (index: number) => [...data.keys()][index] ?? null
  } });
  return { data, fail: (value: boolean) => { fail = value; } };
}
function entry(id: string, source: JournalEntry['source'] = 'field'): JournalEntry {
  return { id, source, speciesId: 'bird', birdName: 'Ave', scientificName: 'Bird species', trailName: '', notes: '', timestamp: 100 };
}
test('corrupt JSON recovery keeps a stable displayed profile that can commit progress', () => {
  const fake = storage();
  fake.data.set('senial_nativa_profiles_list_v2', '{broken');
  const displayed = loadProfilesList()[0];
  assert.equal(loadProfilesList()[0].id, displayed.id);
  const result = commitProfile(displayed.id, () => ({ updates: { xp: 30 } }));
  assert.equal(result.saved, true);
  assert.equal(loadProfilesList()[0].xp, 30);
  assert.ok([...fake.data.entries()].some(([key, value]) => key.startsWith('senial_nativa_profiles_corrupt_') && value === '{broken'));
});
test('categories, legacy classification, filters, evidence and synthetic stations', () => {
  const entries = [entry('f'), entry('ai', 'ai-identification'), entry('m', 'mindar-signal'), entry('s', 'station-activity')];
  assert.deepEqual(entries.map(getEntryCategory), ['field', 'ai', 'mindar', 'station']);
  for (const category of ['field', 'ai', 'mindar', 'station'] as const) assert.equal(filterJournal(entries, category, 'oldest').length, 1);
  assert.equal(getEntryCategory({ ...entry('legacy'), source: undefined, stars: 1 }), 'ai');
  assert.equal(getEntryCategory({ ...entry('legacy'), source: undefined, notes: 'Foto Perfecta XR prueba' }), 'ai');
  assert.equal(hasPhotoEvidence({ ...entries[0], photoUrl: '/assets/bird.jpg' }), false);
  const photo = { ...entries[0], photoId: 'photo', photoKind: 'user' as const };
  assert.equal(hasPhotoEvidence(photo), true);
  assert.equal(filterJournal([photo], 'photos', 'newest').length, 1);
  assert.deepEqual(entries.map(countsTowardDetailBadge), [true, false, false, false]);
  assert.deepEqual(entries.map(isRealObservation), [true, true, false, false]);
  assert.equal(isRealObservation(createDefaultProfile().fieldJournal[0]), false);
  assert.equal(countsTowardDetailBadge(createDefaultProfile().fieldJournal[0]), false);
  assert.deepEqual(filterJournal([entry('old'), { ...entry('new'), timestamp: 200 }], 'all', 'newest').map(e => e.id), ['new', 'old']);
  const p = { ...createDefaultProfile(), completedCheckpoints: [1] };
  assert.equal(deriveStationEntries(p)[0].timestamp, undefined);
  assert.equal(deriveStationEntries({ ...p, fieldJournal: [{ ...entry('station-1', 'station-activity'), stationId: 1 }] }).length, 0);
});
test('atomic rewards survive double call, reload, restore, failed write and separate profiles', () => {
  const fake = storage();
  const p = createDefaultProfile();
  const other = { ...createDefaultProfile(), id: 'other' };
  saveProfilesList([p, other]);
  const apply = (e: JournalEntry) => commitProfile(p.id, latest => awardJournalEntry(latest, e));
  fake.fail(true);
  const failed = apply(entry('1'));
  assert.equal(failed.saved, false);
  assert.equal(failed.profile.xp, 0);
  fake.fail(false);
  assert.equal(apply(entry('1')).profile.xp, 30);
  assert.equal(apply(entry('1')).profile.xp, 30);
  assert.equal(loadProfilesList()[0].fieldJournal.length, 2);
  assert.equal(apply(entry('2')).profile.xp, 30);
  assert.equal(loadProfilesList()[1].xp, 0);
  const restored = parseBackup(JSON.stringify(buildBackup(loadProfilesList()[0])));
  assert.equal(restored.ok, true);
  if (!restored.ok) return;
  commitProfile(p.id, () => ({ updates: restored.profile }));
  assert.equal(apply(entry('3')).profile.xp, 30);
  const legacy = { ...loadProfilesList()[0], rewardLedger: undefined };
  assert.equal(awardJournalEntry(legacy, entry('4')).updates.xp, 30);
  assert.equal(commitProfile(other.id, latest => awardJournalEntry(latest, entry('1'))).profile.xp, 30);
  for (let i = 4; i <= 12; i++) apply(entry(String(i)));
  const full = loadProfilesList()[0];
  assert.equal(full.fieldJournal.length, 13);
  assert.equal(full.xp, 130);
  assert.equal(full.hasDetailObserverBadge, true);
  assert.equal(apply(entry('13')).profile.xp, 130);
  assert.equal(awardCompanionPhoto(full, 'tucan').updates.xp, 155);
  const rewarded = { ...full, ...awardCompanionPhoto(full, 'tucan').updates };
  assert.equal(awardCompanionPhoto(rewarded, 'tucan').status, 'already-awarded');
  assert.equal(awardQuizLevelUp({ ...full, hasRisingObserverBadge: true }).status, 'already-awarded');
});
test('AI XP is species based, stars do not multiply it and repeated captures are retained', () => {
  const p = createDefaultProfile();
  const first = { ...p, ...awardJournalEntry(p, { ...entry('ai', 'ai-identification'), selfAssessment: { checks: ['a'], stars: 1 } }).updates };
  assert.equal(first.xp, 50);
  const second = { ...first, ...awardJournalEntry(first, { ...entry('ai2', 'ai-identification'), selfAssessment: { checks: ['a', 'b', 'c'], stars: 3 } }).updates };
  assert.equal(second.xp, 50);
  assert.equal(second.sightingsCompleted, 2);
  assert.equal(second.birdPhotoStars.bird, 3);
});

test('legacy XR and new AI entries share scientific identity but stars use catalog id', () => {
  const p = { ...createDefaultProfile(), xp: 50, fieldJournal: [
    { ...entry('legacy'), source: undefined, speciesId: undefined, notes: 'Foto Perfecta XR', stars: 2 }
  ] };
  const result = awardJournalEntry(p, { ...entry('new', 'ai-identification'), speciesId: 'catalog-bird', stars: 3 });
  assert.equal(result.updates.xp, 50);
  assert.deepEqual(result.updates.rewardLedger, ['ai-species:Bird species']);
  assert.equal(result.updates.birdPhotoStars?.['catalog-bird'], 3);
  const next = { ...p, ...result.updates, fieldJournal: [] };
  assert.equal(awardJournalEntry(next, { ...entry('after-restore', 'ai-identification'), speciesId: 'catalog-bird' }).updates.xp, 50);
});

test('identical corrupt data is copied only once across loads and saves', () => {
  const fake = storage();
  const key = 'senial_nativa_profiles_list_v2';
  fake.data.set(key, '{broken');
  loadProfilesList();
  loadProfilesList();
  assert.equal([...fake.data.keys()].filter(k => k.startsWith('senial_nativa_profiles_corrupt_')).length, 1);
  saveProfilesList([createDefaultProfile()]);
  fake.data.set(key, '{broken');
  saveProfilesList([createDefaultProfile()]);
  assert.equal([...fake.data.keys()].filter(k => k.startsWith('senial_nativa_profiles_corrupt_')).length, 1);
});
test('backup roundtrip preserves MindAR, station progress, all progress and photo references', () => {
  storage();
  let p = createDefaultProfile();
  p = { ...p, ...registerMindARDiscovery(p, 1).updates };
  p = { ...p, ...completeMindARChallenge(p, 2).updates };
  const station = CHECKPOINTS_DATA[0];
  p = { ...p, ...completeStation(p, { stationId: station.id, scannedToken: buildStationToken(station.id), answerIndex: station.challenge.correctIndex }).updates };
  assert.equal(p.fieldJournal[0].source, 'station-activity');
  assert.equal(p.fieldJournal[0].scientificName, '');
  assert.equal(p.fieldJournal.filter(isRealObservation).length, 0);
  assert.equal(p.fieldJournal.filter(countsTowardDetailBadge).length, 0);
  assert.equal(completeStation(p, { stationId: station.id, scannedToken: '', answerIndex: 0 }).status, 'already-completed');
  const backup = buildBackup(p, []);
  const result = parseBackup(JSON.stringify(backup));
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(result.profile, p);
  saveProfilesList([result.profile]);
  assert.deepEqual(loadProfilesList()[0], p);
  assert.equal(completeMindARChallenge(result.profile, 3).status, 'already-rewarded');
  assert.equal(parseBackup(JSON.stringify({ profile: p })).ok, true);
  assert.equal(parseBackup(JSON.stringify(p)).ok, true);
});
test('corrupt backups rejected and corrupt local storage is preserved before overwrite', () => {
  const p = createDefaultProfile();
  for (const bad of ['{', 'null', '[]', '{}', JSON.stringify({ ...p, xp: '1' }), JSON.stringify({ ...p, level: '1' }),
    JSON.stringify({ ...p, fieldJournal: [{ id: 'x', timestamp: 'y' }] }), JSON.stringify({ ...p, missions: 'bad' }),
    JSON.stringify({ ...buildBackup(p), formatVersion: 99 }), JSON.stringify({ ...buildBackup(p), photos: { included: true, count: 1, items: [] } })]) {
    assert.equal(parseBackup(bad).ok, false, bad);
  }
  const fake = storage();
  fake.data.set('senial_nativa_profiles_list_v2', '{broken');
  loadProfilesList();
  assert.ok([...fake.data].some(([key, value]) => key.startsWith('senial_nativa_profiles_corrupt_') && value === '{broken'));
  assert.equal(saveProfilesList([p]), true);
  fake.data.set('senial_nativa_profiles_list_v2', '{another');
  fake.fail(true);
  assert.equal(saveProfilesList([p]), false);
  assert.equal(fake.data.get('senial_nativa_profiles_list_v2'), '{another');
});
