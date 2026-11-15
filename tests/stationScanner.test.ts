import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { createQrDecoder, decodeQrPixels, startQrScanLoop, stopMediaStream, type QrDecoder } from '../src/utils/qrScanner';
import { TrailMapModal } from '../src/components/TrailMapModal';
import { StationChallengeModal } from '../src/components/StationChallengeModal';
import { CHECKPOINTS_DATA } from '../src/data/birdsData';
import { createDefaultProfile } from '../src/utils/storage';
import { buildStationToken, parseStationQr } from '../src/utils/stationQr';

function scheduler() {
  let time = 0;
  let id = 0;
  const jobs = new Map<number, () => void>();
  return {
    jobs,
    options: {
      now: () => time,
      schedule: (callback: () => void) => { jobs.set(++id, callback); return id; },
      cancel: (handle: unknown) => { jobs.delete(handle as number); }
    },
    async tick(advance = 200) {
      time += advance;
      const next = jobs.entries().next().value;
      if (next) { jobs.delete(next[0]); next[1](); }
      for (let i = 0; i < 8; i++) await Promise.resolve();
    }
  };
}
const video = { readyState: 2, videoWidth: 640 } as HTMLVideoElement;
const decoder = (decode: () => Promise<string | null>): QrDecoder => ({ engine: 'jsqr', decode });

test('scan loop dedupes for two seconds, then allows text again and stop cancels scheduling', async () => {
  const clock = scheduler();
  const texts: string[] = [];
  const loop = startQrScanLoop(video, decoder(async () => 'same'), text => { texts.push(text); return false; }, clock.options);
  await clock.tick();
  await clock.tick();
  assert.deepEqual(texts, ['same']);
  await clock.tick(2100);
  assert.deepEqual(texts, ['same', 'same']);
  loop.stop();
  assert.equal(clock.jobs.size, 0);
  await clock.tick();
  assert.equal(texts.length, 2);
});

test('scan loop stops after accepted code and skips video without a ready frame', async () => {
  const clock = scheduler();
  let calls = 0;
  const source = { readyState: 0, videoWidth: 0 } as HTMLVideoElement;
  startQrScanLoop(source, decoder(async () => { calls++; return buildStationToken(1); }), () => true, clock.options);
  await clock.tick();
  assert.equal(calls, 0);
  Object.assign(source, { readyState: 2, videoWidth: 640 });
  await clock.tick();
  assert.equal(calls, 1);
  assert.equal(clock.jobs.size, 0);
});

test('scan loop never decodes concurrently and ignores an in-flight result after stop', async () => {
  const clock = scheduler();
  let finish!: (text: string) => void;
  let calls = 0;
  let accepted = 0;
  const loop = startQrScanLoop(video, decoder(() => { calls++; return new Promise(resolve => { finish = resolve; }); }),
    () => { accepted++; return true; }, clock.options);
  await clock.tick();
  await clock.tick();
  assert.equal(calls, 1);
  assert.equal(clock.jobs.size, 0);
  loop.stop();
  finish('qr');
  await clock.tick();
  assert.equal(accepted, 0);
  assert.equal(clock.jobs.size, 0);
});

test('decode errors are reported and the loop can continue until stopped', async () => {
  const clock = scheduler();
  let errors = 0;
  const loop = startQrScanLoop(video, decoder(async () => { throw new Error('frame'); }), () => false,
    { ...clock.options, onError: () => { errors++; } });
  await clock.tick();
  assert.equal(errors, 1);
  assert.equal(clock.jobs.size, 1);
  loop.stop();
});

test('stream cleanup stops every track even when a track already failed', () => {
  let stopped = 0;
  stopMediaStream({ getTracks: () => [{ stop() { stopped++; throw new Error('released'); } }, { stop() { stopped++; } }] } as MediaStream);
  stopMediaStream(null);
  assert.equal(stopped, 2);
});

