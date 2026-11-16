import React, { useState } from 'react';
import { Bird, Camera, MapPin, ScanLine, Sparkles, Download } from 'lucide-react';
import { Button, Card, EmptyState, StatusPill } from './ui';
import type { PhotoRef, PlayerProfile } from '../types/game';
import { countsTowardDetailBadge, deriveStationEntries, filterJournal, getEntryCategory, hasPhotoEvidence, isWelcomeSeed, type JournalRecord } from '../utils/journal';
import { downloadPhoto, usePhotoUrl } from '../utils/photoStore';

export const photoKindLabel = (kind: PhotoRef['kind']) => ({
  user: 'Foto propia', composite: 'Composición ilustrativa', companion: 'Foto con ave compañera'
})[kind];

export function StoredPhoto({ photo }: { photo: PhotoRef }) {
  const url = usePhotoUrl(photo);
  const [error, setError] = useState('');
  return <figure className="space-y-2 min-w-0">
    {url ? <img src={url} alt={photoKindLabel(photo.kind)} className="w-full h-36 rounded-xl object-contain bg-surface-900" /> : <p className="rounded-xl bg-surface-900 p-3 text-xs text-ink-muted">Foto no disponible en este dispositivo</p>}
    <figcaption className="text-xs text-ink-muted space-y-1">
      <p>{photoKindLabel(photo.kind)}</p>
      <p>{new Date(photo.createdAt).toLocaleString()}</p>
      {photo.kind === 'companion' && <p>Composición ilustrativa</p>}
    </figcaption>
    <Button variant="ghost" className="text-xs" icon={<Download className="h-4 w-4" />} onClick={async () => {
      try { await downloadPhoto(photo); setError(''); } catch { setError('No se pudo descargar la fotografía.'); }
    }}>Descargar</Button>
    {error && <p role="alert" className="text-xs text-rose-200">{error}</p>}
  </figure>;
}

const categories = {
  field: { label: 'Observación', icon: <Bird className="h-3 w-3" />, tone: 'success' },
  ai: { label: 'IA', icon: <Sparkles className="h-3 w-3" />, tone: 'warning' },
  mindar: { label: 'MindAR', icon: <ScanLine className="h-3 w-3" />, tone: 'info' },
  station: { label: 'Estación', icon: <MapPin className="h-3 w-3" />, tone: 'neutral' }
} as const;

export function JournalCard({ entry, photos = [] }: { entry: JournalRecord; photos?: PhotoRef[] }) {
  const category = getEntryCategory(entry);
  const meta = categories[category];
  const photo = photos.find(p => p.id === entry.photoId);
  return <Card className="space-y-2 bg-surface-950">
    <StatusPill text={isWelcomeSeed(entry) ? 'Registro de bienvenida' : meta.label} icon={meta.icon} tone={meta.tone} />
    {!isWelcomeSeed(entry) && entry.birdName && <h4 className="text-sm font-semibold">{entry.birdName}</h4>}
    {entry.scientificName && <p className="text-xs italic text-teal-200">{entry.scientificName}</p>}
    <p className="text-xs text-ink-muted">{entry.timestamp === undefined ? 'fecha no registrada' : new Date(entry.timestamp).toLocaleString()}</p>
    {entry.trailName && <p className="text-xs text-ink-muted">{entry.trailName}</p>}
    {entry.notes && <p className="text-xs whitespace-pre-wrap break-words">{entry.notes}</p>}
    {category === 'ai' && <p className="text-xs text-amber-200">Sugerida por IA (Gemini) · puede contener errores</p>}
    {category === 'field' && !isWelcomeSeed(entry) && <StatusPill text={hasPhotoEvidence(entry) ? 'Con foto' : 'Declarada por el usuario'} />}
    <div className="flex flex-wrap gap-1">
      {([['Acción', entry.behavior], ['Cantidad', entry.count], ['Estrato', entry.stratum], ['Clima', entry.weather]] as const)
        .filter(([, value]) => !!value).map(([label, value]) => <StatusPill key={label} text={`${label}: ${value}`} />)}
    </div>
    {entry.selfAssessment && <p className="text-xs text-amber-200">Autoevaluación declarada: {entry.selfAssessment.stars} ★ · la app no analiza la calidad de la foto</p>}
    {photo ? <StoredPhoto photo={photo} /> : entry.photoId ? <p className="text-xs text-ink-muted">Foto no disponible en este dispositivo</p> : null}
    {!photo && entry.photoUrl?.startsWith('/assets/') && <figure>
      <img src={entry.photoUrl} alt="Ilustración del catálogo" className="h-24 rounded-xl object-contain" />
      <figcaption className="text-xs text-ink-muted">Ilustración del catálogo · no es evidencia</figcaption>
    </figure>}
  </Card>;
}

