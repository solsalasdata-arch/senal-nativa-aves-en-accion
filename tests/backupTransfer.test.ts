import test from 'node:test';
import assert from 'node:assert/strict';
import { assembleBackup, backupSummary, importBackupPhotos, readPhotoDataUrl } from '../src/utils/backupTransfer';
import { buildBackup, parseBackup } from '../src/utils/backup';
import { createDefaultProfile } from '../src/utils/storage';
import { savePhoto, toDataUrl, type PhotoBackend } from '../src/utils/photoStore';
import type { PhotoRef } from '../src/types/game';

class MemoryBackend implements PhotoBackend {
  data = new Map<string, Blob | string>();
  puts = 0;
  failAt = Infinity;
  async available() { return true; }
  async put(id: string, value: Blob | string) {
    if (++this.puts === this.failAt) throw new DOMException('Full', 'QuotaExceededError');
    this.data.set(id, value);
  }
  async get(id: string) { return this.data.get(id); }
  async delete(id: string) { this.data.delete(id); }
}
const source = 'data:image/jpeg;base64,YWJj';
test('identifiers-only builder used by Drive excludes inline legacy photo bytes without mutating the profile', () => {
  const profile = createDefaultProfile();
  profile.unlockedPhotos = [source, '/assets/bird.jpg'];
  profile.fieldJournal = [{ id: 'legacy', timestamp: 1, birdName: 'Ave', scientificName: '', trailName: '', notes: '', photoUrl: source }];
  const backup = buildBackup(profile);
  assert.deepEqual(backup.profile.unlockedPhotos, ['/assets/bird.jpg']);
  assert.equal(backup.profile.fieldJournal[0].photoUrl, undefined);
  assert.equal(backup.photos.included, false);
  assert.equal(profile.unlockedPhotos[0], source);
  assert.equal(profile.fieldJournal[0].photoUrl, source);
});
async function fixture() {
  const backend = new MemoryBackend();
  const profile = createDefaultProfile('Ana');
  const result = await savePhoto(source, { profile, kind: 'user' }, { backend,
    compress: async () => ({ blob: await (await fetch(source)).blob(), width: 10, height: 20 }) });
  assert.ok(result.ok);
  const ref = (result as { ok: true; ref: PhotoRef }).ref;
  profile.photos = [ref];
  profile.fieldJournal = [{ id: 'field', timestamp: 123, birdName: 'Ave', scientificName: 'Avis', trailName: '', notes: '',
    source: 'field', photoId: ref.id, photoKind: 'user', evidence: 'photo' }];
  return { profile, ref, backend };
}

test('backup assembly includes all photos, no photos on opt-out, and honestly excludes all after a failed read', async () => {
  const { profile, ref } = await fixture();
  const complete = await assembleBackup(profile, true, async () => source);
  assert.equal(complete.backup.photos.included, true);
  assert.equal(complete.backup.photos.count, 1);
  assert.deepEqual(complete.warnings, []);
  assert.equal(parseBackup(JSON.stringify(complete.backup)).ok, true);
  const omitted = await assembleBackup(profile, false, async () => { throw new Error('must not read'); });
  assert.equal(omitted.backup.photos.included, false);
  assert.equal(omitted.backup.photos.items, undefined);
  const partial = await assembleBackup({ ...profile, photos: [ref, { ...ref, id: 'missing' }] }, true, async photo => {
    if (photo.id === 'missing') throw new Error('Missing');
    return source;
  });
  assert.equal(partial.backup.photos.included, false);
  assert.equal(partial.backup.photos.items, undefined);
  assert.match(partial.warnings.join(' '), /missing.*solo identificadores/);
  const empty = await assembleBackup({ ...profile, photos: [] }, true);
  assert.equal(empty.backup.photos.included, true);
  assert.equal(empty.backup.photos.count, 0);
  const legacy = { ...profile, unlockedPhotos: [source, '/assets/bird.jpg'],
    fieldJournal: [{ ...profile.fieldJournal[0], photoUrl: source }] };
  const legacyOmitted = await assembleBackup(legacy, false);
  assert.deepEqual(legacyOmitted.backup.profile.unlockedPhotos, ['/assets/bird.jpg']);
  assert.equal(legacyOmitted.backup.profile.fieldJournal[0].photoUrl, undefined);
  const legacyIncluded = await assembleBackup(legacy, true, async () => source);
  assert.equal(legacyIncluded.backup.profile.unlockedPhotos[0], source);
  assert.match(legacyIncluded.warnings.join(' '), /antiguas integradas/);
  assert.equal(legacy.unlockedPhotos.length, 2);
});

