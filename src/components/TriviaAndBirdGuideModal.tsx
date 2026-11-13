import React, { useState, useEffect, useRef } from 'react';
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

// Vectorial Black SVG Bird Silhouette Component (shows clear contour of beak, head, wings, tail & perch)
const BirdSilhouetteSvg: React.FC<{ bird: CatalogBird; size?: 'card' | 'stage' }> = ({
  bird,
  size = 'card'
}) => {
  const num = parseInt(bird.catalogNumber, 10) || 1;
  const svgSizeClass = size === 'stage' ? 'w-44 h-44 sm:w-48 sm:h-48' : 'w-28 h-28 sm:w-32 sm:h-32';

  // Select anatomically distinct vector silhouette path by species/family
  const renderBirdPath = () => {
    // 003 Chercán (Ratona) -> compact wren with upright cocked tail
    if (num === 3) {
      return (
        <g>
          {/* Perched branch */}
          <path d="M18 102 Q60 96 104 104" stroke="#08221E" strokeWidth="5" strokeLinecap="round" fill="none" />
          {/* Legs */}
          <path d="M56 84 L53 100 M64 84 L63 100" stroke="#061210" strokeWidth="3" strokeLinecap="round" />
          {/* Upright cocked tail */}
          <path d="M36 66 L22 30 L32 28 L44 62 Z" fill="#061210" />
          {/* Compact rounded body & wing */}
          <ellipse cx="56" cy="69" rx="22" ry="16" fill="#061210" />
          {/* Head */}
          <circle cx="74" cy="56" r="11" fill="#061210" />
          {/* Slender slightly curved insectivore beak */}
          <path d="M83 53 Q96 54 99 58 L83 59 Z" fill="#061210" />
        </g>
      );
    }

    // 008 Tero -> long-legged plover with thin occipital crest
    if (num === 8) {
      return (
        <g>
          {/* Ground/branch line */}
          <path d="M16 106 Q60 103 104 106" stroke="#08221E" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          {/* Long slender legs */}
          <path d="M56 72 L53 104 M65 72 L68 104" stroke="#061210" strokeWidth="3.2" strokeLinecap="round" />
          {/* Plover body & tail */}
          <path d="M24 68 L48 50 Q68 48 76 62 Q68 76 46 74 Z" fill="#061210" />
          {/* Upright neck & head */}
          <path d="M66 56 L72 36 Q78 30 84 36 L78 58 Z" fill="#061210" />
          {/* Occipital crest plume */}
          <path d="M70 35 Q58 29 53 33 Q62 37 70 39 Z" fill="#061210" />
          {/* Plover beak */}
          <path d="M83 36 L98 39 L83 42 Z" fill="#061210" />
        </g>
      );
    }

    // 013 Carancho -> perched raptor with hooked beak and broad shoulders
    if (num === 13) {
      return (
        <g>
          {/* Perch post/branch */}
          <path d="M20 102 Q60 97 100 103" stroke="#08221E" strokeWidth="5.5" strokeLinecap="round" fill="none" />
          {/* Strong raptor talons */}
          <path d="M54 82 L50 100 M64 82 L66 100" stroke="#061210" strokeWidth="3.8" strokeLinecap="round" />
          {/* Tail */}
          <path d="M36 76 L22 104 L36 106 L48 80 Z" fill="#061210" />
          {/* Upright broad-shouldered raptor body & folded wings */}
          <path d="M38 78 Q36 46 58 38 Q74 44 70 78 Z" fill="#061210" />
          {/* Crested raptor head */}
          <path d="M52 40 Q54 22 68 25 Q76 28 73 40 Z" fill="#061210" />
          {/* Hooked raptor beak */}
          <path d="M72 28 Q87 28 86 38 Q81 35 72 35 Z" fill="#061210" />
        </g>
      );
    }

    // 017 Pava de las yungas -> large arboreal guan with long broad fan tail & crest
    if (num === 17) {
      return (
        <g>
          {/* Thick Yungas branch */}
          <path d="M14 98 Q62 92 106 100" stroke="#08221E" strokeWidth="6" strokeLinecap="round" fill="none" />
          {/* Legs */}
          <path d="M58 78 L55 95 M66 78 L67 96" stroke="#061210" strokeWidth="3.5" strokeLinecap="round" />
          {/* Long broad guan tail */}
          <path d="M42 68 L12 96 L24 104 L48 74 Z" fill="#061210" />
          {/* Plump arboreal body */}
          <ellipse cx="60" cy="64" rx="23" ry="16" transform="rotate(-12 60 64)" fill="#061210" />
          {/* Elongated neck & crested head */}
          <path d="M72 56 L78 32 Q84 26 90 32 L82 58 Z" fill="#061210" />
          {/* Bushy crown crest */}
          <path d="M75 31 Q72 21 82 23 Q86 25 85 31 Z" fill="#061210" />
          {/* Curved gamebird beak */}
          <path d="M89 32 Q99 34 97 39 L88 37 Z" fill="#061210" />
        </g>
      );
    }

    // 018 Aratinga mitrada (Loro/Calancate) -> hooked parrot beak & long pointed parakeet tail
    if (num === 18) {
      return (
        <g>
          {/* Branch */}
          <path d="M20 94 Q60 88 102 96" stroke="#08221E" strokeWidth="5" strokeLinecap="round" fill="none" />
          {/* Zygodactyl feet */}
          <path d="M56 78 L54 91 M63 78 L63 91" stroke="#061210" strokeWidth="3.2" strokeLinecap="round" />
          {/* Long pointed graduated parakeet tail */}
          <path d="M44 72 L18 110 L26 112 L52 76 Z" fill="#061210" />
          {/* Compact parrot body & folded wing */}
          <path d="M42 74 Q42 46 62 42 Q76 48 68 76 Z" fill="#061210" />
          {/* Rounded parrot head */}
          <circle cx="64" cy="36" r="12" fill="#061210" />
          {/* Hooked psittacid upper & lower mandible */}
          <path d="M74 30 Q88 32 84 44 Q78 40 74 39 Z" fill="#061210" />
        </g>
      );
    }

    // 001 Chingolo, 006 Saltator, 011 Urraca morada -> Crested / jay-like perched passerine
    if (num === 1 || num === 6 || num === 11) {
      return (
        <g>
          {/* Branch */}
          <path d="M16 98 Q60 92 104 100" stroke="#08221E" strokeWidth="4.8" strokeLinecap="round" fill="none" />
          {/* Legs */}
          <path d="M55 78 L52 95 M63 78 L64 95" stroke="#061210" strokeWidth="3" strokeLinecap="round" />
          {/* Tail feathers */}
          <path d="M40 70 L18 96 L28 100 L48 74 Z" fill="#061210" />
          {/* Perched songbird body & wing */}
          <ellipse cx="58" cy="64" rx="21" ry="15" transform="rotate(-18 58 64)" fill="#061210" />
          {/* Head with distinctive crown crest */}
          <circle cx="73" cy="46" r="11.5" fill="#061210" />
          <path d="M64 38 L60 24 L72 34 L69 25 L78 36 Z" fill="#061210" />
          {/* Conical beak */}
          <path d="M83 43 L98 47 L83 51 Z" fill="#061210" />
        </g>
      );
    }

    // 007 Benteveo, 012 Suirirí real, 014 Hornero, 020 Ticotico -> Upright flycatcher / furnariid with long bill
    if (num === 7 || num === 12 || num === 14 || num === 20) {
      return (
        <g>
          {/* Branch */}
          <path d="M16 98 Q60 92 104 100" stroke="#08221E" strokeWidth="5" strokeLinecap="round" fill="none" />
          {/* Legs */}
          <path d="M54 78 L51 95 M62 78 L63 95" stroke="#061210" strokeWidth="3" strokeLinecap="round" />
          {/* Long notched tail */}
          <path d="M40 70 L20 100 L31 103 L48 74 Z" fill="#061210" />
          {/* Upright sentinel body & wing */}
          <path d="M38 72 Q40 48 62 44 Q76 50 66 76 Z" fill="#061210" />
          {/* Robust head */}
          <circle cx="68" cy="39" r="12" fill="#061210" />
          {/* Strong straight/slightly curved flycatcher/furnariid bill */}
          <path d="M78 35 L100 39 L98 43 L78 43 Z" fill="#061210" />
        </g>
      );
    }

    // Default Perched Songbird / Tanager / Thrush / Dove (002, 004, 005, 009, 010, 015, 016, 019, 021)
    return (
      <g>
        {/* Branch with leaf */}
        <path d="M16 98 Q60 91 104 99" stroke="#08221E" strokeWidth="4.8" strokeLinecap="round" fill="none" />
        <path d="M88 96 Q96 86 104 90 Q98 98 88 96 Z" fill="#08221E" />
        {/* Legs */}
        <path d="M55 77 L52 94 M63 77 L64 95" stroke="#061210" strokeWidth="2.8" strokeLinecap="round" />
        {/* Tail */}
        <path d="M39 68 L16 90 L25 96 L47 73 Z" fill="#061210" />
        {/* Sleek songbird body & layered wing tip */}
        <ellipse cx="57" cy="63" rx="22" ry="15" transform="rotate(-16 57 63)" fill="#061210" />
        <path d="M44 58 Q62 54 70 67 Q54 71 40 69 Z" fill="#061210" />
        {/* Head */}
        <circle cx="73" cy="46" r="11.5" fill="#061210" />
        {/* Crisp songbird beak */}
        <path d="M83 43 L97 46 L83 50 Z" fill="#061210" />
      </g>
    );
  };

  return (
    <svg
      viewBox="0 0 120 120"
      className={`${svgSizeClass} drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)] select-none pointer-events-none`}
      aria-label={`Silueta vectorial #${bird.catalogNumber}`}
    >
      {/* Subtle circular halo behind the black bird silhouette for maximum contrast */}
      <circle cx="60" cy="58" r="44" fill="rgba(255, 255, 255, 0.28)" />
      {renderBirdPath()}
    </svg>
  );
};

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

  // Bioacoustic Mode State (Paso 11) - default 007 Benteveo
  const [audioTargetBird, setAudioTargetBird] = useState<CatalogBird>(
    CATALOG_BIRDS_DATA.find((b) => b.catalogNumber === '007') || CATALOG_BIRDS_DATA[0]
  );
  const [audioIsPlaying, setAudioIsPlaying] = useState(false);
  const [activeAudioUrl, setActiveAudioUrl] = useState<string>(
    (CATALOG_BIRDS_DATA.find((b) => b.catalogNumber === '007') || CATALOG_BIRDS_DATA[0]).audioUrl
  );
  const [waveTick, setWaveTick] = useState(0);
  const [audioGuess, setAudioGuess] = useState<string | null>(null);
  const [audioResult, setAudioResult] = useState<'correct' | 'wrong' | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
    if (!isOpen) {
      soundManager.stopCurrentAudio();
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setAudioIsPlaying(false);
    }
  }, [initialTab, isOpen]);

  useEffect(() => {
    if (!audioIsPlaying) return;
    const interval = window.setInterval(() => {
      setWaveTick((t) => t + 1);
    }, 100);
    return () => window.clearInterval(interval);
  }, [audioIsPlaying]);

  if (!isOpen) return null;

  // Real HTML5 <audio> Dispatcher: plays the exact .mp3 file from /assets/aves/ using encodeURI()
  const playSoundForBird = (bird: CatalogBird) => {
    const mp3Path = bird.audioUrl || soundManager.resolveBirdMp3Url(bird.id || bird.commonName) || '/assets/aves/7-Benteveo.mp3';
    const encodedPath = mp3Path.includes('%') ? mp3Path : encodeURI(mp3Path);
    setActiveAudioUrl(encodedPath);
    setAudioIsPlaying(true);

    soundManager.stopCurrentAudio();
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.src = encodedPath;
        audioRef.current.currentTime = 0;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            soundManager.playBirdSound(mp3Path, () => setAudioIsPlaying(false));
          });
        }
        return;
      } catch {
        // Fallback to soundManager
      }
    }
    soundManager.playBirdSound(mp3Path, () => setAudioIsPlaying(false));
  };

  // Featured bird: CHINCHERO CHICO
  const featuredChinchero: CatalogBird = {
    id: '000-chinchero-chico',
    catalogNumber: '000',
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
    soundType: '020-ticotico-cejicanelo',
    image: '/assets/aistudio/chinchero_chico_portrait.jpg',
    audioUrl: '/assets/aves/20-Ticotico cejicanelo.mp3',
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

  // All 21 species (001-021) in the official catalog
  const addedPackIds = playerProfile.addedPackBirdIds || [];
  const extraPackBirds = PACK_EXTRA_BIRDS_DATA.filter((b) => addedPackIds.includes(b.id));
  const allCatalogBirds = Array.from(
    new Map([...CATALOG_BIRDS_DATA, ...extraPackBirds].map((b) => [b.id, b])).values()
  );

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

  // Build deterministic 4 options for Silueta Misteriosa across all 21 species
  const getSilhouetteOptions = (bird: CatalogBird): string[] => {
    const others = CATALOG_BIRDS_DATA.filter((b) => b.id !== bird.id);
    const num = Math.max(1, parseInt(bird.catalogNumber, 10) || 1);
    const d1 = others[(num * 3) % others.length].commonName;
    const d2 = others[(num * 3 + 7) % others.length].commonName;
    const d3 = others[(num * 3 + 13) % others.length].commonName;
    const all = [bird.commonName, d1, d2, d3];
    const shift = num % 4;
    return [...all.slice(shift), ...all.slice(0, shift)];
  };

  // Build deterministic 3 options for Modo Bioacústico "Escucha el Canto" across all 21 species
  const getAudioOptions = (bird: CatalogBird): string[] => {
    const others = CATALOG_BIRDS_DATA.filter((b) => b.id !== bird.id);
    const num = Math.max(1, parseInt(bird.catalogNumber, 10) || 1);
    const d1 = others[(num * 5) % others.length].commonName;
    const d2 = others[(num * 5 + 9) % others.length].commonName;
    const all = [bird.commonName, d1, d2];
    const shift = num % 3;
    return [...all.slice(shift), ...all.slice(0, shift)];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-3 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      {/* Hidden Real HTML5 Audio Element connected to /assets/aves/*.mp3 */}
      <audio
        ref={audioRef}
        src={activeAudioUrl}
        preload="auto"
        onPlay={() => setAudioIsPlaying(true)}
        onPause={() => setAudioIsPlaying(false)}
        onEnded={() => setAudioIsPlaying(false)}
        className="hidden"
      />
      <div
        className="relative w-full max-w-sm max-h-[94vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border-2 border-[#1DB5A0] bg-[#2CC5B1]"
      >
        {/* TOP HEADER */}
        <div className="bg-slate-950/90 px-3.5 pt-3 pb-2 border-b border-teal-800/60 shrink-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-400 flex items-center justify-center text-teal-300 shrink-0 shadow">
                <Bird className="w-4 h-4" />
              </div>
              <div className="truncate">
                <h3 className="font-black text-xs text-white uppercase tracking-wider truncate">
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
              {/* Circular Seal of "PARQUE BOTÁNICO MUNICIPAL BARÓN CARLOS MARÍA SCHUEL" + Full Uncropped Bird Showcase */}
              <div className="relative flex flex-col items-center justify-center py-1">
                <div className="relative w-full aspect-square max-h-[340px] rounded-2xl bg-[#E8FAF6] border-3 border-amber-300 shadow-2xl flex flex-col items-center justify-center overflow-hidden">
                  {/* Decorative Seal Watermark Ring */}
                  <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full opacity-25 pointer-events-none">
                    <defs>
                      <path id="sealTopArc" d="M 24,100 A 76,76 0 1,1 176,100" />
                      <path id="sealBottomArc" d="M 176,100 A 76,76 0 1,1 24,100" />
                    </defs>
                    <circle cx="100" cy="100" r="90" fill="none" stroke="#0D6B5D" strokeWidth="3" />
                    <circle cx="100" cy="100" r="68" fill="none" stroke="#0D6B5D" strokeWidth="1.5" strokeDasharray="4 3" />
                    <text fill="#064E3B" fontSize="9.5" fontWeight="800" letterSpacing="1.6">
                      <textPath href="#sealTopArc" startOffset="50%" textAnchor="middle">
                        PARQUE BOTÁNICO MUNICIPAL
                      </textPath>
                    </text>
                    <text fill="#064E3B" fontSize="9" fontWeight="800" letterSpacing="1.3">
                      <textPath href="#sealBottomArc" startOffset="50%" textAnchor="middle">
                        BARÓN CARLOS MARÍA SCHUEL
                      </textPath>
                    </text>
                  </svg>

                  {/* Chinchero Chico illustration filling the whole showcase card */}
                  <img
                    src={featuredChinchero.image}
                    alt="Chinchero Chico"
                    className="absolute inset-0 z-10 w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-300"
                  />

                  {/* Sound Quick Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playSoundForBird(featuredChinchero);
                    }}
                    className="absolute bottom-2.5 right-2.5 z-20 w-9 h-9 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 border-2 border-slate-900 flex items-center justify-center shadow-lg active:scale-95"
                    title="Escuchar Canto del Chinchero Chico"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Title Banner Below the Seal */}
                <div className="text-center mt-2">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-950/60 border border-teal-300/40 text-[9px] font-black text-amber-300 uppercase tracking-widest">
                    AVE DESTACADA · PARQUE BOTÁNICO BARÓN SCHUEL
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

            {/* Vista Oficial del Catálogo de Siluetas (Completa sin recortes) */}
            <div className="rounded-2xl overflow-hidden border-2 border-teal-200/70 bg-[#E8FAF6] p-2 shadow-lg flex items-center justify-center min-h-[240px]">
              <img
                src="/assets/aistudio/Editing_bird_images_and_silhouettes_b4122078.jpg"
                alt="Catálogo Oficial de Siluetas Chinchero Chico"
                className="w-full h-[240px] object-contain object-top rounded-xl"
              />
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
                  {tx('Guía Oficial de Especies (001 - 021)', 'Official Species Guide (001 - 021)')}
                </span>
                <span className="text-[10px] font-extrabold text-teal-950">
                  {allCatalogBirds.filter(b => isBirdUnlocked(b.id)).length}/{allCatalogBirds.length} {tx('Iluminadas', 'Illuminated')}
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
                  {tx('Todas', 'All')} ({allCatalogBirds.length})
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
                  {tx('Siluetas', 'Silhouettes')} ({allCatalogBirds.filter(b => !isBirdUnlocked(b.id)).length})
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
                  {tx('Iluminadas', 'Illuminated')} ({allCatalogBirds.filter(b => isBirdUnlocked(b.id)).length})
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

                      {/* Vector Black SVG Silhouette when locked; Full Uncropped Photo (object-contain, min-h 240px) when unlocked */}
                      <div
                        className={`relative min-h-[240px] rounded-xl overflow-hidden flex items-center justify-center border border-teal-500/40 mb-2 ${
                          isUnlocked
                            ? 'bg-[#E8FAF6]'
                            : 'p-2 bg-gradient-to-b from-[#9CF0E0] via-[#6BD9C6] to-[#38B8A4]'
                        }`}
                      >
                        {isUnlocked ? (
                          <img
                            src={encodeURI(bird.image)}
                            style={{ objectPosition: bird.imageFocus || 'center' }}
                            alt={bird.commonName}
                            className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-300 hover:scale-105"
                          />
                        ) : (
                          <BirdSilhouetteSvg bird={bird} size="card" />
                        )}
                        {!isUnlocked && (
                          <span className="absolute bottom-1 right-1 text-[8px] font-black text-slate-950 bg-amber-300/95 px-1.5 py-0.2 rounded-full tracking-wider uppercase shadow-xs">
                            {tx('Pistas', 'Clues')}
                          </span>
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
                              <span className={`font-black ${bird.conservationStatus === 'AM' ? 'text-rose-400' : bird.conservationStatus === 'VU' ? 'text-amber-400' : 'text-emerald-400'}`}>
                                {bird.conservationStatus}
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <h5 className="text-xs font-bold text-slate-300 truncate leading-tight">
                              {tx('Especie', 'Species')} #{bird.catalogNumber}
                            </h5>
                            <p className="text-[9px] text-teal-400 truncate">
                              {bird.hints.size}
                            </p>
                            <div className="mt-1 flex items-center justify-between text-[9px] text-amber-400 font-bold">
                              <span>{tx('Misterio', 'Mystery')}</span>
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
        {/* TAB 2: BIOACÚSTICA "ESCUCHA EL CANTO" (21 ARCHIVOS .MP3 REALES) */}
        {/* ============================================================== */}
        {activeTab === 'audio' && (
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
            {/* Lámina Oficial Bioacústica sin recortes (min-h 240px + object-contain) */}
            <div className="rounded-2xl overflow-hidden border-2 border-teal-400/80 bg-[#E8FAF6] p-2 shadow-lg flex items-center justify-center min-h-[240px]">
              <img
                src="/assets/aistudio/Add_bird_song_interface_data_9b786ba3.jpg"
                alt="Interfaz Oficial de Canto y Onda Sonora"
                className="w-full h-[240px] object-contain object-top rounded-xl"
              />
            </div>

            {/* Header & Real MP3 Bioacoustic Player Info */}
            <div className="rounded-2xl p-3 bg-slate-950/90 border border-teal-500/60 space-y-2 text-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  {tx('Bioacústica Yungas (21 Cantos MP3)', 'Yungas Bioacoustics (21 MP3 Calls)')}
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500">
                  100% OFFLINE
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                {tx(
                  'Grabaciones bioacústicas reales (.mp3) de las 21 especies del Parque Botánico Municipal Barón Schuel.',
                  'Real bioacoustic recordings (.mp3) of the 21 species of Barón Schuel Municipal Botanical Park.'
                )}
              </p>

              {/* Animated Sound Wave Graphic */}
              <div className="h-14 rounded-xl bg-slate-900 border border-teal-800 p-2 flex items-center justify-center gap-1.5 overflow-hidden">
                {['h-3', 'h-6', 'h-4', 'h-10', 'h-8', 'h-5', 'h-11', 'h-7', 'h-4', 'h-9', 'h-6', 'h-3', 'h-7', 'h-10', 'h-4', 'h-6'].map((activeClass, idx) => {
                  const isHigh = audioIsPlaying && (waveTick + idx) % 2 === 0;
                  return (
                    <div
                      key={idx}
                      className={`w-1.5 rounded-full bg-gradient-to-t from-teal-400 to-amber-300 transition-all duration-100 ${
                        audioIsPlaying ? (isHigh ? activeClass : 'h-3') : 'h-1.5'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Bird Selector Buttons (All 21 Species with Real .MP3 Calls) */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {CATALOG_BIRDS_DATA.map((bird) => {
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
                      <span>#{bird.catalogNumber} {bird.commonName}</span>
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
                  {tx('Desafío: ¿Quién Canta en el Sendero?', 'Challenge: Who Is Singing on the Trail?')}
                </span>
                <span className="text-[10px] font-black text-teal-300">+50 XP</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-teal-900 text-center space-y-2">
                <p className="text-[11px] text-slate-300">
                  {tx(
                    'Escucha el archivo de audio real (.mp3) y selecciona cuál de las 3 especies candidatas está vocalizando:',
                    'Listen to the real audio file (.mp3) and select which of the 3 candidate species is vocalizing:'
                  )}
                </p>
                <audio
                  controls
                  src={encodeURI(audioTargetBird.audioUrl)}
                  onPlay={() => setAudioIsPlaying(true)}
                  onPause={() => setAudioIsPlaying(false)}
                  onEnded={() => setAudioIsPlaying(false)}
                  className="w-full h-8 rounded-lg"
                />
                <button
                  onClick={() => playSoundForBird(audioTargetBird)}
                  className="w-full py-2.5 rounded-xl game-btn-mint text-emerald-950 font-black text-xs flex items-center justify-center gap-2 shadow"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{audioIsPlaying ? tx('Reproduciendo Canto MP3...', 'Playing MP3 Call...') : tx('Reproducir Canto MP3', 'Play MP3 Call')}</span>
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

              {/* Audio Success Banner + Full Uncropped Bird Photo */}
              {audioResult === 'correct' && (
                <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-500 text-xs text-emerald-200 space-y-2 animate-fadeIn">
                  <div className="font-bold flex items-center gap-1.5 text-amber-300">
                    <Sparkles className="w-4 h-4" />
                    ¡RECONOCIMIENTO EXITOSO! (+50 XP)
                  </div>
                  <div className="relative w-full min-h-[240px] rounded-xl overflow-hidden bg-[#E8FAF6] border-2 border-amber-400 flex items-center justify-center shadow-lg">
                    <img
                      src={encodeURI(audioTargetBird.image)}
                      style={{ objectPosition: audioTargetBird.imageFocus || 'center' }}
                      alt={audioTargetBird.commonName}
                      className="absolute inset-0 w-full h-full object-cover object-center"
                    />
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
            {/* Lámina Oficial "DIARIO DE AVENTURAS: ¡Anota tus aventuras del día!" sin recortes */}
            <div className="rounded-2xl overflow-hidden border-2 border-amber-400/80 bg-[#E8FAF6] p-2 shadow-xl flex items-center justify-center min-h-[240px]">
              <img
                src="/assets/aistudio/Toucan_writing_adventure_diary_9f3bf558.jpg"
                alt="Diario de Aventuras Oficial"
                className="w-full h-[240px] object-contain object-top rounded-xl"
              />
            </div>

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
              {/* Silhouette Stage: Vectorial Black SVG Silhouette when unrevealed; Full Uncropped Photo (object-contain, min-h 240px) when guessed */}
              <div className="relative min-h-[260px] rounded-2xl bg-gradient-to-b from-[#9CF0E0] via-[#5CD2BF] to-[#2BB5A0] border-2 border-teal-300 flex flex-col items-center justify-center p-3 text-center shadow-inner">
                {silhouetteResult === 'correct' ? (
                  <div className="w-full flex flex-col items-center animate-scaleIn">
                    <div className="relative w-full min-h-[240px] rounded-2xl overflow-hidden bg-[#E8FAF6] border-3 border-amber-400 shadow-xl flex items-center justify-center">
                      <img
                        src={encodeURI(localizedSilBird.image)}
                        style={{ objectPosition: localizedSilBird.imageFocus || 'center' }}
                        alt={localizedSilBird.commonName}
                        className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-500"
                      />
                    </div>
                    <span className="text-xs font-black text-slate-950 bg-amber-300 px-3 py-1 rounded-full mt-2 uppercase shadow">
                      {tx(`¡${localizedSilBird.commonName} ILUMINADO!`, `${localizedSilBird.commonName} ILLUMINATED!`)}
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="w-full min-h-[200px] rounded-2xl border-2 border-teal-900/30 shadow-md flex items-center justify-center bg-[#A8F3E5]/60 p-2">
                      <BirdSilhouetteSvg bird={localizedSilBird} size="stage" />
                    </div>
                    <div className="text-[10px] font-black text-amber-300 bg-slate-950/90 px-3 py-1 rounded-full mt-2 border border-amber-400/50">
                      {tx(
                        `Recompensa activa (${hintsRevealed} ${hintsRevealed === 1 ? 'pista' : 'pistas'}): +${getSilhouetteXpReward()} XP`,
                        `Active reward (${hintsRevealed} ${hintsRevealed === 1 ? 'clue' : 'clues'}): +${getSilhouetteXpReward()} XP`
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Botón Destacado para Escuchar el Canto (.mp3) en Silueta Misteriosa */}
              <button
                type="button"
                onClick={() => playSoundForBird(silhouetteGameBird)}
                className="w-full py-3 px-3.5 rounded-2xl game-btn-orange text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg border-2 border-amber-300 active:scale-98 transition-all cursor-pointer"
              >
                <Volume2 className="w-4 h-4 text-amber-200 shrink-0" />
                <span>
                  {audioIsPlaying
                    ? tx('🔊 Reproduciendo canto de esta especie...', '🔊 Playing this species call...')
                    : tx('🔊 Escuchar el canto de esta especie', '🔊 Listen to this species call')}
                </span>
              </button>

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
              {/* Prototype-Style Top Card with PC 2579, Full Uncropped Bird Showcase (object-contain, min-h 250px) & 125 / 125 HP Bar */}
              <div className="relative rounded-3xl overflow-hidden border-2 border-teal-400/70 bg-gradient-to-b from-[#0E6E5C] via-[#134E48] to-slate-950 p-3 text-center shadow-xl">
                <div className="text-amber-300 font-black text-sm tracking-widest uppercase drop-shadow">
                  PC <span className="text-xl text-white">{localizedInspBird.cp || 2579}</span>
                </div>

                {/* Full Uncropped Bird Photo Container (min-h 250px, object-contain, clean background) */}
                <div className="relative w-full min-h-[250px] sm:min-h-[270px] rounded-2xl overflow-hidden border-3 border-amber-300 shadow-2xl bg-[#E8FAF6] flex items-center justify-center my-2">
                  <img
                    src={encodeURI(localizedInspBird.image)}
                    style={{ objectPosition: localizedInspBird.imageFocus || 'center' }}
                    alt={localizedInspBird.commonName}
                    className="absolute inset-0 w-full h-full object-cover object-center"
                  />
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

                {/* Canto with Unlocked Sound Wave & Real HTML5 <audio> Player */}
                <div className="pt-1.5 border-t border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-amber-300 text-[10px] flex items-center gap-1">
                      <Music className="w-3 h-3" />
                      <span>
                        {tx('CANTO REAL (.MP3) Y ONDA SONORA', 'REAL CALL (.MP3) & SOUND WAVE')}{' '}
                        {isAcousticUnlocked(localizedInspBird.id) ? tx('(DESBLOQUEADA ✓)', '(UNLOCKED ✓)') : ''}:
                      </span>
                    </span>
                    <button
                      onClick={() => playSoundForBird(inspectingBird)}
                      className="px-2.5 py-0.5 rounded-lg bg-teal-700 hover:bg-teal-600 text-white text-[9px] font-black flex items-center gap-1 shadow"
                    >
                      <Play className="w-2.5 h-2.5" />
                      <span>{audioIsPlaying ? tx('Sonando...', 'Playing...') : tx('Escuchar MP3', 'Listen MP3')}</span>
                    </button>
                  </div>

                  {/* Wave Visualizer Graphic */}
                  <div className="h-9 rounded-lg bg-slate-900 border border-teal-950 p-1.5 flex items-center justify-center gap-1">
                    {['h-2', 'h-5', 'h-3', 'h-6', 'h-5', 'h-2.5', 'h-6', 'h-4', 'h-7', 'h-3.5', 'h-5', 'h-3', 'h-4', 'h-6', 'h-2.5', 'h-4'].map((cls, i) => {
                      const isHigh = audioIsPlaying && (waveTick + i) % 2 === 0;
                      return (
                        <div
                          key={i}
                          className={`w-1 rounded-full bg-gradient-to-t from-teal-400 to-amber-300 transition-all duration-100 ${
                            audioIsPlaying ? (isHigh ? cls : 'h-2') : cls
                          }`}
                        />
                      );
                    })}
                  </div>
                  <audio
                    controls
                    src={encodeURI(localizedInspBird.audioUrl)}
                    onPlay={() => setAudioIsPlaying(true)}
                    onPause={() => setAudioIsPlaying(false)}
                    onEnded={() => setAudioIsPlaying(false)}
                    className="w-full h-8 rounded-lg"
                  />
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
