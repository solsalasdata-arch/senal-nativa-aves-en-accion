import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterJournal } from '../src/utils/journal';
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
  assert.deepEqual(next.unlockedSilhouettes, ['001-chingolo', 'tucan-grande', '007-benteveo']);
  assert.deepEqual(registerMindARDiscovery(next, 101), { updates: {}, status: 'already-registered' });
  assert.equal(getMindARStatus(next), 'registered');
});

test('four compiled target indices resolve to the matching bird and register independently', () => {
  const expected = ['001-chingolo', 'tucan-grande', '007-benteveo', '014-hornero'];
  let profile = createDefaultProfile('Ana');
  for (const [index, speciesId] of expected.entries()) {
    const result = registerMindARDiscovery(profile, 200 + index, index);
    profile = { ...profile, ...result.updates };
    assert.equal(result.status, 'registered');
    assert.equal(profile.mindarDiscoveries?.at(-1)?.speciesId, speciesId);
    assert.equal(profile.mindarDiscoveries?.at(-1)?.targetId, `${speciesId}#${index}`);
    assert.equal(profile.fieldJournal[0].speciesId, speciesId);
    assert.equal(getMindARStatus(profile, index), 'registered');
  }
  assert.equal(profile.mindarDiscoveries?.length, 4);
  assert.equal(profile.fieldJournal.filter(entry => entry.source === 'mindar-signal').length, 4);
  assert.deepEqual(profile.unlockedSilhouettes, expected);
  assert.equal(profile.sightingsCompleted, 0);
});

test('all four targets can complete their own challenge once per profile', () => {
  let profile = createDefaultProfile('Ana');
  for (let targetIndex = 0; targetIndex < 4; targetIndex++) {
    profile = { ...profile, ...registerMindARDiscovery(profile, 300 + targetIndex, targetIndex).updates };
  }

  for (let targetIndex = 0; targetIndex < 4; targetIndex++) {
    const result = completeMindARChallenge(profile, 400 + targetIndex, targetIndex);
    assert.equal(result.status, 'rewarded');
    profile = { ...profile, ...result.updates };
  }

  assert.equal(profile.xp, createDefaultProfile('Ana').xp + 4 * 40);
  for (let targetIndex = 0; targetIndex < 4; targetIndex++) {
    assert.equal(getMindARStatus(profile, targetIndex), 'rewarded');
    assert.equal(completeMindARChallenge(profile, 500 + targetIndex, targetIndex).status, 'already-rewarded');
  }
});

test('field journal keeps old records and signals without a cap', () => {
  const field = createDefaultProfile().fieldJournal[0];
  const fields = Array.from({ length: 11 }, (_, index) => ({ ...field, id: `field-${index}` }));
  const signal = { ...field, id: 'signal', source: 'mindar-signal' as const };
  const all = [fields[0], signal, ...fields.slice(1)];
  assert.deepEqual(filterJournal(all, 'all', 'newest'), all);
  assert.deepEqual(filterJournal([], 'all', 'newest'), []);
  assert.deepEqual(filterJournal([signal], 'mindar', 'newest'), [signal]);
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
