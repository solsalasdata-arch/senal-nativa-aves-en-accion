import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerMindARDiscovery, completeMindARChallenge, getMindARStatus } from '../src/utils/mindarProgress';
import { createDefaultProfile, saveProfilesList, loadProfilesList, updateActiveProfileChecked } from '../src/utils/storage';

test('registration preserves field data and creates only one signal without invented observations', () => {
  const p = createDefaultProfile();
  const result = registerMindARDiscovery(p, 100);
  const next = { ...p, ...result.updates };
  assert.equal(next.mindarDiscoveries?.length, 1);
  assert.equal(next.fieldJournal.length, p.fieldJournal.length + 1);
  const entry = next.fieldJournal[0];
  assert.equal(entry.source, 'mindar-signal');
  for (const key of ['behavior', 'count', 'stratum', 'weather', 'stars', 'coords']) assert.equal(key in entry, false);
  assert.deepEqual(next.fieldJournal.slice(1), p.fieldJournal);
  for (const key of ['sightingsCompleted', 'birdPhotoStars', 'missions', 'unlockedSilhouettes'] as const) assert.deepEqual(next[key], p[key]);
  assert.deepEqual(registerMindARDiscovery(next, 101), { updates: {}, status: 'already-registered' });
  assert.equal(getMindARStatus(next), 'registered');
});

test('challenge requires registration and awards exactly once', () => {
  const p = createDefaultProfile();
  assert.deepEqual(completeMindARChallenge(p, 1), { updates: {}, status: 'not-registered' });
  const registered = { ...p, ...registerMindARDiscovery(p, 2).updates };
  const completed = { ...registered, ...completeMindARChallenge(registered, 3).updates };
  assert.equal(completed.xp, p.xp + 40);
  assert.equal(completed.mindarDiscoveries?.[0].xpAwarded, 40);
  assert.equal(getMindARStatus(completed), 'rewarded');
  assert.deepEqual(completeMindARChallenge(completed, 4), { updates: {}, status: 'already-rewarded' });
});

test('empty journal, cap and profile isolation', () => {
  const p = { ...createDefaultProfile(), fieldJournal: [] };
  assert.equal(registerMindARDiscovery(p, 1).updates.fieldJournal?.length, 1);
  const full = { ...p, fieldJournal: Array(10).fill(createDefaultProfile().fieldJournal[0]) };
  assert.equal(registerMindARDiscovery(full, 1).updates.fieldJournal?.length, 10);
  const registered = { ...p, ...registerMindARDiscovery(p, 1).updates, id: 'another-profile' };
  assert.equal(getMindARStatus(registered), 'none');
});

test('storage round-trip, migration and checked write failures', () => {
  const data = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => { data.set(key, value); }
  } });
  const p = createDefaultProfile();
  const registered = { ...p, ...registerMindARDiscovery(p, 5).updates };
  const completed = { ...registered, ...completeMindARChallenge(registered, 6).updates };
  assert.equal(saveProfilesList([completed]), true);
  assert.deepEqual(loadProfilesList()[0], completed);
  assert.equal(updateActiveProfileChecked(completed, {}).saved, true);
  const legacy = { ...p };
  delete legacy.mindarDiscoveries;
  saveProfilesList([legacy]);
  assert.deepEqual(loadProfilesList()[0].mindarDiscoveries, []);
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: () => { throw new Error('quota exceeded'); }
  } });
  assert.equal(saveProfilesList([completed]), false);
  assert.equal(updateActiveProfileChecked(completed, {}).saved, false);
});
