import React, { useState } from 'react';
import {
  Settings,
  HelpCircle,
  Map,
  ShoppingBag,
  Binoculars,
  Camera,
  Award,
  Sparkles,
  ChevronDown,
  X,
  Volume2,
  Users,
  LogOut,
  Cloud
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { PlayerProfile, Mission } from '../types/game';
import { SHOP_ITEMS } from '../data/birdsData';
import { useLanguage, LanguageSelector, localizeMission, localizeDifficultyLabel } from '../utils/i18n';
import { PWAInstallButton } from './PWAInstallButton';
import { AvatarIcon } from './AvatarIcon';

interface Screen4MainHubProps {
  playerProfile: PlayerProfile;
  missions: Mission[];
  onOpenOptions: () => void;
  onOpenTips: () => void;
  onOpenMap: () => void;
  onOpenShop: () => void;
  onOpenBirds: () => void;
  onOpenSighting: () => void;
  onOpenCamera: () => void;
  onOpenBadge?: () => void;
  onOpenDrive: () => void;
  onOpenSquadsAndSeasons: () => void;
  onOpenMiroAvatar?: () => void;
  onOpenMiroFlow?: () => void;
  onChangePlayer: () => void;
  onBackToSplash: () => void;
}

export const Screen4MainHub: React.FC<Screen4MainHubProps> = ({
  playerProfile,
  missions,
  onOpenOptions,
  onOpenTips,
  onOpenMap,
  onOpenShop,
  onOpenBirds,
  onOpenSighting,
  onOpenCamera,
  onOpenBadge,
  onOpenDrive,
  onOpenSquadsAndSeasons,
  onOpenMiroAvatar,
  onOpenMiroFlow,
  onChangePlayer,
  onBackToSplash
}) => {
  const { lang, tx } = useLanguage();
  const [showMissionsModal, setShowMissionsModal] = useState(false);
  const [showQuickExitModal, setShowQuickExitModal] = useState(false);

  // Weekly progress calculation
  const weeklyMissionsDone = missions.filter(m => m.completed).length;
  const weeklyProgressPercent = Math.min(100, Math.round((weeklyMissionsDone / missions.length) * 100));

  return (
    <div
      className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-cover bg-center select-none"
      style={{ backgroundImage: `url('/assets/aistudio/Botanical_park_start_screen_logo_546dfb3b_47fb3d00.jpg')` }}
    >
      {/* 1. TOP BAR */}
      <div className="relative z-20 flex items-center justify-between p-2.5 sm:p-3 bg-slate-950/75 backdrop-blur-md border-b border-teal-800/40 gap-1.5">
        {/* Left: Active Player Pill ("YO / JUGADORES" Miro Screen) + "Flujo Miro" */}
        <div className="flex items-center gap-1 min-w-0">
          <button
            onClick={() => {
              soundManager.playClick();
              if (onOpenMiroAvatar) onOpenMiroAvatar();
              else onChangePlayer();
            }}
            className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-teal-950/90 hover:bg-teal-900 border border-amber-400/60 text-white shadow min-w-0 cursor-pointer active:scale-95 transition-all"
            title={tx('Abrir Perfil YO / JUGADORES y Avatar con Ave Compañera', 'Open ME / PLAYERS Profile & Companion Bird Avatar')}
          >
            <AvatarIcon icon={playerProfile.avatarIcon} className="w-5 h-5" alt={playerProfile.name} />
            <span className="text-[11px] font-black text-amber-300 truncate max-w-[58px]">
              {playerProfile.name}
            </span>
            <span className="text-teal-400">·</span>
            <span className="text-[10px] text-teal-200 truncate max-w-[52px]">
              {playerProfile.favoriteBird}
            </span>
            {(playerProfile.equippedItems || ['visera-oficial']).length > 0 && (
              <span className="hidden xs:flex items-center gap-0.5 text-[10px] pl-0.5">
                {SHOP_ITEMS.filter(it => (playerProfile.equippedItems || ['visera-oficial']).includes(it.id))
                  .slice(0, 2)
                  .map(it => (
                    <span key={it.id} title={it.name}>
                      {it.icon}
                    </span>
                  ))}
              </span>
            )}
          </button>

          {onOpenMiroFlow && (
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenMiroFlow();
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-400/90 hover:bg-amber-300 text-slate-950 text-[10px] font-black border border-amber-200 shadow shrink-0 active:scale-95 transition-all cursor-pointer"
              title={tx('Ver Arquitectura de Estaciones Digitales y Tablero Miro', 'View Digital Stations Architecture & Miro Board')}
            >
              <span>🗺️</span>
              <span className="hidden xs:inline">{tx('Miro', 'Miro')}</span>
            </button>
          )}
        </div>

        {/* Right: Level/XP + Language Selector (ES | EN) + PWA Install + Opciones (gear) + Consejos (?) */}
        <div className="flex items-center gap-1 shrink-0">
          <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/90 border border-teal-500/30 text-[10px] text-white">
            <span className="font-extrabold text-amber-400">
              {tx('NV', 'LV')} {playerProfile.level}
            </span>
            <span className="text-teal-400">·</span>
            <span className="font-semibold text-teal-200">{playerProfile.xp} XP</span>
          </div>

          {/* Selector de Idioma (ES / EN) junto al engranaje */}
          <LanguageSelector />

          {/* Botón de instalación rápida PWA */}
          <PWAInstallButton compact />

          {/* Botón circular "OPCIONES" (engranaje) */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenOptions();
            }}
            className="w-8 h-8 rounded-full bg-white/90 text-teal-900 game-btn-circle flex items-center justify-center hover:bg-white active:scale-95 cursor-pointer shadow-md"
            title={tx('Opciones del Juego', 'Game Options')}
          >
            <Settings className="w-4 h-4 text-teal-950 stroke-[2.5]" />
          </button>

          {/* Botón circular "CONSEJOS" (signo "?") */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenTips();
            }}
            className="w-8 h-8 rounded-full bg-sky-200 text-sky-950 game-btn-circle flex items-center justify-center hover:bg-sky-100 active:scale-95 cursor-pointer shadow-md"
            title={tx('Consejos y Regla de Nivel', 'Tips & Level Rule')}
          >
            <HelpCircle className="w-4 h-4 text-sky-950 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* 2. CENTER UPPER: Toucan Guide + Speech Bubble */}
      <div className="relative z-10 flex flex-col items-center px-4 pt-1">
        {/* Speech Bubble */}
        <div className="relative max-w-xs bg-white text-slate-900 rounded-3xl p-3 shadow-xl border-3 border-teal-900 mb-2 animate-float">
          <p className="text-xs font-bold leading-snug text-center">
            {tx(
              '"¡Estas son las opciones del juego! Necesitas más avistamientos para seguir obteniendo desbloqueos."',
              '"These are the game options! You need more sightings to keep earning unlocks."'
            )}
          </p>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-r-3 border-b-3 border-teal-900 rotate-45" />
        </div>

        {/* Toucan Host Character Greeting with Sound */}
        <div className="relative flex items-center justify-center">
          <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 border-amber-400 p-0.5 shadow-2xl overflow-hidden bg-teal-950 ring-4 ring-teal-400/40 relative">
            <img
              src="/assets/aistudio/toucan_guide_portrait.jpg"
              alt={tx('Tucán Grande Guía con visera verde y mochila', 'Toco Toucan Guide with green visor and backpack')}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Audio greeting & croak button on the Toucan */}
          <button
            onClick={() => {
              soundManager.playToucanGreeting(lang);
            }}
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center border-2 border-slate-900 shadow-lg hover:scale-110 active:scale-95 cursor-pointer"
            title={tx('Escuchar saludo y voz del Tucán Grande', 'Listen to Toco Toucan greeting & call')}
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Floating / Highlighted Button: "MISIONES DEL DÍA (20-40 min)" */}
        <button
          onClick={() => {
            soundManager.playClick();
            setShowMissionsModal(true);
          }}
          className="mt-2 w-full max-w-xs py-1.5 px-3 rounded-2xl bg-gradient-to-r from-teal-900/90 via-teal-800/90 to-emerald-900/90 backdrop-blur-md border-2 border-amber-400/80 shadow-xl flex items-center justify-between cursor-pointer hover:border-amber-300 active:scale-98 transition-all group"
        >
          <div className="flex items-center gap-2">
            <span className="text-base">🎯</span>
            <div className="text-left">
              <div className="text-[11px] font-black text-amber-300 tracking-wide uppercase flex items-center gap-1">
                <span>{tx('MISIONES DEL DÍA', 'DAILY MISSIONS')}</span>
                <span className="text-[9px] text-teal-200 font-bold">(20-40 min)</span>
              </div>
              <div className="text-[9px] text-teal-200">
                {tx(
                  `${missions.filter(m => m.completed).length} de ${missions.length} completadas hoy`,
                  `${missions.filter(m => m.completed).length} of ${missions.length} completed today`
                )}
              </div>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-amber-300 group-hover:translate-y-0.5 transition-transform" />
        </button>

        {/* Acceso Destacado: "YO / JUGADORES" (Avatar con Ave Compañera en Hombro) + "Cuadrillas y Temporadas" */}
        <div className="mt-1.5 w-full max-w-xs grid grid-cols-2 gap-1.5">
          <button
            onClick={() => {
              soundManager.playClick();
              if (onOpenMiroAvatar) onOpenMiroAvatar();
            }}
            className="py-1.5 px-2.5 rounded-2xl bg-gradient-to-r from-[#FDF6E2] to-[#F2D58B] border-2 border-amber-400 shadow-lg flex items-center justify-between cursor-pointer hover:brightness-105 active:scale-98 transition-all text-slate-950"
          >
            <div className="text-left min-w-0">
              <div className="text-[10px] font-black uppercase tracking-tight truncate">
                {tx('YO / JUGADORES', 'ME / PLAYERS')}
              </div>
              <div className="text-[8px] font-bold text-amber-900 truncate">
                {playerProfile.name} &amp; {playerProfile.favoriteBird.split(' ')[0]}
              </div>
            </div>
            <span className="text-sm shrink-0">🦜</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenSquadsAndSeasons();
            }}
            className="py-1.5 px-2.5 rounded-2xl bg-gradient-to-r from-amber-500/95 to-orange-500/95 border-2 border-amber-200 shadow-lg flex items-center justify-between cursor-pointer hover:brightness-105 active:scale-98 transition-all text-slate-950"
          >
            <div className="text-left min-w-0">
              <div className="text-[10px] font-black uppercase tracking-tight truncate">
                {tx('Cuadrillas', 'Squads')}
              </div>
              <div className="text-[8px] font-bold text-amber-950 truncate">
                {tx('Temporadas y Ranking', 'Seasons & Ranking')}
              </div>
            </div>
            <Users className="w-3.5 h-3.5 text-slate-950 shrink-0" />
          </button>
        </div>

        {/* Badge shortcut if unlocked */}
        {playerProfile.hasRisingObserverBadge && (
          <button
            onClick={() => {
              soundManager.playSuccess();
              if (onOpenBadge) onOpenBadge();
            }}
            className="mt-1 flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px] shadow-lg animate-pulse"
          >
            <Award className="w-3.5 h-3.5" />
            <span>
              {tx(
                '¡Insignia de Observador en Ascenso Portada!',
                'Rising Observer Badge Equipped!'
              )}
            </span>
          </button>
        )}
      </div>

      {/* 3. 4 BIG CIRCULAR BUTTONS + SINGLE CENTERED CIRCULAR "X" BUTTON BELOW */}
      <div className="relative z-10 w-full max-w-xs mx-auto px-4 pb-5 pt-1 flex flex-col items-center gap-3.5">
        <div className="w-full grid grid-cols-4 gap-2.5 items-center justify-items-center">
          {/* 1) MAPAS */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenMap();
              }}
              className="w-16 h-16 rounded-full bg-white text-teal-900 game-btn-circle flex items-center justify-center hover:bg-slate-50 cursor-pointer shadow-xl active:scale-90 transition-transform"
              title={tx('Mapas', 'Maps')}
            >
              <div className="w-10 h-10 rounded-full bg-teal-100/70 flex items-center justify-center">
                <Map className="w-5 h-5 text-teal-800 stroke-[2.5]" />
              </div>
            </button>
            <span className="mt-1 text-[11px] font-black text-white tracking-wider uppercase drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)]">
              {tx('MAPAS', 'MAPS')}
            </span>
          </div>

          {/* 2) TIENDA */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenShop();
              }}
              className="w-16 h-16 rounded-full bg-white text-teal-900 game-btn-circle flex items-center justify-center hover:bg-slate-50 cursor-pointer shadow-xl active:scale-90 transition-transform"
              title={tx('Tienda', 'Shop')}
            >
              <div className="w-10 h-10 rounded-full bg-amber-100/70 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-amber-700 stroke-[2.5]" />
              </div>
            </button>
            <span className="mt-1 text-[11px] font-black text-white tracking-wider uppercase drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)]">
              {tx('TIENDA', 'SHOP')}
            </span>
          </div>

          {/* 3) AVES */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenBirds();
              }}
              className="w-16 h-16 rounded-full bg-white text-teal-900 game-btn-circle flex items-center justify-center hover:bg-slate-50 cursor-pointer shadow-xl active:scale-90 transition-transform"
              title={tx('Aves y Trivia', 'Birds & Trivia')}
            >
              <div className="w-10 h-10 rounded-full bg-sky-100/70 flex items-center justify-center">
                <svg className="w-5 h-5 text-sky-800" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C9 5 4 8 2 10c3 1 7 0 10 2 3-2 7-1 10-2-2-2-7-5-10-8z" />
                </svg>
              </div>
            </button>
            <span className="mt-1 text-[11px] font-black text-white tracking-wider uppercase drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)]">
              {tx('AVES', 'BIRDS')}
            </span>
          </div>

          {/* 4) AVISTAMIENTO */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenSighting();
              }}
              className="w-16 h-16 rounded-full game-btn-orange flex items-center justify-center cursor-pointer shadow-2xl active:scale-90 transition-transform ring-3 ring-amber-300/50"
              title={tx('Avistamiento de aves', 'Bird Sighting')}
            >
              <div className="w-10 h-10 rounded-full bg-amber-950/20 flex items-center justify-center">
                <Binoculars className="w-6 h-6 text-white stroke-[2.5]" />
              </div>
            </button>
            <span className="mt-1 text-[10px] font-black text-amber-300 tracking-tight uppercase drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)] truncate max-w-[76px]">
              {tx('AVISTAMIENTO', 'SIGHTING')}
            </span>
          </div>
        </div>

        {/* ÚNICO BOTÓN CIRCULAR "X" CENTRADO DEBAJO DE LOS 4 BOTONES PRINCIPALES */}
        <button
          onClick={() => {
            soundManager.playClick();
            setShowQuickExitModal(true);
          }}
          className="w-12 h-12 rounded-full bg-teal-900/90 hover:bg-teal-800 text-teal-100 border-2 border-teal-300/80 shadow-[0_0_16px_rgba(45,212,191,0.5)] flex items-center justify-center active:scale-90 transition-all cursor-pointer"
          title={tx('Cambiar de Jugador o Volver al Inicio', 'Switch Player or Return to Start')}
        >
          <X className="w-5 h-5 text-teal-100 stroke-[2.5]" />
        </button>
      </div>

      {/* MODAL RÁPIDO AL PULSAR "X": ACCIONES DE SALIDA Y RETORNO */}
      {showQuickExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xs rounded-3xl overflow-hidden bg-slate-900 border-2 border-teal-500 shadow-2xl p-4 text-center">
            <div className="flex items-center justify-between pb-2 border-b border-teal-900">
              <h4 className="text-sm font-bold text-white">
                {tx('MENÚ DE NAVEGACIÓN', 'NAVIGATION MENU')}
              </h4>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setShowQuickExitModal(false);
                }}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3 space-y-2">
              {/* Action a: Cambiar de Jugador / Personaje */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  setShowQuickExitModal(false);
                  onChangePlayer();
                }}
                className="w-full p-2.5 rounded-xl bg-teal-900/80 hover:bg-teal-800 text-teal-100 text-xs font-bold border border-teal-600/60 flex items-center gap-2.5 transition-colors"
              >
                <Users className="w-4 h-4 text-amber-400" />
                <div className="text-left">
                  <div>{tx('Cambiar de Jugador / Personaje', 'Switch Player / Character')}</div>
                  <div className="text-[9px] text-teal-300 font-normal">
                    {tx('Guarda tu avance y elige o crea otro perfil', 'Save your progress and choose or create another profile')}
                  </div>
                </div>
              </button>

              {/* Action b: Cambiar Ave Compañera / Tomar Foto */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  setShowQuickExitModal(false);
                  onOpenCamera();
                }}
                className="w-full p-2.5 rounded-xl bg-teal-900/80 hover:bg-teal-800 text-teal-100 text-xs font-bold border border-teal-600/60 flex items-center gap-2.5 transition-colors"
              >
                <Camera className="w-4 h-4 text-sky-400" />
                <div className="text-left">
                  <div>{tx('Cambiar Ave Compañera / Foto', 'Change Companion Bird / Photo')}</div>
                  <div className="text-[9px] text-teal-300 font-normal">
                    {tx('Abre el selector de ave y la cámara sin flash', 'Opens the bird selector and no-flash camera')}
                  </div>
                </div>
              </button>

              {/* Google Drive Cloud Sync */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  setShowQuickExitModal(false);
                  onOpenDrive();
                }}
                className="w-full p-2.5 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 text-xs font-bold border border-emerald-500/60 flex items-center gap-2.5 transition-colors"
              >
                <Cloud className="w-4 h-4 text-emerald-300" />
                <div className="text-left">
                  <div>{tx('Sincronizar con Google Drive', 'Sync with Google Drive')}</div>
                  <div className="text-[9px] text-emerald-300 font-normal">
                    {tx('Exporta tu Diario Científico y respaldo en la nube', 'Export your Field Journal and cloud backup')}
                  </div>
                </div>
              </button>

              {/* Action c: Volver a la Portada Principal */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  setShowQuickExitModal(false);
                  onBackToSplash();
                }}
                className="w-full p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-2.5 transition-colors"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <div className="text-left">
                  <div>{tx('Volver a la Portada Principal', 'Return to Main Cover')}</div>
                  <div className="text-[9px] text-slate-400 font-normal">
                    {tx('Regresa a la pantalla inicial del juego', 'Go back to the initial splash screen')}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Misiones del Día (20 a 40 minutos) */}
      {showMissionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-sm max-h-[90vh] flex flex-col rounded-3xl overflow-hidden bg-slate-900 border-2 border-teal-500 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-teal-900/60">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎯</span>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    {tx('MISIONES DEL DÍA', 'DAILY MISSIONS')}
                  </h3>
                  <p className="text-[10px] text-teal-300">
                    {tx('Meta recomendada: 20 a 40 minutos de sendero', 'Recommended goal: 20 to 40 minutes on the trail')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setShowMissionsModal(false);
                }}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Missions List */}
            <div className="p-3.5 space-y-3 flex-1 overflow-y-auto">
              {/* Weekly Mission Progress Bar */}
              <div className="bg-teal-950/70 border border-teal-700/50 rounded-2xl p-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-amber-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    {tx('Misión Semanal de Fin de Semana', 'Weekend Weekly Mission')}
                  </span>
                  <span className="text-teal-200">{weeklyProgressPercent}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-teal-900">
                  <div
                    className="h-full bg-gradient-to-r from-teal-400 to-amber-400 transition-all duration-500"
                    style={{ width: `${weeklyProgressPercent}%` }}
                  />
                </div>
                <div className="text-[10px] text-teal-300/80">
                  {tx(
                    'Completa las 3 misiones para obtener el "Sobre de Siluetas Raras de las Yungas".',
                    'Complete all 3 missions to earn the "Rare Yungas Silhouettes Pack".'
                  )}
                </div>
              </div>

              {/* 3 Active Daily Missions */}
              {missions.map((rawMission) => {
                const mission = localizeMission(rawMission, lang);
                const diffBadgeColor =
                  rawMission.difficulty === 'Fácil'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-600/50'
                    : rawMission.difficulty === 'Media'
                    ? 'bg-amber-950 text-amber-300 border-amber-600/50'
                    : 'bg-rose-950 text-rose-300 border-rose-600/50';

                return (
                  <div
                    key={mission.id}
                    className="bg-slate-950/80 border border-teal-900/60 rounded-2xl p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white">{mission.title}</h4>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${diffBadgeColor}`}>
                            {localizeDifficultyLabel(rawMission.difficulty, lang)} · {mission.duration}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-snug mt-1">
                          {mission.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px]">
                      <div className="text-amber-400 font-bold">
                        +{mission.xpReward} XP · {mission.extraReward}
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-teal-950 text-teal-300 font-semibold border border-teal-800/40">
                        {mission.progress}/{mission.target}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Bottom CTA */}
            <div className="p-3 bg-slate-950 border-t border-teal-900/80">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setShowMissionsModal(false);
                  onOpenSighting();
                }}
                className="w-full py-3 rounded-2xl game-btn-orange text-white text-xs font-bold"
              >
                {tx(
                  'IR A CUMPLIR MISIÓN CON PRISMÁTICOS',
                  'START MISSION WITH XR BINOCULARS'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
