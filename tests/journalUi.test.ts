import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { JournalCard, JournalPanel, photoKindLabel } from '../src/components/JournalPanel';
import { BackupRecovery } from '../src/components/BackupRecovery';
import { createDefaultProfile } from '../src/utils/storage';
import { deriveStationEntries, filterJournal, type JournalRecord } from '../src/utils/journal';

const base = { id: 'entry', timestamp: 123, birdName: 'Ave', scientificName: 'Avis', notes: '', trailName: '' };
const card = (entry: JournalRecord) => renderToStaticMarkup(React.createElement(JournalCard, { entry }));
test('cards display honest categories, missing data, declared evidence and legacy illustrations', () => {
  const field = card(base);
  assert.match(field, /Observación/);
  assert.match(field, /Declarada por el usuario/);
  assert.doesNotMatch(field, /En reposo|1 individuo|Subdosel|Soleado|Sendero Las Yungas/);
  const ai = card({ ...base, source: 'ai-identification' });
  assert.match(ai, /Sugerida por IA \(Gemini\) · puede contener errores/);
  assert.doesNotMatch(ai, /Declarada por el usuario/);
  assert.match(card({ ...base, source: 'mindar-signal' }), /MindAR/);
  assert.match(card({ ...base, id: 'j_init' }), /Registro de bienvenida/);
  const photo = card({ ...base, photoId: 'missing', photoKind: 'user' });
  assert.match(photo, /Con foto/);
  assert.match(photo, /Foto no disponible/);
  const legacy = card({ ...base, photoUrl: '/assets/catalog.jpg', behavior: 'Cantando' });
  assert.match(legacy, /Ilustración del catálogo · no es evidencia/);
  assert.match(legacy, /Acción: Cantando/);
});
test('journal renders filter controls, badge exclusions, legacy dates and empty gallery', () => {
  const profile = createDefaultProfile();
  profile.completedCheckpoints = [1];
  const html = renderToStaticMarkup(React.createElement(JournalPanel, { profile, onRegister() {} }));
  for (const text of ['Todos', 'Observaciones', 'IA', 'MindAR', 'Estaciones', 'Con foto', 'Recientes', 'Mis fotos', 'fecha no registrada', '0/10', 'no cuentan']) assert.ok(html.includes(text), text);
  const station = deriveStationEntries(profile)[0];
  assert.equal(filterJournal<JournalRecord>([base, station], 'station', 'newest')[0].timestamp, undefined);
  assert.equal(filterJournal<JournalRecord>([base, station], 'all', 'oldest')[0].id, station.id);
  const empty = renderToStaticMarkup(React.createElement(JournalPanel, { profile: { ...profile, fieldJournal: [], completedCheckpoints: [] }, onRegister() {} }));
  assert.match(empty, /Sin registros · Todos/);
  const photos = renderToStaticMarkup(React.createElement(JournalPanel, { profile, onRegister() {}, initialSection: 'photos' }));
  assert.match(photos, /Guardadas solo en este dispositivo/);
  assert.match(photos, /Todavía no hay fotos guardadas/);
  assert.equal(photoKindLabel('companion'), 'Foto con ave compañera');
  assert.equal(photoKindLabel('composite'), 'Composición ilustrativa');
  assert.equal(photoKindLabel('user'), 'Foto propia');
});
test('local backup UI defaults to including photos and has explicit local file control', () => {
  const html = renderToStaticMarkup(React.createElement(BackupRecovery, {
    profile: createDefaultProfile(), onRestore: async () => ({ saved: true, status: 'saved' })
  }));
  assert.match(html, /Respaldo y recuperación/);
  assert.match(html, /type="checkbox" checked=""/);
  assert.match(html, /Exportar JSON/);
  assert.match(html, /type="file" accept=".json,application\/json"/);
  assert.doesNotMatch(html, /Confirmar restauración/);
});
