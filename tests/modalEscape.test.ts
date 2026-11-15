import assert from 'node:assert/strict';
import test from 'node:test';
import { listenForModalEscape } from '../src/components/ui/useModalEscape';

const key = (value: string) => {
  const event = new Event('keydown', { cancelable: true });
  Object.defineProperty(event, 'key', { value });
  return event;
};

test('Escape closes only the innermost listener, then the parent after child cleanup', () => {
  const target = new EventTarget();
  const closed: string[] = [];
  const parent = listenForModalEscape(target, () => closed.push('parent'));
  const child = listenForModalEscape(target, () => closed.push('child'));
  target.dispatchEvent(key('Escape'));
  assert.deepEqual(closed, ['child']);
  child();
  target.dispatchEvent(key('Escape'));
  assert.deepEqual(closed, ['child', 'parent']);
  parent();
  target.dispatchEvent(key('Escape'));
  assert.deepEqual(closed, ['child', 'parent']);
});

test('non-Escape and consumed keys leave dialogs open; independent targets do not share a stack', () => {
  const first = new EventTarget(), second = new EventTarget();
  let firstClosed = 0, secondClosed = 0;
  const closeFirst = listenForModalEscape(first, () => firstClosed++);
  const closeSecond = listenForModalEscape(second, () => secondClosed++);
  first.dispatchEvent(key('Enter'));
  const consumed = key('Escape');
  consumed.preventDefault();
  first.dispatchEvent(consumed);
  assert.equal(firstClosed, 0);
  first.dispatchEvent(key('Escape'));
  assert.equal(firstClosed, 1);
  assert.equal(secondClosed, 0);
  closeFirst();
  closeSecond();
});

test('removing a parent while a child remains does not remove the child listener', () => {
  const target = new EventTarget();
  let childClosed = 0;
  const parent = listenForModalEscape(target, () => assert.fail('unmounted parent closed'));
  const child = listenForModalEscape(target, () => childClosed++);
  parent();
  target.dispatchEvent(key('Escape'));
  assert.equal(childClosed, 1);
  child();
});
