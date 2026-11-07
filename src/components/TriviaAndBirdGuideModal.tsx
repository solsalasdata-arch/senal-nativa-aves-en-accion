import React, { useState, useEffect } from 'react';
import {
  Bird,
  HelpCircle,
  X,
  Volume2,
  CheckCircle2,
  AlertCircle,
  Award,
  Sparkles,
  ChevronRight,
  BookOpen,
  Music,
  Eye,
  Calendar,
  Clock,
  MapPin,
  Shield,
  Feather,
  Info,
  Check,
  Star,
  Play,
  RotateCcw
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { CATALOG_BIRDS_DATA, TRIVIA_QUESTIONS, CHECKPOINTS_DATA } from '../data/birdsData';
import { CatalogBird, JournalEntry, PlayerProfile } from '../types/game';

interface TriviaAndBirdGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerProfile: PlayerProfile;
  onUnlockSilhouette: (birdId: string, xpGain: number) => void;
  onUnlockAcoustic: (birdId: string, xpGain: number) => void;
  onAddJournalEntry: (entry: Omit<JournalEntry, 'id' | 'timestamp'>) => void;
  questionsAnsweredCount: number;
  onQuestionsAnsweredUpdate: (newCount: number) => void;
  initialTab?: 'catalog' | 'audio' | 'journal' | 'trivia';
}