test('native support is checked, and runtime native failure switches to bundled jsQR', async () => {
  const nativeDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'BarcodeDetector');
  const documentDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'document');
  const pixels = new Uint8ClampedArray(16 * 16 * 4).fill(255);
  class Detector {
    static async getSupportedFormats() { return ['qr_code']; }
    async detect() { throw new Error('native failed'); }
  }
  try {
    Object.defineProperty(globalThis, 'BarcodeDetector', { configurable: true, value: Detector });
    Object.defineProperty(globalThis, 'document', { configurable: true, value: { createElement: () => ({ width: 0, height: 0,
      getContext: () => ({ drawImage() {}, getImageData: () => ({ data: pixels }) }) }) } });
    const reader = await createQrDecoder();
    assert.equal(reader.engine, 'barcode-detector');
    assert.equal(await reader.decode({ width: 16, height: 16 } as HTMLCanvasElement), null);
    assert.equal(reader.engine, 'jsqr');
    Detector.getSupportedFormats = async () => ['ean_13'];
    assert.equal((await createQrDecoder()).engine, 'jsqr');
    Reflect.deleteProperty(globalThis, 'BarcodeDetector');
    assert.equal((await createQrDecoder()).engine, 'jsqr');
  } finally {
    for (const [key, descriptor] of [['BarcodeDetector', nativeDescriptor], ['document', documentDescriptor]] as const) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key);
    }
  }
});

test('bundled pixel helper used by photo decoding reads a generated PNG and rejects blank pixels', () => {
  const directory = new URL('../public/qr/estaciones/', import.meta.url);
  const manifest = JSON.parse(readFileSync(new URL('manifest.json', directory), 'utf8'));
  const png = PNG.sync.read(readFileSync(new URL(manifest[0].files.png, directory)));
  const text = decodeQrPixels(new Uint8ClampedArray(png.data), png.width, png.height);
  assert.deepEqual(parseStationQr(text!), { ok: true, stationId: 1, token: buildStationToken(1) });
  assert.equal(decodeQrPixels(new Uint8ClampedArray(16 * 16 * 4).fill(255), 16, 16), null);
});

test('trail map renders pending scan/practice actions, completed states and recognized deep link', () => {
  const props = { isOpen: true, onClose() {}, playerProfile: createDefaultProfile(), onCompleteStation: () => 'completed' as const };
  const render = (overrides = {}) => renderToStaticMarkup(React.createElement(TrailMapModal, { ...props, ...overrides }));
  const pending = render();
  for (const label of ['Pendiente', 'Escanear QR de la estación', 'Practicar sin QR (sin recompensa)']) assert.ok(pending.includes(label), label);
  const done = render({ playerProfile: { ...props.playerProfile, completedCheckpoints: [1] } });
  assert.match(done, /Completada ✓/);
  assert.match(done, /Estación completada anteriormente/);
  assert.doesNotMatch(done, /Escanear QR de la estación/);
  const linked = render({ initialStationToken: buildStationToken(3) });
  assert.match(linked, /QR reconocido/);
  assert.match(linked, /Responder desafío/);
  assert.doesNotMatch(linked, /Confirmar respuesta/);
  const previous = render({ initialStationToken: buildStationToken(1), playerProfile: { ...props.playerProfile, completedCheckpoints: [1] } });
  assert.match(previous, /Sin XP adicional/);
});

test('practice is explicitly unrewarded while an unverified scanner hides the answer step', () => {
  let rewards = 0;
  const props = { station: CHECKPOINTS_DATA[0], profile: createDefaultProfile(), onClose() {}, onSelectStation() {},
    onCompleteStation: () => { rewards++; return 'completed' as const; } };
  const practice = renderToStaticMarkup(React.createElement(StationChallengeModal, { ...props, practice: true }));
  assert.match(practice, /Modo práctica — no otorga XP ni valida la estación/);
  assert.match(practice, /Desafío pendiente/);
  const scan = renderToStaticMarkup(React.createElement(StationChallengeModal, { ...props, practice: false }));
  assert.match(scan, /Buscando QR…/);
  assert.match(scan, /Elegir foto con un QR/);
  assert.doesNotMatch(scan, /Confirmar respuesta/);
  assert.equal(rewards, 0);
});
