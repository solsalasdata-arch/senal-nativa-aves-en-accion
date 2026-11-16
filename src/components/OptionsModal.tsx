import React from 'react';
import { ModalHeader } from './ui';
import { useModalEscape } from './ui/useModalEscape';
import type { SaveResult } from '../utils/profileActions';
import {
  Settings,
  X,
  Volume2,
  VolumeX,
  Trees,
  Info,
  RotateCcw,
  Users,
  Camera,
  LogOut,
  Cloud,
  Globe
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { useLanguage } from '../utils/i18n';
import { PWAInstallButton } from './PWAInstallButton';
import { BackupRecovery } from './BackupRecovery';
import type { PlayerProfile } from '../types/game';
import type { BackupPhoto } from '../utils/backup';

interface OptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  bgmEnabled: boolean;
  onToggleSound: () => void;
  onToggleBgm: () => void;
  onResetProgress: () => SaveResult | void;
  onChangePlayer: () => void;
  onChangeCompanionOrPhoto: () => void;
  onBackToSplash: () => void;
  onOpenDrive: () => void;
  activeProfile?: PlayerProfile;
  onRestoreProfileData?: (profile: PlayerProfile, photos: BackupPhoto[]) => Promise<SaveResult>;
}

export const OptionsModal: React.FC<OptionsModalProps> = ({
  isOpen,
  onClose,
  soundEnabled,
  bgmEnabled,
  onToggleSound,
  onToggleBgm,
  onResetProgress,
  onChangePlayer,
  onChangeCompanionOrPhoto,
  onBackToSplash,
  onOpenDrive,
  activeProfile,
  onRestoreProfileData
}) => {
  const { lang, setLang, tx } = useLanguage();

  useModalEscape(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label={tx('OPCIONES DEL JUEGO', 'GAME OPTIONS')} className="ui-overlay z-50 flex items-center justify-center sm:p-3 animate-fadeIn">
      <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-surface-900 text-ink sm:max-h-[94dvh] sm:max-w-md sm:rounded-3xl sm:border sm:border-white/20 shadow-xl">
        {/* Header */}
        <div className="pt-safe shrink-0 bg-forest-950"><ModalHeader title={tx('OPCIONES DEL JUEGO', 'GAME OPTIONS')} subtitle={tx('Configuración, Idioma, Jugador y Reserva', 'Settings, Language, Player & Reserve')} icon={<Settings aria-hidden="true" className="h-5 w-5" />} onClose={() => {
              soundManager.playClick();
              onClose();
            }} /></div>

        {/* Content */}
        <div className="pb-safe min-h-0 p-4 space-y-4 flex-1 overflow-y-auto text-xs text-slate-200">
          {activeProfile && onRestoreProfileData && <BackupRecovery key={activeProfile.id} profile={activeProfile} onRestore={onRestoreProfileData} />}
          {/* SECCIÓN 0: SELECTOR DE IDIOMA Y MODO PWA OFFLINE */}
          <div className="ui-card bg-surface-950 rounded-2xl p-3 border border-amber-400/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white">
                  {tx('Idioma de la Interfaz', 'Interface Language')}
                </span>
              </div>
              <div className="flex gap-1 bg-surface-900 p-1 rounded-xl border border-teal-800">
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setLang('es');
                  }}
                  className={`min-h-11 min-w-11 px-2.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                    lang === 'es'
                      ? 'bg-amber-400 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Español (ES)
                </button>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setLang('en');
                  }}
                  className={`min-h-11 min-w-11 px-2.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                    lang === 'en'
                      ? 'bg-amber-400 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  English (EN)
                </button>
              </div>
            </div>

            <div className="[&_button]:min-h-11 [&_button_div_div:last-child]:text-[11px]"><PWAInstallButton /></div>
          </div>

          {/* SECCIÓN 1: ACCIONES PRINCIPALES DE JUGADOR Y NAVEGACIÓN */}
          <div className="ui-card bg-surface-950 rounded-2xl p-3 border border-teal-700/60 space-y-2">
            <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wide">
              {tx('ACCIONES DE EXPEDICIÓN', 'EXPEDITION ACTIONS')}
            </div>

            {/* Google Drive Sync */}
            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
                onOpenDrive();
              }}
              className="min-h-11 min-w-11 w-full p-2.5 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 text-xs font-bold border border-emerald-500/60 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Cloud className="w-4 h-4 text-emerald-300 shrink-0" />
              <div className="text-left flex-1">
                <div>{tx('Sincronizar con Google Drive', 'Sync with Google Drive')}</div>
                <div className="text-[11px] text-emerald-300 font-normal">
                  {tx(
                    'Exporta tu Diario Científico o restaura respaldos en la nube',
                    'Export your Field Journal or restore cloud backups'
                  )}
                </div>
              </div>
            </button>

            {/* a) Cambiar de Jugador / Personaje */}
            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
                onChangePlayer();
              }}
              className="min-h-11 min-w-11 w-full p-2.5 rounded-xl bg-teal-900/80 hover:bg-teal-800 text-teal-100 text-xs font-bold border border-teal-600/60 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Users className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-left flex-1">
                <div>{tx('Cambiar de Jugador / Personaje', 'Switch Player / Character')}</div>
                <div className="text-[11px] text-teal-300 font-normal">
                  {tx(
                    'Guarda tu progreso y elige o crea otro explorador',
                    'Save your progress and choose or create another explorer'
                  )}
                </div>
              </div>
            </button>

            {/* b) Cambiar Ave Compañera / Tomar Foto */}
            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
                onChangeCompanionOrPhoto();
              }}
              className="min-h-11 min-w-11 w-full p-2.5 rounded-xl bg-teal-900/80 hover:bg-teal-800 text-teal-100 text-xs font-bold border border-teal-600/60 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Camera className="w-4 h-4 text-sky-400 shrink-0" />
              <div className="text-left flex-1">
                <div>{tx('Cambiar Ave Compañera / Tomar Foto', 'Change Companion Bird / Take Photo')}</div>
                <div className="text-[11px] text-teal-300 font-normal">
                  {tx(
                    'Posar con Tucán, Benteveo, Chinchero o Picaflor sin flash',
                    'Pose with Toucan, Kiskadee, Woodcreeper, or Comet without flash'
                  )}
                </div>
              </div>
            </button>

            {/* c) Volver a la Portada Principal */}
            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
                onBackToSplash();
              }}
              className="min-h-11 min-w-11 w-full p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
              <div className="text-left flex-1">
                <div>{tx('Volver a la Portada Principal', 'Return to Main Cover')}</div>
                <div className="text-[11px] text-slate-400 font-normal">
                  {tx(
                    'Regresar a la pantalla de bienvenida del juego',
                    'Return to the welcome splash screen'
                  )}
                </div>
              </div>
            </button>
          </div>

          {/* SECCIÓN 2: AJUSTES DE AUDIO */}
          <div className="ui-card bg-surface-950 rounded-2xl p-3 border border-teal-900/60 space-y-3">
            <div className="text-[11px] font-bold text-teal-300 uppercase">
              {tx('AJUSTES DE AUDIO', 'AUDIO SETTINGS')}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
                <span>{tx('Efectos de Sonido y Cantos', 'Sound Effects & Bird Calls')}</span>
              </div>
              <button
                onClick={() => {
                  soundManager.playClick();
                  onToggleSound();
                }}
                className={`min-h-11 min-w-11 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  soundEnabled
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {soundEnabled ? tx('Activado', 'Enabled') : tx('Mudo', 'Muted')}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trees className="w-4 h-4 text-teal-400" />
                <span>{tx('Brisa de Selva Montana', 'Mountain Forest Breeze')}</span>
              </div>
              <button
                onClick={() => {
                  soundManager.playClick();
                  onToggleBgm();
                }}
                className={`min-h-11 min-w-11 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  bgmEnabled
                    ? 'bg-teal-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {bgmEnabled ? tx('En reproducción', 'Playing') : tx('Pausado', 'Paused')}
              </button>
            </div>
          </div>

          {/* SECCIÓN 3: INFORMACIÓN DE LA RESERVA */}
          <div className="ui-card bg-surface-950 rounded-2xl p-3 border border-teal-900/60 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300 uppercase">
              <Info className="w-3.5 h-3.5" />
              <span>{tx('PARQUE BOTÁNICO MUNICIPAL', 'MUNICIPAL BOTANICAL PARK')}</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              <strong>"Barón Carlos María Schuel"</strong>{' '}
              {tx(
                'es una Reserva Natural Urbana de 15.5 hectáreas en el barrio Los Perales, San Salvador de Jujuy.',
                'is a 15.5-hectare Urban Nature Reserve in the Los Perales neighborhood, San Salvador de Jujuy.'
              )}
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-teal-200">
              <div className="bg-teal-950/50 p-2 rounded-lg border border-teal-900/40">
                <span className="block font-bold text-amber-300">{tx('ALTITUD', 'ALTITUDE')}</span>
                {tx('1334 a 1463 m.s.n.m.', '1334 to 1463 m.a.s.l.')}
              </div>
              <div className="bg-teal-950/50 p-2 rounded-lg border border-teal-900/40">
                <span className="block font-bold text-amber-300">{tx('ECOSISTEMA', 'ECOSYSTEM')}</span>
                {tx('Selva Montana de las Yungas', 'Yungas Mountain Forest')}
              </div>
            </div>
          </div>

          {/* SECCIÓN 4: CÓDIGO ÉTICO */}
          <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-2xl p-3 text-[11px] text-emerald-200 space-y-1">
            <div className="font-bold text-emerald-300">
              {tx('CÓDIGO DEL OBSERVADOR ÉTICO:', 'ETHICAL OBSERVER CODE:')}
            </div>
            <ul className="list-disc list-inside space-y-0.5 opacity-90">
              <li>{tx('Nunca uses flash: desorienta y estresa a las aves.', 'Never use flash: it disorients and stresses birds.')}</li>
              <li>{tx('Mantén el silencio para escuchar los cantos nativos.', 'Keep quiet so you can hear native bird calls.')}</li>
              <li>{tx('No dejes residuos en los senderos.', 'Leave no litter on the trails.')}</li>
              <li>{tx('Permanece siempre en las sendas señalizadas.', 'Always stay on marked trails.')}</li>
            </ul>
          </div>

          {/* Reiniciar perfil actual */}
          <div className="pt-1">
            <button
              onClick={() => {
                if (
                  confirm(
                    tx(
                      '¿Deseas reiniciar los puntos y misiones del perfil activo a Nivel 1?',
                      'Do you want to reset the active profile points and missions to Level 1?'
                    )
                  )
                ) {
                  soundManager.playClick();
                  const result = onResetProgress();
                  if (result && !result.saved) return;
                  onClose();
                }
              }}
              className="min-h-11 min-w-11 w-full py-2.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 hover:text-white hover:bg-rose-900/80 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{tx('Reiniciar Progreso de este Perfil', 'Reset Progress for This Profile')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
