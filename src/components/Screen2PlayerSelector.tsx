import React, { useState } from 'react';
import { ArrowLeft, Camera, UserPlus, Trash2, Check, Award } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { PlayerProfile, CompanionBirdId } from '../types/game';
import { EXPLORER_AVATARS, COMPANION_BIRDS_OPTIONS } from '../data/birdsData';
import { useLanguage, LanguageSelector } from '../utils/i18n';
import { AvatarIcon } from './AvatarIcon';
import { Button, IconButton, Card, SheetHeader, StatusPill } from './ui';

interface Screen2PlayerSelectorProps {
  profiles: PlayerProfile[];
  activeProfile: PlayerProfile;
  onSelectProfile: (profileId: string) => void;
  onCreateProfile: (name: string, avatarId: string, favoriteBird: CompanionBirdId) => void;
  onDeleteProfile: (profileId: string) => void;
  onAdvanceToScreen3: () => void;
  onAdvanceToScreen4: () => void;
  onTakePhoto: () => void;
  onBackToSplash: () => void;
  onOpenMiroAvatar?: () => void;
}

export const Screen2PlayerSelector: React.FC<Screen2PlayerSelectorProps> = ({ profiles, activeProfile, onSelectProfile, onCreateProfile, onDeleteProfile, onAdvanceToScreen3, onAdvanceToScreen4, onTakePhoto, onBackToSplash, onOpenMiroAvatar }) => {
  const { tx } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState(EXPLORER_AVATARS[0].id);
  const [selectedBird, setSelectedBird] = useState<CompanionBirdId>(EXPLORER_AVATARS[0].favoriteBird);
  const [formError, setFormError] = useState('');
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) { setFormError(tx('Por favor ingresa tu nombre de explorador.', 'Please enter your explorer name.')); return; }
    soundManager.playSuccess();
    onCreateProfile(newPlayerName.trim(), selectedAvatarId, selectedBird);
    setShowForm(false); setNewPlayerName(''); setFormError('');
    onAdvanceToScreen3();
  };
  const handleSelectReturningProfile = (id: string) => { soundManager.playClick(); onSelectProfile(id); onAdvanceToScreen4(); };
  const handleDeleteWithConfirm = (id: string, name: string) => {
    if (confirm(tx(`¿Estás seguro de eliminar el perfil de "${name}"?`, `Are you sure you want to delete "${name}"'s profile?`))) { soundManager.playClick(); onDeleteProfile(id); }
  };
  return <div className="flex h-full flex-col bg-forest-950 text-ink">
    <header className="pt-safe flex shrink-0 items-center gap-2 px-4 pb-3"><IconButton label={tx('Volver a la portada', 'Back to cover')} onClick={onBackToSplash}><ArrowLeft className="h-5 w-5" /></IconButton><h1 className="flex-1 text-xl font-semibold leading-tight">{tx('Elegí tu explorador', 'Choose your explorer')}</h1><LanguageSelector className="min-h-11 text-[11px]" /></header>
    <main className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-safe">
      <h2 className="mt-3 text-base font-semibold text-ink-muted">{tx('Continuar', 'Continue')}</h2>
      {profiles.map(profile => <Card key={profile.id} className={profile.id === activeProfile.id ? 'border-action-turquoise' : ''}>
        <div className="flex items-start gap-2"><button className="flex min-h-11 min-w-0 flex-1 items-center gap-3 text-left" onClick={() => handleSelectReturningProfile(profile.id)} aria-label={tx(`Continuar como ${profile.name}`, `Continue as ${profile.name}`)}>
          <AvatarIcon icon={profile.avatarIcon} alt="" className="h-14 w-14 shrink-0 rounded-xl" /><span className="min-w-0"><span className="block break-words text-base font-semibold">{profile.name}</span><span className="block text-xs text-ink-muted">{profile.favoriteBird}</span><span className="mt-1 block text-xs text-ink-muted">{tx('Nivel', 'Level')} {profile.level} · {profile.xp} XP</span></span>
        </button><IconButton label={tx(`Eliminar perfil de ${profile.name}`, `Delete ${profile.name}'s profile`)} onClick={() => handleDeleteWithConfirm(profile.id, profile.name)}><Trash2 className="h-4 w-4" /></IconButton></div>
        <div className="mt-3 flex flex-wrap items-center gap-2">{profile.id === activeProfile.id && <StatusPill text={tx('Activo', 'Active')} tone="success" icon={<Check className="h-3 w-3" />} />}{profile.hasRisingObserverBadge && <StatusPill icon={<Award className="h-3 w-3" />} text={tx('Observador', 'Observer')} tone="warning" />}</div>
        {profile.id === activeProfile.id && onOpenMiroAvatar && <Button variant="ghost" className="mt-3 border-transparent px-0 text-xs underline" onClick={onOpenMiroAvatar}>{tx('Ver perfil y avatar', 'View profile and avatar')}</Button>}
      </Card>)}
      <Button fullWidth icon={<UserPlus className="h-5 w-5" />} onClick={() => { soundManager.playClick(); setShowForm(true); }}>{tx('Crear nuevo explorador', 'Create new explorer')}</Button>
      <Card className="flex items-center gap-3"><img src="/assets/aistudio/toucan_waving_cutout.png" alt="" className="h-20 w-16 shrink-0 object-contain" /><Button variant="ghost" fullWidth icon={<Camera className="h-5 w-5 shrink-0" />} onClick={() => { soundManager.playClick(); onTakePhoto(); }}>{tx('Tomar una foto con tu ave favorita', 'Take a photo with your favorite bird')}</Button></Card>
    </main>
    {showForm && <div className="ui-overlay z-50 flex items-end justify-center animate-fadeIn" onKeyDown={e => { if (e.key === 'Escape') setShowForm(false); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="new-explorer-title" className="ui-sheet flex max-h-[100dvh] w-full max-w-md flex-col overflow-hidden pb-0">
        <SheetHeader title={tx('Nuevo explorador', 'New explorer')} titleId="new-explorer-title" subtitle={tx('Tu próxima aventura empieza acá', 'Your next adventure starts here')} onClose={() => setShowForm(false)} />
        <form onSubmit={handleCreateSubmit} className="flex min-h-0 flex-col">
          <div className="min-h-0 space-y-5 overflow-y-auto p-4">
            <div><label htmlFor="explorer-name" className="mb-2 block text-xs font-semibold">{tx('1. Nombre o apodo del explorador', '1. Explorer name or nickname')}</label><input id="explorer-name" type="text" maxLength={24} placeholder={tx('Ej: Lucía, Facundo, Guardián...', 'E.g.: Lucía, Facundo, Ranger...')} value={newPlayerName} onChange={e => { setNewPlayerName(e.target.value); if (formError) setFormError(''); }} onFocus={e => e.currentTarget.scrollIntoView({ block: 'nearest' })} aria-invalid={!!formError} aria-describedby={formError ? 'name-error' : undefined} className="min-h-11 w-full rounded-xl border border-ink-muted bg-surface-950 px-3 py-2 text-base text-ink" />{formError && <p id="name-error" role="alert" className="mt-2 text-xs text-rose-200">{formError}</p>}</div>
            <fieldset><legend className="mb-2 text-xs font-semibold">{tx('2. Elegí tu personaje', '2. Choose your character')}</legend><div className="grid grid-cols-3 gap-2">{EXPLORER_AVATARS.map(avatar => <button key={avatar.id} type="button" aria-pressed={selectedAvatarId === avatar.id} onClick={() => { soundManager.playClick(); setSelectedAvatarId(avatar.id); setSelectedBird(avatar.favoriteBird); }} className={`relative flex min-h-11 flex-col items-center gap-1 rounded-xl border bg-surface-950 p-2 ${selectedAvatarId === avatar.id ? 'border-discovery-amber ring-2 ring-discovery-amber' : 'border-white/20'}`}>
              <AvatarIcon icon={avatar.icon} alt="" className="h-16 w-full rounded-lg object-contain" /><span className="text-[11px] font-semibold">{avatar.name}</span><span className="text-[11px] text-ink-muted">{avatar.favoriteBird}</span>{selectedAvatarId === avatar.id && <Check aria-hidden="true" className="absolute right-1 top-1 h-5 w-5 rounded-full bg-discovery-amber text-forest-950" />}
            </button>)}</div></fieldset>
            <fieldset><legend className="mb-2 text-xs font-semibold">{tx('3. Ave compañera favorita', '3. Favorite companion bird')}</legend><div className="grid grid-cols-2 gap-2">{COMPANION_BIRDS_OPTIONS.map(bird => <button key={bird.name} type="button" aria-pressed={selectedBird === bird.name} onClick={() => { soundManager.playBirdSound(bird.name); setSelectedBird(bird.name); }} className={`min-h-11 rounded-xl border bg-surface-950 p-3 text-left ${selectedBird === bird.name ? 'border-discovery-amber ring-2 ring-discovery-amber' : 'border-white/20'}`}><span className="flex items-center justify-between gap-1 text-xs font-semibold">{bird.name}{selectedBird === bird.name && <Check className="h-4 w-4 shrink-0 text-discovery-amber" />}</span><span className="mt-1 block text-[11px] italic text-ink-muted">{bird.scientific}</span><span className="mt-1 block text-[11px] text-ink-muted">{bird.badge}</span></button>)}</div></fieldset>
          </div>
          <footer className="pb-safe sticky bottom-0 shrink-0 border-t border-white/15 bg-surface-900 p-4"><Button type="submit" fullWidth>{tx('Guardar y comenzar', 'Save and start')}</Button></footer>
        </form>
      </section>
    </div>}
  </div>;
};
