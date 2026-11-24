import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { BIRDS_DATA, CATALOG_BIRDS_DATA } from '../src/data/birdsData';
import { MINDAR_CHALLENGES } from '../src/data/mindarChallenges';

test('each compiled bird target has a complete, species-specific challenge', () => {
  assert.deepEqual(Object.keys(MINDAR_CHALLENGES).map(Number).sort(), [0, 1, 2, 3]);
  const prompts = Object.values(MINDAR_CHALLENGES).map(challenge => challenge.question);
  assert.equal(new Set(prompts).size, 4);

  for (const challenge of Object.values(MINDAR_CHALLENGES)) {
    assert.equal(challenge.options.length, 4);
    assert.ok(challenge.correctIndex >= 0 && challenge.correctIndex < challenge.options.length);
    assert.ok(challenge.explanation.length > 20);
  }

  assert.match(MINDAR_CHALLENGES[1].question, /Tucán/i);
  assert.match(MINDAR_CHALLENGES[1].options[MINDAR_CHALLENGES[1].correctIndex], /calor/i);
});

test('all four discovery cards have local bird songs available', () => {
  const speciesIds = ['001-chingolo', 'tucan-grande', '007-benteveo', '014-hornero'];
  for (const speciesId of speciesIds) {
    const bird = CATALOG_BIRDS_DATA.find(candidate => candidate.id === speciesId)
      ?? BIRDS_DATA.find(candidate => candidate.id === speciesId);
    const audioUrl = bird?.audioUrl;
    if (!audioUrl) assert.fail(`${speciesId} needs a local song`);
    assert.ok(audioUrl.startsWith('/assets/aves/'), `${speciesId} needs a local song`);
    assert.ok(existsSync(join(process.cwd(), 'public', audioUrl.slice(1))), `${speciesId} song file is missing`);
  }
});
