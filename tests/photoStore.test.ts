import { test } from 'node:test';
import assert from 'node:assert/strict';
import { savePhoto, getPhotoUrl, migrateLegacyPhotos, toDataUrl, LocalPhotoBackend, type PhotoBackend, type PhotoCompressor } from '../src/utils/photoStore';
import { createDefaultProfile, loadProfilesList, saveProfilesList } from '../src/utils/storage';
import { buildBackup, parseBackup } from '../src/utils/backup';

class MemoryBackend implements PhotoBackend {
  data = new Map<string, Blob | string>();
  puts = 0;
  failAt = Infinity;
  error = new DOMException('Full', 'QuotaExceededError');
  async put(id: string, value: Blob | string) { if (++this.puts === this.failAt) throw this.error; this.data.set(id, value); }
  async get(id: string) { return this.data.get(id); }
  async delete(id: string) { this.data.delete(id); }
  async available() { return true; }
}
const dataUrl = 'data:image/jpeg;base64,YWJj';
const compress: PhotoCompressor = async source => ({ blob: typeof source === 'string' ? await (await fetch(source)).blob() : source, width: 10, height: 20 });
function storage() {
  const data = new Map<string, string>();
  let blocked = false;
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => { if (blocked) throw new DOMException('Blocked', 'SecurityError'); data.set(key, value); },
    removeItem: (key: string) => { data.delete(key); }
  } });
  return { block: () => { blocked = true; } };
}
test('save and retrieve, hash deduplication, profile separation and photo backup roundtrip', async () => {
  const backend = new MemoryBackend();
  const profile = createDefaultProfile();
  const result = await savePhoto(dataUrl, { profile, kind: 'user' }, { backend, compress });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  const url = await getPhotoUrl(result.ref, backend);
  assert.ok(url);
  assert.equal(await (await fetch(url!)).text(), 'abc');
  URL.revokeObjectURL(url!);
  const withPhoto = { ...profile, photos: [result.ref] };
  const repeated = await savePhoto(dataUrl, { profile: withPhoto, kind: 'user' }, { backend, compress });
  assert.deepEqual(repeated, result);
  assert.equal(backend.puts, 1);
  const other = await savePhoto(dataUrl, { profile: { ...withPhoto, id: 'other' }, kind: 'user' }, { backend, compress });
  assert.equal(other.ok, true);
  if (other.ok) assert.notEqual(other.ref.id, result.ref.id);
  const backup = buildBackup(withPhoto, [{ ref: result.ref, dataUrl: await toDataUrl((await backend.get(result.ref.id))!) }]);
  const restored = parseBackup(JSON.stringify(backup));
  assert.equal(restored.ok, true);
  if (restored.ok) {
    assert.deepEqual(restored.profile, withPhoto);
    assert.equal(restored.photos[0].dataUrl, dataUrl);
  }
  assert.equal(await getPhotoUrl({ ...result.ref, id: 'missing' }, backend), undefined);
});
test('quota, blocked, failed verification and failed compression return errors without orphans', async () => {
  for (const name of ['QuotaExceededError', 'SecurityError']) {
    const backend = new MemoryBackend();
    backend.failAt = 1;
    backend.error = new DOMException('Failure', name);
    assert.deepEqual(await savePhoto(dataUrl, { profile: createDefaultProfile(), kind: 'user' }, { backend, compress }),
      { ok: false, reason: name === 'QuotaExceededError' ? 'quota' : 'blocked' });
    assert.equal(backend.data.size, 0);
  }
  const backend = new MemoryBackend();
  backend.get = async () => undefined;
  assert.deepEqual(await savePhoto(dataUrl, { profile: createDefaultProfile(), kind: 'user' }, { backend, compress }), { ok: false, reason: 'unknown' });
  assert.equal(backend.data.size, 0);
  assert.deepEqual(await savePhoto(dataUrl, { profile: createDefaultProfile(), kind: 'user' }, { backend, compress: async () => { throw new Error('bad image'); } }), { ok: false, reason: 'unknown' });
  const fake = storage();
  const local = new LocalPhotoBackend();
  await local.put('a', dataUrl);
  assert.equal(await local.get('a'), dataUrl);
  await local.delete('a');
  assert.equal(await local.get('a'), undefined);
  fake.block();
  assert.equal(await local.available(), false);
  assert.deepEqual(await savePhoto(dataUrl, { profile: createDefaultProfile(), kind: 'user' }, { backend: local, compress }), { ok: false, reason: 'blocked' });
});
test('legacy migration is lossless, idempotent, retains non-data URLs and retries after mid-way failure', async () => {
  storage();
  const backend = new MemoryBackend();
  backend.failAt = 2;
  const second = 'data:image/jpeg;base64,ZGVm';
  const profile = { ...createDefaultProfile(), unlockedPhotos: [dataUrl, second, '/assets/catalog.jpg'] };
  saveProfilesList([profile]);
  const migrated = await migrateLegacyPhotos(profile, { backend });
  assert.equal(migrated.migrated, 1);
  assert.deepEqual(loadProfilesList()[0].unlockedPhotos, [second, '/assets/catalog.jpg']);
  assert.equal(await toDataUrl((await backend.get(migrated.profile.photos![0].id))!), dataUrl);
  assert.equal(migrated.profile.photos![0].migratedFrom, 'unlockedPhotos');
  backend.failAt = Infinity;
  const retried = await migrateLegacyPhotos(loadProfilesList()[0], { backend });
  assert.equal(retried.migrated, 1);
  assert.deepEqual(retried.profile.unlockedPhotos, ['/assets/catalog.jpg']);
  assert.equal(retried.profile.photos?.length, 2);
  assert.equal((await migrateLegacyPhotos(retried.profile, { backend })).migrated, 0);
});
test('migration keeps legacy bytes when profile save or readback fails', async () => {
  const fake = storage();
  const profile = { ...createDefaultProfile(), unlockedPhotos: [dataUrl] };
  saveProfilesList([profile]);
  fake.block();
  const backend = new MemoryBackend();
  assert.equal((await migrateLegacyPhotos(profile, { backend })).migrated, 0);
  assert.deepEqual(loadProfilesList()[0].unlockedPhotos, [dataUrl]);
  assert.equal(backend.data.size, 0);
  backend.get = async () => 'data:image/jpeg;base64,eHl6';
  assert.equal((await migrateLegacyPhotos(profile, { backend })).migrated, 0);
  assert.deepEqual(loadProfilesList()[0].unlockedPhotos, [dataUrl]);
  assert.equal(backend.data.size, 0);
});
