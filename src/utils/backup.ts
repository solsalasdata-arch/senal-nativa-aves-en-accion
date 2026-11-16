import type { PhotoRef, PlayerProfile } from '../types/game';
import { createDefaultProfile } from './storage';

export type BackupPhoto = { ref: PhotoRef; dataUrl: string };
export function buildBackup(profile: PlayerProfile, photos?: BackupPhoto[]) {
  return { format: 'senal-nativa-backup' as const, formatVersion: 2 as const, app: 'Señal Nativa',
    exportedAt: new Date().toISOString(), profile: structuredClone(profile),
    photos: { included: photos !== undefined, count: photos?.length ?? profile.photos?.length ?? 0,
      ...(photos ? { items: structuredClone(photos) } : {}) } };
}
export type ParsedBackup = { ok: true; profile: PlayerProfile; photos: BackupPhoto[]; warnings: string[] } | { ok: false; error: string };
const object = (v: unknown): v is Record<string, any> => !!v && typeof v === 'object' && !Array.isArray(v);
const number = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0;
function validPhoto(ref: unknown): ref is PhotoRef {
  return object(ref) && typeof ref.id === 'string' && typeof ref.profileId === 'string' &&
    ['user', 'composite', 'companion'].includes(ref.kind) && ['indexeddb', 'local'].includes(ref.storage) &&
    ['mime', 'hash'].every(key => typeof ref[key] === 'string') &&
    ['width', 'height', 'sizeBytes', 'createdAt'].every(key => number(ref[key]));
}
export function parseBackup(text: string): ParsedBackup {
  try {
    const data: unknown = JSON.parse(text);
    if (!object(data)) throw new Error('El respaldo debe ser un objeto JSON.');
    if (data.format !== undefined && data.format !== 'senal-nativa-backup') throw new Error('Formato de respaldo desconocido.');
    if (data.formatVersion !== undefined && data.formatVersion !== 1 && data.formatVersion !== 2) throw new Error('Versión de respaldo no compatible.');
    if (data.format === 'senal-nativa-backup' && data.formatVersion === undefined) throw new Error('Falta la versión del respaldo.');
    const p = data.profile ?? data;
    if (!object(p) || !number(p.xp)) throw new Error('El perfil necesita XP numérico válido.');
    const defaults = createDefaultProfile();
    for (const [key, value] of Object.entries(defaults)) {
      if (p[key] === undefined) continue;
      if (typeof value === 'number' && !number(p[key])) throw new Error(`Número inválido: ${key}.`);
      if (typeof value === 'boolean' && typeof p[key] !== 'boolean') throw new Error(`Indicador inválido: ${key}.`);
      if (typeof value === 'string' && typeof p[key] !== 'string') throw new Error(`Texto inválido: ${key}.`);
      if (Array.isArray(value) && !Array.isArray(p[key])) throw new Error(`Lista inválida: ${key}.`);
    }
    for (const key of ['photos', 'rewardLedger', 'mindarDiscoveries']) {
      if (p[key] !== undefined && !Array.isArray(p[key])) throw new Error(`Lista inválida: ${key}.`);
    }
    if (p.fieldJournal?.some((e: unknown) => !object(e) || typeof e.id !== 'string' || !e.id || !number(e.timestamp) ||
      ['birdName', 'scientificName', 'trailName', 'notes'].some(key => e[key] !== undefined && typeof e[key] !== 'string') ||
      (e.source !== undefined && !['field', 'ai-identification', 'station-activity', 'mindar-signal'].includes(e.source))))
      throw new Error('Registro de diario inválido: requiere id y fecha numérica.');
    for (const key of ['rewardLedger', 'unlockedPhotos', 'unlockedRareBirds', 'unlockedSilhouettes', 'unlockedAcoustics',
      'addedPackBirdIds', 'purchasedGear', 'equippedItems', 'unlockedSpecialEvents', 'registeredMigrantIds']) {
      if (p[key] !== undefined && (!Array.isArray(p[key]) || p[key].some((v: unknown) => typeof v !== 'string'))) throw new Error(`Lista inválida: ${key}.`);
    }
    if (p.completedCheckpoints?.some((id: unknown) => !number(id))) throw new Error('Estaciones inválidas.');
    if (p.photos?.some((ref: unknown) => !validPhoto(ref))) throw new Error('Referencia de fotografía inválida.');
    if (p.mindarDiscoveries?.some((d: unknown) => !object(d) || !['targetId', 'speciesId', 'profileId'].every(k => typeof d[k] === 'string') ||
      !number(d.discoveredAt) || !number(d.xpAwarded) || (d.challengeCompletedAt !== undefined && !number(d.challengeCompletedAt))))
      throw new Error('Progreso MindAR inválido.');
    if (p.missions?.some((m: unknown) => !object(m) || typeof m.id !== 'string' || !number(m.progress) || !number(m.target) || typeof m.completed !== 'boolean'))
      throw new Error('Misiones inválidas.');
    if (p.birdPhotoStars !== undefined && (!object(p.birdPhotoStars) || Object.values(p.birdPhotoStars).some(v => !number(v)))) throw new Error('Estrellas inválidas.');
    const warnings: string[] = [];
    let photos: BackupPhoto[] = [];
    if (data.formatVersion === 2) {
      if (!object(data.photos) || typeof data.photos.included !== 'boolean' || !number(data.photos.count) || !Number.isInteger(data.photos.count))
        throw new Error('Metadatos de fotografías inválidos.');
      if (data.photos.included) {
        if (!Array.isArray(data.photos.items) || data.photos.count !== data.photos.items.length ||
          data.photos.items.some((item: unknown) => !object(item) || !validPhoto(item.ref) || typeof item.dataUrl !== 'string' ||
            !/^data:image\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/]+={0,2}$/i.test(item.dataUrl)))
          throw new Error('Fotografías del respaldo inválidas.');
        photos = data.photos.items;
        if (photos.length !== (p.photos?.length || 0) || new Set(photos.map(item => item.ref.id)).size !== photos.length ||
          photos.some(item => !p.photos?.some((ref: PhotoRef) => ref.id === item.ref.id && ref.hash === item.ref.hash && ref.kind === item.ref.kind)))
          throw new Error('Las fotografías incluidas no coinciden con las referencias del perfil.');
      } else warnings.push('No incluye fotografías: solo se guardaron identificadores locales.');
    } else warnings.push('Respaldo antiguo: algunos campos se completaron con valores iniciales.');
    return { ok: true, profile: { ...defaults, ...p, fieldJournal: p.fieldJournal || [] }, photos, warnings };
  } catch (error) {
    return { ok: false, error: error instanceof SyntaxError ? 'JSON de respaldo corrupto.' : (error as Error).message };
  }
}
