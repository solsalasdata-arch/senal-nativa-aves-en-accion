import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { createDefaultProfile, loadProfilesList, saveProfilesList, setActiveProfileId } from '../src/utils/storage';
import { CHECKPOINTS_DATA } from '../src/data/birdsData';
import { buildStationToken } from '../src/utils/stationQr';
import { SAVE_ERROR } from '../src/utils/profileActions';
import type { PlayerProfile } from '../src/types/game';

const require = createRequire(import.meta.url);
const bundle = await build({
  entryPoints: [fileURLToPath(new URL('../src/App.tsx', import.meta.url))],
  bundle: true, write: false, platform: 'node', format: 'cjs', logLevel: 'silent',
  plugins: [{
    name: 'app-handler-harness',
    setup(builder) {
      builder.onResolve({ filter: /^\//, namespace: 'test-hooks' }, args => ({ path: args.path, external: true }));
      builder.onResolve({ filter: /^react$/ }, args => args.importer.endsWith('/src/App.tsx')
        ? { path: 'react-hooks', namespace: 'test-hooks' } : { path: require.resolve('react'), external: true });
      builder.onResolve({ filter: /^react\// }, args => ({ path: require.resolve(args.path), external: true }));
      builder.onLoad({ filter: /.*/, namespace: 'test-hooks' }, () => ({ contents: `
        import React from ${JSON.stringify(require.resolve('react'))};
        export default React;
        export const useState = (...args) => globalThis.__appHooks.useState(...args);
        export const useRef = (...args) => globalThis.__appHooks.useRef(...args);
        export const useEffect = (...args) => globalThis.__appHooks.useEffect(...args);
        export const useCallback = value => value;
      `, loader: 'js' }));
      builder.onResolve({ filter: /^\.\/components\// }, args => ({ path: args.path.split('/').pop()!, namespace: 'test-components' }));
      builder.onLoad({ filter: /.*/, namespace: 'test-components' }, args => ({ contents: args.path === 'useModalEscape'
        ? 'export const useModalEscape = () => {};'
        : args.path === 'PWAInstallButton' ? 'export const OfflineIndicator = "OfflineIndicator";'
        : `export const ${args.path === 'ui' ? 'ModalHeader' : args.path} = ${JSON.stringify(args.path)};`, loader: 'js' }));
    }
  }]
});
const bundledModule = { exports: {} as { default?: () => unknown } };
new Function('require', 'module', 'exports', bundle.outputFiles[0].text)(require, bundledModule, bundledModule.exports);
const App = bundledModule.exports.default!;

function harness(initial?: PlayerProfile[]) {
  const data = new Map<string, string>();
  let blocked: false | 'all' | 'profiles' = false;
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (blocked === 'all' || (blocked === 'profiles' && key === 'senial_nativa_profiles_list_v2')) throw new DOMException('Full', 'QuotaExceededError');
      data.set(key, value);
    },
    removeItem: (key: string) => data.delete(key),
    key: (index: number) => [...data.keys()][index] ?? null,
    get length() { return data.size; }
  } });
  const profiles = initial || [createDefaultProfile()];
  saveProfilesList(profiles);
  setActiveProfileId(profiles[0].id);
  const slots: any[] = [];
  const effects: (() => unknown)[] = [];
  let cursor = 0;
  (globalThis as any).__appHooks = {
    useState(initial: any) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial;
      return [slots[index], (next: any) => { slots[index] = typeof next === 'function' ? next(slots[index]) : next; }];
    },
    useRef(initial: any) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = { current: initial };
      return slots[index];
    },
    useEffect(effect: () => unknown) { effects.push(effect); }
  };
  let tree: any;
  const render = () => { cursor = 0; effects.length = 0; tree = App(); };
  const find = (name: string, node = tree): any => {
    if (!node) return;
    if (Array.isArray(node)) return node.map(n => n == null ? undefined : find(name, n)).find(Boolean);
    if (node.type === name) return node.props;
    return node.props?.children == null ? undefined : find(name, node.props.children);
  };
  render();
  return { render, find, effects, profiles, data, block(value: boolean, profileOnly = false) { blocked = value ? profileOnly ? 'profiles' : 'all' : false; },
    current: () => loadProfilesList().find(p => p.id === profiles[0].id)! };
}
const observation = { source: 'field' as const, birdName: 'Ave', scientificName: 'Avis test', trailName: '', notes: '' };

