import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ToucanMindARViewer } from '../src/components/ToucanMindARViewer';
import { SightingSimulationModal } from '../src/components/SightingSimulationModal';
import { createDefaultProfile } from '../src/utils/storage';
import { registerMindARDiscovery, completeMindARChallenge } from '../src/utils/mindarProgress';
import type { PlayerProfile } from '../src/types/game';

const profile = createDefaultProfile('Ana');
const action = () => ({ saved: true, status: 'registered' as const });
const render = (player: PlayerProfile) => renderToStaticMarkup(React.createElement(ToucanMindARViewer, {
  profile: player, onClose: () => {}, onRegister: action, onComplete: action,
  onRetrySave: () => true, onJournal: () => {},
}));

test('empty scanner starts full-screen with named controls and a polite loading status', () => {
  const html = render(profile);
  for (const text of ['fixed inset-0', 'Salir del escáner', 'Escáner de señales', 'Descubrí aves del parque', 'aria-label="Ayuda"', 'aria-live="polite"', 'Preparando cámara…', 'Visor MindAR de aves', 'targetIndex: 0', 'targetIndex: 1', 'targetIndex: 2', 'targetIndex: 3']) assert.ok(html.includes(text), `missing: ${text}`);
  assert.doesNotMatch(html, /Registrar descubrimiento|Responder desafío|Ver mi diario/);
});

test('registered scanner offers a collapsed accessible sheet and challenge action without reward', () => {
  const registered = { ...profile, ...registerMindARDiscovery(profile, 1).updates };
  const html = render(registered);
  for (const text of ['Tucán Grande', 'Ramphastos toco', 'Ver ficha completa', 'aria-expanded="false"', 'aria-controls="scanner-details"', 'Pasos del descubrimiento', 'Registrar', 'Desafío', 'Responder desafío']) assert.ok(html.includes(text), `missing: ${text}`);
  assert.doesNotMatch(html, /Registrar descubrimiento|Recibir \+40 XP|Ver mi diario/);
});

test('rewarded scanner offers journal access, not duplicate registration or XP', () => {
  const registered = { ...profile, ...registerMindARDiscovery(profile, 1).updates };
  const rewarded = { ...registered, ...completeMindARChallenge(registered, 2).updates };
  const html = render(rewarded);
  assert.match(html, /Ver mi diario/);
  assert.doesNotMatch(html, /Registrar descubrimiento|Responder desafío|Recibir \+40 XP/);
});

test('checking state matches the viewer while a closed sighting modal remains empty', () => {
  const props = {
    isOpen: true, playerProfile: profile, onClose: () => {}, onSightingSuccess: () => {},
    onOpenQuizConsignas: () => {}, onMindARRegister: action, onMindARComplete: action,
    onMindARRetrySave: () => true, onMindARJournal: () => {},
  };
  const html = renderToStaticMarkup(React.createElement(SightingSimulationModal, props));
  assert.match(html, /Preparando escáner…/);
  assert.match(html, /role="status"/);
  assert.match(html, /animate-spin/);
  assert.match(html, />Salir<\/button>/);
  assert.equal(renderToStaticMarkup(React.createElement(SightingSimulationModal, { ...props, isOpen: false })), '');
});