const filters = [['all', 'Todos'], ['field', 'Observaciones'], ['ai', 'IA'], ['mindar', 'MindAR'], ['station', 'Estaciones'], ['photos', 'Con foto']] as const;

export function JournalPanel({ profile, onRegister, onOpenDrive, initialSection = 'records' }: {
  profile: PlayerProfile; onRegister: () => void; onOpenDrive?: () => void; initialSection?: 'records' | 'photos';
}) {
  const [section, setSection] = useState(initialSection);
  const [filter, setFilter] = useState<typeof filters[number][0]>('all');
  const [order, setOrder] = useState<'newest' | 'oldest'>('newest');
  const entries = filterJournal<JournalRecord>([...profile.fieldJournal, ...deriveStationEntries(profile)], filter, order);
  const badgeCount = profile.fieldJournal.filter(countsTowardDetailBadge).length;
  return <div className="space-y-3">
    <Card className="space-y-2 border-amber-400/50 bg-surface-950">
      <h3 className="text-sm font-semibold text-amber-200">Insignia Observador de Detalles · {Math.min(10, badgeCount)}/10</h3>
      <p className="text-xs text-ink-muted">10 observaciones de campo con 4 Toques. MindAR, QR, IA y el registro de bienvenida no cuentan.</p>
      {profile.hasDetailObserverBadge && <StatusPill text="¡Insignia obtenida!" tone="success" />}
    </Card>
    <div className="flex flex-wrap gap-2">
      <Button variant="secondary" onClick={onRegister}>+ Registrar</Button>
      {onOpenDrive && <Button variant="ghost" onClick={onOpenDrive}>Google Drive</Button>}
    </div>
    <div className="flex gap-2" role="group" aria-label="Contenido del diario">
      <Button variant={section === 'records' ? 'primary' : 'ghost'} aria-pressed={section === 'records'} onClick={() => setSection('records')}>Registros</Button>
      <Button variant={section === 'photos' ? 'primary' : 'ghost'} aria-pressed={section === 'photos'} onClick={() => setSection('photos')}>Mis fotos</Button>
    </div>
    {section === 'photos' ? <section className="space-y-3" aria-label="Mis fotos">
      <p className="text-xs text-ink-muted">Guardadas solo en este dispositivo</p>
      {profile.photos?.length ? <div className="grid grid-cols-2 gap-2">{profile.photos.map(photo => <Card key={photo.id} className="bg-surface-950"><StoredPhoto photo={photo} /></Card>)}</div>
        : <EmptyState icon={<Camera className="h-6 w-6" />} title="Todavía no hay fotos guardadas" text="Adjuntá una foto a una observación o creá una composición con tu ave compañera." />}
    </section> : <>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar registros">
        {filters.map(([value, label]) => <Button key={value} variant={filter === value ? 'secondary' : 'ghost'} className="text-xs" aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</Button>)}
      </div>
      <Button variant="ghost" className="text-xs" onClick={() => setOrder(order === 'newest' ? 'oldest' : 'newest')}>Orden: {order === 'newest' ? 'Recientes' : 'Antiguos'}</Button>
      {entries.length ? entries.map(entry => <JournalCard key={entry.id} entry={entry} photos={profile.photos} />)
        : <EmptyState title={`Sin registros · ${filters.find(([value]) => value === filter)![1]}`} text={filter === 'photos' ? 'Adjuntá una foto para verla junto a tu registro.' : 'No hay registros en esta categoría. Podés cambiar el filtro o registrar una observación.'} />}
    </>}
  </div>;
}
