import React, { useRef, useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { Button, Card } from './ui';
import type { PlayerProfile } from '../types/game';
import { parseBackup, type BackupPhoto, type ParsedBackup } from '../utils/backup';
import { assembleBackup, backupSummary } from '../utils/backupTransfer';
import { SAVE_ERROR, type SaveResult } from '../utils/profileActions';

export function BackupRecovery({ profile, onRestore }: {
  profile: PlayerProfile;
  onRestore: (profile: PlayerProfile, photos: BackupPhoto[]) => Promise<SaveResult>;
}) {
  const [includePhotos, setIncludePhotos] = useState(true);
  const [pending, setPending] = useState<Extract<ParsedBackup, { ok: true }> | null>(null);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);
  const fileRequest = useRef(0);
  const summary = pending && backupSummary(pending);
  const exportBackup = async () => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError(''); setMessage(''); setWarnings([]);
    try {
      const result = await assembleBackup(profile, includePhotos);
      setWarnings(result.warnings);
      const url = URL.createObjectURL(new Blob([JSON.stringify(result.backup, null, 2)], { type: 'application/json' }));
      const anchor = document.createElement('a');
      anchor.href = url; anchor.download = 'senal-nativa-respaldo.json'; anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage(result.backup.photos.included ? `Respaldo exportado · ${result.backup.photos.count} fotografías incluidas.` : 'Respaldo exportado · sin fotografías, solo identificadores locales.');
    } catch { setError('No se pudo exportar el respaldo.'); }
    finally { lock.current = false; setBusy(false); }
  };
  const restore = async () => {
    if (!pending || lock.current) return;
    lock.current = true; setBusy(true); setError(''); setMessage('');
    try {
      const result = await onRestore(pending.profile, pending.photos);
      if (!result.saved) { setError(result.error || SAVE_ERROR); return; }
      setPending(null); setWarnings([]); setMessage('Respaldo restaurado y guardado en el perfil activo.');
    } catch { setError(SAVE_ERROR); }
    finally { lock.current = false; setBusy(false); }
  };
  return <Card className="space-y-3 bg-surface-950">
    <h3 className="text-sm font-semibold text-amber-200">Respaldo y recuperación</h3>
    <p className="text-xs text-ink-muted">Guardadas solo en este dispositivo. Descargá un respaldo para conservar tu progreso y tus fotos fuera de este navegador.</p>
    <label className="flex min-h-11 items-center gap-2">
      <input type="checkbox" checked={includePhotos} disabled={busy} onChange={e => setIncludePhotos(e.target.checked)} />
      Incluir fotografías
    </label>
    <p className="text-xs text-ink-muted">{includePhotos ? 'Se incluirán las fotografías si todas pueden leerse del dispositivo.' : 'Sin fotografías: solo se guardarán identificadores locales, que no recuperan imágenes en otro dispositivo.'}</p>
    <Button fullWidth disabled={busy} onClick={exportBackup} icon={<Download className="h-4 w-4" />}>Exportar JSON</Button>
    <label className="block space-y-2 text-xs">
      <span className="flex items-center gap-2"><Upload className="h-4 w-4" />Elegir respaldo para restaurar</span>
      <input type="file" accept=".json,application/json" disabled={busy} className="block w-full min-h-11" onChange={async e => {
        const file = e.target.files?.[0];
        e.target.value = '';
        const request = ++fileRequest.current;
        setPending(null); setError(''); setMessage(''); setWarnings([]);
        if (!file) return;
        try {
          const result = parseBackup(await file.text());
          if (request !== fileRequest.current) return;
          if (!result.ok) { setError(result.error); return; }
          setPending(result); setWarnings(result.warnings);
        } catch { if (request === fileRequest.current) setError('No se pudo leer el archivo de respaldo.'); }
      }} />
    </label>
    {summary && <section aria-label="Confirmar restauración" className="space-y-3 border-t border-amber-400/40 pt-3">
      <h4 className="font-semibold">Resumen del respaldo</h4>
      <p>{summary.name} · {summary.xp} XP · Nivel {summary.level}</p>
      <p>Registros: Observaciones {summary.categories.field} · IA {summary.categories.ai} · MindAR {summary.categories.mindar} · Estaciones {summary.categories.station}</p>
      <p>Estaciones completadas: {summary.stations} · Descubrimientos MindAR: {summary.mindar}</p>
      <p>{summary.includedPhotos || summary.inlinePhotos ? `Fotografías incluidas: ${summary.includedPhotos + summary.inlinePhotos}` : 'Sin fotografías incluidas'} · Identificadores: {summary.photoRefs}</p>
      <p className="text-amber-200">Se reemplazará el progreso del perfil activo: {profile.name}. Se guardará una copia de seguridad antes de restaurar. No se sumarán recompensas.</p>
      <div className="flex flex-wrap gap-2">
        <Button disabled={busy} onClick={restore}>Confirmar restauración</Button>
        <Button variant="ghost" disabled={busy} onClick={() => { setPending(null); setWarnings([]); setError(''); }}>Cancelar</Button>
      </div>
    </section>}
    {busy && <p role="status">Procesando…</p>}
    {warnings.length > 0 && <ul className="space-y-1 text-xs text-amber-200" aria-label="Advertencias">{warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul>}
    {error && <p role="alert" className="text-xs text-rose-200">{error}</p>}
    {message && <p role="status" className="text-xs text-emerald-200">{message}</p>}
  </Card>;
}