test('App journal, trivia, quiz, unlocks and shop always use latest persisted progress', () => {
  const app = harness([{ ...createDefaultProfile(), xp: 200 }]);
  const journal = app.find('TriviaAndBirdGuideModal');
  assert.equal(journal.onAddJournalEntry(observation).xpGained, 30);
  assert.equal(journal.onAddJournalEntry(observation).xpGained, 0);
  journal.onUnlockSilhouette('test-bird', 100);
  journal.onUnlockSilhouette('test-bird', 100);
  journal.onUnlockAcoustic('test-bird', 50);
  journal.onUnlockAcoustic('test-bird', 50);
  journal.onQuestionsAnsweredUpdate(1);
  journal.onQuestionsAnsweredUpdate(1);
  assert.equal(app.current().xp, 400);
  const shop = app.find('ShopModal');
  shop.onEquipItem('test-gear', 50);
  shop.onEquipItem('test-gear', 50);
  assert.equal(app.current().xp, 350);
  const quiz = app.find('QuizConsignasModal');
  quiz.onLevelUpSuccess();
  quiz.onLevelUpSuccess();
  assert.equal(app.current().xp, 500);
  assert.equal(app.current().level, 2);
});

test('App failed writes preserve rendered progress and MindAR retries latest data without duplicate XP', () => {
  const app = harness();
  const scanner = app.find('SightingSimulationModal');
  app.block(true);
  assert.equal(scanner.onMindARRegister().saved, false);
  app.render();
  assert.equal(app.find('SightingSimulationModal').playerProfile.mindarDiscoveries.length, 0);
  app.block(false);
  app.find('TriviaAndBirdGuideModal').onUnlockAcoustic('concurrent', 50);
  assert.equal(scanner.onMindARRetrySave(), true);
  app.block(true);
  assert.equal(scanner.onMindARComplete().saved, false);
  assert.equal(app.current().xp, 50);
  app.block(false);
  assert.equal(scanner.onMindARRetrySave(), true);
  scanner.onMindARComplete();
  assert.equal(app.current().xp, 90);
  assert.equal(app.current().mindarDiscoveries?.length, 1);
  app.block(true);
  const failed = app.find('TriviaAndBirdGuideModal').onAddJournalEntry(observation);
  assert.equal(failed.saved, false);
  assert.equal(failed.error, SAVE_ERROR);
  assert.equal(app.current().fieldJournal.length, 2);
});

test('App station, squad, restore, reset and profile switch are guarded and isolated', () => {
  const first = createDefaultProfile();
  const other = { ...createDefaultProfile(), id: 'other' };
  const app = harness([first, other]);
  const station = CHECKPOINTS_DATA[0];
  const map = app.find('TrailMapModal');
  app.block(true);
  assert.equal(map.onCompleteStation(station.id, buildStationToken(station.id), station.challenge.correctIndex).saved, false);
  app.block(false);
  assert.equal(map.onCompleteStation(station.id, buildStationToken(station.id), station.challenge.correctIndex).status, 'completed');
  map.onCompleteStation(station.id, buildStationToken(station.id), station.challenge.correctIndex);
  assert.equal(app.current().xp, 25);
  assert.equal(app.find('SquadsAndSeasonsModal').onClaimSquadGoalReward('missing').status, 'not-eligible');
  const drive = app.find('GoogleDriveModal');
  const restored = { ...first, xp: 300, rewardLedger: ['ai-species:Avis test'], mindarDiscoveries: [{
    profileId: 'old', targetId: 'target', speciesId: 'bird', discoveredAt: 1, xpAwarded: 40
  }] };
  drive.onRestoreProfileData(restored);
  assert.equal(app.current().xp, 300);
  assert.equal(app.current().mindarDiscoveries?.[0].profileId, first.id);
  assert.ok(app.data.has(`senial_nativa_pre_restore_${first.id}`));
  app.block(true);
  assert.equal(app.find('OptionsModal').onResetProgress().saved, false);
  assert.equal(app.current().xp, 300);
  app.block(false);
  app.find('OptionsModal').onResetProgress();
  assert.equal(app.current().xp, 0);
  assert.deepEqual(app.current().rewardLedger, []);
  app.find('MiroFlowAndAvatarModal').onSelectProfile(other.id);
  app.render();
  app.find('TriviaAndBirdGuideModal').onAddJournalEntry(observation);
  assert.equal(loadProfilesList().find(p => p.id === other.id)?.xp, 30);
  assert.equal(app.current().xp, 0);
});

