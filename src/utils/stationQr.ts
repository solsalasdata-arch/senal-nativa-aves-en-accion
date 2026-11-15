import { CHECKPOINTS_DATA } from '../data/birdsData';

export const STATION_QR_VERSION = 'SN1';
export const STATION_CIRCUIT_ID = 'PBSCHUEL';
export const STATION_QR_SEED = 'senal-nativa-estaciones-v1';
export const DEFAULT_PUBLIC_APP_URL = 'https://senal-nativa-aves-en-accion.vercel.app';
const PUBLIC_APP_URL = import.meta.env?.VITE_PUBLIC_APP_URL || DEFAULT_PUBLIC_APP_URL;
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function stationCode(id: number): string {
  const input = `${STATION_QR_VERSION}|${STATION_CIRCUIT_ID}|${id}|${STATION_QR_SEED}`;
  let hash = 2166136261;
  for (const char of input) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0;
  let code = '';
  for (let i = 0; i < 6; i++) {
    code = ALPHABET[hash & 31] + code;
    hash >>>= 5;
  }
  return code;
}

// Proves circuit membership, not physical presence at the station.
export function buildStationToken(id: number): string {
  if (!CHECKPOINTS_DATA.some(station => station.id === id)) throw new RangeError('Unknown station');
  return `${STATION_QR_VERSION}.${STATION_CIRCUIT_ID}.E${String(id).padStart(2, '0')}.${stationCode(id)}`;
}

export function buildStationQrUrl(id: number, baseUrl = PUBLIC_APP_URL): string {
  return `${baseUrl.replace(/\/+$/, '')}/?sn=${buildStationToken(id)}`;
}

export type StationQrResult = { ok: true; stationId: number; token: string } | {
  ok: false;
  reason: 'malformed' | 'unsupported-version' | 'other-circuit' | 'unknown-station' | 'invalid-code';
};

export function parseStationQr(text: string): StationQrResult {
  let token = text.trim();
  if (/^https?:\/\//i.test(token)) {
    try {
      token = new URL(token).searchParams.get('sn')?.trim() || '';
    } catch {
      return { ok: false, reason: 'malformed' };
    }
  }
  token = token.toUpperCase();
  const parts = /^([A-Z]+\d+)\.([A-Z0-9]+)\.E(\d{2})\.([A-Z0-9]{6})$/.exec(token);
  if (!parts) return { ok: false, reason: 'malformed' };
  if (parts[1] !== STATION_QR_VERSION) return { ok: false, reason: 'unsupported-version' };
  if (parts[2] !== STATION_CIRCUIT_ID) return { ok: false, reason: 'other-circuit' };
  const stationId = Number(parts[3]);
  if (!CHECKPOINTS_DATA.some(station => station.id === stationId)) return { ok: false, reason: 'unknown-station' };
  if (token !== buildStationToken(stationId)) return { ok: false, reason: 'invalid-code' };
  return { ok: true, stationId, token };
}
