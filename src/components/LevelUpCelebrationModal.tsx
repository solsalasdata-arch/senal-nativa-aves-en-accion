import React from 'react';
import { ModalHeader } from './ui';
import { useModalEscape } from './ui/useModalEscape';
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

  useModalEscape(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label={tx('¡Insignia de Observador en Ascenso!', 'Rising Observer Badge!')} className="ui-overlay z-50 flex items-center justify-center sm:p-3 animate-fadeIn">
      <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-surface-900 text-ink sm:max-h-[94dvh] sm:max-w-md sm:rounded-3xl sm:border sm:border-white/20 shadow-xl pb-safe min-h-0 overflow-y-auto p-4 text-center items-center">
        {/* Close */}
        <div className="pt-safe shrink-0 bg-forest-950"><ModalHeader title={tx('¡Insignia de Observador en Ascenso!', 'Rising Observer Badge!')} subtitle={tx('Tu progreso en el parque', 'Your progress in the park')} icon={<Award aria-hidden="true" className="h-5 w-5" />} onClose={() => {
            soundManager.playClick();
            onClose();
          }} /></div>

        {/* Official Artwork Banner from public/assets/aistudio/ */}
        <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-amber-400/80 shadow-2xl mb-3 shrink-0 bg-teal-950">
          <img
            src="/assets/aistudio/Toucan_image_prompt_translation_ed4d9490.jpg"
            alt="Insignia de Observador en Ascenso"
            className="w-full h-full object-contain object-center bg-forest-950"
          />
          <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-surface-950 border border-amber-400 text-[11px] font-black text-amber-300 flex items-center gap-1 shadow">
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
        <div className="ui-card w-full bg-surface-950 rounded-2xl p-3 border border-teal-800/60 text-xs text-slate-200 text-left space-y-1.5 mb-3">
          <div className="text-[11px] font-black text-teal-300 uppercase">
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
          className="min-h-11 min-w-11 w-full py-3 rounded-2xl game-btn-orange text-white text-xs font-black uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5"
        >
          <Award className="w-4 h-4 text-amber-200" />
          <span>{tx('CONTINUAR CON EL AVISTAJE', 'CONTINUE SIGHTING')}</span>
        </button>
      </div>
    </div>
  );
};
