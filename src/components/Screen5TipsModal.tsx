import React from 'react';
import { HelpCircle, X, Map, Bird, CheckCircle2, CircleDashed, Award } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { PlayerState } from '../types/game';
import { useLanguage } from '../utils/i18n';

interface Screen5TipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerState: PlayerState;
  onOpenMap: () => void;
  onOpenBirds: () => void;
}

export const Screen5TipsModal: React.FC<Screen5TipsModalProps> = ({
  isOpen,
  onClose,
  playerState,
  onOpenMap,
  onOpenBirds
}) => {
  const { tx } = useLanguage();

  if (!isOpen) return null;

  const sightingComplete = playerState.sightingsCompleted >= 1;
  const questionsComplete = playerState.questionsAnswered >= 5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm max-h-[92vh] flex flex-col rounded-3xl overflow-hidden bg-slate-900 border-2 border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.3)]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-teal-900/60">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-sm text-white">
                {tx('CONSEJOS DE NIVEL', 'LEVEL UP TIPS')}
              </h3>
              <p className="text-[10px] text-teal-300">
                {tx('Regla Oficial del Parque Botánico Schuel', 'Official Rule of Schuel Botanical Park')}
              </p>
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

        {/* Body */}
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          {/* Toucan Host Character with Speech Bubble */}
          <div className="flex items-center gap-3 bg-teal-950/70 border border-teal-700/50 rounded-2xl p-3">
            {/* Toucan Avatar */}
            <div className="relative w-16 h-16 rounded-full border-2 border-amber-400 p-0.5 bg-slate-900 shrink-0 overflow-hidden shadow">
              <img
                src="/assets/aistudio/c3da3f37-f246-40f4-8d25-1958fb93d2f1_0d2a7f41.jpeg"
                alt="Tucán Guía"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Speech bubble */}
            <div className="relative bg-white text-slate-900 p-2.5 rounded-2xl text-xs font-bold leading-snug shadow-md">
              {tx(
                '"Para subir de nivel, debes completar 1 avistamiento y responder 5 preguntas."',
                '"To level up, you must complete 1 bird sighting and answer 5 questions."'
              )}
              {/* Pointer beak */}
              <div className="absolute top-1/2 -left-1.5 transform -translate-y-1/2 w-3 h-3 bg-white border-l border-b border-slate-300 rotate-45" />
            </div>
          </div>

          {/* Visual Indicator of current progress */}
          <div className="bg-slate-950/90 rounded-2xl p-3.5 border border-teal-800/60 space-y-3">
            <div className="text-xs font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              <span>Progreso hacia la "Insignia de Observador en Ascenso"</span>
            </div>

            {/* Metric 1: Avistamientos: 0/1 */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2.5">
                {sightingComplete ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <CircleDashed className="w-5 h-5 text-amber-400 animate-spin shrink-0" />
                )}
                <div>
                  <div className="text-xs font-bold text-white">Avistamiento de Ave</div>
                  <div className="text-[10px] text-slate-400">Usa los prismáticos en la selva</div>
                </div>
              </div>
              <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg border ${
                sightingComplete
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-600/50'
                  : 'bg-amber-950 text-amber-300 border-amber-600/50'
              }`}>
                {playerState.sightingsCompleted}/1
              </span>
            </div>

            {/* Metric 2: Preguntas respondidas correctamente: 0/5 */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2.5">
                {questionsComplete ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <CircleDashed className="w-5 h-5 text-teal-400 shrink-0" />
                )}
                <div>
                  <div className="text-xs font-bold text-white">Preguntas de Biodiversidad</div>
                  <div className="text-[10px] text-slate-400">Trivia educativa de las Yungas</div>
                </div>
              </div>
              <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg border ${
                questionsComplete
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-600/50'
                  : 'bg-teal-950 text-teal-300 border-teal-600/50'
              }`}>
                {playerState.questionsAnswered}/5
              </span>
            </div>
          </div>

          {/* Botón naranja grande: "CONTINUAR CON LA AVENTURA" */}
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="w-full py-3.5 px-4 rounded-2xl game-btn-orange text-white text-xs sm:text-sm font-black tracking-wide uppercase shadow-xl flex items-center justify-center cursor-pointer transition-all active:scale-98"
          >
            CONTINUAR CON LA AVENTURA
          </button>

          {/* Accesos rápidos inferiores a "MAPAS" y "AVES" */}
          <div className="pt-1">
            <div className="text-[10px] font-bold text-teal-300 uppercase mb-2 text-center">
              ACCESOS RÁPIDOS PARA CUMPLIR LA REGLA:
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  soundManager.playClick();
                  onClose();
                  onOpenMap();
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-200 text-xs font-bold border border-teal-700/50 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Map className="w-4 h-4 text-teal-400" />
                <span>MAPAS</span>
              </button>

              <button
                onClick={() => {
                  soundManager.playClick();
                  onClose();
                  onOpenBirds();
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-200 text-xs font-bold border border-amber-700/50 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Bird className="w-4 h-4 text-amber-400" />
                <span>AVES (TRIVIA)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
