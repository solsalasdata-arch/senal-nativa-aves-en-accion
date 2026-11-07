import React from 'react';
import { Award, Sparkles, X, Check } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface LevelUpCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: number;
}

export const LevelUpCelebrationModal: React.FC<LevelUpCelebrationModalProps> = ({
  isOpen,
  onClose,
  level
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-lg animate-fadeIn">
      <div className="relative w-full max-w-sm rounded-3xl overflow-hidden bg-slate-900 border-3 border-amber-400 shadow-[0_0_50px_rgba(245,158,11,0.5)] p-5 text-center flex flex-col items-center">
        {/* Close */}
        <button
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Floating Sparkles Header */}
        <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4 animate-spin" />
          <span>¡ENHORABUENA EXPLORADOR!</span>
          <Sparkles className="w-4 h-4 animate-spin" />
        </div>

        {/* Insignia Graphic */}
        <div className="relative my-3">
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 p-1.5 shadow-2xl flex items-center justify-center ring-4 ring-amber-400/50">
            <div className="w-full h-full rounded-full bg-teal-950 flex flex-col items-center justify-center border-2 border-amber-300 overflow-hidden relative">
              <img
                src="/assets/aistudio/c3da3f37-f246-40f4-8d25-1958fb93d2f1_0d2a7f41.jpeg"
                alt="Insignia Tucán"
                className="w-16 h-16 object-cover rounded-full"
              />
              <div className="absolute bottom-1 bg-amber-400 text-slate-950 text-[9px] font-extrabold px-2 py-0.5 rounded-full">
                NIVEL {level}
              </div>
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-full border-2 border-slate-900 shadow">
            <Check className="w-4 h-4" />
          </div>
        </div>

        <h3 className="text-xl font-extrabold text-white mb-1">
          ¡Insignia de Observador en Ascenso!
        </h3>
        <p className="text-xs text-amber-300 font-semibold mb-3">
          Parque Botánico Municipal "Barón Carlos María Schuel"
        </p>

        {/* Requirements Accomplished */}
        <div className="w-full bg-slate-950/80 rounded-2xl p-3 border border-teal-800/60 text-xs text-slate-200 text-left space-y-2 mb-4">
          <div className="text-[11px] font-bold text-teal-300">REQUISITOS OFICIALES CUMPLIDOS:</div>
          <div className="flex items-center gap-2 text-emerald-300">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>1 Avistamiento con prismáticos completado</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-300">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>5 Preguntas de biodiversidad respondidas</span>
          </div>
          <div className="pt-1 text-[11px] text-teal-200/90 italic border-t border-teal-900/60">
            "Has demostrado respeto por el ecosistema de las Yungas y conocimiento sobre las especies nativas."
          </div>
        </div>

        <button
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          className="w-full py-3 rounded-2xl game-btn-orange text-white text-xs font-bold shadow-lg"
        >
          ¡PORTAR MI NUEVA INSIGNIA!
        </button>
      </div>
    </div>
  );
};
