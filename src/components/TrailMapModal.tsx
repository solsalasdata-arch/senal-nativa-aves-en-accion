import React, { useState } from 'react';
import {
  Map,
  X,
  Compass,
  Mountain,
  MapPin,
  CheckCircle2,
  QrCode,
  Award,
  Sparkles,
  ChevronRight,
  Eye,
  Info,
  ShieldCheck,
  Feather
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { CHECKPOINTS_DATA, RARE_BIRDS_DATA } from '../data/birdsData';
import { CheckPoint, PlayerProfile, BirdSpecies } from '../types/game';

interface TrailMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerProfile: PlayerProfile;
  onValidateCheckpoint: (checkpointId: number, xpReward: number) => void;
  onOpenRareBirdDetails?: (bird: BirdSpecies) => void;
  onOpenXRVision?: () => void;
}

export const TrailMapModal: React.FC<TrailMapModalProps> = ({
  isOpen,
  onClose,
  playerProfile,
  onValidateCheckpoint,
  onOpenRareBirdDetails,
  onOpenXRVision
}) => {
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<CheckPoint>(CHECKPOINTS_DATA[0]);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [selectedChallengeOption, setSelectedChallengeOption] = useState<number | null>(null);
  const [challengeSubmitted, setChallengeSubmitted] = useState(false);
  const [showRareBirdsModal, setShowRareBirdsModal] = useState(false);
  const [selectedRareBird, setSelectedRareBird] = useState<BirdSpecies>(RARE_BIRDS_DATA[0]);

  if (!isOpen) return null;

  const completedCount = playerProfile.completedCheckpoints?.length || 0;
  const isRouteComplete = completedCount >= 8 || playerProfile.hasRouteCompleteSeal;
  const isCurrentCheckpointCompleted = playerProfile.completedCheckpoints?.includes(selectedCheckpoint.id);

  const handleOpenChallenge = () => {
    soundManager.playClick();
    setSelectedChallengeOption(null);
    setChallengeSubmitted(false);
    setShowChallengeModal(true);
  };

  const handleConfirmChallenge = () => {
    if (selectedChallengeOption === null || challengeSubmitted) return;
    setChallengeSubmitted(true);

    const isCorrect = selectedChallengeOption === selectedCheckpoint.challenge.correctIndex;
    if (isCorrect) {
      soundManager.playSuccess();
      onValidateCheckpoint(selectedCheckpoint.id, 25);
    } else {
      soundManager.playClick();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm max-h-[94vh] flex flex-col rounded-3xl overflow-hidden bg-slate-900 border-2 border-teal-500 shadow-2xl">
        {/* Cabecera Oficial */}
        <div className="px-4 py-3 bg-slate-950 border-b border-teal-900/60">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Map className="w-5 h-5 text-teal-400" />
              <div>
                <h3 className="font-extrabold text-xs sm:text-sm text-white tracking-wide">
                  Plano de los Senderos
                </h3>
                <p className="text-[10px] text-teal-300">Parque Botánico Municipal Barón Schuel</p>
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

          {/* Subheader info strip */}
          <div className="flex items-center justify-between text-[10px] text-teal-200/90 pt-1 border-t border-slate-800">
            <span className="flex items-center gap-1">
              <Mountain className="w-3 h-3 text-amber-400" />
              Altitud: 1334 - 1463 m.s.n.m.
            </span>
            <span className="font-semibold text-amber-300">
              Recorrido: 2720 m (~2 hs)
            </span>
          </div>

          {/* Sello de Ruta Completa - Barra de Progreso */}
          <div className="mt-2 p-2 rounded-xl bg-teal-950/70 border border-teal-800/60">
            <div className="flex items-center justify-between text-[11px] font-bold mb-1">
              <span className="text-amber-300 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                Sello de Ruta Completa
              </span>
              <span className={isRouteComplete ? 'text-emerald-300 font-extrabold' : 'text-teal-200'}>
                {completedCount}/8 puntos {isRouteComplete && '✓'}
              </span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-teal-900">
              <div
                className="h-full bg-gradient-to-r from-teal-400 via-amber-400 to-emerald-400 transition-all duration-500"
                style={{ width: `${Math.min(100, (completedCount / 8) * 100)}%` }}
              />
            </div>

            {/* Unlocked Rare Birds Announcement */}
            {isRouteComplete && (
              <button
                onClick={() => {
                  soundManager.playSuccess();
                  setShowRareBirdsModal(true);
                }}
                className="mt-1.5 w-full py-1.5 px-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-400/60 text-[10px] font-bold text-amber-300 flex items-center justify-center gap-1.5 animate-pulse"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>¡Sello Logrado! Ver Aves Raras: Urutaú y Jote Real</span>
              </button>
            )}
          </div>
        </div>

        {/* Mapa Interactivo con Sendero Serpenteante */}
        <div className="relative h-60 bg-emerald-950 overflow-hidden border-b border-teal-900/80">
          {/* Fondo de Selva Montana con sellos */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-60"
            style={{ backgroundImage: `url('/assets/aistudio/Botanical_park_start_screen_logo_546dfb3b_47fb3d00.jpg')` }}
          />

          {/* Curvas Topográficas y Sendero Serpenteante SVG */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Curvas de Nivel Tenues */}
            <path d="M 0 90 Q 30 80 60 92 T 100 88" fill="none" stroke="rgba(140, 231, 211, 0.2)" strokeWidth="0.8" />
            <path d="M 0 70 Q 40 55 70 75 T 100 65" fill="none" stroke="rgba(140, 231, 211, 0.25)" strokeWidth="0.9" />
            <path d="M 0 45 Q 35 30 75 50 T 100 40" fill="none" stroke="rgba(140, 231, 211, 0.3)" strokeWidth="1" />
            <path d="M 10 25 Q 55 12 90 28" fill="none" stroke="rgba(245, 158, 11, 0.35)" strokeWidth="1.2" />

            {/* SENDERO SERPENTEANTE QUE CONECTA LOS 8 PUNTOS */}
            {/* P1(18,82) -> P2(28,70) -> P3(42,75) -> P4(55,62) -> P5(68,48) -> P6(50,38) -> P7(38,26) -> P8(74,16) */}
            <path
              d="M 10 90 Q 14 85 18 82 Q 22 75 28 70 Q 34 78 42 75 Q 49 68 55 62 Q 62 52 68 48 Q 60 40 50 38 Q 42 32 38 26 Q 52 18 74 16 L 85 14"
              fill="none"
              stroke="#FDBA2E"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeDasharray="4,2.5"
            />
          </svg>

          {/* Marcadores de los 8 Puntos de Control */}
          {CHECKPOINTS_DATA.map((cp) => {
            const isSelected = selectedCheckpoint.id === cp.id;
            const isDone = playerProfile.completedCheckpoints?.includes(cp.id);

            return (
              <button
                key={cp.id}
                onClick={() => {
                  soundManager.playClick();
                  setSelectedCheckpoint(cp);
                }}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform cursor-pointer ${
                  isSelected
                    ? 'scale-125 z-30 ring-4 ring-amber-400 shadow-xl'
                    : 'hover:scale-110 z-20'
                }`}
                style={{ left: `${cp.coords.x}%`, top: `${cp.coords.y}%` }}
                title={`${cp.id}. ${cp.name}`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 ${
                    isDone
                      ? 'bg-emerald-500 text-slate-950 border-white shadow-md'
                      : isSelected
                      ? 'bg-amber-400 text-slate-950 border-slate-900'
                      : 'bg-slate-900/90 text-teal-200 border-teal-400'
                  }`}
                >
                  {isDone ? '✓' : cp.id}
                </div>
              </button>
            );
          })}

          {/* Leyenda y HUD del Mapa */}
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-sm border border-teal-500/40 text-[9px] text-teal-200">
            🌲 Selva Montana de las Yungas
          </div>
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-sm border border-teal-500/40 text-[9px] text-amber-300 font-bold">
            2720 m Totales
          </div>
        </div>

        {/* Panel Inferior: Detalle del Punto Seleccionado */}
        <div className="p-3.5 bg-slate-950/95 space-y-3 flex-1 overflow-y-auto">
          {/* Título de la Parada */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                  {selectedCheckpoint.id}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px]">
                  {selectedCheckpoint.name}
                </h4>
              </div>
              <div className="text-[10px] text-amber-400 font-semibold mt-0.5">
                Distancia acumulada: {selectedCheckpoint.distanceMeters} m · Tipo: {selectedCheckpoint.type}
              </div>
            </div>

            {/* Estado del Punto */}
            <span
              className={`text-[9px] font-extrabold px-2.5 py-1 rounded-full border shrink-0 ${
                isCurrentCheckpointCompleted
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                  : 'bg-amber-950 text-amber-300 border-amber-500'
              }`}
            >
              {isCurrentCheckpointCompleted ? 'COMPLETADO ✓' : 'PENDIENTE'}
            </span>
          </div>

          {/* Especies Probables con Siluetas */}
          <div>
            <div className="text-[10px] font-bold text-teal-300 uppercase mb-1.5 flex items-center gap-1">
              <Feather className="w-3 h-3 text-teal-400" />
              <span>Especies Probables en esta Parada:</span>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {selectedCheckpoint.probableSpecies.map((bird, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-xl bg-teal-950/60 border border-teal-800/40 flex items-center gap-2.5"
                >
                  <span className="text-xl p-1 rounded-lg bg-teal-900/60 border border-teal-700/50 shrink-0">
                    {bird.silhouetteIcon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white truncate">{bird.common}</div>
                    <div className="text-[10px] italic text-teal-300 font-serif truncate">{bird.scientific}</div>
                    <p className="text-[9px] text-slate-300 line-clamp-1 mt-0.5">{bird.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botón: Validar Punto (Escanear QR / GPS) */}
          <div className="pt-1 flex gap-2">
            <button
              onClick={handleOpenChallenge}
              className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-black tracking-wide uppercase flex items-center justify-center gap-2 transition-all ${
                isCurrentCheckpointCompleted
                  ? 'bg-slate-800 text-teal-200 border border-teal-700/60 hover:bg-slate-700'
                  : 'game-btn-orange text-white shadow-lg'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>
                {isCurrentCheckpointCompleted
                  ? 'Repasar Desafío QR / GPS'
                  : 'Validar Punto (Escanear QR / GPS)'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DEL DESAFÍO QR / GPS DE LA PARADA */}
      {showChallengeModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xs rounded-3xl overflow-hidden bg-slate-900 border-2 border-teal-400 p-4 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-teal-800">
              <div className="flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white">VALIDACIÓN EN SENDEROS</h4>
              </div>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setShowChallengeModal(false);
                }}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Question */}
            <div className="py-3 space-y-2.5">
              <div className="text-[10px] text-teal-300 font-semibold">
                Punto {selectedCheckpoint.id}: {selectedCheckpoint.name} (+25 XP)
              </div>
              <p className="text-xs font-bold text-white leading-snug">
                {selectedCheckpoint.challenge.question}
              </p>

              {/* Options */}
              <div className="space-y-1.5 pt-1">
                {selectedCheckpoint.challenge.options.map((option, idx) => {
                  const isSelected = selectedChallengeOption === idx;
                  const isCorrect = idx === selectedCheckpoint.challenge.correctIndex;

                  let optClass = 'bg-slate-950 border-slate-700 text-slate-300';
                  if (challengeSubmitted) {
                    if (isCorrect) optClass = 'bg-emerald-950 border-emerald-400 text-emerald-200 font-bold';
                    else if (isSelected) optClass = 'bg-rose-950 border-rose-500 text-rose-200';
                  } else if (isSelected) {
                    optClass = 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold';
                  }

                  return (
                    <button
                      key={idx}
                      disabled={challengeSubmitted}
                      onClick={() => {
                        soundManager.playClick();
                        setSelectedChallengeOption(idx);
                      }}
                      className={`w-full p-2 rounded-xl border text-left text-[11px] transition-all flex items-start gap-2 ${optClass}`}
                    >
                      <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1 leading-snug">{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Feedback */}
              {challengeSubmitted && (
                <div
                  className={`p-2.5 rounded-xl text-[10px] leading-relaxed ${
                    selectedChallengeOption === selectedCheckpoint.challenge.correctIndex
                      ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-200'
                      : 'bg-amber-950/80 border border-amber-500/50 text-amber-200'
                  }`}
                >
                  <span className="font-bold block mb-0.5">
                    {selectedChallengeOption === selectedCheckpoint.challenge.correctIndex
                      ? '¡PUNTO VALIDADO CON ÉXITO! (+25 XP)'
                      : 'CONSEJO DE CAMPO:'}
                  </span>
                  {selectedCheckpoint.challenge.explanation}
                </div>
              )}
            </div>

            {/* Action */}
            <div className="pt-2">
              {!challengeSubmitted ? (
                <button
                  disabled={selectedChallengeOption === null}
                  onClick={handleConfirmChallenge}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all ${
                    selectedChallengeOption !== null
                      ? 'game-btn-orange text-white cursor-pointer'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  CONFIRMAR RESPUESTA
                </button>
              ) : (
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setShowChallengeModal(false);
                  }}
                  className="w-full py-2.5 rounded-xl game-btn-mint text-emerald-950 font-bold text-xs"
                >
                  LISTO · CONTINUAR RUTA
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE AVES RARAS DESBLOQUEADAS: URUTAÚ Y JOTE REAL */}
      {showRareBirdsModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xs max-h-[88vh] rounded-3xl overflow-hidden bg-slate-900 border-2 border-amber-400 p-4 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-teal-800">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase">Aves Raras Desbloqueadas</h4>
              </div>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setShowRareBirdsModal(false);
                }}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Bird Selector */}
            <div className="flex gap-2 py-2">
              {RARE_BIRDS_DATA.map((bird) => (
                <button
                  key={bird.id}
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedRareBird(bird);
                  }}
                  className={`flex-1 py-1 px-2 rounded-xl text-[10px] font-bold border transition-all ${
                    selectedRareBird.id === bird.id
                      ? 'bg-amber-400 text-slate-950 border-amber-300'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  {bird.commonName.split(' / ')[0]}
                </button>
              ))}
            </div>

            {/* Card Content */}
            <div className="space-y-2.5 overflow-y-auto text-xs text-slate-200 flex-1 pr-1">
              <div>
                <h5 className="font-extrabold text-sm text-amber-300">{selectedRareBird.commonName}</h5>
                <p className="text-[10px] italic text-teal-300">{selectedRareBird.scientificName} · {selectedRareBird.size}</p>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                {selectedRareBird.description}
              </p>

              {selectedRareBird.legend && (
                <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-600/40 text-[10px] text-amber-200 leading-normal">
                  <span className="font-bold text-amber-300 block mb-0.5">📜 LEYENDA ANCESTRAL:</span>
                  {selectedRareBird.legend}
                </div>
              )}

              <div className="p-2 rounded-xl bg-teal-950/60 border border-teal-800/40 text-[10px] text-teal-200">
                <span className="font-bold text-teal-300 block mb-0.5">🌿 CURIOSIDAD DE LAS YUNGAS:</span>
                {selectedRareBird.funFact}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setShowRareBirdsModal(false);
                }}
                className="w-full py-2.5 rounded-xl game-btn-orange text-white text-xs font-bold"
              >
                Cerrar y Continuar Explorando
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
