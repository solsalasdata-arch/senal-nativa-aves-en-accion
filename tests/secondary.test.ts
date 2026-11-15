import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { OptionsModal } from '../src/components/OptionsModal';
import { Screen5TipsModal } from '../src/components/Screen5TipsModal';
import { QuizConsignasModal } from '../src/components/QuizConsignasModal';
import { LevelUpCelebrationModal } from '../src/components/LevelUpCelebrationModal';
import { ShopModal } from '../src/components/ShopModal';
import { TriviaAndBirdGuideModal } from '../src/components/TriviaAndBirdGuideModal';
import { GoogleDriveModal } from '../src/components/GoogleDriveModal';
import { createDefaultProfile } from '../src/utils/storage';

const noop = () => {};
const profile = createDefaultProfile('Ana');
const render = renderToStaticMarkup;
const shell = (html: string) => {
  for (const text of ['role="dialog"', 'aria-modal="true"', 'ui-overlay', 'h-[100dvh]', 'aria-label="Cerrar"', 'pt-safe']) assert.ok(html.includes(text), text);
  assert.doesNotMatch(html, /backdrop-blur-(md|xl)|animate-(pulse|bounce|float|ping)/);
};

test('options and tips share a mobile shell while preserving available actions and requirements', () => {
  const options = { isOpen: true, onClose: noop, soundEnabled: true, bgmEnabled: false,
    onToggleSound: noop, onToggleBgm: noop, onResetProgress: noop, onChangePlayer: noop,
    onChangeCompanionOrPhoto: noop, onBackToSplash: noop, onOpenDrive: noop };
  const html = render(React.createElement(OptionsModal, options));
  shell(html);
  for (const label of ['Sincronizar con Google Drive', 'Cambiar de Jugador', 'Efectos de Sonido', 'Brisa de Selva']) assert.ok(html.includes(label));
  assert.equal(render(React.createElement(OptionsModal, { ...options, isOpen: false })), '');
  const tips = render(React.createElement(Screen5TipsModal, { isOpen: true, onClose: noop, playerState: profile, onOpenMap: noop, onOpenBirds: noop }));
  shell(tips);
  assert.match(tips, /0\/1/);
  assert.match(tips, /0\/5/);
});

test('quiz and celebration retain their question/reward presentation inside named dialogs', () => {
  const quiz = { isOpen: true, onClose: noop, playerProfile: profile, onLevelUpSuccess: noop, onOpenMap: noop, onOpenBirds: noop };
  const html = render(React.createElement(QuizConsignasModal, quiz));
  shell(html);
  assert.match(html, /5 CONSIGNAS DEL TUCÁN/);
  assert.match(html, /CONFIRMAR RESPUESTA/);
  assert.equal(render(React.createElement(QuizConsignasModal, { ...quiz, isOpen: false })), '');
  const badge = render(React.createElement(LevelUpCelebrationModal, { isOpen: true, onClose: noop, level: 2 }));
  shell(badge);
  assert.match(badge, /Observador en Ascenso/);
});

test('shop handles an empty inventory without removing purchasable content or changing balance', () => {
  const props = { isOpen: true, onClose: noop, playerState: { ...profile, purchasedGear: [], equippedItems: [], addedPackBirdIds: [] },
    onEquipItem: noop, onBuySilhouettePack: () => [] };
  const html = render(React.createElement(ShopModal, props));
  shell(html);
  assert.match(html, /TIENDA BOTÁNICA SCHUEL/);
  assert.match(html, /0 XP/);
  assert.doesNotMatch(html, /NaN|Infinity/);
  assert.equal(render(React.createElement(ShopModal, { ...props, isOpen: false })), '');
});

test('bird guide and unauthenticated Drive retain their initial UI shells', () => {
  const journal = render(React.createElement(TriviaAndBirdGuideModal, {
    isOpen: true, onClose: noop, playerProfile: { ...profile, fieldJournal: [] }, initialTab: 'journal',
    onUnlockSilhouette: noop, onUnlockAcoustic: noop, onAddJournalEntry: noop,
    questionsAnsweredCount: 0, onQuestionsAnsweredUpdate: noop,
  }));
  shell(journal);
  assert.match(journal, /COLECCIÓN DE AVES/);
  assert.match(journal, /Catálogo/);
  const props = { isOpen: true, onClose: noop, activeProfile: profile, onRestoreProfileData: noop };
  const drive = render(React.createElement(GoogleDriveModal, props));
  shell(drive);
  assert.match(drive, /Sign in with Google/);
  assert.equal(render(React.createElement(GoogleDriveModal, { ...props, isOpen: false })), '');
});