test('App seasonal and squad rewards persist once and cannot be claimed after a failed save', () => {
  const app = harness();
  app.find('TriviaAndBirdGuideModal').onAddJournalEntry(observation);
  const squads = app.find('SquadsAndSeasonsModal');
  squads.onRegisterMigrantBird('migrant-test', 40);
  squads.onRegisterMigrantBird('migrant-test', 40);
  squads.onUnlockSpecialEvent('event-test', 60);
  squads.onUnlockSpecialEvent('event-test', 60);
  assert.equal(app.current().xp, 130);
  app.data.set('senial_nativa_squads_list_v1', JSON.stringify([{
    id: 'test-squad', members: [{ id: app.profiles[0].id, contributedSpecies: [] }],
    goalTarget: 1, goalRewardClaimed: false
  }]));
  app.block(true);
  assert.equal(squads.onClaimSquadGoalReward('test-squad').saved, false);
  assert.equal(app.current().xp, 130);
  app.block(false);
  assert.equal(squads.onClaimSquadGoalReward('test-squad').xpGained, 150);
  assert.equal(squads.onClaimSquadGoalReward('test-squad').xpGained, 0);
  assert.equal(app.current().xp, 280);
});

test('App cross-tab storage listener refreshes the active profile', () => {
  const app = harness();
  const listeners = new Map<string, () => void>();
  const prior = (globalThis as any).window;
  (globalThis as any).window = { addEventListener: (name: string, cb: () => void) => listeners.set(name, cb),
    removeEventListener: (name: string) => listeners.delete(name) };
  try {
    const effect = app.effects.find(cb => cb.toString().includes('"storage"'))!;
    assert.ok(effect);
    const cleanup = effect() as () => void;
    saveProfilesList([{ ...app.current(), xp: 999 }]);
    listeners.get('storage')!();
    app.render();
    assert.equal(app.find('SightingSimulationModal').playerProfile.xp, 999);
    cleanup();
    assert.equal(listeners.has('storage'), false);
  } finally { (globalThis as any).window = prior; }
});

test('App profile creation and selection report blocked writes without changing the active profile', () => {
  const app = harness([createDefaultProfile(), { ...createDefaultProfile(), id: 'other' }]);
  app.find('Screen1Splash').onStartAdventure();
  app.render();
  const selector = app.find('Screen2PlayerSelector');
  app.block(true);
  assert.equal(selector.onCreateProfile('Nuevo', 'explorer', 'Benteveo').saved, false);
  assert.equal(selector.onSelectProfile('other').saved, false);
  app.render();
  assert.equal(app.find('Screen2PlayerSelector').activeProfile.id, app.profiles[0].id);
  assert.equal(loadProfilesList().length, 2);
  app.block(false);
  assert.equal(selector.onCreateProfile('Nuevo', 'explorer', 'Benteveo').saved, true);
  app.render();
  assert.equal(app.find('Screen2PlayerSelector').activeProfile.name, 'Nuevo');
  assert.equal(loadProfilesList().length, 3);
});

