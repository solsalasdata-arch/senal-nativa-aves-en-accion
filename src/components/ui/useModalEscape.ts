import { useEffect, useRef } from 'react';

const escapeStacks = new WeakMap<EventTarget, symbol[]>();

export function listenForModalEscape(target: EventTarget, onClose: () => void) {
  const stack = escapeStacks.get(target) ?? [];
  escapeStacks.set(target, stack);
  const token = Symbol();
  stack.push(token);
  const closeOnEscape = (event: Event) => {
    if ((event as KeyboardEvent).key !== 'Escape' || event.defaultPrevented || stack[stack.length - 1] !== token) return;
    event.preventDefault();
    event.stopPropagation();
    onClose();
  };
  target.addEventListener('keydown', closeOnEscape, { capture: true });
  return () => {
    target.removeEventListener('keydown', closeOnEscape, { capture: true });
    const index = stack.indexOf(token);
    if (index !== -1) stack.splice(index, 1);
  };
}

export function useModalEscape(isOpen: boolean, onClose: () => void) {
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => {
    if (!isOpen) return;
    return listenForModalEscape(window, () => closeRef.current());
  }, [isOpen]);
}
