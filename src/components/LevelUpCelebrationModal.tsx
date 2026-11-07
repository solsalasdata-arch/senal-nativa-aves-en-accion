import React from 'react';
import { Award, Sparkles, X, Check } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { useLanguage } from '../utils/i18n';

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
  const { tx } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-lg animate-fadeIn select-none">
      <div className="relative w-full max-w-sm max-h-[94vh] rounded-3xl overflow-hidden bg-slate-900 border-3 border-amber-400 shadow-[0_0_50px_rgba(245,158,11,0.5)] p-4 text-center flex flex-col items-center overflow-y-auto">
        {/* Close */}
        <button
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-slate-900/90 text-slate-200 hover:text-white flex items-center justify-center border border-amber-400/50 shadow"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Official Artwork Banner from public/assets/aistudio/ */}
        <div className="relative w-full h-64 rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-2xl mb-3 shrink-0 bg-teal-950">
          <img
            src="/assets/aistudio/Toucan_image_prompt_translation_ed4d9490.jpg"
            alt="Insignia de Observador en Ascenso"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-slate-950/85 border border-amber-400 text-[10px] font-black text-amber-300 flex items-center gap-1 shadow">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>{tx('NIVEL', 'LEVEL')} {level}</span>
          </div>
        </div>

        <h3 className="text-base sm:text-lg font-black text-white mb-0.5 uppercase tracking-wide">
          {tx('¡Insignia de Observador en Ascenso!', 'Rising Observer Badge!')}
        </h3>
        <p className="text-[11px] text-amber-300 font-bold mb-2.5">
          {tx(
            '¡Has respondido todas las consignas correctamente y has subido de nivel!',
            'You answered all questions correctly and leveled up!'
          )}
        </p>

        {/* Requirements Accomplished */}
        <div className="w-full bg-slate-950/90 rounded-2xl p-3 border border-teal-800/60 text-xs text-slate-200 text-left space-y-1.5 mb-3">
          <div className="text-[10px] font-black text-teal-300 uppercase">
            {tx('REQUISITOS OFICIALES CUMPLIDOS:', 'OFFICIAL REQUIREMENTS MET:')}
          </div>
          <div className="flex items-center gap-2 text-emerald-300 text-[11px] font-bold">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{tx('1 Avistamiento con prismáticos completado', '1 Binocular sighting completed')}</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-300 text-[11px] font-bold">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{tx('5 Preguntas de biodiversidad respondidas', '5 Biodiversity questions answered')}</span>
          </div>
        </div>

        <button
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          className="w-full py-3 rounded-2xl game-btn-orange text-white text-xs font-black uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5"
        >
          <Award className="w-4 h-4 text-amber-200" />
          <span>{tx('CONTINUAR CON EL AVISTAJE', 'CONTINUE SIGHTING')}</span>
        </button>
      </div>
    </div>
  );
};
