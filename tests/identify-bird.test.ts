import test from 'node:test';
import assert from 'node:assert/strict';
import { identifyWithFallback, normalizeModelAnswer } from '../api/identify-bird.ts';

test('accepts only an exact catalog number for catalog classifications', () => {
  assert.deepEqual(normalizeModelAnswer({ kind: 'catalog', catalogNumber: '001' }), {
    kind: 'catalog', catalogNumber: '001'
  });
  assert.throws(() => normalizeModelAnswer({ kind: 'catalog', catalogNumber: 'bird 001' }));
  assert.throws(() => normalizeModelAnswer({ kind: 'catalog', catalogNumber: '1' }));
});

test('rejects malformed or incomplete model answers instead of inventing no_bird', () => {
  assert.throws(() => normalizeModelAnswer({ kind: 'unknown' }));
  assert.throws(() => normalizeModelAnswer({ kind: 'catalog' }));
  assert.throws(() => normalizeModelAnswer(null));
});

test('tries fallback after transient model failure and returns its answer', async () => {
  const calls: string[] = [];
  const answer = await identifyWithFallback(['primary', 'fallback'], async (model) => {
    calls.push(model);
    if (model === 'primary') throw Object.assign(new Error('unavailable'), { status: 503 });
    return { text: '{"kind":"no_bird"}' };
  });
  assert.deepEqual(calls, ['primary', 'fallback']);
  assert.deepEqual(answer, { text: '{"kind":"no_bird"}' });
});

test('tries fallback when the configured model is unavailable', async () => {
  const calls: string[] = [];
  const answer = await identifyWithFallback(['missing-model', 'fallback'], async (model) => {
    calls.push(model);
    if (model === 'missing-model') throw Object.assign(new Error('model not found'), { status: 404 });
    return { text: '{"kind":"no_bird"}' };
  });
  assert.deepEqual(calls, ['missing-model', 'fallback']);
  assert.deepEqual(answer, { text: '{"kind":"no_bird"}' });
});

test('does not retry permanent model errors', async () => {
  const calls: string[] = [];
  await assert.rejects(() => identifyWithFallback(['primary', 'fallback'], async (model) => {
    calls.push(model);
    throw Object.assign(new Error('bad request'), { status: 400 });
  }));
  assert.deepEqual(calls, ['primary']);
});
