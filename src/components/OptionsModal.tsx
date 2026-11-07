import React from 'react';
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
  Cloud
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface OptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  bgmEnabled: boolean;
  onToggleSound: () => void;
  onToggleBgm: () => void;
  onResetProgress: () => void;
  onChangePlayer: () => void;
  onChangeCompanionOrPhoto: () => void;
  onBackToSplash: () => void;
  onOpenDrive: () => void;
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
  onOpenDrive
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm max-h-[92vh] flex flex-col rounded-3xl overflow-hidden bg-slate-900 border-2 border-teal-500 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-teal-900/60">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-teal-400" />
            <div>
              <h3 className="font-bold text-sm text-white">OPCIONES DEL JUEGO</h3>
              <p className="text-[10px] text-teal-300">Configuración, Jugador y Reserva</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 flex-1 overflow-y-auto text-xs text-slate-200">
          {/* SECCIÓN 1: ACCIONES PRINCIPALES DE JUGADOR Y NAVEGACIÓN */}
          <div className="bg-slate-950/90 rounded-2xl p-3 border border-teal-700/60 space-y-2">
            <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wide">
              ACCIONES DE EXPEDICIÓN
            </div>

            {/* Google Drive Sync */}
            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
                onOpenDrive();
              }}
              className="w-full p-2.5 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 text-xs font-bold border border-emerald-500/60 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Cloud className="w-4 h-4 text-emerald-300 shrink-0" />
              <div className="text-left flex-1">
                <div>Sincronizar con Google Drive</div>
                <div className="text-[9px] text-emerald-300 font-normal">Exporta tu Diario Científico o restaura respaldos en la nube</div>
              </div>
            </button>

            {/* a) Cambiar de Jugador / Personaje */}
            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
                onChangePlayer();
              }}
              className="w-full p-2.5 rounded-xl bg-teal-900/80 hover:bg-teal-800 text-teal-100 text-xs font-bold border border-teal-600/60 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Users className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-left flex-1">
                <div>Cambiar de Jugador / Personaje</div>
                <div className="text-[9px] text-teal-300 font-normal">Guarda tu progreso y elige o crea otro explorador</div>
              </div>
            </button>

            {/* b) Cambiar Ave Compañera / Tomar Foto */}
            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
                onChangeCompanionOrPhoto();
              }}
              className="w-full p-2.5 rounded-xl bg-teal-900/80 hover:bg-teal-800 text-teal-100 text-xs font-bold border border-teal-600/60 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Camera className="w-4 h-4 text-sky-400 shrink-0" />
              <div className="text-left flex-1">
                <div>Cambiar Ave Compañera / Tomar Foto</div>
                <div className="text-[9px] text-teal-300 font-normal">Posar con Tucán, Benteveo, Chinchero o Picaflor sin flash</div>
              </div>
            </button>

            {/* c) Volver a la Portada Principal */}
            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
                onBackToSplash();
              }}
              className="w-full p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
              <div className="text-left flex-1">
                <div>Volver a la Portada Principal</div>
                <div className="text-[9px] text-slate-400 font-normal">Regresar a la pantalla de bienvenida del juego</div>
              </div>
            </button>
          </div>

          {/* SECCIÓN 2: AJUSTES DE AUDIO */}
          <div className="bg-slate-950/80 rounded-2xl p-3 border border-teal-900/60 space-y-3">
            <div className="text-[11px] font-bold text-teal-300 uppercase">AJUSTES DE AUDIO</div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
                <span>Efectos de Sonido y Cantos</span>
              </div>
              <button
                onClick={() => {
                  soundManager.playClick();
                  onToggleSound();
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  soundEnabled
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {soundEnabled ? 'Activado' : 'Mudo'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trees className="w-4 h-4 text-teal-400" />
                <span>Brisa de Selva Montana</span>
              </div>
              <button
                onClick={() => {
                  soundManager.playClick();
                  onToggleBgm();
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  bgmEnabled
                    ? 'bg-teal-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {bgmEnabled ? 'En reproducción' : 'Pausado'}
              </button>
            </div>
          </div>

          {/* SECCIÓN 3: INFORMACIÓN DE LA RESERVA */}
          <div className="bg-slate-950/80 rounded-2xl p-3 border border-teal-900/60 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300 uppercase">
              <Info className="w-3.5 h-3.5" />
              <span>PARQUE BOTÁNICO MUNICIPAL</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              <strong>"Barón Carlos María Schuel"</strong> es una Reserva Natural Urbana de 15.5 hectáreas en el barrio Los Perales, San Salvador de Jujuy.
            </p>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-teal-200">
              <div className="bg-teal-950/50 p-2 rounded-lg border border-teal-900/40">
                <span className="block font-bold text-amber-300">ALTITUD</span>
                1334 a 1463 m.s.n.m.
              </div>
              <div className="bg-teal-950/50 p-2 rounded-lg border border-teal-900/40">
                <span className="block font-bold text-amber-300">ECOSISTEMA</span>
                Selva Montana de las Yungas
              </div>
            </div>
          </div>

          {/* SECCIÓN 4: CÓDIGO ÉTICO */}
          <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-2xl p-3 text-[11px] text-emerald-200 space-y-1">
            <div className="font-bold text-emerald-300">CÓDIGO DEL OBSERVADOR ÉTICO:</div>
            <ul className="list-disc list-inside space-y-0.5 opacity-90">
              <li>Nunca uses flash: desorienta y estresa a las aves.</li>
              <li>Mantén el silencio para escuchar los cantos nativos.</li>
              <li>No dejes residuos en los senderos.</li>
              <li>Permanece siempre en las sendas señalizadas.</li>
            </ul>
          </div>

          {/* Reiniciar perfil actual */}
          <div className="pt-1">
            <button
              onClick={() => {
                if (confirm('¿Deseas reiniciar los puntos y misiones del perfil activo a Nivel 1?')) {
                  soundManager.playClick();
                  onResetProgress();
                  onClose();
                }
              }}
              className="w-full py-2.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 hover:text-white hover:bg-rose-900/80 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar Progreso de este Perfil</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