test('summary separates categories, ignores welcome, derives legacy stations without inventing timestamps', () => {
  const profile = createDefaultProfile('Ana');
  const base = { id: 'field', timestamp: 123, birdName: 'Ave', scientificName: '', trailName: '', notes: '' };
  profile.fieldJournal.push(base, { ...base, id: 'ai', notes: 'Foto Perfecta XR' }, { ...base, id: 'signal', source: 'mindar-signal' });
  profile.completedCheckpoints = [1];
  profile.mindarDiscoveries = [{ profileId: profile.id, targetId: 't', speciesId: 's', discoveredAt: 1, xpAwarded: 40 }];
  const parsed = parseBackup(JSON.stringify(buildBackup(profile)));
  assert.ok(parsed.ok);
  if (!parsed.ok) return;
  const summary = backupSummary(parsed);
  assert.deepEqual(summary.categories, { field: 1, ai: 1, mindar: 1, station: 1 });
  assert.equal(summary.mindar, 1);
  assert.equal(summary.stations, 1);
  assert.equal(summary.name, 'Ana');
  assert.deepEqual(backupSummary({ ...parsed, profile: { ...profile, fieldJournal: [], completedCheckpoints: [], mindarDiscoveries: [] } }).categories,
    { field: 0, ai: 0, mindar: 0, station: 0 });
});

test('verified import preserves photo bytes and progress while remapping photo and profile IDs', async () => {
  const { profile, ref } = await fixture();
  const target = createDefaultProfile('Otro');
  const backend = new MemoryBackend();
  const imported = await importBackupPhotos(profile, [{ ref, dataUrl: source }], target, { backend });
  assert.equal(imported.profile.id, target.id);
  assert.equal(imported.profile.xp, profile.xp);
  assert.equal(imported.profile.photos?.[0].profileId, target.id);
  assert.equal(imported.profile.photos?.[0].createdAt, ref.createdAt);
  assert.notEqual(imported.profile.photos?.[0].id, ref.id);
  assert.equal(imported.profile.fieldJournal[0].photoId, imported.profile.photos?.[0].id);
  assert.equal(await toDataUrl(backend.data.get(imported.profile.photos![0].id)!), source);
  const empty = await importBackupPhotos(profile, [], target, { backend });
  assert.equal(empty.profile.photos?.[0].profileId, target.id);
  assert.deepEqual(empty.newRefs, []);
});

test('corrupt images and failed writes abort photo imports and clean earlier new blobs', async () => {
  const { profile, ref } = await fixture();
  const target = createDefaultProfile();
  const backend = new MemoryBackend();
  await assert.rejects(importBackupPhotos(profile, [{ ref, dataUrl: 'data:image/jpeg;base64,ZGVm' }], target, { backend }), /corrupta/);
  assert.equal(backend.data.size, 0);
  await assert.rejects(importBackupPhotos(profile, [{ ref, dataUrl: source }, { ref: { ...ref, id: 'bad' }, dataUrl: 'data:image/jpeg;base64,ZGVm' }], target, { backend }), /corrupta/);
  assert.equal(backend.data.size, 0);
  backend.failAt = backend.puts + 1;
  await assert.rejects(importBackupPhotos(profile, [{ ref, dataUrl: source }], target, { backend }), /lleno o bloqueado/);
  assert.equal(backend.data.size, 0);
});

test('backup parser rejects mismatched included photos and photo reads report missing local data', async () => {
  const { profile, ref } = await fixture();
  const bad = buildBackup(profile, [{ ref: { ...ref, id: 'unknown' }, dataUrl: source }]);
  assert.equal(parseBackup(JSON.stringify(bad)).ok, false);
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => null } });
  await assert.rejects(readPhotoDataUrl({ ...ref, storage: 'local' }), /no disponible/);
});
