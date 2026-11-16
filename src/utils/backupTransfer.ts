import type { PhotoRef, PlayerProfile } from '../types/game';
import { buildBackup, type BackupPhoto, type ParsedBackup } from './backup';
import { deletePhoto, getPhotoUrl, savePhoto, toDataUrl, type PhotoOptions } from './photoStore';
import { deriveStationEntries, getEntryCategory, isWelcomeSeed } from './journal';

export async function readPhotoDataUrl(ref: PhotoRef): Promise<string> {
  const url = await getPhotoUrl(ref);
  if (!url) throw new Error('Foto no disponible');
  try {
    if (url.startsWith('data:')) return url;
    const response = await fetch(url);
    if (!response.ok) throw new Error('No se pudo leer la foto');
    return await toDataUrl(await response.blob());
  } finally {
    if (url.startsWith('blob:')) URL.revokeObjectURL(url);
  }
}

export async function assembleBackup(profile: PlayerProfile, includePhotos: boolean,
  read: (ref: PhotoRef) => Promise<string> = readPhotoDataUrl) {
  const photos: BackupPhoto[] = [];
  const warnings: string[] = [];
  if (includePhotos) {
    for (const ref of profile.photos || []) {
      try { photos.push({ ref, dataUrl: await read(ref) }); }
      catch { warnings.push(`No se pudo leer la foto ${ref.id}.`); }
    }
  }
  const included = includePhotos && !warnings.length;
  if (warnings.length) warnings.push('No se incluyeron fotografías: el archivo conserva solo identificadores locales. Reintentá el respaldo para incluir todas las fotos.');
  const hasInlinePhotos = profile.unlockedPhotos.some(url => url.startsWith('data:')) || profile.fieldJournal.some(entry => entry.photoUrl?.startsWith('data:'));
  if (included && hasInlinePhotos) warnings.push('El perfil contiene fotografías antiguas integradas: también se conservan en el JSON, además de las fotos del almacén.');
  const exportedProfile = included ? profile : { ...profile,
    unlockedPhotos: profile.unlockedPhotos.filter(url => !url.startsWith('data:')),
    fieldJournal: profile.fieldJournal.map(entry => {
      if (!entry.photoUrl?.startsWith('data:')) return entry;
      const { photoUrl, ...rest } = entry;
      return rest;
    })
  };
  return { backup: buildBackup(exportedProfile, included ? photos : undefined), warnings };
}

export function backupSummary(parsed: Extract<ParsedBackup, { ok: true }>) {
  const categories = { field: 0, ai: 0, mindar: 0, station: 0 };
  for (const entry of [...parsed.profile.fieldJournal, ...deriveStationEntries(parsed.profile)]) {
    if (!isWelcomeSeed(entry)) categories[getEntryCategory(entry)]++;
  }
  return { name: parsed.profile.name, xp: parsed.profile.xp, level: parsed.profile.level, categories,
    stations: parsed.profile.completedCheckpoints.length, mindar: parsed.profile.mindarDiscoveries?.length || 0,
    includedPhotos: parsed.photos.length, photoRefs: parsed.profile.photos?.length || 0,
    inlinePhotos: parsed.profile.unlockedPhotos.filter(url => url.startsWith('data:')).length +
      parsed.profile.fieldJournal.filter(entry => entry.photoUrl?.startsWith('data:')).length };
}

export async function importBackupPhotos(profile: PlayerProfile, photos: BackupPhoto[], target: PlayerProfile, options: PhotoOptions = {}) {
  const newRefs: PhotoRef[] = [];
  const mapping = new Map<string, PhotoRef>();
  try {
    for (const item of photos) {
      const blob = await (await fetch(item.dataUrl)).blob();
      const digest = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer());
      const hash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
      if (hash !== item.ref.hash) throw new Error('La fotografía del respaldo está corrupta.');
      const result = await savePhoto(blob, { profile: { ...target, photos: newRefs },
        kind: item.ref.kind, label: item.ref.label, entryId: item.ref.entryId, migratedFrom: item.ref.migratedFrom }, {
        ...options, compress: async () => ({ blob, width: item.ref.width, height: item.ref.height })
      });
      if (!result.ok) throw new Error('No se pudo importar una fotografía: almacenamiento lleno o bloqueado.');
      mapping.set(item.ref.id, { ...result.ref, createdAt: item.ref.createdAt });
      if (!target.photos?.some(ref => ref.id === result.ref.id) && !newRefs.some(ref => ref.id === result.ref.id)) newRefs.push(result.ref);
    }
    return { newRefs, profile: { ...profile, id: target.id,
      mindarDiscoveries: (profile.mindarDiscoveries || []).map(d => ({ ...d, profileId: target.id })),
      photos: Array.from(new Map((profile.photos || []).map(ref => {
        const imported = mapping.get(ref.id) || { ...ref, profileId: target.id };
        return [imported.id, imported] as const;
      })).values()),
      fieldJournal: profile.fieldJournal.map(entry => entry.photoId && mapping.has(entry.photoId)
        ? { ...entry, photoId: mapping.get(entry.photoId)!.id } : entry)
    } };
  } catch (error) {
    await Promise.all(newRefs.map(ref => deletePhoto(ref, options.backend).catch(() => {})));
    throw error;
  }
}
