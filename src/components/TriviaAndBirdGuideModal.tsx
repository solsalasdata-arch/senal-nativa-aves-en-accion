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
  RotateCcw,
  Cloud
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { CATALOG_BIRDS_DATA, PACK_EXTRA_BIRDS_DATA, TRIVIA_QUESTIONS, CHECKPOINTS_DATA } from '../data/birdsData';
import { CatalogBird, JournalEntry, PlayerProfile } from '../types/game';
import { useLanguage, localizeTriviaQuestions, localizeCatalogBird } from '../utils/i18n';

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
  onOpenDrive?: () => void;
  onConsumeFreeHints?: (usedCount: number) => void;
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
  initialTab = 'catalog',
  onOpenDrive,
  onConsumeFreeHints
}) => {
  const { lang, tx } = useLanguage();
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

  // Toast feedback when saving a 4-Toque journal entry
  const [journalSavedToast, setJournalSavedToast] = useState<string | null>(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  // Sound Dispatcher: plays the exact synthesized call for every species in the Park
  const playSoundForBird = (bird: CatalogBird) => {
    setAudioIsPlaying(true);
    soundManager.playBirdSound(bird.soundType || bird.id || bird.commonName);

    setTimeout(() => {
      setAudioIsPlaying(false);
    }, 1600);
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
    image: '/assets/aistudio/c3da3f37-f246-40f4-8d25-1958fb93d2f1_0d2a7f41.jpeg',
    silhouetteIcon: '🪵'
  };

  const isBirdUnlocked = (birdId: string) => {
    return (playerProfile.unlockedSilhouettes || []).includes(birdId);
  };

  const isAcousticUnlocked = (birdId: string) => {
    return (playerProfile.unlockedAcoustics || []).includes(birdId);
  };

  // Start Silhouette Mystery Game (automatically reveals 2 free hints if player has Sobre Selva Montana hints)
  const handleOpenSilhouetteGame = (bird: CatalogBird) => {
    soundManager.playClick();
    setSilhouetteGameBird(bird);
    const availableFreeHints = playerProfile.freeSilhouetteHints || 0;
    if (availableFreeHints >= 2) {
      setHintsRevealed(3);
      if (onConsumeFreeHints) onConsumeFreeHints(2);
    } else if (availableFreeHints === 1) {
      setHintsRevealed(2);
      if (onConsumeFreeHints) onConsumeFreeHints(1);
    } else {
      setHintsRevealed(1);
    }
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

  // Open 4-Toque Field Journal form with automatic active checkpoint detection
  const handleOpenJournalForm = (bird: CatalogBird) => {
    soundManager.playClick();
    setJournalModalBird(bird);
    setStratum(bird.stratum);
    const completedIds = playerProfile.completedCheckpoints || [];
    if (completedIds.length > 0) {
      const lastId = completedIds[completedIds.length - 1];
      const cpObj = CHECKPOINTS_DATA.find((c) => c.id === lastId);
      if (cpObj) {
        setSelectedTrailPoint(`${cpObj.name} (${cpObj.distanceMeters} m)`);
      }
    }
  };

  // Save 4-Toque Field Journal entry
  const handleSaveJournalEntry = () => {
    if (!journalModalBird) return;
    soundManager.playSuccess();

    const nextCount = Math.min(10, (playerProfile.fieldJournal || []).length + 1);

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
    setJournalSavedToast(`+30 XP · Observación guardada en Diario de Campo (${nextCount}/10)`);
    setTimeout(() => {
      setJournalSavedToast(null);
    }, 3500);
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

  // TRIVIA Handlers (Localized ES/EN)
  const localizedTriviaList = localizeTriviaQuestions(TRIVIA_QUESTIONS, lang);
  const currentQ = localizedTriviaList[currentQuestionIdx];

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

  // Combine base catalog (011-018) with any extra species unlocked via Sobre Selva Montana (019-024)
  const addedPackIds = playerProfile.addedPackBirdIds || [];
  const extraPackBirds = PACK_EXTRA_BIRDS_DATA.filter((b) => addedPackIds.includes(b.id));
  const allCatalogBirds = [...CATALOG_BIRDS_DATA, ...extraPackBirds];

  // Filtered bird list for the collection grid
  const filteredBirds = allCatalogBirds.filter((b) => {
    const unlocked = isBirdUnlocked(b.id);
    if (catalogFilter === 'silhouettes') return !unlocked;
    if (catalogFilter === 'illuminated') return unlocked;
    return true;
  });

  const journalEntries = playerProfile.fieldJournal || [];
  const journalCount = journalEntries.length;
  const hasDetailBadge = playerProfile.hasDetailObserverBadge || journalCount >= 10;

  // Render Black SVG Silhouette for each species (011 to 018)
  const renderBirdSilhouetteSvg = (catalogNumber: string, sizeClass = 'w-20 h-16') => {
    switch (catalogNumber) {
      case '011': // Jote Real - soaring condor/raptor in flight
        return (
          <svg viewBox="0 0 100 80" className={`${sizeClass} fill-slate-950 drop-shadow-[0_2px_3px_rgba(0,0,0,0.4)]`}>
            <path d="M50 35 C42 20, 22 12, 4 16 C2 23, 12 29, 26 34 C35 37, 44 40, 47 46 L50 50 L53 46 C56 40, 65 37, 74 34 C88 29, 98 23, 96 16 C78 12, 58 20, 50 35 Z M46 49 L43 70 L57 70 L54 49 Z M50 24 C46 24, 46 33, 50 35 C54 33, 54 24, 50 24 Z" />
          </svg>
        );
      case '012': // Loro Alisero - perched parrot with curved hooked beak
        return (
          <svg viewBox="0 0 80 90" className={`${sizeClass} fill-slate-950 drop-shadow-[0_2px_3px_rgba(0,0,0,0.4)]`}>
            <path d="M42 14 C33 14, 28 21, 31 30 C33 38, 29 48, 33 60 L37 86 L43 86 L45 64 C50 54, 56 44, 53 31 C51 21, 48 15, 42 14 Z M31 21 C24 22, 23 29, 29 31 L31 28 Z M22 62 L58 62 L58 65 L22 65 Z" />
          </svg>
        );
      case '013': // Picaflor Cometa - hovering hummingbird with long forked tail
        return (
          <svg viewBox="0 0 95 90" className={`${sizeClass} fill-slate-950 drop-shadow-[0_2px_3px_rgba(0,0,0,0.4)]`}>
            <path d="M38 30 C44 22, 53 23, 57 29 C59 34, 55 42, 49 48 L64 86 L59 86 L46 55 L33 84 L28 84 L43 48 C37 42, 32 36, 38 30 Z M56 28 L82 24 L57 32 Z M40 28 C26 14, 14 14, 12 22 C18 28, 30 32, 40 28 Z" />
          </svg>
        );
      case '014': // Urutaú - nocturnal bird perched upright on branch
        return (
          <svg viewBox="0 0 80 95" className={`${sizeClass} fill-slate-950 drop-shadow-[0_2px_3px_rgba(0,0,0,0.4)]`}>
            <path d="M39 12 C30 13, 29 26, 31 38 C33 50, 34 68, 35 88 L45 88 C46 68, 48 50, 46 38 C44 26, 46 13, 39 12 Z M30 19 L25 21 L30 23 Z M22 86 L58 86 L58 90 L22 90 Z" />
          </svg>
        );
      case '015': // Chiricote - long-billed walking rail with long legs
        return (
          <svg viewBox="0 0 95 90" className={`${sizeClass} fill-slate-950 drop-shadow-[0_2px_3px_rgba(0,0,0,0.4)]`}>
            <path d="M40 26 C32 26, 24 34, 24 44 C24 52, 32 58, 42 58 C52 58, 60 50, 62 40 L84 36 L62 33 C58 28, 49 26, 40 26 Z M35 58 L32 85 L36 85 L39 58 Z M47 58 L45 85 L49 85 L51 58 Z M24 44 L16 38 L20 48 Z" />
          </svg>
        );
      case '016': // Benteveo - perched passerine with stout bill
        return (
          <svg viewBox="0 0 90 85" className={`${sizeClass} fill-slate-950 drop-shadow-[0_2px_3px_rgba(0,0,0,0.4)]`}>
            <path d="M40 20 C31 20, 27 28, 29 38 C31 48, 38 56, 48 58 L58 78 L63 78 L56 55 C64 48, 66 38, 62 29 C58 22, 48 20, 40 20 Z M61 28 L78 29 L61 34 Z M24 60 L66 60 L66 63 L24 63 Z" />
          </svg>
        );
      case '017': // Hornero - rufous ovenbird walking proudly
        return (
          <svg viewBox="0 0 85 85" className={`${sizeClass} fill-slate-950 drop-shadow-[0_2px_3px_rgba(0,0,0,0.4)]`}>
            <path d="M38 24 C31 24, 27 31, 29 40 C31 50, 38 57, 48 57 L56 76 L61 76 L54 55 C60 49, 62 39, 58 31 C54 25, 46 24, 38 24 Z M57 30 L73 33 L57 35 Z M38 57 L36 78 L40 78 L42 57 Z M46 57 L45 78 L49 78 L50 57 Z" />
          </svg>
        );
      case '018': // Zorzal Colorado - thrush perched
      default:
        return (
          <svg viewBox="0 0 85 85" className={`${sizeClass} fill-slate-950 drop-shadow-[0_2px_3px_rgba(0,0,0,0.4)]`}>
            <path d="M41 19 C33 19, 29 27, 31 37 C33 49, 41 59, 51 59 L60 79 L65 79 L57 57 C63 49, 65 37, 61 27 C55 21, 47 19, 41 19 Z M60 26 L75 28 L60 31 Z M25 62 L65 62 L65 65 L25 65 Z" />
          </svg>
        );
    }
  };

  // Build deterministic 4 options for Silueta Misteriosa so correct answer isn't always first
  const getSilhouetteOptions = (bird: CatalogBird): string[] => {
    const distractorsMap: Record<string, [string, string, string]> = {
      '011': ['Loro Alisero', 'Urutaú', 'Chiricote'],
      '012': ['Jote Real', 'Benteveo', 'Picaflor Cometa'],
      '013': ['Chinchero Chico', 'Hornero', 'Zorzal Colorado'],
      '014': ['Jote Real', 'Chiricote', 'Loro Alisero'],
      '015': ['Benteveo', 'Urutaú', 'Hornero'],
      '016': ['Zorzal Colorado', 'Hornero', 'Chinchero Chico'],
      '017': ['Zorzal Colorado', 'Benteveo', 'Chiricote'],
      '018': ['Hornero', 'Benteveo', 'Picaflor Cometa']
    };
    const distractors = distractorsMap[bird.catalogNumber] || ['Benteveo', 'Hornero', 'Urutaú'];
    const all = [bird.commonName, ...distractors];
    // Deterministic rotation based on catalogNumber
    const shift = parseInt(bird.catalogNumber, 10) % 4;
    return [...all.slice(shift), ...all.slice(0, shift)];
  };

  // Build deterministic 3 options for Modo Bioacústico "Escucha el Canto"
  const getAudioOptions = (bird: CatalogBird): string[] => {
    const distractorsMap: Record<string, [string, string]> = {
      '010': ['Benteveo', 'Hornero'],
      '011': ['Loro Alisero', 'Urutaú'],
      '012': ['Benteveo', 'Picaflor Cometa'],
      '013': ['Chinchero Chico', 'Zorzal Colorado'],
      '014': ['Zorzal Colorado', 'Chinchero Chico'],
      '015': ['Hornero', 'Benteveo'],
      '016': ['Chinchero Chico', 'Zorzal Colorado'],
      '017': ['Chinchero Chico', 'Zorzal Colorado'],
      '018': ['Benteveo', 'Hornero']
    };
    const distractors = distractorsMap[bird.catalogNumber] || ['Benteveo', 'Urutaú'];
    const all = [bird.commonName, ...distractors];
    const shift = parseInt(bird.catalogNumber, 10) % 3;
    return [...all.slice(shift), ...all.slice(0, shift)];
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
                  {tx('COLECCIÓN DE AVES · YUNGAS', 'BIRD COLLECTION · YUNGAS')}
                </h3>
                <p className="text-[10px] text-teal-300 font-semibold truncate">
                  {tx(
                    'Parque Botánico Municipal "Barón Carlos María Schuel"',
                    '"Barón Carlos María Schuel" Municipal Botanical Park'
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className="px-2.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-teal-200 hover:text-white text-[10px] font-bold flex items-center gap-1 border border-teal-700/60 shrink-0 shadow active:scale-95 transition-all"
            >
              <span>{tx('← Volver al Menú', '← Back to Menu')}</span>
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
              <span>{tx('Catálogo', 'Catalog')}</span>
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
              <span>{tx('Cantos', 'Calls')}</span>
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
              <span>{tx('Diario', 'Journal')}</span>
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

        {journalSavedToast && (
          <div className="mx-3 mt-2 px-3 py-2 rounded-xl bg-emerald-950 border border-emerald-400 text-emerald-200 text-[11px] font-black flex items-center justify-between shadow-lg animate-fadeIn">
            <span>✓ {journalSavedToast}</span>
            <Award className="w-4 h-4 text-amber-300 shrink-0" />
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 1: CATÁLOGO DE AVES (011 AL 018) */}
        {/* ============================================================== */}
        {activeTab === 'catalog' && (
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            
            {/* UPPER HALF: CHINCHERO CHICO ILLUSTRATED IN COLOR OVER CIRCULAR PARK SEAL */}
            <div
              onClick={() => {
                soundManager.playClick();
                setInspectingBird(featuredChinchero);
              }}
              className="relative rounded-3xl overflow-hidden border-2 border-teal-100/70 bg-gradient-to-b from-[#1AA693] via-[#138A79] to-[#0D6B5D] p-3.5 shadow-xl cursor-pointer group"
            >
              {/* Circular Seal of "PARQUE BOTÁNICO MUNICIPAL BARÓN CARLOS MARÍA SCHUEL" */}
              <div className="relative flex flex-col items-center justify-center py-1">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full">
                    <defs>
                      <path
                        id="sealTopArc"
                        d="M 24,100 A 76,76 0 1,1 176,100"
                      />
                      <path
                        id="sealBottomArc"
                        d="M 176,100 A 76,76 0 1,1 24,100"
                      />
                    </defs>
                    <circle
                      cx="100"
                      cy="100"
                      r="92"
                      fill="rgba(12, 110, 90, 0.45)"
                      stroke="rgba(140, 231, 211, 0.55)"
                      strokeWidth="3"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="64"
                      fill="rgba(20, 155, 126, 0.35)"
                      stroke="rgba(140, 231, 211, 0.4)"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                    />
                    <text
                      fill="#BDF7EA"
                      fontSize="10.5"
                      fontWeight="800"
                      letterSpacing="1.8"
                    >
                      <textPath href="#sealTopArc" startOffset="50%" textAnchor="middle">
                        PARQUE BOTÁNICO MUNICIPAL
                      </textPath>
                    </text>
                    <text
                      fill="#BDF7EA"
                      fontSize="9.5"
                      fontWeight="800"
                      letterSpacing="1.4"
                    >
                      <textPath href="#sealBottomArc" startOffset="50%" textAnchor="middle">
                        BARÓN CARLOS MARÍA SCHUEL
                      </textPath>
                    </text>
                  </svg>

                  {/* Chinchero Chico Color Illustration Centered Over the Seal */}
                  <div className="relative z-10 w-24 h-24 rounded-full overflow-hidden border-3 border-amber-300 shadow-2xl bg-slate-900 group-hover:scale-105 transition-transform duration-300">
                    <img
                      src={featuredChinchero.image}
                      alt="Chinchero Chico"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Sound Quick Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playSoundForBird(featuredChinchero);
                    }}
                    className="absolute bottom-1 right-1 z-20 w-8 h-8 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 border-2 border-slate-900 flex items-center justify-center shadow-lg active:scale-95"
                    title="Escuchar Canto del Chinchero Chico"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Title Banner Below the Seal */}
                <div className="text-center mt-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-950/60 border border-teal-300/40 text-[9px] font-black text-amber-300 uppercase tracking-widest">
                    AVE DESTACADA · #010
                  </span>
                  <h4 className="text-lg font-black text-white uppercase tracking-wider drop-shadow mt-0.5">
                    CHINCHERO CHICO
                  </h4>
                  <p className="text-[10px] italic text-teal-100 font-serif">
                    {featuredChinchero.scientificName} · {featuredChinchero.size} · {featuredChinchero.weight}
                  </p>
                </div>

                <div className="mt-2 flex items-center justify-center gap-2 w-full">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      soundManager.playClick();
                      setInspectingBird(featuredChinchero);
                    }}
                    className="flex-1 py-1.5 px-3 rounded-xl game-btn-mint text-emerald-950 text-[10px] font-black flex items-center justify-center gap-1 shadow"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Abrir Ficha Técnica</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenJournalForm(featuredChinchero);
                    }}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-slate-950/85 text-amber-300 border border-amber-400/60 hover:bg-slate-900 text-[10px] font-black flex items-center justify-center gap-1 shadow"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span>Diario (4 Toques)</span>
                  </button>
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
                  Guía Oficial de Especies (011 - {extraPackBirds.length > 0 ? '024' : '018'})
                </span>
                <span className="text-[10px] font-extrabold text-teal-950">
                  {(playerProfile.unlockedSilhouettes || []).length}/{allCatalogBirds.length} Iluminadas
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
                  Todas ({allCatalogBirds.length})
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
                  Siluetas ({allCatalogBirds.filter(b => !isBirdUnlocked(b.id)).length})
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
                  Iluminadas ({allCatalogBirds.filter(b => isBirdUnlocked(b.id)).length})
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
                      <div className="relative h-24 rounded-xl overflow-hidden flex items-center justify-center border border-teal-500/40 mb-2">
                        {isUnlocked ? (
                          <img
                            src={bird.image}
                            alt={bird.commonName}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#9CF0E0] via-[#6BD9C6] to-[#38B8A4]">
                            {renderBirdSilhouetteSvg(bird.catalogNumber, 'w-20 h-16')}
                            <span className="text-[8px] font-black text-slate-950 bg-amber-300/90 px-1.5 py-0.2 rounded-full tracking-wider uppercase mt-0.5 shadow-xs">
                              Toca para Pistas
                            </span>
                          </div>
                        )}

                        <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-xs text-[8px] text-teal-200 font-bold">
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

              {/* Bird Selector Buttons (All Species with Characteristic Calls) */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {[
                  CATALOG_BIRDS_DATA[5], // Benteveo ("bien-te-veo")
                  featuredChinchero,     // Chinchero Chico (descending trill)
                  CATALOG_BIRDS_DATA[3], // Urutaú (nocturnal lament "Turay, kakuy")
                  CATALOG_BIRDS_DATA[7], // Zorzal Colorado (melodious flute)
                  CATALOG_BIRDS_DATA[6], // Hornero (rhythmic duet)
                  CATALOG_BIRDS_DATA[1], // Loro Alisero (flock squawk)
                  CATALOG_BIRDS_DATA[2], // Picaflor Cometa (wing hum + tsik-tsik)
                  CATALOG_BIRDS_DATA[4], // Chiricote ("chi-ri-co-te")
                  CATALOG_BIRDS_DATA[0]  // Jote Real (soaring thermal + click)
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
                {getAudioOptions(audioTargetBird).map((optName, idx) => {
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

            {/* Quick Register & Google Drive Sync Triggers */}
            <div className="flex items-center justify-between gap-2 px-1">
              <span className="text-xs font-black text-slate-900 uppercase truncate">
                Observaciones ({journalCount})
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                {onOpenDrive && (
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      onOpenDrive();
                    }}
                    className="px-2.5 py-1 rounded-xl bg-slate-950 text-teal-200 border border-teal-400 hover:bg-slate-900 text-[10px] font-black flex items-center gap-1 shadow"
                  >
                    <Cloud className="w-3 h-3 text-teal-300" />
                    <span>Google Drive</span>
                  </button>
                )}
                <button
                  onClick={() => handleOpenJournalForm(CATALOG_BIRDS_DATA[5])}
                  className="px-2.5 py-1 rounded-xl game-btn-orange text-white text-[10px] font-black flex items-center gap-1 shadow"
                >
                  <span>+ Registrar</span>
                </button>
              </div>
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
                      <span>
                        {currentQuestionIdx < TRIVIA_QUESTIONS.length - 1
                          ? tx('SIGUIENTE PREGUNTA', 'NEXT QUESTION')
                          : tx('VER RESULTADOS FINALES', 'VIEW FINAL RESULTS')}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* SUBMODAL 1: JUEGO "SILUETA MISTERIOSA" */}
        {/* ============================================================== */}
        {silhouetteGameBird && (() => {
          const localizedSilBird = localizeCatalogBird(silhouetteGameBird, lang);
          return (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col p-3 animate-fadeIn select-none">
            <div className="flex items-center justify-between pb-2 border-b border-teal-900 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xl">🕵️</span>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    {tx('SILUETA MISTERIOSA', 'MYSTERY SILHOUETTE')} #{localizedSilBird.catalogNumber}
                  </h4>
                  <p className="text-[10px] text-teal-300">
                    {tx('Descifra la especie a través de las 4 pistas', 'Decipher the species through the 4 clues')}
                  </p>
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
              <div className="relative h-32 rounded-2xl bg-gradient-to-b from-[#9CF0E0] via-[#5CD2BF] to-[#2BB5A0] border-2 border-teal-300 flex flex-col items-center justify-center p-2 text-center shadow-inner">
                {silhouetteResult === 'correct' ? (
                  <div className="flex flex-col items-center animate-scaleIn">
                    <img
                      src={localizedSilBird.image}
                      alt={localizedSilBird.commonName}
                      className="w-20 h-20 rounded-full object-cover border-3 border-amber-400 shadow-xl"
                    />
                    <span className="text-xs font-black text-slate-950 bg-amber-300 px-2.5 py-0.5 rounded-full mt-1 uppercase shadow">
                      {tx(`¡${localizedSilBird.commonName} ILUMINADO!`, `${localizedSilBird.commonName} ILLUMINATED!`)}
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="filter drop-shadow-md">
                      {renderBirdSilhouetteSvg(localizedSilBird.catalogNumber, 'w-24 h-20')}
                    </div>
                    <div className="text-[10px] font-black text-amber-300 bg-slate-950/85 px-2.5 py-0.5 rounded-full mt-1 border border-amber-400/50">
                      {tx(
                        `Recompensa activa (${hintsRevealed} ${hintsRevealed === 1 ? 'pista' : 'pistas'}): +${getSilhouetteXpReward()} XP`,
                        `Active reward (${hintsRevealed} ${hintsRevealed === 1 ? 'clue' : 'clues'}): +${getSilhouetteXpReward()} XP`
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* The 4 Progressive Hints */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-black text-teal-300">
                  <span>{tx('Pistas Reveladas:', 'Clues Revealed:')} {hintsRevealed}/4</span>
                  {hintsRevealed < 4 && silhouetteResult === null && (
                    <button
                      onClick={() => {
                        soundManager.playClick();
                        setHintsRevealed(prev => Math.min(4, prev + 1));
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 text-[10px] font-black border border-amber-300 shadow"
                    >
                      + {tx('Revelar Pista', 'Reveal Clue')} {hintsRevealed + 1}
                    </button>
                  )}
                </div>

                {/* Pista 1: Tamaño */}
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <span className="font-bold text-amber-400 block text-[9px]">
                    {tx('PISTA 1 (TAMAÑO):', 'CLUE 1 (SIZE):')}
                  </span>
                  <p className="text-white text-[11px] font-bold">{localizedSilBird.hints.size}</p>
                </div>

                {/* Pista 2: Hábitat / Estrato */}
                {hintsRevealed >= 2 && (
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs animate-fadeIn">
                    <span className="font-bold text-emerald-400 block text-[9px]">
                      {tx('PISTA 2 (HÁBITAT / ESTRATO):', 'CLUE 2 (HABITAT / STRATUM):')}
                    </span>
                    <p className="text-white text-[11px]">{localizedSilBird.hints.habitat}</p>
                  </div>
                )}

                {/* Pista 3: Color y Morfología */}
                {hintsRevealed >= 3 && (
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs animate-fadeIn">
                    <span className="font-bold text-sky-400 block text-[9px]">
                      {tx('PISTA 3 (COLOR Y MORFOLOGÍA):', 'CLUE 3 (COLOR & MORPHOLOGY):')}
                    </span>
                    <p className="text-white text-[11px]">{localizedSilBird.hints.morphology}</p>
                  </div>
                )}

                {/* Pista 4: Dato Curioso / Leyenda */}
                {hintsRevealed >= 4 && (
                  <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-600 text-xs animate-fadeIn">
                    <span className="font-bold text-amber-300 block text-[9px]">
                      {tx('PISTA 4 (DATO CURIOSO / LEYENDA):', 'CLUE 4 (FUN FACT / FOLKLORE):')}
                    </span>
                    <p className="text-amber-100 text-[11px] italic">{localizedSilBird.hints.loreOrFact}</p>
                  </div>
                )}
              </div>

              {/* 4 Species Options */}
              {silhouetteResult === null && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-black text-slate-300 block">
                    {tx('Selecciona el nombre correcto entre las 4 opciones:', 'Select the correct species name from the 4 options:')}
                  </span>
                  {getSilhouetteOptions(silhouetteGameBird).map((optName, idx) => (
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
                    🎉 {tx('¡SILUETA ILUMINADA A COLOR!', 'SILHOUETTE ILLUMINATED IN COLOR!')}
                  </div>
                  <p className="text-xs text-emerald-200">
                    {tx('Has ganado', 'You earned')}{' '}
                    <span className="font-black text-white">+{getSilhouetteXpReward()} XP</span>{' '}
                    {tx('y esta especie ya brilla en tu catálogo.', 'and this species now shines in your catalog.')}
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => {
                        setSilhouetteGameBird(null);
                        setInspectingBird(silhouetteGameBird);
                      }}
                      className="flex-1 py-2 rounded-xl game-btn-mint text-emerald-950 font-bold text-xs"
                    >
                      {tx('Ver Ficha Técnica', 'View Technical Sheet')}
                    </button>
                    <button
                      onClick={() => setSilhouetteGameBird(null)}
                      className="flex-1 py-2 rounded-xl game-btn-orange text-white font-bold text-xs"
                    >
                      {tx('Volver a la Guía', 'Back to Guide')}
                    </button>
                  </div>
                </div>
              )}

              {/* Failure Dialogue: Tucán Feedback Amable - NO RESTA PUNTOS */}
              {silhouetteResult === 'wrong' && (
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-teal-500 text-slate-100 space-y-2.5 animate-fadeIn">
                  <div className="flex items-start gap-2.5">
                    <img
                      src="/assets/aistudio/Toucan_perched_on_branch_8ab41bfc_230157f9.jpg"
                      alt="Tucán Guía"
                      className="w-12 h-12 rounded-full object-cover border-2 border-amber-400 shrink-0"
                    />
                    <div className="text-xs">
                      <span className="font-black text-amber-300 block">
                        {tx('TUCÁN ANFITRIÓN:', 'TOUCAN HOST:')}
                      </span>
                      <p className="text-[11px] text-teal-100 italic leading-snug mt-0.5">
                        {tx(
                          '"Desafortunadamente, no has respondido todas las preguntas correctamente. ¡El Parque Botánico Barón Schuel siempre te da otra oportunidad para aprender! Vuelve a escuchar los cantos y observar las copas de los árboles."',
                          '"Unfortunately, that wasn\'t the right match. Baron Schuel Botanical Park always gives you another chance to learn! Listen carefully to the calls and observe the treetops again."'
                        )}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      soundManager.playClick();
                      setSilhouetteResult(null);
                      setHintsRevealed(prev => Math.min(4, prev + 1));
                    }}
                    className="w-full py-2.5 rounded-xl game-btn-mint text-emerald-950 font-black text-xs shadow flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{tx('Volver a intentar (Habilita pista extra)', 'Try again (Unlocks extra clue)')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          );
        })()}

        {/* ============================================================== */}
        {/* SUBMODAL 2: FICHA TÉCNICA ESTILO PROTOTIPO */}
        {/* ============================================================== */}
        {inspectingBird && (() => {
          const localizedInspBird = localizeCatalogBird(inspectingBird, lang);
          return (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col p-3 animate-fadeIn select-none text-white">
            <div className="flex items-center justify-between pb-2 border-b border-teal-900 shrink-0">
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  {tx('FICHA TÉCNICA', 'TECHNICAL SHEET')} · #{localizedInspBird.catalogNumber}
                </h4>
                <p className="text-[10px] text-teal-300 font-serif italic">
                  {localizedInspBird.scientificName}
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
              {/* Prototype-Style Top Semicircular Arc with PC 2579, Avatar & 125 / 125 HP Bar */}
              <div className="relative rounded-3xl overflow-hidden border-2 border-teal-400/70 bg-gradient-to-b from-[#0E6E5C] via-[#134E48] to-slate-950 p-3 text-center shadow-xl">
                <div className="text-amber-300 font-black text-sm tracking-widest uppercase drop-shadow">
                  PC <span className="text-xl text-white">{localizedInspBird.cp || 2579}</span>
                </div>

                <div className="relative w-44 h-32 mx-auto flex items-center justify-center">
                  <svg viewBox="0 0 200 120" className="absolute inset-0 w-full h-full pointer-events-none">
                    <path
                      d="M 16 105 A 84 84 0 0 1 184 105"
                      fill="none"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="6"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 16 105 A 84 84 0 0 1 172 68"
                      fill="none"
                      stroke="#5EEAD4"
                      strokeWidth="6"
                      strokeLinecap="round"
                    />
                    <circle cx="172" cy="68" r="5" fill="#FDE047" />
                  </svg>

                  <div className="relative z-10 w-24 h-24 rounded-full overflow-hidden border-3 border-amber-300 shadow-2xl bg-slate-900 mt-3">
                    <img
                      src={localizedInspBird.image}
                      alt={localizedInspBird.commonName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <h3 className="text-base font-black text-white uppercase tracking-wide mt-1">
                  {localizedInspBird.commonName}
                </h3>
                <div className="w-40 mx-auto mt-1">
                  <div className="h-2 rounded-full bg-slate-900 border border-emerald-500/60 overflow-hidden">
                    <div className="h-full w-full bg-gradient-to-r from-emerald-400 to-teal-300" />
                  </div>
                  <span className="text-[10px] font-black text-emerald-300 block mt-0.5">
                    {localizedInspBird.hp || '125 / 125 HP'}
                  </span>
                </div>

                {/* Best Foto Perfecta Rating Badge */}
                <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-950/85 border border-amber-400/60 text-[10px] font-bold text-amber-300">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>
                    {tx('Mejor Foto Perfecta:', 'Best Perfect Photo:')} {'★'.repeat(playerProfile.birdPhotoStars?.[localizedInspBird.id] || 3)}
                  </span>
                </div>
              </div>

              {/* Biological Metrics Grid */}
              <div className="grid grid-cols-3 gap-1.5 text-center text-xs bg-slate-950 p-2.5 rounded-2xl border border-teal-900">
                <div className="p-1.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[8px] text-slate-400 block font-bold uppercase">{tx('PESO', 'WEIGHT')}</span>
                  <span className="text-teal-300 font-black text-xs">{localizedInspBird.weight}</span>
                </div>
                <div className="p-1.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[8px] text-slate-400 block font-bold uppercase">{tx('ALTURA', 'SIZE')}</span>
                  <span className="text-amber-300 font-black text-xs">{localizedInspBird.size}</span>
                </div>
                <div className="p-1.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[8px] text-slate-400 block font-bold uppercase">{tx('FAMILIA', 'FAMILY')}</span>
                  <span className="text-white font-black text-[10px] truncate block">{localizedInspBird.family}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-950 border border-teal-900/80 space-y-1.5 text-[10px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-bold">{tx('Hábitat / Estrato:', 'Habitat / Stratum:')}</span>
                  <span className="text-teal-200 font-bold text-right">{localizedInspBird.habitat} ({localizedInspBird.stratum})</span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-1 pt-1 border-t border-slate-900">
                  <span className={`px-2 py-0.5 rounded font-black border ${
                    localizedInspBird.conservationStatus === 'AM'
                      ? 'bg-rose-950 text-rose-300 border-rose-600'
                      : localizedInspBird.conservationStatus === 'VU'
                      ? 'bg-amber-950 text-amber-300 border-amber-600'
                      : 'bg-emerald-950 text-emerald-300 border-emerald-600'
                  }`}>
                    {tx('Conservación:', 'Conservation:')} {localizedInspBird.conservationStatus}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-200 font-bold">
                    {tx('Presencia:', 'Presence:')} {localizedInspBird.presence}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-300 font-bold">
                    Obs.: {localizedInspBird.observationPossibility}
                  </span>
                </div>
              </div>

              {/* Anatomical Details: Pico, Canto con Onda Sonora Desbloqueada, Plumaje */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-teal-900 space-y-2 text-xs">
                <div>
                  <span className="font-black text-teal-300 block text-[10px]">{tx('TIPO DE PICO:', 'BEAK TYPE:')}</span>
                  <p className="text-slate-200 text-[11px] leading-snug">{localizedInspBird.beakDescription}</p>
                </div>

                {/* Canto with Unlocked Sound Wave */}
                <div className="pt-1.5 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-amber-300 text-[10px] flex items-center gap-1">
                      <Music className="w-3 h-3" />
                      <span>
                        {tx('CANTO Y ONDA SONORA', 'CALL & SOUND WAVE')}{' '}
                        {isAcousticUnlocked(localizedInspBird.id) ? tx('(DESBLOQUEADA ✓)', '(UNLOCKED ✓)') : ''}:
                      </span>
                    </span>
                    <button
                      onClick={() => playSoundForBird(inspectingBird)}
                      className="px-2.5 py-0.5 rounded-lg bg-teal-700 hover:bg-teal-600 text-white text-[9px] font-black flex items-center gap-1 shadow"
                    >
                      <Play className="w-2.5 h-2.5" />
                      <span>{audioIsPlaying ? tx('Sonando...', 'Playing...') : tx('Escuchar', 'Listen')}</span>
                    </button>
                  </div>
                  
                  {/* Wave Visualizer Graphic */}
                  <div className="h-9 rounded-lg bg-slate-900 border border-teal-950 p-1.5 flex items-center justify-center gap-1">
                    {[8, 18, 12, 26, 20, 10, 24, 16, 28, 14, 22, 12, 19, 25, 11, 15].map((h, i) => {
                      const barH = audioIsPlaying
                        ? Math.min(28, Math.max(6, h * (1 + 0.5 * Math.sin(Date.now() / 100 + i))))
                        : h;
                      return (
                        <div
                          key={i}
                          className="w-1 rounded-full bg-gradient-to-t from-teal-400 to-amber-300 transition-all duration-100"
                          style={{ height: `${barH}px` }}
                        />
                      );
                    })}
                  </div>
                  <p className="text-slate-300 text-[10px] italic mt-1">{localizedInspBird.songDescription}</p>
                </div>

                <div className="pt-1.5 border-t border-slate-800">
                  <span className="font-black text-teal-300 block text-[10px]">
                    {tx('DESCRIPCIÓN DE PLUMAJE:', 'PLUMAGE DESCRIPTION:')}
                  </span>
                  <p className="text-slate-200 text-[11px] leading-snug">{localizedInspBird.plumageDescription}</p>
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
                <span>{tx('Registrar en Diario de Campo (4 Toques)', 'Log in Field Journal (4 Taps)')}</span>
              </button>
            </div>
          </div>
          );
        })()}

        {/* ============================================================== */}
        {/* SUBMODAL 3: FORMULARIO CIENTÍFICO DE 4 TOQUES */}
        {/* ============================================================== */}
        {journalModalBird && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col p-3 animate-fadeIn select-none text-white">
            <div className="flex items-center justify-between pb-2 border-b border-teal-900 shrink-0">
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  {tx('REGISTRO CIENTÍFICO (4 TOQUES)', 'SCIENTIFIC LOG (4 TAPS)')}
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
                  <span className="font-bold text-teal-300 block mb-1">
                    {tx('Punto del Sendero:', 'Trail Point:')}
                  </span>
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
                  {tx('TOQUE 1: COMPORTAMIENTO', 'TAP 1: BEHAVIOR')}
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
                      {b === 'Alimentándose'
                        ? tx('Alimentándose', 'Foraging')
                        : b === 'Cantando'
                        ? tx('Cantando', 'Singing')
                        : b === 'En reposo'
                        ? tx('En reposo', 'Resting')
                        : tx('En vuelo', 'In flight')}
                    </button>
                  ))}
                </div>
              </div>

              {/* TOQUE 2: CANTIDAD */}
              <div className="space-y-1">
                <span className="text-[10px] font-black text-emerald-300 uppercase">
                  {tx('TOQUE 2: CANTIDAD', 'TAP 2: COUNT')}
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
                      {c === '1 individuo'
                        ? tx('1 individuo', '1 individual')
                        : c === 'Pareja (2)'
                        ? tx('Pareja (2)', 'Pair (2)')
                        : tx('Grupo/Bandada (3+)', 'Flock (3+)')}
                    </button>
                  ))}
                </div>
              </div>

              {/* TOQUE 3: ESTRATO */}
              <div className="space-y-1">
                <span className="text-[10px] font-black text-sky-300 uppercase">
                  {tx('TOQUE 3: ESTRATO', 'TAP 3: STRATUM')}
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
                      {st === 'Dosel'
                        ? tx('Dosel', 'Canopy')
                        : st === 'Subdosel'
                        ? tx('Subdosel', 'Subcanopy')
                        : st === 'Sotobosque'
                        ? tx('Sotobosque', 'Understory')
                        : st === 'Zona Urbanizada'
                        ? tx('Zona Urbanizada', 'Urbanized Area')
                        : tx('En Vuelo', 'In Flight')}
                    </button>
                  ))}
                </div>
              </div>

              {/* TOQUE 4: CLIMA */}
              <div className="space-y-1">
                <span className="text-[10px] font-black text-amber-400 uppercase">
                  {tx('TOQUE 4: CLIMA DEL MOMENTO', 'TAP 4: CURRENT WEATHER')}
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
                      {w === 'Soleado'
                        ? tx('Soleado', 'Sunny')
                        : w === 'Nublado'
                        ? tx('Nublado', 'Cloudy')
                        : tx('Llovizna de Yungas', 'Yungas Drizzle')}
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
                  <span>{tx('Guardar Observación (+30 XP)', 'Save Observation (+30 XP)')}</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
