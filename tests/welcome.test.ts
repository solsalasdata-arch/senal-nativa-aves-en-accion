import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Screen1Splash } from '../src/components/Screen1Splash';
import { Screen2PlayerSelector } from '../src/components/Screen2PlayerSelector';
import { Screen3HostPresentation } from '../src/components/Screen3HostPresentation';
import { createDefaultProfile } from '../src/utils/storage';
import { getReturningProfile } from '../src/utils/welcome';

const noop = () => {};
const profile = createDefaultProfile('Ana');

test('returning profile ignores untouched seeds but recognizes user progress', () => {
  for (const name of ['Santi Guardián', 'Explorador Yungas']) {
    const seed = createDefaultProfile(name);
    assert.equal(getReturningProfile(seed, [seed]), null);
    assert.equal(getReturningProfile({ ...seed, fieldJournal: [] }, [seed]), null);
    for (const progressed of [
      { ...seed, name: 'Ana' },
      { ...seed, xp: 1 },
      { ...seed, fieldJournal: [{ ...seed.fieldJournal[0], id: 'observation' }] },
      { ...seed, mindarDiscoveries: [{ targetId: 't', speciesId: 'b', profileId: seed.id, discoveredAt: 1, xpAwarded: 0 }] },
    ]) assert.equal(getReturningProfile(progressed, [progressed]), progressed);
    assert.equal(getReturningProfile(seed, [seed, profile]), seed);
  }
});

test('splash offers a real start CTA or returning-profile actions', () => {
  const props = { onStartAdventure: noop, onContinue: noop, onToggleSound: noop, soundEnabled: true };
  const fresh = renderToStaticMarkup(React.createElement(Screen1Splash, props));
  assert.match(fresh, /Comenzar exploración/);
  assert.doesNotMatch(fresh, /Continuar como/);
  assert.doesNotMatch(fresh, /Comienza tu aventura/);
  for (const text of ['Explorar', 'Descubrir', 'Aprender']) assert.ok(fresh.includes(text));
  const returning = renderToStaticMarkup(React.createElement(Screen1Splash, { ...props, returningProfile: profile }));
  assert.match(returning, /Continuar como Ana/);
  assert.match(returning, /Comenzar con otro explorador/);
});

test('selector exposes inline saved profiles, active status, stats and actions', () => {
  const props = { profiles: [profile], activeProfile: profile, onSelectProfile: noop, onCreateProfile: noop, onDeleteProfile: noop, onAdvanceToScreen3: noop, onAdvanceToScreen4: noop, onTakePhoto: noop, onBackToSplash: noop, onOpenMiroAvatar: noop };
  const html = renderToStaticMarkup(React.createElement(Screen2PlayerSelector, props));
  for (const text of ['Continuar como Ana', 'Activo', 'Nivel', 'XP', 'Eliminar perfil de Ana', 'Ver perfil y avatar', 'Crear nuevo explorador', 'Tomar una foto con tu ave favorita']) assert.ok(html.includes(text));
  const empty = renderToStaticMarkup(React.createElement(Screen2PlayerSelector, { ...props, profiles: [] }));
  assert.match(empty, /Crear nuevo explorador/);
  assert.doesNotMatch(empty, /Eliminar perfil/);
});

test('host offers welcome, voice, information, and primary exploration action', () => {
  const html = renderToStaticMarkup(React.createElement(Screen3HostPresentation, { activeProfile: profile, onAdvanceToMainHub: noop, onBack: noop, onChangePlayer: noop }));
  for (const text of ['¡Hola, Ana!', 'Empezar a explorar', 'Conocer al tucán', 'Escuchar la bienvenida', 'Ficha científica del tucán']) assert.ok(html.includes(text));
});
