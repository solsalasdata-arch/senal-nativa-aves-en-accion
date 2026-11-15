import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Button, Card, EmptyState, IconButton, ModalHeader, ProgressBar, SheetHeader, StatusPill } from '../src/components/ui/index';

const render = (component: React.ElementType, props: object) => renderToStaticMarkup(React.createElement(component, props));

test('Button forwards native props and supports variants, sizes and icons', () => {
  const html = render(Button, { children: 'Continuar', variant: 'secondary', size: 'lg', fullWidth: true, icon: '→', disabled: true, type: 'submit' });
  for (const expected of ['ui-btn-secondary', 'min-h-12', 'w-full', 'disabled=""', 'type="submit"', 'Continuar', 'aria-hidden="true"']) assert.ok(html.includes(expected));
  assert.match(render(Button, {}), /ui-btn-primary/);
  assert.match(render(Button, { variant: 'ghost' }), /ui-btn-ghost/);
});

test('IconButton and headers provide accessible close labels', () => {
  const html = render(IconButton, { label: 'Mapa' });
  assert.match(html, /aria-label="Mapa"/);
  assert.match(html, /title="Mapa"/);
  const header = render(SheetHeader, { title: 'Aves', subtitle: 'Yungas', titleId: 'birds-title', onClose() {} });
  assert.match(header, /id="birds-title"/);
  assert.match(header, /Yungas/);
  assert.match(header, /aria-label="Cerrar"/);
  assert.equal(ModalHeader, SheetHeader);
});

test('ProgressBar handles normal, empty and invalid values accessibly', () => {
  for (const [value, expected] of [[42, 42], [0, 0], [-10, 0], [120, 100], [NaN, 0]]) {
    const html = render(ProgressBar, { value, label: 'Progreso' });
    assert.match(html, /role="progressbar"/);
    assert.match(html, /aria-label="Progreso"/);
    assert.ok(html.includes(`aria-valuenow="${expected}"`));
    assert.ok(html.includes(`width:${expected}%`));
  }
});

test('presentational containers render content and optional empty states', () => {
  assert.match(render(Card, { children: 'Contenido', className: 'extra' }), /ui-card extra/);
  const empty = render(EmptyState, { title: 'Sin aves', text: 'Explorá el parque' });
  assert.match(empty, /Sin aves/);
  assert.match(empty, /Explorá el parque/);
  assert.match(render(EmptyState, { title: '', text: '', icon: '★', action: React.createElement('button', {}, 'Explorar') }), /Explorar/);
  assert.match(render(StatusPill, { text: 'Listo', tone: 'success', icon: '✓' }), /text-emerald-200/);
  assert.match(render(StatusPill, { text: '' }), /ui-chip/);
});
