import type { JournalEntry } from '../types/game';

export function capFieldJournal(entries: JournalEntry[], limit = 10): JournalEntry[] {
  let fieldCount = 0;
  return entries.filter(entry => entry.source === 'mindar-signal' || ++fieldCount <= limit);
}
