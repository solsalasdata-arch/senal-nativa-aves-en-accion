import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Screen4MainHub, HubSheet } from '../src/components/Screen4MainHub';
import { MiroFlowAndAvatarModal } from '../src/components/MiroFlowAndAvatarModal';
import { createDefaultProfile } from '../src/utils/storage';

const noop = () => {};
const playerProfile = createDefaultProfile('Ana');
const props = {
  playerProfile, missions: playerProfile.missions, hubSheet: null as HubSheet,
  onHubSheetChange: noop, onOpenOptions: noop, onOpenTips: noop, onOpenMap: noop,
  onOpenShop: noop, onOpenBirds: noop, onOpenSighting: noop, onOpenCompanionPhoto: noop,
  onOpenJournal: noop, onOpenDrive: noop, onOpenSquadsAndSeasons: noop,
  onOpenMiroAvatar: noop, onChangePlayer: noop, onBackToSplash: noop,
};
const render = (overrides: Partial<typeof props> = {}) => renderToStaticMarkup(React.createElement(Screen4MainHub, { ...props, ...overrides }));

test('hub exposes four named navigation actions, profile stats and mission progress', () => {
  const html = render();
  for (const text of ['Navegación principal', 'Explorar', 'Escanear', 'Mis aves', 'Mi progreso', 'Más opciones', 'Escuchar al tucán', 'Objetivo de hoy', 'Ver misiones']) assert.ok(html.includes(text));
  assert.match(html, /0 XP/);
  assert.doesNotMatch(html, /animate-(float|pulse)/);
  assert.doesNotMatch(html, /FLUJO MIRO/);
});

test('hub sheets have labelled dialogs and preserve routes, stats and locked badge text', () => {
  const more = render({ hubSheet: 'more' });
  for (const text of ['role="dialog"', 'aria-modal="true"', 'aria-labelledby="hub-sheet-title"', 'Actividades', 'Cuenta y datos', 'Cambiar ave compañera / foto', 'Sincronizar con Google Drive', 'Opciones y sonido']) assert.ok(more.includes(text));
  const progress = render({ hubSheet: 'progress' });
  for (const text of ['Observaciones reales', 'Descubrimientos MindAR', 'Estaciones completadas', 'Fotos guardadas', 'Respaldo y recuperación', 'Pendiente', 'Ver diario de campo', 'Perfil y avatar', 'Recompensas / tienda']) assert.ok(progress.includes(text));
  assert.equal((progress.match(/Pendiente/g) ?? []).length, 3);
  const earned = render({ hubSheet: 'progress', playerProfile: { ...playerProfile, hasRisingObserverBadge: true } });
  assert.match(earned, /Conseguida/);
});

test('missions preserve supplied rewards and handle empty mission lists without invalid progress', () => {
  const html = render({ hubSheet: 'missions' });
  for (const mission of playerProfile.missions) {
    assert.ok(html.includes(mission.title));
    assert.ok(html.includes(`+${mission.xpReward} XP`));
  }
  assert.match(html, /Ir a escanear/);
  const empty = render({ hubSheet: 'missions', missions: [] });
  assert.match(empty, /Sin misiones por ahora/);
  assert.doesNotMatch(empty, /NaN|Infinity/);
});

test('Miro architecture is admin-only, including direct initial-mode requests', () => {
  const miroProps = {
    isOpen: true, initialMode: 'miro_flow' as const, onClose: noop,
    activeProfile: playerProfile, profiles: [playerProfile], onSelectProfile: noop,
    onSelectCompanionBird: noop, onUpdateAvatar: noop, onNavigateToScreen: noop,
    onOpenMap: noop, onOpenSighting: noop, onOpenBirds: noop,
    onOpenShop: noop, onOpenSquads: noop, onOpenQuiz: noop,
  };
  const publicView = renderToStaticMarkup(React.createElement(MiroFlowAndAvatarModal, miroProps));
  assert.doesNotMatch(publicView, /FLUJO MIRO|ARQUITECTURA OFICIAL DEL PROYECTO/);
  assert.match(publicView, /ESTUDIO 3D/);
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'location');
  Object.defineProperty(globalThis, 'location', { configurable: true, value: { search: '?admin' } });
  try {
    const adminView = renderToStaticMarkup(React.createElement(MiroFlowAndAvatarModal, miroProps));
    assert.match(adminView, /FLUJO MIRO/);
    assert.match(adminView, /ARQUITECTURA OFICIAL DEL PROYECTO/);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'location', descriptor);
    else delete (globalThis as { location?: unknown }).location;
  }
});