export const TriviaAndBirdGuideModal: React.FC<TriviaAndBirdGuideModalProps> = ({
  isOpen,
  onClose,
  playerProfile,
  onUnlockSilhouette,
  onUnlockAcoustic,
  onAddJournalEntry,
  questionsAnsweredCount,
  onQuestionsAnsweredUpdate,
  initialTab = 'catalog'
}) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'audio' | 'journal' | 'trivia'>('catalog');

  // Filter for catalog cards: 'all' | 'silhouettes' | 'illuminated'
  const [catalogFilter, setCatalogFilter] = useState<'all' | 'silhouettes' | 'illuminated'>('all');

  // Sub-modals
  const [inspectingBird, setInspectingBird] = useState<CatalogBird | null>(null);
  const [silhouetteGameBird, setSilhouetteGameBird] = useState<CatalogBird | null>(null);
  const [hintsRevealed, setHintsRevealed] = useState<number>(1);
  const [selectedSilhouetteAnswer, setSelectedSilhouetteAnswer] = useState<string | null>(null);
  const [silhouetteResult, setSilhouetteResult] = useState<'correct' | 'wrong' | null>(null);

  // 4-Toques Scientific Field Journal Form
  const [journalModalBird, setJournalModalBird] = useState<CatalogBird | null>(null);
  const [behavior, setBehavior] = useState<'Alimentándose' | 'Cantando' | 'En reposo' | 'En vuelo'>('Cantando');
  const [count, setCount] = useState<'1 individuo' | 'Pareja (2)' | 'Bandada (3 o más)'>('1 individuo');
  const [stratum, setStratum] = useState<'Dosel' | 'Subdosel' | 'Sotobosque' | 'Zona urbanizada' | 'Zona Urbanizada' | 'En vuelo' | 'En Vuelo'>('Subdosel');
  const [weather, setWeather] = useState<'Soleado' | 'Nublado' | 'Llovizna de Yungas'>('Soleado');
  const [selectedTrailPoint, setSelectedTrailPoint] = useState<string>('1º Descanso "Mora Negra" (470 m)');

  // Bioacoustic Mode State (Paso 11)
  const [audioTargetBird, setAudioTargetBird] = useState<CatalogBird>(CATALOG_BIRDS_DATA[5]); // Benteveo default
  const [audioIsPlaying, setAudioIsPlaying] = useState(false);
  const [audioGuess, setAudioGuess] = useState<string | null>(null);
  const [audioResult, setAudioResult] = useState<'correct' | 'wrong' | null>(null);

  // Trivia State (5 Questions)
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [correctAnswersList, setCorrectAnswersList] = useState<number[]>([]);
  const [triviaFinished, setTriviaFinished] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  // Sound Dispatcher based on bird soundType
  const playSoundForBird = (bird: CatalogBird) => {
    setAudioIsPlaying(true);
    if (bird.soundType === 'benteveo') soundManager.playBenteveoCall();
    else if (bird.soundType === 'chinchero') soundManager.playChincheroCall();
    else if (bird.soundType === 'urutau') soundManager.playUrutauCall();
    else if (bird.soundType === 'zorzal') soundManager.playZorzalCall();
    else if (bird.soundType === 'hornero') soundManager.playHorneroCall();
    else if (bird.soundType === 'toucan') soundManager.playToucanCall();
    else soundManager.playClick();

    setTimeout(() => {
      setAudioIsPlaying(false);
    }, 1800);
  };

  // Featured bird: CHINCHERO CHICO
  const featuredChinchero: CatalogBird = {
    id: '010-chinchero-chico',
    catalogNumber: '010',
    commonName: 'Chinchero Chico',
    scientificName: 'Lepidocolaptes angustirostris',
    size: '21 cm',
    weight: '36 g',
    family: 'FURNARIIDAE',
    habitat: 'Fustes y troncos de las Yungas',
    stratum: 'Subdosel',
    conservationStatus: 'NA',
    presence: 'R',
    observationPossibility: 'A',
    beakDescription: 'Pico pálido, esbelto y curvado hacia abajo, ideal para buscar insectos en la corteza.',
    songDescription: 'Trino descendente y rápido "ti-ti-ti-tirrr" característico.',
    plumageDescription: 'Cejas blancas nítidas, dorso canela y pecho estriado de blanco cremoso.',
    cp: 2579,
    hp: '125 / 125 HP',
    hints: {
      size: '21 cm',
      habitat: 'Estrato: subdosel y fustes de árboles',
      morphology: 'Pico pálido arqueado como lezna y cola con raquis rígidos como trípode.',
      loreOrFact: 'Trepa ágilmente los troncos de tipas y laureles en espiral buscando larvas.'
    },
    soundType: 'chinchero',
    image: '/assets/aistudio/Remove_text_from_screen_248c7528_824b6a34.jpg',
    silhouetteIcon: '🪵'
  };

  const isBirdUnlocked = (birdId: string) => {
    return (playerProfile.unlockedSilhouettes || []).includes(birdId);
  };

  const isAcousticUnlocked = (birdId: string) => {
    return (playerProfile.unlockedAcoustics || []).includes(birdId);
  };

  // Start Silhouette Mystery Game
  const handleOpenSilhouetteGame = (bird: CatalogBird) => {
    soundManager.playClick();
    setSilhouetteGameBird(bird);
    setHintsRevealed(1);
    setSelectedSilhouetteAnswer(null);
    setSilhouetteResult(null);
  };

  const getSilhouetteXpReward = () => {
    if (hintsRevealed === 1) return 100;
    if (hintsRevealed === 2) return 75;
    if (hintsRevealed === 3) return 50;
    return 25;
  };

  const handleGuessSilhouette = (guessedCommonName: string) => {
    if (!silhouetteGameBird || silhouetteResult !== null) return;
    setSelectedSilhouetteAnswer(guessedCommonName);

    if (guessedCommonName.toLowerCase() === silhouetteGameBird.commonName.toLowerCase()) {
      soundManager.playSuccess();
      setSilhouetteResult('correct');
      const xp = getSilhouetteXpReward();
      onUnlockSilhouette(silhouetteGameBird.id, xp);
    } else {
      soundManager.playClick();
      setSilhouetteResult('wrong');
    }
  };

  // Open 4-Toque Field Journal form
  const handleOpenJournalForm = (bird: CatalogBird) => {
    soundManager.playClick();
    setJournalModalBird(bird);
    setStratum(bird.stratum);
  };

  // Save 4-Toque Field Journal entry
  const handleSaveJournalEntry = () => {
    if (!journalModalBird) return;
    soundManager.playSuccess();

    onAddJournalEntry({
      birdName: journalModalBird.commonName,
      scientificName: journalModalBird.scientificName,
      trailName: selectedTrailPoint,
      notes: `Registro Científico 4 Toques: Comportamiento ${behavior}, ${count}, Estrato ${stratum}, Clima ${weather}.`,
      behavior,
      count,
      stratum,
      weather,
      photoUrl: journalModalBird.image
    });

    setJournalModalBird(null);
  };

  // Bioacoustic Recognition Game Handlers
  const handleStartAudioGame = (targetBird: CatalogBird) => {
    soundManager.playClick();
    setAudioTargetBird(targetBird);
    setAudioGuess(null);
    setAudioResult(null);
    playSoundForBird(targetBird);
  };

  const handleAudioGuess = (guessedName: string) => {
    if (audioResult !== null) return;
    setAudioGuess(guessedName);

    if (guessedName.toLowerCase() === audioTargetBird.commonName.toLowerCase()) {
      soundManager.playSuccess();
      setAudioResult('correct');
      onUnlockAcoustic(audioTargetBird.id, 50);
    } else {
      soundManager.playClick();
      setAudioResult('wrong');
    }
  };

  // TRIVIA Handlers
  const currentQ = TRIVIA_QUESTIONS[currentQuestionIdx];

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    soundManager.playClick();
    setSelectedOption(idx);
  };

  const handleSubmitTrivia = () => {
    if (selectedOption === null || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);

    const isCorrect = selectedOption === currentQ.correctIndex;
    if (isCorrect) {
      soundManager.playSuccess();
      const updated = Array.from(new Set([...correctAnswersList, currentQ.id]));
      setCorrectAnswersList(updated);
      onQuestionsAnsweredUpdate(updated.length);
    } else {
      soundManager.playClick();
    }
  };

  const handleNextTriviaQuestion = () => {
    soundManager.playClick();
    if (currentQuestionIdx < TRIVIA_QUESTIONS.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setTriviaFinished(true);
    }
  };

  const handleResetTrivia = () => {
    soundManager.playClick();
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setTriviaFinished(false);
  };

  // Filtered bird list for the collection grid
  const filteredBirds = CATALOG_BIRDS_DATA.filter((b) => {
    const unlocked = isBirdUnlocked(b.id);
    if (catalogFilter === 'silhouettes') return !unlocked;
    if (catalogFilter === 'illuminated') return unlocked;
    return true;
  });

  const journalEntries = playerProfile.fieldJournal || [];
  const journalCount = journalEntries.length;
  const hasDetailBadge = playerProfile.hasDetailObserverBadge || journalCount >= 10;

  // Render SVG Silhouette for each species
  const renderBirdSilhouetteSvg = (catalogNumber: string) => {
    switch (catalogNumber) {
      case '011': // Jote Real - soaring raptor
        return (
          <svg viewBox="0 0 100 80" className="w-20 h-16 fill-slate-900 drop-shadow-md">
            <path d="M50 35 C42 22, 25 15, 5 18 C3 25, 12 30, 26 34 C35 37, 44 40, 48 45 L50 48 L52 45 C56 40, 65 37, 74 34 C88 30, 97 25, 95 18 C75 15, 58 22, 50 35 Z M47 48 L46 68 L54 68 L53 48 Z M47 32 C47 28, 53 28, 53 32 Z" />
          </svg>
        );
      case '012': // Loro Alisero - perched parrot
        return (
          <svg viewBox="0 0 80 90" className="w-16 h-18 fill-slate-900 drop-shadow-md">
            <path d="M42 15 C34 14, 30 22, 32 30 C34 38, 30 48, 34 60 L38 85 L42 85 L44 65 C48 55, 55 45, 52 32 C50 22, 48 16, 42 15 Z M32 24 C28 25, 27 29, 31 31 Z" />
          </svg>
        );
      case '013': // Picaflor Cometa - hovering hummingbird with scissor streamers
        return (
          <svg viewBox="0 0 90 90" className="w-18 h-18 fill-slate-900 drop-shadow-md">
            <path d="M35 32 C42 24, 52 24, 56 30 C58 34, 55 42, 50 48 L58 85 L54 85 L46 54 L38 82 L34 82 L44 48 C38 42, 30 38, 35 32 Z M54 30 L78 28 L56 34 Z M35 32 L15 36 Z" />
          </svg>
        );
      case '014': // Urutaú - vertical cryptic nightjar on tree stump
        return (
          <svg viewBox="0 0 80 95" className="w-16 h-18 fill-slate-900 drop-shadow-md">
            <path d="M38 12 C30 14, 32 28, 34 40 C36 52, 35 70, 36 90 L44 90 C45 70, 46 52, 44 40 C42 28, 44 14, 38 12 Z M32 20 C30 20, 30 24, 34 24 Z" />
          </svg>
        );
      case '015': // Chiricote - walking rail with long beak
        return (
          <svg viewBox="0 0 90 90" className="w-18 h-18 fill-slate-900 drop-shadow-md">
            <path d="M42 25 C35 25, 28 32, 28 42 C28 50, 35 56, 44 56 C52 56, 60 48, 62 40 L78 36 L62 34 C58 28, 50 25, 42 25 Z M36 56 L34 82 L38 82 L40 56 Z M48 56 L46 80 L50 80 L52 56 Z" />
          </svg>
        );
      case '016': // Benteveo - perched stout passerine
        return (
          <svg viewBox="0 0 90 85" className="w-18 h-16 fill-slate-900 drop-shadow-md">
            <path d="M40 22 C32 22, 28 28, 30 38 C32 48, 38 56, 48 58 L58 75 L62 75 L56 55 C64 48, 66 38, 62 30 C58 24, 48 22, 40 22 Z M62 30 L76 31 L62 35 Z" />
          </svg>
        );
      case '017': // Hornero - ovenbird standing firmly
        return (
          <svg viewBox="0 0 85 85" className="w-16 h-16 fill-slate-900 drop-shadow-md">
            <path d="M40 25 C34 25, 30 32, 32 40 C34 50, 40 58, 50 58 L58 76 L62 76 L56 56 C62 50, 64 40, 60 32 C56 26, 48 25, 40 25 Z M60 32 L74 34 L60 36 Z" />
          </svg>
        );
      case '018': // Zorzal Colorado - upright song thrush
      default:
        return (
          <svg viewBox="0 0 85 85" className="w-16 h-16 fill-slate-900 drop-shadow-md">
            <path d="M42 20 C34 20, 30 28, 32 38 C34 50, 42 60, 52 60 L60 78 L64 78 L58 58 C64 50, 66 38, 62 28 C56 22, 48 20, 42 20 Z M62 28 L76 29 L62 32 Z" />
          </svg>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-3 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div
        className="relative w-full max-w-sm max-h-[94vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border-2 border-[#1DB5A0]"
        style={{ backgroundColor: '#2CC5B1' }}
      >
        {/* TOP HEADER */}
        <div className="bg-slate-950/90 px-3.5 pt-3 pb-2 border-b border-teal-800/60 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-400 flex items-center justify-center text-teal-300 shrink-0 shadow">
                <Bird className="w-4 h-4" />
              </div>
              <div className="truncate">
                <h3 className="font-black text-xs text-white uppercase tracking-wider">
                  COLECCIÓN DE AVES · YUNGAS
                </h3>
                <p className="text-[10px] text-teal-300 font-semibold truncate">
                  Parque Botánico Municipal "Barón Carlos María Schuel"
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 4 SEGMENTED NAVIGATION TABS */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900/90 rounded-xl border border-teal-900/60 text-[10px] font-bold">
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('catalog');
              }}
              className={`py-1.5 rounded-lg transition-all text-center flex flex-col items-center justify-center ${
                activeTab === 'catalog'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bird className="w-3.5 h-3.5 mb-0.5" />
              <span>Catálogo</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('audio');
              }}
              className={`py-1.5 rounded-lg transition-all text-center flex flex-col items-center justify-center ${
                activeTab === 'audio'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Music className="w-3.5 h-3.5 mb-0.5" />
              <span>Cantos</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('journal');
              }}
              className={`py-1.5 rounded-lg transition-all text-center flex flex-col items-center justify-center relative ${
                activeTab === 'journal'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 mb-0.5" />
              <span>Diario</span>
              {hasDetailBadge && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-slate-900" />
              )}
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('trivia');
              }}
              className={`py-1.5 rounded-lg transition-all text-center flex flex-col items-center justify-center ${
                activeTab === 'trivia'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 mb-0.5" />
              <span>Trivia ({questionsAnsweredCount}/5)</span>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: CATÁLOGO DE AVES (011 AL 018) */}
        {/* ============================================================== */}
        {activeTab === 'catalog' && (
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            
            {/* UPPER HALF: CHINCHERO CHICO OVER CIRCULAR PARK SEAL */}
            <div
              onClick={() => {
                soundManager.playClick();
                setInspectingBird(featuredChinchero);
              }}
              className="relative rounded-3xl overflow-hidden border-2 border-teal-400/80 bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-950 p-3.5 shadow-xl cursor-pointer group"
            >
              {/* Circular Watermark Seal */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none bg-center bg-contain bg-no-repeat"
                style={{
                  backgroundImage: `url('/assets/aistudio/Remove_text_from_screen_248c7528_824b6a34.jpg')`
                }}
              />

              <div className="relative z-10 flex items-center gap-3">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-400 shrink-0 bg-slate-900 shadow-lg">
                  <img
                    src={featuredChinchero.image}
                    alt="Chinchero Chico"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.2 rounded bg-black/80 text-[8px] font-black text-amber-300">
                    DESTACADA
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-500/60 uppercase">
                      Parque Barón Schuel
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playSoundForBird(featuredChinchero);
                      }}
                      className="p-1.5 rounded-lg bg-teal-800 text-teal-200 border border-teal-500/70 hover:bg-teal-700 active:scale-95"
                      title="Escuchar Trino"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="text-base font-black text-white uppercase tracking-wide mt-0.5">
                    {featuredChinchero.commonName}
                  </h4>
                  <p className="text-[10px] italic text-teal-200 font-serif">
                    {featuredChinchero.scientificName} · {featuredChinchero.size}
                  </p>

                  <div className="mt-2 flex gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        soundManager.playClick();
                        setInspectingBird(featuredChinchero);
                      }}
                      className="px-2.5 py-1 rounded-lg game-btn-mint text-emerald-950 text-[10px] font-black flex items-center gap-1 shadow"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Ficha Técnica</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenJournalForm(featuredChinchero);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-teal-950 text-teal-200 border border-teal-500/60 hover:bg-teal-900 text-[10px] font-bold flex items-center gap-1"
                    >
                      <BookOpen className="w-3 h-3 text-amber-400" />
                      <span>4 Toques</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Access to Bioacoustic Mode */}
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('audio');
              }}
              className="w-full py-2.5 px-3 rounded-2xl game-btn-orange text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg tracking-wide uppercase"
            >
              <Music className="w-4 h-4 text-amber-300" />
              <span>Modo Escuchar el Canto (Sin Conexión)</span>
            </button>

            {/* LOWER HALF: CATALOG GRID WITH SILHOUETTES / ILLUMINATED FILTER */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Guía Oficial de Especies (011 - 018)
                </span>
                <span className="text-[10px] font-extrabold text-teal-950">
                  {(playerProfile.unlockedSilhouettes || []).length}/{CATALOG_BIRDS_DATA.length} Iluminadas
                </span>
              </div>

              {/* Toggle Filter Tabs */}
              <div className="flex gap-1 p-1 bg-slate-950/80 rounded-xl border border-teal-900 text-[10px] font-bold">
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setCatalogFilter('all');
                  }}
                  className={`flex-1 py-1 rounded-lg transition-all ${
                    catalogFilter === 'all'
                      ? 'bg-teal-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Todas ({CATALOG_BIRDS_DATA.length})
                </button>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setCatalogFilter('silhouettes');
                  }}
                  className={`flex-1 py-1 rounded-lg transition-all ${
                    catalogFilter === 'silhouettes'
                      ? 'bg-amber-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Siluetas ({CATALOG_BIRDS_DATA.filter(b => !isBirdUnlocked(b.id)).length})
                </button>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setCatalogFilter('illuminated');
                  }}
                  className={`flex-1 py-1 rounded-lg transition-all ${
                    catalogFilter === 'illuminated'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Iluminadas ({CATALOG_BIRDS_DATA.filter(b => isBirdUnlocked(b.id)).length})
                </button>
              </div>

              {/* 2-Column Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {filteredBirds.map((bird) => {
                  const isUnlocked = isBirdUnlocked(bird.id);
                  const stars = playerProfile.birdPhotoStars?.[bird.id] || 0;

                  return (
                    <div
                      key={bird.id}
                      onClick={() => {
                        if (isUnlocked) {
                          soundManager.playClick();
                          setInspectingBird(bird);
                        } else {
                          handleOpenSilhouetteGame(bird);
                        }
                      }}
                      className={`relative rounded-2xl overflow-hidden border p-2.5 flex flex-col justify-between cursor-pointer transition-all active:scale-[0.98] shadow-md ${
                        isUnlocked
                          ? 'bg-slate-950/90 border-teal-400 hover:border-amber-400'
                          : 'bg-slate-950/95 border-slate-800 hover:border-teal-500'
                      }`}
                    >
                      {/* ID Badge */}
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-900 text-teal-300 border border-teal-900">
                          #{bird.catalogNumber}
                        </span>
                        {isUnlocked ? (
                          <div className="flex items-center text-amber-400 text-[10px]">
                            {'★'.repeat(Math.max(1, stars))}
                          </div>
                        ) : (
                          <span className="text-[8px] font-black text-amber-400 bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-600/40">
                            SILUETA
                          </span>
                        )}
                      </div>

                      {/* Silhouette or Color Image */}
                      <div className="relative h-24 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center border border-slate-800/80 mb-2">
                        {isUnlocked ? (
                          <img
                            src={bird.image}
                            alt={bird.commonName}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-teal-950/40 to-slate-950">
                            {renderBirdSilhouetteSvg(bird.catalogNumber)}
                            <span className="text-[8px] font-black text-amber-300 tracking-wider uppercase mt-1">
                              Toca para Pistas
                            </span>
                          </div>
                        )}

                        <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-xs text-[8px] text-teal-200">
                          {bird.size}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="min-w-0">
                        {isUnlocked ? (
                          <>
                            <h5 className="text-xs font-black text-white truncate leading-tight">
                              {bird.commonName}
                            </h5>
                            <p className="text-[9px] italic text-teal-300 font-serif truncate">
                              {bird.scientificName}
                            </p>
                            <div className="mt-1 flex items-center justify-between text-[9px] text-slate-400">
                              <span className="truncate">{bird.family}</span>
                              <span className={`font-black ${bird.conservationStatus === 'AM' ? 'text-rose-400' : 'text-emerald-400'}`}>
                                {bird.conservationStatus}
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <h5 className="text-xs font-bold text-slate-300 truncate leading-tight">
                              Especie #{bird.catalogNumber}
                            </h5>
                            <p className="text-[9px] text-teal-400 truncate">
                              {bird.hints.size}
                            </p>
                            <div className="mt-1 flex items-center justify-between text-[9px] text-amber-400 font-bold">
                              <span>Misterio</span>
                              <span>+100 XP</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: BIOACÚSTICA "ESCUCHA EL CANTO" (PASO 11) */}
        {/* ============================================================== */}
        {activeTab === 'audio' && (
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
            {/* Header & Bioacoustic Synth Info */}
            <div className="rounded-2xl p-3 bg-slate-950/90 border border-teal-500/60 space-y-2 text-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  Bioacústica Yungas (Web Audio)
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500">
                  100% OFFLINE
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Vocalizaciones sintetizadas en el dispositivo: Benteveo, Chinchero Chico, Urutaú, Zorzal Colorado y Hornero.
              </p>

              {/* Animated Sound Wave Graphic */}
              <div className="h-16 rounded-xl bg-slate-900 border border-teal-800 p-2 flex items-center justify-center gap-1.5 overflow-hidden">
                {[14, 30, 20, 48, 38, 22, 52, 32, 20, 42, 26, 16, 32, 45, 18, 28].map((baseH, idx) => {
                  const animHeight = audioIsPlaying
                    ? Math.min(48, Math.max(8, baseH * (1 + 0.8 * Math.sin(Date.now() / 120 + idx))))
                    : 6;
                  return (
                    <div
                      key={idx}
                      className="w-1.5 rounded-full bg-gradient-to-t from-teal-400 to-amber-300 transition-all duration-100"
                      style={{ height: `${animHeight}px` }}
                    />
                  );
                })}
              </div>

              {/* Bird Selector Buttons */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {[
                  CATALOG_BIRDS_DATA[5], // Benteveo
                  featuredChinchero,     // Chinchero Chico
                  CATALOG_BIRDS_DATA[3], // Urutaú
                  CATALOG_BIRDS_DATA[7], // Zorzal Colorado
                  CATALOG_BIRDS_DATA[6]  // Hornero
                ].map((bird) => {
                  const isSelected = audioTargetBird.id === bird.id;
                  const isUnlocked = isAcousticUnlocked(bird.id);
                  return (
                    <button
                      key={bird.id}
                      onClick={() => handleStartAudioGame(bird)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 border transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-400 shadow ring-2 ring-emerald-400/40'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-teal-500'
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5 text-amber-300" />
                      <span>{bird.commonName}</span>
                      {isUnlocked && <span className="text-emerald-300 text-[10px]">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Acoustic Recognition Challenge */}
            <div className="bg-slate-950/95 rounded-2xl p-3.5 border border-teal-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wide">
                  Desafío: ¿Quién Canta en el Sendero?
                </span>
                <span className="text-[10px] font-black text-teal-300">+50 XP</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-teal-900 text-center space-y-2">
                <p className="text-[11px] text-slate-300">
                  Escucha el trino o lamento y selecciona cuál de las 3 especies candidatas está vocalizando:
                </p>
                <button
                  onClick={() => playSoundForBird(audioTargetBird)}
                  className="w-full py-2.5 rounded-xl game-btn-mint text-emerald-950 font-black text-xs flex items-center justify-center gap-2 shadow"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{audioIsPlaying ? 'Reproduciendo Canto...' : 'Reproducir Canto'}</span>
                </button>
              </div>

              {/* 3 Guess Options */}
              <div className="space-y-2">
                {[
                  audioTargetBird.commonName,
                  audioTargetBird.catalogNumber === '016' ? 'Chinchero Chico' : 'Benteveo',
                  audioTargetBird.catalogNumber === '014' ? 'Zorzal Colorado' : 'Urutaú'
                ]
                  .filter((v, i, a) => a.indexOf(v) === i)
                  .map((optName, idx) => {
                    const isSelected = audioGuess === optName;
                    let style = 'bg-slate-900 border-slate-700 text-slate-200 hover:border-teal-500';

                    if (audioResult !== null) {
                      if (optName.toLowerCase() === audioTargetBird.commonName.toLowerCase()) {
                        style = 'bg-emerald-950 border-emerald-400 text-emerald-200 font-bold';
                      } else if (isSelected) {
                        style = 'bg-rose-950 border-rose-500 text-rose-200';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={audioResult !== null}
                        onClick={() => handleAudioGuess(optName)}
                        className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${style}`}
                      >
                        <span className="font-bold">{optName}</span>
                        {audioResult === 'correct' && optName === audioTargetBird.commonName && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        )}
                      </button>
                    );
                  })}
              </div>

              {/* Audio Success Banner */}
              {audioResult === 'correct' && (
                <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-500 text-xs text-emerald-200 space-y-1 animate-fadeIn">
                  <div className="font-bold flex items-center gap-1.5 text-amber-300">
                    <Sparkles className="w-4 h-4" />
                    ¡RECONOCIMIENTO EXITOSO! (+50 XP)
                  </div>
                  <p className="text-[11px]">
                    Has desbloqueado el reproductor de audio con onda sonora en la Ficha Técnica del {audioTargetBird.commonName}.
                  </p>
                </div>
              )}

              {/* Audio Retry */}
              {audioResult === 'wrong' && (
                <div className="p-3 rounded-xl bg-amber-950 border border-amber-500 text-xs text-amber-200 space-y-1 animate-fadeIn">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    ¡Escucha con atención el ritmo!
                  </div>
                  <p className="text-[11px]">
                    El Benteveo tiene un llamado trisilábico muy agudo, el Chinchero un trino rápido, el Urutaú un lamento descendente y el Hornero un dúo repiqueteado.
                  </p>
                  <button
                    onClick={() => {
                      setAudioGuess(null);
                      setAudioResult(null);
                    }}
                    className="mt-1 px-3 py-1 rounded-lg bg-amber-800 text-amber-100 text-[10px] font-bold"
                  >
                    Reintentar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: DIARIO DE CAMPO (PASO 13) */}
        {/* ============================================================== */}
        {activeTab === 'journal' && (
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
            {/* Observer of Details Badge Tracker */}
            <div className="rounded-2xl p-3 bg-slate-950/90 border border-amber-500/60 space-y-2 text-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  Insignia Observador de Detalles
                </span>
                <span className="text-xs font-black text-amber-400">
                  {Math.min(10, journalCount)}/10
                </span>
              </div>

              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-amber-900">
                <div
                  className="h-full bg-gradient-to-r from-teal-400 to-amber-400 transition-all duration-500"
                  style={{ width: `${Math.min(100, (journalCount / 10) * 100)}%` }}
                />
              </div>

              {hasDetailBadge ? (
                <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-200 text-[11px] font-bold flex items-center gap-2">
                  <span className="text-xl">🏅</span>
                  <div>
                    <div>¡Insignia Obtenida!</div>
                    <div className="text-[9px] font-normal text-emerald-300">
                      Has registrado 10 observaciones científicas con el método de 4 Toques.
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-[10px] text-amber-200/80">
                  Completa 10 registros científicos con los 4 Toques (Comportamiento, Cantidad, Estrato, Clima) para ganar la Insignia Dorada.
                </p>
              )}
            </div>

            {/* Quick Register Trigger */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black text-slate-900 uppercase">
                Observaciones Registradas ({journalCount})
              </span>
              <button
                onClick={() => handleOpenJournalForm(CATALOG_BIRDS_DATA[5])}
                className="px-2.5 py-1 rounded-xl game-btn-orange text-white text-[10px] font-black flex items-center gap-1 shadow"
              >
                <span>+ Registrar en Diario</span>
              </button>
            </div>

            {/* Entries List */}
            {journalEntries.length === 0 ? (
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-2 text-white">
                <p className="text-xs text-slate-400">No hay observaciones registradas todavía.</p>
                <p className="text-[10px] text-teal-300">
                  Abre la Ficha Técnica de cualquier ave del catálogo y pulsa "Registrar en Diario de Campo (4 Toques)".
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {journalEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 rounded-2xl bg-slate-950/95 border border-teal-900 space-y-1.5 text-white"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="text-xs font-black text-white">{entry.birdName}</h5>
                        <p className="text-[10px] italic text-teal-300 font-serif">
                          {entry.scientificName}
                        </p>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-900 text-teal-200 border border-teal-800">
                        {entry.trailName || 'Sendero Las Yungas'}
                      </span>
                    </div>

                    {/* 4 Toque Pills */}
                    <div className="grid grid-cols-2 gap-1 text-[9px]">
                      <div className="bg-slate-900 px-2 py-1 rounded border border-slate-800 text-slate-300">
                        <span className="text-teal-400 font-bold">1. Acción: </span>
                        {entry.behavior || 'En reposo'}
                      </div>
                      <div className="bg-slate-900 px-2 py-1 rounded border border-slate-800 text-slate-300">
                        <span className="text-teal-400 font-bold">2. Cantidad: </span>
                        {entry.count || '1 individuo'}
                      </div>
                      <div className="bg-slate-900 px-2 py-1 rounded border border-slate-800 text-slate-300">
                        <span className="text-teal-400 font-bold">3. Estrato: </span>
                        {entry.stratum || 'Subdosel'}
                      </div>
                      <div className="bg-slate-900 px-2 py-1 rounded border border-slate-800 text-slate-300">
                        <span className="text-teal-400 font-bold">4. Clima: </span>
                        {entry.weather || 'Soleado'}
                      </div>
                    </div>

                    <div className="text-[9px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-900">
                      <span>{new Date(entry.timestamp).toLocaleDateString()} · {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {entry.stars ? (
                        <span className="text-amber-400 font-bold">Foto {'★'.repeat(entry.stars)}</span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: TRIVIA DE LAS YUNGAS (5 PREGUNTAS) */}
        {/* ============================================================== */}
        {activeTab === 'trivia' && (
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
            <div className="bg-slate-950/80 rounded-2xl p-3 border border-teal-900/50">
              <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                <span className="text-teal-300">PREGUNTA {currentQuestionIdx + 1} DE {TRIVIA_QUESTIONS.length}</span>
                <span className="text-amber-400">Aciertos: {questionsAnsweredCount}/5</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-teal-400 to-amber-400 h-full transition-all duration-300"
                  style={{ width: `${(questionsAnsweredCount / 5) * 100}%` }}
                />
              </div>
            </div>

            {triviaFinished ? (
              <div className="bg-slate-950/90 rounded-2xl p-5 border border-teal-700 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-amber-400 mx-auto flex items-center justify-center text-slate-950 shadow-lg">
                  <Award className="w-9 h-9" />
                </div>
                <h4 className="text-lg font-bold text-white">¡Cuestionario Completado!</h4>
                <p className="text-xs text-teal-200">
                  Has respondido correctamente las preguntas sobre la reserva y la avifauna de las Yungas.
                </p>
                <div className="text-sm font-bold text-amber-300">
                  Aciertos acumulados: {questionsAnsweredCount}/5
                </div>
                {questionsAnsweredCount >= 5 && (
                  <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-200 font-bold">
                    ✓ ¡Requisito de 5 preguntas para subir de nivel cumplido!
                  </div>
                )}
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={handleResetTrivia}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
                  >
                    Repasar Trivia
                  </button>
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      onClose();
                    }}
                    className="flex-1 py-2.5 rounded-xl game-btn-orange text-white text-xs font-bold"
                  >
                    Volver al Menú
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-950/90 rounded-2xl p-4 border border-teal-800/60 space-y-3">
                <h4 className="text-sm font-bold text-white leading-snug">
                  {currentQ.question}
                </h4>

                <div className="space-y-2">
                  {currentQ.options.map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrect = idx === currentQ.correctIndex;

                    let btnStyle = 'bg-slate-900 border-slate-700 text-slate-300 hover:border-teal-500';

                    if (isAnswerSubmitted) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-950 border-emerald-400 text-emerald-200 font-bold';
                      } else if (isSelected && !isCorrect) {
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
                          <span>¡EXCELENTE! RESPUESTA CORRECTA</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-amber-400" />
                          <span>REPASO BIOLÓGICO:</span>
                        </>
                      )}
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-90">{currentQ.explanation}</p>
                  </div>
                )}

                <div className="pt-2">
                  {!isAnswerSubmitted ? (
                    <button
                      disabled={selectedOption === null}
                      onClick={handleSubmitTrivia}
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
                      onClick={handleNextTriviaQuestion}
                      className="w-full py-3 rounded-xl game-btn-mint text-emerald-950 font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                      <span>{currentQuestionIdx < TRIVIA_QUESTIONS.length - 1 ? 'SIGUIENTE PREGUNTA' : 'VER RESULTADOS FINALES'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* SUBMODAL 1: JUEGO "SILUETA MISTERIOSA" (PASO 10) */}
        {/* ============================================================== */}
        {silhouetteGameBird && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col p-3 animate-fadeIn select-none">
            <div className="flex items-center justify-between pb-2 border-b border-teal-900 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xl">🕵️</span>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    SILUETA MISTERIOSA #{silhouetteGameBird.catalogNumber}
                  </h4>
                  <p className="text-[10px] text-teal-300">Descifra la especie a través de las 4 pistas</p>
                </div>
              </div>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setSilhouetteGameBird(null);
                }}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-2.5 space-y-2.5">
              {/* Silhouette Stage */}
              <div className="relative h-28 rounded-2xl bg-gradient-to-b from-slate-950 via-teal-950 to-slate-900 border border-teal-500/50 flex flex-col items-center justify-center p-2 text-center">
                {silhouetteResult === 'correct' ? (
                  <div className="flex flex-col items-center animate-scaleIn">
                    <img
                      src={silhouetteGameBird.image}
                      alt={silhouetteGameBird.commonName}
                      className="w-18 h-18 rounded-full object-cover border-2 border-amber-400 shadow-xl"
                    />
                    <span className="text-xs font-black text-amber-300 mt-1 uppercase">
                      ¡{silhouetteGameBird.commonName} ILUMINADO!
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="filter drop-shadow-lg">
                      {renderBirdSilhouetteSvg(silhouetteGameBird.catalogNumber)}
                    </div>
                    <div className="text-[10px] font-black text-amber-300 mt-1">
                      Recompensa activa: +{getSilhouetteXpReward()} XP
                    </div>
                  </>
                )}
              </div>

              {/* The 4 Progressive Hints (Verbatim from Guide) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-black text-teal-300">
                  <span>Pistas Reveladas: {hintsRevealed}/4</span>
                  {hintsRevealed < 4 && silhouetteResult === null && (
                    <button
                      onClick={() => {
                        soundManager.playClick();
                        setHintsRevealed(prev => Math.min(4, prev + 1));
                      }}
                      className="px-2 py-0.5 rounded-lg bg-teal-800 text-teal-100 hover:bg-teal-700 text-[9px] font-bold border border-teal-600"
                    >
                      Revelar Siguiente Pista
                    </button>
                  )}
                </div>

                {/* Pista 1: Tamaño */}
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <span className="font-bold text-amber-400 block text-[9px]">PISTA 1 (TAMAÑO):</span>
                  <p className="text-white text-[11px] font-bold">{silhouetteGameBird.hints.size}</p>
                </div>

                {/* Pista 2: Hábitat / Estrato */}
                {hintsRevealed >= 2 && (
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs animate-fadeIn">
                    <span className="font-bold text-emerald-400 block text-[9px]">PISTA 2 (HÁBITAT / ESTRATO):</span>
                    <p className="text-white text-[11px]">{silhouetteGameBird.hints.habitat}</p>
                  </div>
                )}

                {/* Pista 3: Color y Morfología */}
                {hintsRevealed >= 3 && (
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs animate-fadeIn">
                    <span className="font-bold text-sky-400 block text-[9px]">PISTA 3 (COLOR Y MORFOLOGÍA):</span>
                    <p className="text-white text-[11px]">{silhouetteGameBird.hints.morphology}</p>
                  </div>
                )}

                {/* Pista 4: Dato Curioso / Leyenda */}
                {hintsRevealed >= 4 && (
                  <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-600 text-xs animate-fadeIn">
                    <span className="font-bold text-amber-300 block text-[9px]">PISTA 4 (DATO CURIOSO / LEYENDA):</span>
                    <p className="text-amber-100 text-[11px] italic">{silhouetteGameBird.hints.loreOrFact}</p>
                  </div>
                )}
              </div>

              {/* 4 Species Options */}
              {silhouetteResult === null && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-black text-slate-300 block">
                    ¿A qué ave pertenece esta silueta?
                  </span>
                  {[
                    silhouetteGameBird.commonName,
                    silhouetteGameBird.catalogNumber === '014' ? 'Picaflor Cometa' : 'Urutaú',
                    silhouetteGameBird.catalogNumber === '011' ? 'Loro Alisero' : 'Jote Real',
                    silhouetteGameBird.catalogNumber === '017' ? 'Zorzal Colorado' : 'Hornero'
                  ]
                    .filter((v, i, a) => a.indexOf(v) === i)
                    .map((optName, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleGuessSilhouette(optName)}
                        className="w-full p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-left text-xs font-black text-white border border-slate-700 hover:border-teal-400 transition-all flex items-center justify-between"
                      >
                        <span>{optName}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-teal-400" />
                      </button>
                    ))}
                </div>
              )}

              {/* Victory Banner */}
              {silhouetteResult === 'correct' && (
                <div className="p-3 rounded-2xl bg-emerald-950 border border-emerald-500 text-center space-y-2 animate-scaleIn text-white">
                  <div className="text-sm font-black text-amber-300">
                    🎉 ¡SILUETA ILUMINADA A COLOR!
                  </div>
                  <p className="text-xs text-emerald-200">
                    Has ganado <span className="font-black text-white">+{getSilhouetteXpReward()} XP</span> y esta especie ya brilla en tu catálogo.
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => {
                        setSilhouetteGameBird(null);
                        setInspectingBird(silhouetteGameBird);
                      }}
                      className="flex-1 py-2 rounded-xl game-btn-mint text-emerald-950 font-bold text-xs"
                    >
                      Ver Ficha Técnica
                    </button>
                    <button
                      onClick={() => setSilhouetteGameBird(null)}
                      className="flex-1 py-2 rounded-xl game-btn-orange text-white font-bold text-xs"
                    >
                      Volver a la Guía
                    </button>
                  </div>
                </div>
              )}

              {/* Failure Dialogue: Tucán Feedback Amable (8B) - NO RESTA PUNTOS */}
              {silhouetteResult === 'wrong' && (
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-teal-500 text-slate-100 space-y-2.5 animate-fadeIn">
                  <div className="flex items-start gap-2.5">
                    <img
                      src="/assets/aistudio/Toucan_perched_on_branch_8ab41bfc_230157f9.jpg"
                      alt="Tucán Guía"
                      className="w-12 h-12 rounded-full object-cover border-2 border-amber-400 shrink-0"
                    />
                    <div className="text-xs">
                      <span className="font-black text-amber-300 block">TUCÁN ANFITRIÓN:</span>
                      <p className="text-[11px] text-teal-100 italic leading-snug mt-0.5">
                        "Desafortunadamente, no has respondido todas las preguntas correctamente. ¡El Parque Botánico Barón Schuel siempre te da otra oportunidad para aprender! Vuelve a escuchar los cantos y observar las copas de los árboles."
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      soundManager.playClick();
                      setSilhouetteResult(null);
                      // Automatically grants an extra hint without deducting points
                      setHintsRevealed(prev => Math.min(4, prev + 1));
                    }}
                    className="w-full py-2.5 rounded-xl game-btn-mint text-emerald-950 font-black text-xs shadow flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Volver a intentar (Habilita pista extra)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SUBMODAL 2: FICHA TÉCNICA ESTILO PROTOTIPO (PASO 13) */}
        {/* ============================================================== */}
        {inspectingBird && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col p-3 animate-fadeIn select-none text-white">
            <div className="flex items-center justify-between pb-2 border-b border-teal-900 shrink-0">
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  FICHA TÉCNICA · #{inspectingBird.catalogNumber}
                </h4>
                <p className="text-[10px] text-teal-300 font-serif italic">
                  {inspectingBird.scientificName}
                </p>
              </div>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setInspectingBird(null);
                }}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-2.5 space-y-3">
              {/* Photo & Pokemon-GO Style Top Arc */}
              <div className="relative h-44 rounded-2xl overflow-hidden border border-teal-500/70 bg-emerald-950">
                <img
                  src={inspectingBird.image}
                  alt={inspectingBird.commonName}
                  className="w-full h-full object-cover"
                />

                {/* Top Arc Stats: PC 2579 & 125/125 HP */}
                <div className="absolute top-2 left-2 flex gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-xs text-[10px] font-black text-amber-300 border border-amber-400">
                    PC {inspectingBird.cp || 2579}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-xs text-[10px] font-black text-emerald-300 border border-emerald-400">
                    {inspectingBird.hp || '125 / 125 HP'}
                  </span>
                </div>

                {/* Best Foto Perfecta Rating */}
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-xs text-[10px] font-bold text-amber-300 border border-amber-400/40">
                  Foto Perfecta: {'★'.repeat(playerProfile.birdPhotoStars?.[inspectingBird.id] || 3)}
                </div>

                <button
                  onClick={() => playSoundForBird(inspectingBird)}
                  className="absolute bottom-2 right-2 px-2.5 py-1 rounded-xl bg-teal-950/90 backdrop-blur-md border border-teal-400 text-teal-200 text-[10px] font-bold flex items-center gap-1.5 shadow"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-300" />
                  <span>Canto</span>
                </button>
              </div>

              {/* Title & Biological Status Badges */}
              <div>
                <h3 className="text-base font-black text-white uppercase">
                  {inspectingBird.commonName}
                </h3>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-teal-800 text-[9px] font-bold text-teal-300">
                    Familia: {inspectingBird.family}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                    inspectingBird.conservationStatus === 'AM'
                      ? 'bg-rose-950 text-rose-300 border-rose-600'
                      : inspectingBird.conservationStatus === 'VU'
                      ? 'bg-amber-950 text-amber-300 border-amber-600'
                      : 'bg-emerald-950 text-emerald-300 border-emerald-600'
                  }`}>
                    {inspectingBird.conservationStatus === 'AM' ? 'Amenazada (AM)' : inspectingBird.conservationStatus === 'VU' ? 'Vulnerable (VU)' : 'No Amenazada (NA)'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[9px] text-slate-300 font-bold">
                    Presencia: {inspectingBird.presence === 'M' ? 'Migrante (M)' : 'Residente (R)'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[9px] text-amber-300 font-bold">
                    Observación: {inspectingBird.observationPossibility}
                  </span>
                </div>
              </div>

              {/* Metrics Strip: Peso & Altura */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[9px] text-slate-400 block font-bold">ALTURA / TAMAÑO</span>
                  <span className="text-amber-300 font-black text-xs">{inspectingBird.size}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[9px] text-slate-400 block font-bold">PESO BIOLÓGICO</span>
                  <span className="text-teal-300 font-black text-xs">{inspectingBird.weight}</span>
                </div>
              </div>

              {/* Anatomical Details: Pico, Canto con Onda, Plumaje */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-teal-900 space-y-2 text-xs">
                <div>
                  <span className="font-black text-teal-300 block text-[10px]">TIPO DE PICO:</span>
                  <p className="text-slate-200 text-[11px] leading-snug">{inspectingBird.beakDescription}</p>
                </div>

                {/* Canto with Unlocked Sound Wave */}
                <div className="pt-1 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-amber-300 text-[10px] flex items-center gap-1">
                      <Music className="w-3 h-3" />
                      REPRODUCTOR DE CANTO Y ONDA SONORA:
                    </span>
                    <button
                      onClick={() => playSoundForBird(inspectingBird)}
                      className="px-2 py-0.5 rounded bg-teal-800 hover:bg-teal-700 text-teal-100 text-[9px] font-bold flex items-center gap-1"
                    >
                      <Play className="w-2.5 h-2.5" />
                      <span>Reproducir</span>
                    </button>
                  </div>
                  
                  {/* Wave Visualizer Graphic */}
                  <div className="h-8 rounded-lg bg-slate-900 border border-teal-950 p-1 flex items-center justify-center gap-1">
                    {[8, 18, 12, 26, 20, 10, 24, 16, 28, 14, 22, 12].map((h, i) => (
                      <div
                        key={i}
                        className="w-1 rounded-full bg-teal-400"
                        style={{ height: `${h}px` }}
                      />
                    ))}
                  </div>
                  <p className="text-slate-300 text-[10px] italic mt-1">{inspectingBird.songDescription}</p>
                </div>

                <div className="pt-1 border-t border-slate-800">
                  <span className="font-black text-teal-300 block text-[10px]">DESCRIPCIÓN DE PLUMAJE:</span>
                  <p className="text-slate-200 text-[11px] leading-snug">{inspectingBird.plumageDescription}</p>
                </div>
              </div>

              {/* Button: REGISTRAR EN DIARIO DE CAMPO (4 TOQUES) */}
              <button
                onClick={() => {
                  setInspectingBird(null);
                  handleOpenJournalForm(inspectingBird);
                }}
                className="w-full py-3.5 rounded-2xl game-btn-orange text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
              >
                <BookOpen className="w-4 h-4 text-amber-300" />
                <span>Registrar en Diario de Campo (4 Toques)</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SUBMODAL 3: FORMULARIO CIENTÍFICO DE 4 TOQUES (PASO 13) */}
        {/* ============================================================== */}
        {journalModalBird && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col p-3 animate-fadeIn select-none text-white">
            <div className="flex items-center justify-between pb-2 border-b border-teal-900 shrink-0">
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  REGISTRO CIENTÍFICO (4 TOQUES)
                </h4>
                <p className="text-[10px] text-teal-300 font-bold">
                  {journalModalBird.commonName}
                </p>
              </div>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setJournalModalBird(null);
                }}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-2 space-y-2.5">
              {/* Auto Metadata: Fecha, Hora y Punto del Sendero */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-teal-900 text-[10px] space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1 font-bold">
                    <Calendar className="w-3 h-3 text-teal-400" />
                    {new Date().toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1 font-bold">
                    <Clock className="w-3 h-3 text-teal-400" />
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="pt-1">
                  <span className="font-bold text-teal-300 block mb-1">Punto del Sendero:</span>
                  <select
                    value={selectedTrailPoint}
                    onChange={(e) => setSelectedTrailPoint(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-1.5 focus:border-teal-400 outline-none"
                  >
                    {CHECKPOINTS_DATA.map((cp) => (
                      <option key={cp.id} value={`${cp.name} (${cp.distanceMeters} m)`}>
                        {cp.name} ({cp.distanceMeters} m)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* TOQUE 1: COMPORTAMIENTO */}
              <div className="space-y-1">
                <span className="text-[10px] font-black text-amber-300 uppercase">
                  TOQUE 1: COMPORTAMIENTO
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {(['Alimentándose', 'Cantando', 'En reposo', 'En vuelo'] as const).map((b) => (
                    <button
                      key={b}
                      onClick={() => {
                        soundManager.playClick();
                        setBehavior(b);
                      }}
                      className={`p-2 rounded-xl font-bold border transition-all text-left ${
                        behavior === b
                          ? 'bg-teal-600 text-white border-teal-300 shadow'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-teal-700'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* TOQUE 2: CANTIDAD */}
              <div className="space-y-1">
                <span className="text-[10px] font-black text-emerald-300 uppercase">
                  TOQUE 2: CANTIDAD
                </span>
                <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                  {(['1 individuo', 'Pareja (2)', 'Bandada (3 o más)'] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        soundManager.playClick();
                        setCount(c);
                      }}
                      className={`p-2 rounded-xl font-bold border transition-all text-center leading-tight ${
                        count === c
                          ? 'bg-emerald-600 text-white border-emerald-300 shadow'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-emerald-700'
                      }`}
                    >
                      {c === 'Bandada (3 o más)' ? 'Grupo (3+)' : c}
                    </button>
                  ))}
                </div>
              </div>

              {/* TOQUE 3: ESTRATO */}
              <div className="space-y-1">
                <span className="text-[10px] font-black text-sky-300 uppercase">
                  TOQUE 3: ESTRATO
                </span>
                <div className="grid grid-cols-3 gap-1 text-[10px]">
                  {(['Dosel', 'Subdosel', 'Sotobosque', 'Zona Urbanizada', 'En Vuelo'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        soundManager.playClick();
                        setStratum(st);
                      }}
                      className={`p-1.5 rounded-xl font-bold border transition-all text-center ${
                        stratum === st
                          ? 'bg-sky-600 text-white border-sky-300 shadow'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-sky-700'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* TOQUE 4: CLIMA */}
              <div className="space-y-1">
                <span className="text-[10px] font-black text-amber-400 uppercase">
                  TOQUE 4: CLIMA DEL MOMENTO
                </span>
                <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                  {(['Soleado', 'Nublado', 'Llovizna de Yungas'] as const).map((w) => (
                    <button
                      key={w}
                      onClick={() => {
                        soundManager.playClick();
                        setWeather(w);
                      }}
                      className={`p-2 rounded-xl font-bold border transition-all text-center leading-tight ${
                        weather === w
                          ? 'bg-amber-600 text-white border-amber-300 shadow'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-amber-700'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-1">
                <button
                  onClick={handleSaveJournalEntry}
                  className="w-full py-3.5 rounded-2xl game-btn-orange text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl"
                >
                  <Check className="w-4 h-4 text-amber-300" />
                  <span>Guardar Observación (+30 XP)</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
