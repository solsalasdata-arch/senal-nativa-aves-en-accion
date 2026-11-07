import React, { useState } from 'react';
import {
  HelpCircle,
  X,
  CheckCircle2,
  AlertCircle,
  Award,
  Sparkles,
  ChevronRight,
  RotateCcw,
  Map,
  Bird,
  Check
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { TUCAN_CONSIGNAS_QUESTIONS } from '../data/birdsData';
import { PlayerProfile } from '../types/game';
import { useLanguage, localizeTucanConsignas } from '../utils/i18n';

interface QuizConsignasModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerProfile: PlayerProfile;
  onLevelUpSuccess: () => void;
  onOpenMap: () => void;
  onOpenBirds: () => void;
}

export const QuizConsignasModal: React.FC<QuizConsignasModalProps> = ({
  isOpen,
  onClose,
  playerProfile,
  onLevelUpSuccess,
  onOpenMap,
  onOpenBirds
}) => {
  const { lang, tx } = useLanguage();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [answersStatus, setAnswersStatus] = useState<boolean[]>([]);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);

  if (!isOpen) return null;

  const localizedQuestions = localizeTucanConsignas(TUCAN_CONSIGNAS_QUESTIONS, lang);
  const currentQ = localizedQuestions[currentIdx];
  const allCorrect = score === 5;
  const hasSighting = playerProfile.sightingsCompleted >= 1;

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    soundManager.playClick();
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);

    const isCorrect = selectedOption === currentQ.correctIndex;
    if (isCorrect) {
      soundManager.playSuccess();
      setScore(prev => prev + 1);
      setAnswersStatus(prev => [...prev, true]);
    } else {
      soundManager.playClick();
      setAnswersStatus(prev => [...prev, false]);
    }
  };

  const handleNext = () => {
    soundManager.playClick();
    if (currentIdx < TUCAN_CONSIGNAS_QUESTIONS.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsQuizCompleted(true);
      if (score === 5 && hasSighting) {
        soundManager.playSuccess();
        onLevelUpSuccess();
      }
    }
  };

  const handleRestartQuiz = () => {
    soundManager.playClick();
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setAnswersStatus([]);
    setIsQuizCompleted(false);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm max-h-[94vh] flex flex-col rounded-3xl overflow-hidden bg-slate-900 border-2 border-teal-500 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-teal-900/60">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-extrabold text-xs sm:text-sm text-white">
                {tx('5 CONSIGNAS DEL TUCÁN', '5 TOUCAN QUESTIONS')}
              </h3>
              <p className="text-[10px] text-teal-300">
                {tx('Biodiversidad de la Reserva Barón Schuel', 'Biodiversity of Barón Schuel Reserve')}
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

        {/* Content View */}
        <div className="p-4 space-y-3.5 flex-1 overflow-y-auto text-slate-200">
          {!isQuizCompleted ? (
            /* ACTIVE QUIZ SCREEN */
            <div className="space-y-3">
              {/* Question Progress bar */}
              <div className="bg-slate-950/80 rounded-2xl p-2.5 border border-teal-900/50">
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-teal-300">Consigna {currentIdx + 1} de {TUCAN_CONSIGNAS_QUESTIONS.length}</span>
                  <span className="text-amber-400">Aciertos: {score}/{TUCAN_CONSIGNAS_QUESTIONS.length}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-teal-400 to-amber-400 h-full transition-all duration-300"
                    style={{ width: `${((currentIdx + 1) / TUCAN_CONSIGNAS_QUESTIONS.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Text */}
              <div className="bg-slate-950/90 rounded-2xl p-3.5 border border-teal-800/60 space-y-3">
                <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                  {currentQ.question}
                </h4>

                {/* Options List */}
                <div className="space-y-2">
                  {currentQ.options.map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrect = idx === currentQ.correctIndex;

                    let btnStyle = 'bg-slate-900 border-slate-700 text-slate-300 hover:border-teal-500';
                    if (isAnswerSubmitted) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-950 border-emerald-400 text-emerald-200 font-bold';
                      } else if (isSelected) {
                        btnStyle = 'bg-rose-950 border-rose-500 text-rose-200';
                      } else {
                        btnStyle = 'bg-slate-900/50 border-slate-800 text-slate-500';
                      }
                    } else if (isSelected) {
                      btnStyle = 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold';
                    }

                    return (
                      <button
                        key={idx}
                        disabled={isAnswerSubmitted}
                        onClick={() => handleSelectOption(idx)}
                        className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-start gap-2.5 ${btnStyle}`}
                      >
                        <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="flex-1 leading-snug">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Feedback Explanation */}
                {isAnswerSubmitted && (
                  <div
                    className={`p-3 rounded-xl text-xs space-y-1 ${
                      selectedOption === currentQ.correctIndex
                        ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-200'
                        : 'bg-amber-950/80 border border-amber-500/50 text-amber-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      {selectedOption === currentQ.correctIndex ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>¡EXCELENTE RESPUESTA!</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-amber-400" />
                          <span>GUÍA DE CAMPO SCHUEL:</span>
                        </>
                      )}
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-95">{currentQ.explanation}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2">
                  {!isAnswerSubmitted ? (
                    <button
                      disabled={selectedOption === null}
                      onClick={handleSubmitAnswer}
                      className={`w-full py-3 rounded-xl font-bold text-xs tracking-wide transition-all ${
                        selectedOption !== null
                          ? 'game-btn-orange text-white cursor-pointer'
                          : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      }`}
                    >
                      CONFIRMAR RESPUESTA
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="w-full py-3 rounded-xl game-btn-mint text-emerald-950 font-black text-xs flex items-center justify-center gap-1.5"
                    >
                      <span>{currentIdx < TUCAN_CONSIGNAS_QUESTIONS.length - 1 ? 'SIGUIENTE CONSIGNA' : 'VER RESULTADO FINAL'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : allCorrect && hasSighting ? (
            /* BIFURCACIÓN 1: ÉXITO TOTAL (5/5 CORRECTAS + AL MENOS 1 AVISTAMIENTO) */
            <div className="relative bg-slate-950/95 rounded-3xl p-5 border-3 border-amber-400 text-center space-y-4 shadow-[0_0_40px_rgba(245,158,11,0.4)] animate-fadeIn">
              {/* Confeti animado simulado */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                <span className="absolute top-2 left-6 text-xl animate-bounce">🎉</span>
                <span className="absolute top-4 right-8 text-lg animate-ping">✨</span>
                <span className="absolute top-12 left-10 text-xl animate-spin">🌟</span>
                <span className="absolute top-10 right-4 text-xl animate-bounce">🎊</span>
              </div>

              {/* Tucán Abriendo las Alas Feliz */}
              <div className="relative w-28 h-28 mx-auto rounded-full border-4 border-amber-400 p-1 bg-gradient-to-tr from-amber-500 to-yellow-300 shadow-2xl overflow-hidden ring-4 ring-amber-400/40">
                <img
                  src="/assets/aistudio/Toucan_perched_on_branch_8ab41bfc_230157f9.jpg"
                  alt="Tucán feliz abriendo alas"
                  className="w-full h-full object-cover object-[center_18%] scale-125"
                />
              </div>

              {/* Mensaje de Victoria */}
              <div>
                <h4 className="text-lg font-black text-white leading-tight uppercase">
                  ¡ENHORABUENA EXPLORADOR!
                </h4>
                <p className="text-xs text-amber-300 font-bold mt-1">
                  "¡Has respondido todas las consignas correctamente y has subido de nivel!"
                </p>
              </div>

              {/* Medalla Dorada Central */}
              <div className="bg-gradient-to-r from-amber-500/20 via-yellow-400/20 to-amber-500/20 border-2 border-amber-400/80 rounded-2xl p-3 flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg shrink-0">
                  <Award className="w-8 h-8 text-slate-950 stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-black text-amber-300 uppercase tracking-wide">
                    INSIGNIA DE OBSERVADOR EN ASCENSO
                  </div>
                  <div className="text-[10px] text-teal-200">
                    Nivel {playerProfile.level} Alcanzado · +150 XP Otorgados
                  </div>
                </div>
              </div>

              {/* Requisitos Cumplidos */}
              <div className="text-[11px] text-emerald-300 font-semibold space-y-1 text-left bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>1 Avistamiento con prismáticos XR completado (✓)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>5 de 5 consignas respondidas correctamente (5/5 ✓)</span>
                </div>
              </div>

              {/* Botón: Continuar con el Avistaje */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  onClose();
                }}
                className="w-full py-3.5 rounded-2xl game-btn-orange text-white text-xs font-black tracking-wide uppercase shadow-xl"
              >
                CONTINUAR CON EL AVISTAJE
              </button>
            </div>
          ) : (
            /* BIFURCACIÓN 2: FEEDBACK AMABLE 8B (FALLÓ ALGUNA PREGUNTA O FALTA AVISTAMIENTO) */
            <div className="bg-slate-950/95 rounded-3xl p-5 border-2 border-teal-600/70 text-center space-y-3.5 animate-fadeIn">
              {/* Tucán con Mirada Empática */}
              <div className="relative w-24 h-24 mx-auto rounded-full border-3 border-teal-400/70 p-0.5 bg-slate-900 shadow-xl overflow-hidden">
                <img
                  src="/assets/aistudio/c3da3f37-f246-40f4-8d25-1958fb93d2f1_0d2a7f41.jpeg"
                  alt="Tucán con mirada empática"
                  className="w-full h-full object-cover scale-110"
                />
              </div>

              {/* Globo de Diálogo Empático */}
              <div className="bg-white text-slate-900 p-3 rounded-2xl text-xs font-bold leading-snug shadow-md text-center">
                "Desafortunadamente, no has respondido todas las preguntas correctamente."
              </div>

              {/* Puntaje y Aclaración: NO RESTA PUNTOS */}
              <div className="text-xs text-amber-300 font-semibold">
                Obtuviste <span className="font-extrabold text-white text-sm">{score} de 5</span> aciertos.
                <span className="block text-[10px] text-teal-300 font-normal mt-0.5">
                  ¡No te preocupes! No se restan puntos en el Parque Botánico.
                </span>
              </div>

              {/* Pista Educativa de Repaso */}
              <div className="bg-teal-950/70 border border-teal-800/60 rounded-xl p-3 text-left text-xs text-teal-200 space-y-1">
                <div className="text-[10px] font-bold text-amber-300 uppercase flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>PISTA EDUCATIVA PARA REPASAR:</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-300">
                  Recuerda: el <strong>Benteveo</strong> luce antifaz negro y corona oculta amarilla; el <strong>Chinchero Chico</strong> tiene pico arqueado para las cortezas; y la <strong>Pava de Monte</strong> es vulnerable con carúncula roja.
                </p>
              </div>

              {/* Botón Naranja Grande: CONTINUAR CON LA AVENTURA */}
              <button
                onClick={handleRestartQuiz}
                className="w-full py-3 rounded-2xl game-btn-orange text-white text-xs font-black tracking-wide uppercase shadow-lg flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>CONTINUAR CON LA AVENTURA (REINTENTAR)</span>
              </button>

              {/* Botones Inferiores: MAPAS y AVES */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    soundManager.playClick();
                    onClose();
                    onOpenMap();
                  }}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-200 text-xs font-bold border border-teal-700/60 flex items-center justify-center gap-1.5 transition-colors"
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
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-200 text-xs font-bold border border-amber-700/60 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Bird className="w-4 h-4 text-amber-400" />
                  <span>AVES (GUÍA)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
