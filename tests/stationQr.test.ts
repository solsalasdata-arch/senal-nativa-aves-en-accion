import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import jsQR from 'jsqr';
import { CHECKPOINTS_DATA } from '../src/data/birdsData';
import { buildStationQrUrl, buildStationToken, parseStationQr } from '../src/utils/stationQr';
import { completeStation, STATION_REWARD_XP, STATION_PENDING_KEY, savePendingStationToken, readPendingStationToken, clearPendingStationToken } from '../src/utils/stationProgress';
import { createDefaultProfile, saveProfilesList, loadProfilesList } from '../src/utils/storage';

test('all eight station tokens and public/preview URLs round-trip and normalize case', () => {
  assert.equal(CHECKPOINTS_DATA.length, 8);
  for (const station of CHECKPOINTS_DATA) {
    const token = buildStationToken(station.id);
    assert.match(token, /^SN1\.PBSCHUEL\.E0[1-8]\.[A-HJ-NP-Z2-9]{6}$/);
    const expected = { ok: true, stationId: station.id, token };
    assert.deepEqual(parseStationQr(token), expected);
    assert.deepEqual(parseStationQr(`  ${token.toLowerCase()} \n`), expected);
    assert.deepEqual(parseStationQr(buildStationQrUrl(station.id)), expected);
    assert.deepEqual(parseStationQr(buildStationQrUrl(station.id, 'https://preview.example/')), expected);
    assert.deepEqual(parseStationQr(`HTTP://example.com/path?other=1&sn=${token.toLowerCase()}`), expected);
  }
  assert.throws(() => buildStationToken(9), RangeError);
  assert.throws(() => buildStationQrUrl(0), RangeError);
});

test('malformed data and tokens with incorrect membership or code are rejected', () => {
  for (const text of ['3', 'E03', 'hola', '', '  ', 'https://example.com', 'https://', 'ftp://example.com/?sn=SN1.PBSCHUEL.E01.AAAAAA']) {
    assert.deepEqual(parseStationQr(text), { ok: false, reason: 'malformed' });
  }
  const token = buildStationToken(1);
  for (const [text, reason] of [
    [token.replace('.E01.', '.E09.'), 'unknown-station'],
    [token.slice(0, -6) + 'AAAAAA', 'invalid-code'],
    [token.replace('PBSCHUEL', 'OTHER'), 'other-circuit'],
    [token.replace('SN1', 'SN2'), 'unsupported-version']
  ]) assert.deepEqual(parseStationQr(text), { ok: false, reason });
});

test('scan is mandatory, station-specific and answer-gated, without mutations or XP on failure', () => {
  const profile = createDefaultProfile();
  const before = structuredClone(profile);
  const station = CHECKPOINTS_DATA[0];
  for (const scannedToken of [undefined, '', 'invalid', buildStationToken(2)]) {
    assert.deepEqual(completeStation(profile, { stationId: station.id, scannedToken, answerIndex: station.challenge.correctIndex }),
      { status: 'not-scanned', updates: {} });
  }
  assert.deepEqual(completeStation(profile, { stationId: station.id, scannedToken: buildStationToken(station.id), answerIndex: -1 }),
    { status: 'wrong-answer', updates: {} });
  assert.deepEqual(profile, before);
});

test('successful station grants exactly 25 XP once and is isolated to the profile', () => {
  const a = createDefaultProfile('A');
  const b = createDefaultProfile('B');
  const beforeB = structuredClone(b);
  const station = CHECKPOINTS_DATA[0];
  const input = { stationId: station.id, scannedToken: buildStationToken(station.id), answerIndex: station.challenge.correctIndex };
  const result = completeStation(a, input);
  assert.equal(result.status, 'completed');
  assert.equal(STATION_REWARD_XP, 25);
  const next = { ...a, ...result.updates };
  assert.equal(next.xp, a.xp + 25);
  assert.deepEqual(next.completedCheckpoints, [station.id]);
  assert.equal(next.hasRouteCompleteSeal, false);
  assert.deepEqual(next.unlockedRareBirds, []);
  assert.deepEqual(completeStation(next, input), { status: 'already-completed', updates: {} });
  assert.deepEqual(a.completedCheckpoints, []);
  assert.deepEqual(b, beforeB);
});

test('eight completed stations award seal and rare birds without duplicates', () => {
  let profile = { ...createDefaultProfile(), unlockedRareBirds: ['urutau', 'existing'] };
  for (const [index, station] of CHECKPOINTS_DATA.entries()) {
    const result = completeStation(profile, { stationId: station.id, scannedToken: buildStationToken(station.id), answerIndex: station.challenge.correctIndex });
    assert.equal(result.status, 'completed');
    profile = { ...profile, ...result.updates };
    assert.equal(profile.hasRouteCompleteSeal, index === 7);
  }
  assert.equal(profile.xp, 200);
  assert.deepEqual(profile.completedCheckpoints, CHECKPOINTS_DATA.map(station => station.id));
  assert.deepEqual(profile.unlockedRareBirds, ['urutau', 'existing', 'jote-real']);
});

test('storage preserves completed stations and migrates legacy profiles without data loss', () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const data = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => { data.set(key, value); },
    removeItem: (key: string) => { data.delete(key); }
  } });
  try {
    assert.equal(readPendingStationToken(), null);
    const token = buildStationToken(1);
    savePendingStationToken(token);
    assert.equal(data.get(STATION_PENDING_KEY), token);
    assert.equal(readPendingStationToken(), token);
    clearPendingStationToken();
    assert.equal(readPendingStationToken(), null);
    const initial = createDefaultProfile();
    const completed = { ...initial, ...completeStation(initial, {
      stationId: 1, scannedToken: token, answerIndex: CHECKPOINTS_DATA[0].challenge.correctIndex
    }).updates };
    assert.equal(saveProfilesList([completed]), true);
    assert.deepEqual(loadProfilesList()[0], completed);
    const { completedCheckpoints: ignored, ...legacy } = completed;
    assert.equal(saveProfilesList([legacy as typeof completed]), true);
    assert.deepEqual(loadProfilesList()[0], { ...legacy, completedCheckpoints: [] });
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('denied'); } });
    assert.doesNotThrow(() => savePendingStationToken(token));
    assert.equal(readPendingStationToken(), null);
    assert.doesNotThrow(clearPendingStationToken);
    Reflect.deleteProperty(globalThis, 'localStorage');
    assert.doesNotThrow(() => savePendingStationToken(token));
    assert.equal(readPendingStationToken(), null);
    assert.doesNotThrow(clearPendingStationToken);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  }
});

test('generated high-resolution PNGs decode to each station URL with jsQR', () => {
  const directory = new URL('../public/qr/estaciones/', import.meta.url);
  const manifest = JSON.parse(readFileSync(new URL('manifest.json', directory), 'utf8'));
  assert.equal(manifest.length, 8);
  for (const item of manifest) {
    const png = PNG.sync.read(readFileSync(new URL(item.files.png, directory)));
    assert.ok(png.width >= 1024);
    const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
    assert.ok(decoded);
    assert.equal(decoded.data, item.url);
    assert.deepEqual(parseStationQr(decoded.data), { ok: true, stationId: item.id, token: item.token });
  }
});
