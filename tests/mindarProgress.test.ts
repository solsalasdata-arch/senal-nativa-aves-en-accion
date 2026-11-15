import { test } from 'node:test';
import assert from 'node:assert/strict';
import { capFieldJournal } from '../src/utils/journal';
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

test('field journal cap keeps signals without consuming field slots', () => {
  const field = createDefaultProfile().fieldJournal[0];
  const fields = Array.from({ length: 11 }, (_, index) => ({ ...field, id: `field-${index}` }));
  const signal = { ...field, id: 'signal', source: 'mindar-signal' as const };
  const entries = capFieldJournal([fields[0], signal, ...fields.slice(1)]);
  assert.deepEqual(entries, [fields[0], signal, ...fields.slice(1, 10)]);
  assert.deepEqual(capFieldJournal([]), []);
  assert.deepEqual(capFieldJournal([signal], 0), [signal]);
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

test('empty journal, field entry preservation and profile isolation', () => {
  const p = { ...createDefaultProfile(), fieldJournal: [] };
  assert.equal(registerMindARDiscovery(p, 1).updates.fieldJournal?.length, 1);
  const full = { ...p, fieldJournal: Array.from({ length: 10 }, (_, index) => ({
    ...createDefaultProfile().fieldJournal[0], id: `field-${index}`
  })) };
  const journal = registerMindARDiscovery(full, 1).updates.fieldJournal!;
  assert.equal(journal.length, 11);
  assert.deepEqual(journal.filter(entry => entry.source !== 'mindar-signal'), full.fieldJournal);
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
  const before = { ...createDefaultProfile(), id: 'before' };
  const after = { ...createDefaultProfile(), id: 'after' };
  saveProfilesList([before, completed, after]);
  assert.equal(updateActiveProfileChecked(completed, { name: 'Actualizado' }).saved, true);
  assert.deepEqual(loadProfilesList().map(profile => profile.id), [before.id, completed.id, after.id]);
  assert.equal(loadProfilesList()[1].name, 'Actualizado');
  const missing = { ...createDefaultProfile(), id: 'missing' };
  assert.equal(updateActiveProfileChecked(missing, {}).saved, true);
  assert.deepEqual(loadProfilesList().map(profile => profile.id), [before.id, completed.id, after.id, missing.id]);
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

test('retrying a checked save preserves either in-memory discovery step without repeating actions', () => {
  const data = new Map<string, string>();
  let failWrites = false;
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (failWrites) throw new Error('quota exceeded');
      data.set(key, value);
    }
  } });
  const initial = createDefaultProfile();
  saveProfilesList([initial]);
  let current = initial;
  for (const action of [registerMindARDiscovery, completeMindARChallenge]) {
    failWrites = true;
    const failed = updateActiveProfileChecked(current, action(current, 10).updates);
    assert.equal(failed.saved, false);
    assert.deepEqual(loadProfilesList()[0], current);
    failWrites = false;
    const retried = updateActiveProfileChecked(failed.profile, {});
    assert.equal(retried.saved, true);
    assert.deepEqual(loadProfilesList()[0], retried.profile);
    assert.equal(retried.profile.mindarDiscoveries?.length, 1);
    assert.equal(retried.profile.fieldJournal.filter(entry => entry.source === 'mindar-signal').length, 1);
    current = retried.profile;
  }
  assert.equal(current.xp, initial.xp + 40);
});
