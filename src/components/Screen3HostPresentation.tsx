import React, { useState } from 'react';
import { Binoculars, ArrowLeft, Volume2, Info, X, Users } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { PlayerProfile } from '../types/game';
import { useLanguage, LanguageSelector } from '../utils/i18n';
import { AvatarIcon } from './AvatarIcon';

interface Screen3HostPresentationProps {
  activeProfile: PlayerProfile;
  onAdvanceToMainHub: () => void;
  onBack: () => void;
  onChangePlayer: () => void;
  onOpenMiroAvatar?: () => void;
}

export const Screen3HostPresentation: React.FC<Screen3HostPresentationProps> = ({
  activeProfile,
  onAdvanceToMainHub,
  onBack,
  onChangePlayer,
  onOpenMiroAvatar
}) => {
  const { tx } = useLanguage();
  const [showSilhouettesModal, setShowSilhouettesModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [welcomeScene, setWelcomeScene] = useState<'entrance' | 'branch'>('entrance');

  const bgImage =
    welcomeScene === 'entrance'
      ? '/assets/aistudio/En_el_dialogo_que_diga_c420835e.jpg'
      : '/assets/aistudio/Toucan_perched_on_branch_8ab41bfc_230157f9.jpg';

  return (
    <div
      className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-cover bg-center select-none transition-all duration-300"
      style={{ backgroundImage: `url('${bgImage}')` }}
    >
      {/* Top Header controls with Active Player Chip, LanguageSelector and "Cambiar Jugador" */}
      <div className="relative z-10 flex items-center justify-between p-3 bg-slate-950/65 backdrop-blur-md border-b border-teal-800/40 gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <button
            onClick={() => {
              soundManager.playClick();
              onBack();
            }}
            className="w-8 h-8 rounded-full bg-slate-900/80 border border-teal-400/40 flex items-center justify-center text-teal-300 hover:text-white shrink-0"
            title={tx('Volver', 'Back')}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Active Player Chip -> Opens YO / JUGADORES Miro Avatar Screen */}
          <button
            onClick={() => {
              soundManager.playClick();
              if (onOpenMiroAvatar) onOpenMiroAvatar();
              else onChangePlayer();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-950/90 hover:bg-teal-900 border border-amber-400/50 text-[10px] text-white min-w-0 cursor-pointer"
            title={tx('Abrir Perfil YO / JUGADORES', 'Open ME / PLAYERS Profile')}
          >
            <AvatarIcon icon={activeProfile.avatarIcon} className="w-5 h-5 shrink-0" alt={activeProfile.name} />
            <span className="font-bold text-amber-300 truncate max-w-[65px]">{activeProfile.name}</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <LanguageSelector />

          {/* Toggle Escena Entrada del Parque vs Dosel */}
          <button
            onClick={() => {
              soundManager.playClick();
              setWelcomeScene(prev => (prev === 'entrance' ? 'branch' : 'entrance'));
            }}
            className="px-2 py-1 rounded-full bg-amber-400/90 hover:bg-amber-300 text-slate-950 text-[9px] font-black border border-slate-900 shadow"
            title={tx('Alternar vista Entrada del Parque / Dosel', 'Toggle Park Entrance / Canopy view')}
          >
            {welcomeScene === 'entrance' ? tx('🌿 Dosel', '🌿 Canopy') : tx('🏛️ Entrada', '🏛️ Entrance')}
          </button>

          {/* "Cambiar Jugador" button */}
          <button
            onClick={() => {
              soundManager.playClick();
              onChangePlayer();
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-teal-800/80 hover:bg-teal-700 text-teal-100 text-[10px] font-bold border border-teal-500/50 shadow active:scale-95 transition-all"
            title={tx('Cambiar de Jugador', 'Switch Player')}
          >
            <Users className="w-3 h-3 text-amber-300" />
            <span className="hidden xs:inline">{tx('Cambiar', 'Switch')}</span>
          </button>

          {/* Toucan call audition */}
          <button
            onClick={() => {
              soundManager.playToucanCall();
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-900/80 border border-teal-400/40 text-[10px] font-bold text-teal-200 hover:text-white shadow"
          >
            <Volume2 className="w-3 h-3 text-teal-400" />
            <span>{tx('Canto', 'Call')}</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setShowInfoModal(true);
            }}
            className="w-8 h-8 rounded-full bg-slate-900/80 border border-teal-400/40 flex items-center justify-center text-teal-300 hover:text-white"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center Area */}
      <div className="flex-1" />

      {/* Bottom Translucent Info Panel */}
      <div className="relative z-10 p-4 pb-6 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent">
        {/* Title & Subtitle Card */}
        <div className="w-full bg-teal-900/65 backdrop-blur-md border-2 border-teal-400/60 rounded-3xl p-3 shadow-2xl text-center mb-3">
          <h2 className="text-xl font-black text-white tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {tx('TUCÁN GRANDE · BIENVENIDA', 'TOCO TOUCAN · WELCOME')}
          </h2>
          <div className="text-[10px] font-bold text-amber-200 leading-snug mt-0.5">
            {tx(
              '«¡Bienvenidos! Deben prestar atención al guía para luego responder las preguntas de la trivia y ganar puntos!»',
              '"Welcome! Pay close attention to the guide so you can answer the trivia questions and earn points!"'
            )}
          </div>
        </div>

        {/* 4 Bottom Data Boxes */}
        <div className="grid grid-cols-4 gap-2 items-center">
          {/* 1) Íconos de siluetas de aves */}
          <button
            onClick={() => {
              soundManager.playClick();
              setShowSilhouettesModal(true);
            }}
            className="h-16 rounded-2xl bg-teal-950/80 backdrop-blur-md border-2 border-teal-400/50 flex flex-col items-center justify-center p-1.5 hover:bg-teal-900/80 transition-all cursor-pointer shadow-lg active:scale-95 group"
            title={tx('Ver siluetas de aves de las Yungas', 'View Yungas bird silhouettes')}
          >
            <div className="flex items-center justify-center gap-1 text-teal-300 group-hover:text-amber-300 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C9 5 4 8 2 10c3 1 7 0 10 2 3-2 7-1 10-2-2-2-7-5-10-8z" />
              </svg>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 3c-2 0-4 2-4 4v2l-4 3 2 2 3-2v4l3 2 1-3 3-1V7c0-2-2-4-4-4z" />
              </svg>
            </div>
            <span className="text-[9px] font-bold text-teal-200 mt-1 uppercase tracking-tight">
              {tx('Siluetas', 'Silhouettes')}
            </span>
          </button>

          {/* 2) Tamaño: "55 - 63 cm" */}
          <div className="h-16 rounded-2xl bg-teal-950/80 backdrop-blur-md border-2 border-teal-400/50 flex flex-col items-center justify-center p-1.5 text-center shadow-lg">
            <span className="text-[9px] font-bold text-teal-300 uppercase tracking-tight">
              {tx('Tamaño', 'Size')}
            </span>
            <span className="text-xs font-extrabold text-white mt-0.5 leading-tight">
              55 - 63 cm
            </span>
          </div>

          {/* 3) Botón central destacado con ícono de prismáticos celestes */}
          <button
            onClick={() => {
              soundManager.playClick();
              soundManager.playSuccess();
              onAdvanceToMainHub();
            }}
            className="h-16 rounded-2xl game-btn-cyan flex flex-col items-center justify-center p-1.5 cursor-pointer shadow-xl transform active:scale-95 transition-all group ring-2 ring-sky-300/40"
            title={tx('Comenzar con los prismáticos hacia el Menú Principal', 'Proceed with binoculars to the Main Menu')}
          >
            <div className="w-9 h-9 rounded-xl bg-sky-950/30 flex items-center justify-center text-sky-900 group-hover:scale-110 transition-transform">
              <Binoculars className="w-6 h-6 text-sky-950 stroke-[2.5]" />
            </div>
          </button>

          {/* 4) Peso: "500 - 860 g" */}
          <div className="h-16 rounded-2xl bg-teal-950/80 backdrop-blur-md border-2 border-teal-400/50 flex flex-col items-center justify-center p-1.5 text-center shadow-lg">
            <span className="text-[9px] font-bold text-teal-300 uppercase tracking-tight">
              {tx('Peso', 'Weight')}
            </span>
            <span className="text-xs font-extrabold text-white mt-0.5 leading-tight">
              500 - 860 g
            </span>
          </div>
        </div>
      </div>

      {/* Modal: Siluetas de Aves */}
      {showSilhouettesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xs bg-slate-900 border-2 border-teal-400 rounded-3xl p-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-teal-800">
              <h4 className="font-bold text-sm text-white">
                {tx('SILUETAS ALADAS DE LAS YUNGAS', 'WINGED SILHOUETTES OF THE YUNGAS')}
              </h4>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setShowSilhouettesModal(false);
                }}
                className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-3 space-y-2.5 text-xs">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-teal-950/60 border border-teal-800/40">
                <span className="text-xl">🦅</span>
                <div>
                  <div className="font-bold text-teal-300">{tx('Jote Real / Rapaces', 'King Vulture / Raptors')}</div>
                  <div className="text-[10px] text-slate-300">
                    {tx('Alas rectas anchas para planear sobre las corrientes térmicas.', 'Broad straight wings to soar on rising thermal currents.')}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-teal-950/60 border border-teal-800/40">
                <span className="text-xl">🦜</span>
                <div>
                  <div className="font-bold text-teal-300">{tx('Loro Alisero / Maracaná', 'Alder Amazon / Parrots')}</div>
                  <div className="text-[10px] text-slate-300">
                    {tx('Vuelo rápido en cuña, cola puntiaguda y aleteo continuo.', 'Fast wedge-shaped flight, pointed tail, and continuous wingbeats.')}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-teal-950/60 border border-teal-800/40">
                <span className="text-xl">✨</span>
                <div>
                  <div className="font-bold text-teal-300">{tx('Picaflor Cometa / Común', 'Red-tailed Comet / Hummingbirds')}</div>
                  <div className="text-[10px] text-slate-300">
                    {tx('Vuelo suspendido estacionario en figura de ocho.', 'Hovering stationary flight in a figure-eight pattern.')}
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                soundManager.playClick();
                setShowSilhouettesModal(false);
              }}
              className="w-full py-2.5 rounded-xl game-btn-orange text-white text-xs font-bold mt-1"
            >
              {tx('Entendido', 'Got it')}
            </button>
          </div>
        </div>
      )}

      {/* Modal: Ficha Detallada del Tucán Grande */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xs bg-slate-900 border-2 border-teal-400 rounded-3xl p-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-teal-800">
              <div>
                <h4 className="font-bold text-sm text-white">
                  {tx('FICHA CIENTÍFICA', 'SCIENTIFIC FACT SHEET')}
                </h4>
                <p className="text-[10px] text-teal-300">Ramphastidae · Ramphastos toco</p>
              </div>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setShowInfoModal(false);
                }}
                className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-3 space-y-2 text-xs text-slate-200">
              <p>
                <strong>{tx('Características:', 'Characteristics:')}</strong>{' '}
                {tx(
                  'Longitud promedio de 55 a 63 cm. Destaca su descomunal pico amarillo-anaranjado de 20 cm con mancha negra en la punta, piel periocular turquesa y babero blanco.',
                  'Average length of 55 to 63 cm. Notable for its massive 20 cm yellow-orange bill with a black tip, turquoise periocular skin, and white bib.'
                )}
              </p>
              <p>
                <strong>{tx('Reserva Schuel:', 'Schuel Reserve:')}</strong>{' '}
                {tx(
                  'Habita el dosel superior y las copas de higuerones y laureles de las Yungas en San Salvador de Jujuy.',
                  'Inhabits the upper canopy and crowns of fig and laurel trees in the Yungas of San Salvador de Jujuy.'
                )}
              </p>
            </div>
            <button
              onClick={() => {
                soundManager.playClick();
                setShowInfoModal(false);
              }}
              className="w-full py-2.5 rounded-xl game-btn-orange text-white text-xs font-bold"
            >
              {tx('Cerrar Ficha', 'Close Sheet')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