test('App stores companion/XR photo refs, cleans failed saves and rewards a capture only once', async () => {
  const previousBitmap = globalThis.createImageBitmap;
  const previousDocument = globalThis.document;
  let source: Blob;
  Object.defineProperty(globalThis, 'createImageBitmap', { configurable: true, writable: true, value: async (blob: Blob) => {
    source = blob;
    return { width: 540, height: 720, close() {} };
  } });
  Object.defineProperty(globalThis, 'document', { configurable: true, writable: true, value: {
    createElement: () => ({ width: 0, height: 0, getContext: () => ({ drawImage() {} }), toBlob: (cb: (blob: Blob) => void) => cb(source) })
  } });
  try {
    const app = harness();
    const companion = app.find('PhotoCompanionModal');
    app.block(true, true);
    assert.equal((await companion.onSavePhoto('data:image/jpeg;base64,YWJj', 'Benteveo')).saved, false);
    assert.equal([...app.data.keys()].filter(k => k.startsWith('senial_nativa_photo_')).length, 0);
    app.block(false);
    const first = await companion.onSavePhoto('data:image/jpeg;base64,YWJj', 'Benteveo');
    assert.equal(first.saved, true);
    assert.equal(first.xpGained, 25);
    assert.equal((await companion.onSavePhoto('data:image/jpeg;base64,YWJj', 'Benteveo')).xpGained, 0);
    assert.deepEqual(app.current().unlockedPhotos, []);
    assert.equal(app.current().photos?.length, 1);
    assert.equal(app.current().photos?.[0].kind, 'companion');
    const scanner = app.find('SightingSimulationModal');
    const capture = { entryId: 'capture-1', birdId: '007-benteveo', photoUrl: 'data:image/jpeg;base64,ZGVm', checks: ['No usé flash'] };
    assert.equal((await scanner.onSightingSuccess(capture)).xpGained, 50);
    assert.equal((await scanner.onSightingSuccess(capture)).xpGained, 0);
    assert.equal(app.current().sightingsCompleted, 1);
    assert.equal(app.current().photos?.length, 2);
    assert.equal(app.current().fieldJournal[0].source, 'ai-identification');
    assert.equal(app.current().fieldJournal[0].photoKind, 'composite');
    assert.deepEqual(app.current().fieldJournal[0].identification, { method: 'gemini', status: 'ai-suggested' });
    assert.equal(app.current().birdPhotoStars['007-benteveo'], 1);
    const journal = app.find('TriviaAndBirdGuideModal');
    const file = new File(['user-photo'], 'bird.jpg', { type: 'image/jpeg' });
    app.block(true, true);
    assert.equal((await journal.onAddJournalEntry(observation, file)).saved, false);
    assert.equal(app.current().photos?.length, 2);
    assert.equal([...app.data.keys()].filter(k => k.startsWith('senial_nativa_photo_')).length, 2);
    app.block(false);
    assert.equal((await journal.onAddJournalEntry(observation, file)).xpGained, 30);
    assert.equal(app.current().fieldJournal[0].evidence, 'photo');
    assert.equal(app.current().fieldJournal[0].photoKind, 'user');
    const before = app.current();
    const photos = before.photos!.map(ref => ({ ref, dataUrl: app.data.get(`senial_nativa_photo_${ref.id}`)! }));
    const restore = app.find('OptionsModal').onRestoreProfileData;
    app.block(true, true);
    assert.equal((await restore({ ...before, xp: 777 }, photos)).saved, false);
    assert.equal(app.current().xp, before.xp);
    assert.equal([...app.data.keys()].filter(k => k.startsWith('senial_nativa_photo_')).length, 3);
    app.block(false);
    assert.equal((await restore({ ...before, xp: 777 }, photos)).saved, true);
    assert.equal(app.current().xp, 777);
    assert.equal(app.current().id, before.id);
    assert.notEqual(app.current().fieldJournal[0].photoId, before.fieldJournal[0].photoId);
    assert.ok(app.current().photos?.some(ref => ref.id === app.current().fieldJournal[0].photoId));
    assert.equal(journal.onAddJournalEntry(observation).xpGained, 0);
  } finally {
    globalThis.createImageBitmap = previousBitmap;
    globalThis.document = previousDocument;
  }
});
