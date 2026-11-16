import type { PhotoRef } from '../types/game';

export const SAVE_ERROR = 'No se pudo guardar: almacenamiento lleno o bloqueado';
export interface SaveResult {
  saved: boolean;
  status: string;
  xpGained?: number;
  error?: string;
  photo?: PhotoRef;
}
export interface SightingCapture {
  entryId: string;
  birdId: string;
  photoUrl: string;
  checks: string[];
}
export function saveResultMessage(result: SaveResult): string {
  if (!result.saved) return result.error || SAVE_ERROR;
  return (result.xpGained || 0) > 0 ? `Guardado · +${result.xpGained} XP` : 'Guardado · sin XP: ya registraste esta especie';
}
