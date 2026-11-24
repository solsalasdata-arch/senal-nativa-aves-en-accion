import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultProfile, saveProfilesList, loadProfilesList, setActiveProfileId, getActiveProfile, deleteProfile } from '../src/utils/storage';
import { isMindARTargetUnlocked, registerMindARDiscovery, MINDAR_TARGETS } from '../src/utils/mindarProgress';

function memoryStorage() {
  const data = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => data.set(key, value),
    removeItem: (key: string) => data.delete(key),
    get length() { return data.size; }, key: (index: number) => [...data.keys()][index] ?? null
  } });
}

test('new profiles start with only the first MindAR target unlocked', () => {
  const profile = createDefaultProfile('Ana');
  assert.deepEqual(profile.unlockedSilhouettes, ['001-chingolo', 'tucan-grande']);
});

test('MindAR discoveries unlock only the next target in sequence', () => {
  let profile = createDefaultProfile('Ana');
  assert.deepEqual(profile.unlockedSilhouettes, ['001-chingolo', 'tucan-grande']);
  for (const target of MINDAR_TARGETS) {
    if (!profile.unlockedSilhouettes.includes(target.speciesId)) {
      const foundUnlock = registerMindARDiscovery(profile, target.targetIndex, target.targetIndex);
      assert.equal(foundUnlock.status, 'not-registered');
      assert.deepEqual(foundUnlock.updates, {});
      continue;
    }
    profile = { ...profile, ...registerMindARDiscovery(profile, target.targetIndex + 10, target.targetIndex).updates };
    assert.deepEqual(profile.unlockedSilhouettes, MINDAR_TARGETS.slice(0, target.targetIndex + 2).map(item => item.speciesId));
  }
});

test('a locked target cannot be recorded before its predecessor is discovered', () => {
  const profile = { ...createDefaultProfile('Ana'), unlockedSilhouettes: ['007-benteveo'] };
  const locked = registerMindARDiscovery(profile, 20, 3);
  assert.equal(locked.status, 'not-registered');
  assert.deepEqual(locked.updates, {});
  assert.equal(profile.mindarDiscoveries?.length, 0);
  assert.equal(isMindARTargetUnlocked(profile, 2), false);
});

test('deleting the active last profile creates and selects a fresh profile', () => {
  memoryStorage();
  const profile = createDefaultProfile('Explorador viejo');
  saveProfilesList([profile]);
  setActiveProfileId(profile.id);
  const remaining = deleteProfile(profile.id);
  assert.equal(remaining.length, 1);
  assert.notEqual(remaining[0].id, profile.id);
  assert.equal(remaining[0].name, 'Nuevo Explorador');
  assert.equal(getActiveProfile().id, remaining[0].id);
  assert.equal(loadProfilesList()[0].id, remaining[0].id);
});

test('loading a legacy profile restores MindAR unlocks only from saved discoveries', () => {
  memoryStorage();
  const profile = createDefaultProfile('Ana');
  const discoveries = MINDAR_TARGETS.slice(0, 3).map((target, index) => ({
    targetId: `${target.speciesId}#${target.targetIndex}`,
    speciesId: target.speciesId,
    profileId: profile.id,
    discoveredAt: index + 1,
    xpAwarded: 0
  }));
  saveProfilesList([{ ...profile, unlockedSilhouettes: ['007-benteveo'], mindarDiscoveries: discoveries }]);
  assert.deepEqual(loadProfilesList()[0].unlockedSilhouettes, ['007-benteveo', '001-chingolo', 'tucan-grande']);
});

test('loading an untouched profile removes the old default Benteveo unlock', () => {
  memoryStorage();
  const profile = { ...createDefaultProfile('Ana'), unlockedSilhouettes: ['007-benteveo'] };
  saveProfilesList([profile]);
  assert.deepEqual(loadProfilesList()[0].unlockedSilhouettes, ['001-chingolo', 'tucan-grande']);
});
