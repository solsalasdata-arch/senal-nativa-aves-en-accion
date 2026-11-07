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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-sm max-h-[94vh] flex flex-col rounded-3xl overflow-hidden bg-slate-900 border-2 border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.3)]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-teal-900/60 shrink-0">
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
        <div className="p-3.5 space-y-3 flex-1 overflow-y-auto">
          {/* Official Prototype Artwork from /assets/aistudio/Complete_sightings_to_level_up_9c0d6661.jpg */}
          <div className="relative w-full h-56 rounded-2xl overflow-hidden border-2 border-teal-500/60 shadow-xl bg-teal-950">
            <img
              src="/assets/aistudio/Complete_sightings_to_level_up_9c0d6661.jpg"
              alt="Para subir de nivel debes completar 1 avistamiento y responder 5 preguntas"
              className="w-full h-full object-cover object-top"
            />
          </div>

          {/* Visual Indicator of current progress */}
          <div className="bg-slate-950/90 rounded-2xl p-3 border border-teal-800/60 space-y-2.5">
            <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              <span>
                {tx(
                  'Progreso hacia la "Insignia de Observador en Ascenso"',
                  'Progress toward "Rising Observer Badge"'
                )}
              </span>
            </div>

            {/* Metric 1: Avistamientos: 0/1 */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2.5">
                {sightingComplete ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <CircleDashed className="w-5 h-5 text-amber-400 animate-spin shrink-0" />
                )}
                <div>
                  <div className="text-xs font-bold text-white">
                    {tx('Avistamiento de Ave', 'Bird Sighting')}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {tx('Usa los prismáticos en la selva', 'Use the binoculars in the forest')}
                  </div>
                </div>
              </div>
              <span
                className={`text-xs font-extrabold px-2.5 py-1 rounded-lg border ${
                  sightingComplete
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-600/50'
                    : 'bg-amber-950 text-amber-300 border-amber-600/50'
                }`}
              >
                {playerState.sightingsCompleted}/1
              </span>
            </div>

            {/* Metric 2: Preguntas respondidas correctamente: 0/5 */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2.5">
                {questionsComplete ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <CircleDashed className="w-5 h-5 text-teal-400 shrink-0" />
                )}
                <div>
                  <div className="text-xs font-bold text-white">
                    {tx('Preguntas de Biodiversidad', 'Biodiversity Questions')}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {tx('Trivia educativa de las Yungas', 'Educational Yungas trivia')}
                  </div>
                </div>
              </div>
              <span
                className={`text-xs font-extrabold px-2.5 py-1 rounded-lg border ${
                  questionsComplete
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-600/50'
                    : 'bg-teal-950 text-teal-300 border-teal-600/50'
                }`}
              >
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
            className="w-full py-3 px-4 rounded-2xl game-btn-orange text-white text-xs sm:text-sm font-black tracking-wide uppercase shadow-xl flex items-center justify-center cursor-pointer transition-all active:scale-98"
          >
            {tx('CONTINUAR CON LA AVENTURA', 'CONTINUE WITH THE ADVENTURE')}
          </button>

          {/* Accesos rápidos inferiores a "MAPAS" y "AVES" */}
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
              <span>{tx('MAPAS', 'MAPS')}</span>
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
              <span>{tx('AVES (TRIVIA)', 'BIRDS (TRIVIA)')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
