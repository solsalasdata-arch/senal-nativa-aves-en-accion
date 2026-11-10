import React, { useState } from 'react';
import {
  ArrowLeft,
  Camera,
  UserPlus,
  Users,
  Trash2,
  Check,
  Award,
  Sparkles,
  X
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { PlayerProfile, CompanionBirdId } from '../types/game';
import { EXPLORER_AVATARS, COMPANION_BIRDS_OPTIONS } from '../data/birdsData';
import { useLanguage, LanguageSelector } from '../utils/i18n';

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

export const Screen2PlayerSelector: React.FC<Screen2PlayerSelectorProps> = ({
  profiles,
  activeProfile,
  onSelectProfile,
  onCreateProfile,
  onDeleteProfile,
  onAdvanceToScreen3,
  onAdvanceToScreen4,
  onTakePhoto,
  onBackToSplash,
  onOpenMiroAvatar
}) => {
  const { tx } = useLanguage();

  // Modal states: 'none' | 'new_player' | 'returning_player'
  const [activeModal, setActiveModal] = useState<'none' | 'new_player' | 'returning_player'>('none');

  // Form states for New Player
  const [newPlayerName, setNewPlayerName] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState(EXPLORER_AVATARS[0].id);
  const [selectedBird, setSelectedBird] = useState<CompanionBirdId>('Tucán Grande');
  const [formError, setFormError] = useState('');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) {
      setFormError(tx('Por favor ingresa tu nombre de explorador.', 'Please enter your explorer name.'));
      return;
    }
    soundManager.playSuccess();
    onCreateProfile(newPlayerName.trim(), selectedAvatarId, selectedBird);
    setActiveModal('none');
    setNewPlayerName('');
    setFormError('');
    // Advance to Screen 3 (Presentación del Guía Tucán Grande)
    onAdvanceToScreen3();
  };

  const handleSelectReturningProfile = (profileId: string) => {
    soundManager.playClick();
    onSelectProfile(profileId);
    setActiveModal('none');
    // Advance to Screen 4 (Menú Principal)
    onAdvanceToScreen4();
  };

  const handleDeleteWithConfirm = (e: React.MouseEvent, profileId: string, name: string) => {
    e.stopPropagation();
    if (confirm(tx(`¿Estás seguro de eliminar el perfil de "${name}"?`, `Are you sure you want to delete "${name}"'s profile?`))) {
      soundManager.playClick();
      onDeleteProfile(profileId);
    }
  };

  return (
    <div
      className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-cover bg-center select-none p-4"
      style={{ backgroundImage: `url('/assets/aistudio/Botanical_park_start_screen_logo_546dfb3b_47fb3d00.jpg')` }}
    >
      {/* Top Bar with "← Portada" Button, Title, and Language Selector */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <button
          onClick={() => {
            soundManager.playClick();
            onBackToSplash();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/70 backdrop-blur-md border border-teal-400/40 text-xs font-bold text-teal-200 hover:text-white shadow active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-teal-300" />
          <span>{tx('Portada', 'Cover')}</span>
        </button>

        <div className="flex items-center gap-1.5">
          <div className="px-2.5 py-1 rounded-full bg-slate-950/70 backdrop-blur-md border border-teal-400/30 text-[10px] text-teal-200 tracking-wider font-semibold">
            {tx('SELECTOR DE JUGADOR', 'PLAYER SELECTOR')}
          </div>
          <LanguageSelector />
        </div>
      </div>

      {/* Main Logo */}
      <div className="relative z-10 flex flex-col items-center mt-2">
        <div className="text-center">
          <div className="text-3xl sm:text-4xl font-black text-amber-400 tracking-wider drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] [text-shadow:_0_3px_0_#064e3b,_0_6px_0_#0f172a]">
            {tx('AVES', 'BIRDS')}
          </div>
          <div className="text-xl sm:text-2xl font-black text-sky-200 -mt-1 tracking-widest drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] [text-shadow:_0_2px_0_#0369a1,_0_4px_0_#0f172a]">
            {tx('EN ACCIÓN', 'IN ACTION')}
          </div>
        </div>

        {/* Active Player Mini Badge -> Opens "YO / JUGADORES" Miro Avatar Screen */}
        {activeProfile && (
          <button
            onClick={() => {
              soundManager.playClick();
              if (onOpenMiroAvatar) onOpenMiroAvatar();
              else setActiveModal('returning_player');
            }}
            className="mt-1 flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-950/90 hover:bg-teal-900 border border-amber-400/60 text-[10px] text-teal-200 shadow cursor-pointer active:scale-95 transition-all"
          >
            <span>{activeProfile.avatarIcon || '🧢'}</span>
            <span className="font-black text-amber-300">{activeProfile.name}</span>
            <span className="text-white font-bold">&amp; {activeProfile.favoriteBird}</span>
            <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-black text-[8px] uppercase">
              {tx('YO / JUGADORES', 'ME / PLAYERS')}
            </span>
          </button>
        )}
      </div>

      {/* Central 2 Unified Buttons: JUGADOR RECURRENTE / RETURNING PLAYER & NUEVO JUGADOR / NEW PLAYER */}
      <div className="relative z-10 w-full max-w-xs mx-auto space-y-3 my-auto">
        <button
          onClick={() => {
            soundManager.playClick();
            setActiveModal('returning_player');
          }}
          className="w-full py-3.5 px-4 rounded-2xl game-btn-mint text-emerald-950 font-black text-sm tracking-wider uppercase shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
        >
          <Users className="w-5 h-5 text-emerald-950 stroke-[2.5]" />
          <span>
            {tx(`JUGADOR RECURRENTE (${profiles.length})`, `RETURNING PLAYER (${profiles.length})`)}
          </span>
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            setActiveModal('new_player');
          }}
          className="w-full py-3.5 px-4 rounded-2xl bg-teal-900/40 backdrop-blur-md border-3 border-emerald-400/80 text-emerald-100 font-black text-sm tracking-wider uppercase shadow-xl hover:bg-teal-900/60 transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2"
        >
          <UserPlus className="w-5 h-5 text-emerald-300 stroke-[2.5]" />
          <span>{tx('NUEVO JUGADOR', 'NEW PLAYER')}</span>
        </button>
      </div>

      {/* Bottom section: Toucan avatar with single clean frame + Photo CTA */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-xs mx-auto pb-2 pt-2">
        {/* Single Clean Toucan Illustration (already includes its golden circular emblem) */}
        <div
          onClick={() => {
            soundManager.playToucanCall();
            onTakePhoto();
          }}
          className="relative mb-1.5 flex items-center justify-center overflow-visible cursor-pointer group"
          title={tx('¡Toca al Tucán Guía o toma una foto con tu ave favorita!', 'Tap the Toucan Guide or take a photo with your favorite bird!')}
        >
          <img
            src="/assets/aistudio/toucan_waving_cutout.png"
            alt={tx(
              'Tucán Grande con visera verde y mochila del Parque Botánico saludando con las alas abiertas',
              'Toco Toucan with green visor and Botanical Park backpack waving with open wings'
            )}
            className="w-36 sm:w-40 h-auto object-contain pointer-events-none drop-shadow-[0_10px_16px_rgba(0,0,0,0.65)] group-hover:scale-105 transition-transform duration-300"
          />

          {/* Speech Bubble: "¿CUÁL ES TU AVE FAVORITA?" */}
          <div className="absolute -top-3 -right-10 sm:-right-12 z-20 bg-white text-slate-900 px-3 py-1.5 rounded-2xl border-2 border-slate-900 shadow-xl text-center rotate-2 animate-bounce">
            <div className="text-[10px] font-black tracking-tight uppercase leading-tight">
              {tx('¿CUÁL ES', "WHAT'S")}<br />
              {tx('TU AVE', 'YOUR')}<br />
              {tx('FAVORITA?', 'FAVORITE?')}
            </div>
            <div className="absolute -bottom-1.5 left-3 w-3 h-3 bg-white border-r-2 border-b-2 border-slate-900 transform rotate-45" />
          </div>
        </div>

        {/* Text: "¡Tómate una foto con tu ave favorita!" */}
        <p className="text-white font-bold text-xs sm:text-sm text-center mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
          {tx('¡Tómate una foto con tu ave favorita!', 'Take a photo with your favorite bird!')}
        </p>

        {/* Green Button: "TOMAR UNA FOTO" */}
        <button
          onClick={() => {
            soundManager.playClick();
            onTakePhoto();
          }}
          className="w-full py-2.5 sm:py-3 px-4 rounded-2xl game-btn-mint text-emerald-950 font-black text-xs sm:text-sm tracking-wider uppercase shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
        >
          <Camera className="w-4 h-4 text-emerald-950 stroke-[2.5]" />
          <span>{tx('TOMAR UNA FOTO', 'TAKE A PHOTO')}</span>
        </button>
      </div>

      {/* MODAL 1: NEW PLAYER FORM */}
      {activeModal === 'new_player' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-sm max-h-[92vh] flex flex-col rounded-3xl overflow-hidden bg-slate-900 border-2 border-emerald-400 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-teal-900/60">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm text-white">
                    {tx('NUEVO EXPLORADOR', 'NEW EXPLORER')}
                  </h3>
                  <p className="text-[10px] text-teal-300">
                    {tx('Crea tu perfil individual para el Parque', 'Create your individual profile for the Park')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setActiveModal('none');
                }}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateSubmit} className="p-4 space-y-3.5 flex-1 overflow-y-auto text-xs text-slate-200">
              {/* Name Input */}
              <div>
                <label className="block text-[11px] font-bold text-teal-300 uppercase mb-1">
                  {tx('1. Nombre o Apodo del Explorador:', '1. Explorer Name or Nickname:')}
                </label>
                <input
                  type="text"
                  maxLength={24}
                  placeholder={tx('Ej: Lucía, Facundo, Guardián...', 'E.g.: Lucía, Facundo, Ranger...')}
                  value={newPlayerName}
                  onChange={(e) => {
                    setNewPlayerName(e.target.value);
                    if (formError) setFormError('');
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border-2 border-teal-700/60 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm font-semibold"
                  autoFocus
                />
                {formError && <p className="text-[10px] text-rose-400 font-bold mt-1">{formError}</p>}
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-[11px] font-bold text-teal-300 uppercase mb-1">
                  {tx('2. Elige tu Personaje:', '2. Choose Your Character:')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {EXPLORER_AVATARS.map((avatar) => {
                    const isSelected = selectedAvatarId === avatar.id;
                    return (
                      <button
                        type="button"
                        key={avatar.id}
                        onClick={() => {
                          soundManager.playClick();
                          setSelectedAvatarId(avatar.id);
                        }}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          isSelected
                            ? 'bg-teal-900/90 border-amber-400 ring-2 ring-amber-400/40 shadow-md'
                            : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className="text-2xl">{avatar.icon}</span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{avatar.name}</div>
                          <div className="text-[9px] text-teal-300 truncate">{avatar.title}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Favorite Companion Bird Selector */}
              <div>
                <label className="block text-[11px] font-bold text-teal-300 uppercase mb-1">
                  {tx('3. Ave Compañera Favorita:', '3. Favorite Companion Bird:')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {COMPANION_BIRDS_OPTIONS.map((bird) => {
                    const isSelected = selectedBird === bird.name;
                    return (
                      <button
                        type="button"
                        key={bird.name}
                        onClick={() => {
                          soundManager.playBirdSound(bird.name);
                          setSelectedBird(bird.name);
                        }}
                        className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/40 shadow-md'
                            : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{bird.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                        <div className="text-[9px] text-teal-300/90 italic truncate">{bird.scientific}</div>
                        <div className="text-[8px] text-slate-400 truncate mt-0.5">{bird.badge}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full mt-2 py-3 rounded-2xl game-btn-orange text-white text-xs font-black uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>
                  {tx('GUARDAR PERFIL E INICIAR EXPEDICIÓN', 'SAVE PROFILE & START EXPEDITION')}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RETURNING PLAYER (PROFILE SELECTOR & MANAGER) */}
      {activeModal === 'returning_player' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-sm max-h-[92vh] flex flex-col rounded-3xl overflow-hidden bg-slate-900 border-2 border-teal-500 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-teal-900/60">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-400" />
                <div>
                  <h3 className="font-bold text-sm text-white">
                    {tx('PERFILES GUARDADOS', 'SAVED PROFILES')}
                  </h3>
                  <p className="text-[10px] text-teal-300">
                    {tx('Selecciona tu explorador en este dispositivo', 'Select your explorer on this device')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setActiveModal('none');
                }}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profiles List */}
            <div className="p-3.5 space-y-2.5 flex-1 overflow-y-auto">
              {profiles.map((profile) => {
                const isActive = activeProfile?.id === profile.id;
                return (
                  <div
                    key={profile.id}
                    onClick={() => handleSelectReturningProfile(profile.id)}
                    className={`relative p-3 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] ${
                      isActive
                        ? 'bg-teal-950/90 border-amber-400 shadow-lg ring-2 ring-amber-400/40'
                        : 'bg-slate-950/80 border-slate-800 hover:border-teal-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl p-1.5 rounded-xl bg-teal-900/50 border border-teal-700/50">
                          {profile.avatarIcon || '🧢'}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-white">{profile.name}</h4>
                            {isActive && (
                              <span className="px-1.5 py-0.2 rounded-md bg-amber-400 text-slate-950 text-[9px] font-black">
                                {tx('ACTIVO', 'ACTIVE')}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-teal-300 font-medium">
                            {tx('Ave:', 'Bird:')}{' '}
                            <span className="text-white font-semibold">{profile.favoriteBird}</span>
                          </div>
                        </div>
                      </div>

                      {/* Delete profile button */}
                      <button
                        onClick={(e) => handleDeleteWithConfirm(e, profile.id, profile.name)}
                        className="w-7 h-7 rounded-lg bg-slate-900 text-slate-500 hover:text-rose-400 hover:bg-rose-950/60 flex items-center justify-center border border-slate-800 transition-colors"
                        title={tx('Eliminar este perfil', 'Delete this profile')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Stats Strip */}
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 grid grid-cols-3 gap-1.5 text-center text-[10px]">
                      <div className="bg-slate-900/80 rounded-lg p-1">
                        <span className="text-slate-400 block text-[9px]">{tx('NIVEL', 'LEVEL')}</span>
                        <span className="font-extrabold text-amber-400">{tx('Nv.', 'Lv.')} {profile.level}</span>
                      </div>
                      <div className="bg-slate-900/80 rounded-lg p-1">
                        <span className="text-slate-400 block text-[9px]">{tx('EXPERIENCIA', 'EXPERIENCE')}</span>
                        <span className="font-bold text-teal-300">{profile.xp} XP</span>
                      </div>
                      <div className="bg-slate-900/80 rounded-lg p-1">
                        <span className="text-slate-400 block text-[9px]">{tx('MEDALLAS', 'BADGES')}</span>
                        <span className="font-bold text-emerald-300 flex items-center justify-center gap-0.5">
                          {profile.hasRisingObserverBadge ? <Award className="w-3 h-3 text-amber-400" /> : '0'}
                          <span>{profile.hasRisingObserverBadge ? tx('Observador', 'Observer') : ''}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Quick Add Profile Button */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  setActiveModal('new_player');
                }}
                className="w-full py-2.5 rounded-xl border-2 border-dashed border-teal-700/60 hover:border-teal-400 text-teal-300 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-teal-950/50 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>
                  {tx('+ Crear Otro Perfil de Explorador', '+ Create Another Explorer Profile')}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
