import { useEffect, useState } from 'react';
import type { PhotoRef, PlayerProfile } from '../types/game';
import { commitProfile } from './storage';

export interface PhotoBackend {
  put(id: string, value: Blob | string): Promise<void>;
  get(id: string): Promise<Blob | string | undefined>;
  delete(id: string): Promise<void>;
  available(): Promise<boolean>;
}
export async function toDataUrl(value: Blob | string): Promise<string> {
  if (typeof value === 'string') return value;
  const bytes = new Uint8Array(await value.arrayBuffer());
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return `data:${value.type};base64,${btoa(binary)}`;
}
async function toBlob(value: Blob | string): Promise<Blob> {
  return typeof value === 'string' ? (await fetch(value)).blob() : value;
}
export class LocalPhotoBackend implements PhotoBackend {
  async put(id: string, value: Blob | string) { localStorage.setItem(`senial_nativa_photo_${id}`, await toDataUrl(value)); }
  async get(id: string) { return localStorage.getItem(`senial_nativa_photo_${id}`) ?? undefined; }
  async delete(id: string) { localStorage.removeItem(`senial_nativa_photo_${id}`); }
  async available() {
    try { const key = 'senial_nativa_photo_probe'; localStorage.setItem(key, ''); localStorage.removeItem(key); return true; } catch { return false; }
  }
}
export class IndexedDBPhotoBackend implements PhotoBackend {
  private open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('senal-nativa-photos', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('photos');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new DOMException('Almacenamiento bloqueado', 'SecurityError'));
    });
  }
  private async run(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest): Promise<any> {
    const db = await this.open();
    try {
      return await new Promise((resolve, reject) => {
        const tx = db.transaction('photos', mode);
        const request = action(tx.objectStore('photos'));
        tx.oncomplete = () => resolve(request.result);
        tx.onerror = () => reject(tx.error || request.error);
        tx.onabort = () => reject(tx.error || request.error);
      });
    } finally { db.close(); }
  }
  async put(id: string, value: Blob | string) { await this.run('readwrite', s => s.put(value, id)); }
  async get(id: string): Promise<Blob | string | undefined> { return this.run('readonly', s => s.get(id)); }
  async delete(id: string) { await this.run('readwrite', s => s.delete(id)); }
  async available() { try { const db = await this.open(); db.close(); return true; } catch { return false; } }
}
export type CompressedPhoto = { blob: Blob; width: number; height: number };
export type PhotoCompressor = (source: Blob | string) => Promise<CompressedPhoto>;
export const compressPhoto: PhotoCompressor = async source => {
  const blob = await toBlob(source);
  const bitmap = await createImageBitmap(blob);
  try {
    const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const compressed = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('Compresión fallida')), 'image/jpeg', 0.85));
    return { blob: compressed, width: canvas.width, height: canvas.height };
  } finally { bitmap.close(); }
};
async function hashPhoto(value: Blob | string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', await (await toBlob(value)).arrayBuffer());
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
}
export type PhotoResult = { ok: true; ref: PhotoRef } | { ok: false; reason: 'quota' | 'unavailable' | 'blocked' | 'unknown' };
export type PhotoOptions = { backend?: PhotoBackend; compress?: PhotoCompressor };
async function selectBackend(): Promise<PhotoBackend> {
  const idb = new IndexedDBPhotoBackend();
  return await idb.available() ? idb : new LocalPhotoBackend();
}
function backendFor(ref: PhotoRef): PhotoBackend { return ref.storage === 'local' ? new LocalPhotoBackend() : new IndexedDBPhotoBackend(); }
export async function savePhoto(source: Blob | string, meta: {
  profile: PlayerProfile; kind: PhotoRef['kind']; entryId?: string; label?: string; migratedFrom?: 'unlockedPhotos';
}, options: PhotoOptions = {}): Promise<PhotoResult> {
  let backend: PhotoBackend | undefined;
  let id: string | undefined;
  try {
    const compressed = await (options.compress || compressPhoto)(source);
    const hash = await hashPhoto(compressed.blob);
    const existing = meta.profile.photos?.find(p => p.profileId === meta.profile.id && p.hash === hash);
    if (existing) return { ok: true, ref: existing };
    backend = options.backend || await selectBackend();
    id = crypto.randomUUID();
    await backend.put(id, compressed.blob);
    const stored = await backend.get(id);
    if (!stored || await hashPhoto(stored) !== hash) throw new Error('Verificación fallida');
    return { ok: true, ref: { id, profileId: meta.profile.id, kind: meta.kind, mime: compressed.blob.type,
      width: compressed.width, height: compressed.height, sizeBytes: compressed.blob.size, hash, createdAt: Date.now(),
      storage: backend instanceof LocalPhotoBackend ? 'local' : 'indexeddb',
      ...(meta.entryId !== undefined ? { entryId: meta.entryId } : {}),
      ...(meta.label !== undefined ? { label: meta.label } : {}),
      ...(meta.migratedFrom !== undefined ? { migratedFrom: meta.migratedFrom } : {}) } };
  } catch (error) {
    if (id && backend) { try { await backend.delete(id); } catch { /* best effort orphan cleanup */ } }
    const name = (error as Error)?.name;
    return { ok: false, reason: name === 'QuotaExceededError' ? 'quota' : name === 'SecurityError' ? 'blocked' : name === 'ReferenceError' ? 'unavailable' : 'unknown' };
  }
}
export async function deletePhoto(ref: PhotoRef, backend = backendFor(ref)): Promise<void> { await backend.delete(ref.id); }
export async function getPhotoUrl(ref: PhotoRef, backend = backendFor(ref)): Promise<string | undefined> {
  const value = await backend.get(ref.id);
  return typeof value === 'string' ? value : value ? URL.createObjectURL(value) : undefined;
}
export function usePhotoUrl(ref?: PhotoRef): string | undefined {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    let disposed = false;
    let current: string | undefined;
    setUrl(undefined);
    if (ref) getPhotoUrl(ref).then(value => {
      current = value;
      if (disposed && value?.startsWith('blob:')) URL.revokeObjectURL(value);
      else if (!disposed) setUrl(value);
    }).catch(() => {});
    return () => { disposed = true; if (current?.startsWith('blob:')) URL.revokeObjectURL(current); };
  }, [ref?.id, ref?.storage]);
  return url;
}
export async function downloadPhoto(ref: PhotoRef): Promise<void> {
  const url = await getPhotoUrl(ref);
  if (!url) throw new Error('Fotografía no disponible');
  const a = document.createElement('a');
  a.href = url;
  a.download = `senal-nativa-${ref.kind}-${new Date(ref.createdAt).toISOString().slice(0, 10)}.jpg`;
  a.click();
  if (url.startsWith('blob:')) setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function migrateLegacyPhotos(profile: PlayerProfile, options: PhotoOptions = {}): Promise<{ profile: PlayerProfile; migrated: number }> {
  let current = profile;
  let migrated = 0;
  for (const dataUrl of profile.unlockedPhotos.filter(url => url.startsWith('data:'))) {
    const result = await savePhoto(dataUrl, { profile: current, kind: 'companion', migratedFrom: 'unlockedPhotos' }, {
      ...options, compress: async source => ({ blob: await toBlob(source), width: 0, height: 0 })
    });
    if (!result.ok) break;
    try {
      const committed = commitProfile(profile.id, latest => ({ updates: {
        photos: [...(latest.photos || []).filter(p => p.id !== result.ref.id), result.ref],
        unlockedPhotos: latest.unlockedPhotos.filter(url => url !== dataUrl)
      } }));
      if (!committed.saved) {
        if (!current.photos?.some(p => p.id === result.ref.id)) await deletePhoto(result.ref, options.backend);
        break;
      }
      current = committed.profile;
      migrated++;
    } catch {
      if (!current.photos?.some(p => p.id === result.ref.id)) await deletePhoto(result.ref, options.backend).catch(() => {});
      break;
    }
  }
  return { profile: current, migrated };
}
