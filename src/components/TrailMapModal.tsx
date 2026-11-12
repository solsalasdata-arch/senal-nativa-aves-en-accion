import React, { useState, useRef, useEffect } from 'react';
import {
  Map,
  X,
  Mountain,
  QrCode,
  Award,
  Sparkles,
  Feather,
  Binoculars,
  Volume2,
  ShieldAlert,
  Layers,
  Camera,
  RefreshCw
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { CHECKPOINTS_DATA, RARE_BIRDS_DATA } from '../data/birdsData';
import { CheckPoint, PlayerProfile, BirdSpecies } from '../types/game';
import { useLanguage, localizeCheckpoint, LanguageSelector } from '../utils/i18n';

interface TrailMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerProfile: PlayerProfile;
  onValidateCheckpoint: (checkpointId: number, xpReward: number) => void;
  onOpenRareBirdDetails?: (bird: BirdSpecies) => void;
  onOpenXRVision?: () => void;
  onOpenBirdsCatalog?: () => void;
  onOpenSquadsAndSeasons?: () => void;
}

export const TrailMapModal: React.FC<TrailMapModalProps> = ({
  isOpen,
  onClose,
  playerProfile,
  onValidateCheckpoint,
  onOpenXRVision,
  onOpenBirdsCatalog,
  onOpenSquadsAndSeasons
}) => {
  const { lang, tx } = useLanguage();
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<CheckPoint>(CHECKPOINTS_DATA[0]);
  const [activeStationLayer, setActiveStationLayer] = useState<1 | 2 | 3>(1);
  const [mapVisualMode, setMapVisualMode] = useState<'circuit_3d' | 'physical_plan'>('circuit_3d');
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [selectedChallengeOption, setSelectedChallengeOption] = useState<number | null>(null);
  const [challengeSubmitted, setChallengeSubmitted] = useState(false);
  const [showRareBirdsModal, setShowRareBirdsModal] = useState(false);
  const [selectedRareBird, setSelectedRareBird] = useState<BirdSpecies>(RARE_BIRDS_DATA[0]);

  // Mobile QR Camera Scanner State
  const [qrCameraActive, setQrCameraActive] = useState(false);
  const [qrFacingMode, setQrFacingMode] = useState<'environment' | 'user'>('environment');
  const [qrNativePhoto, setQrNativePhoto] = useState<string | null>(null);
  const [qrCameraError, setQrCameraError] = useState<string | null>(null);
  const qrVideoRef = useRef<HTMLVideoElement | null>(null);
  const qrStreamRef = useRef<MediaStream | null>(null);
  const qrFileInputRef = useRef<HTMLInputElement | null>(null);

  const stopQrCamera = () => {
    if (qrStreamRef.current) {
      qrStreamRef.current.getTracks().forEach((t) => t.stop());
      qrStreamRef.current = null;
    }
    if (qrVideoRef.current) {
      qrVideoRef.current.srcObject = null;
    }
    setQrCameraActive(false);
  };

  const startQrCamera = async (mode: 'environment' | 'user' = qrFacingMode) => {
    try {
      setQrCameraError(null);
      if (qrStreamRef.current) {
        qrStreamRef.current.getTracks().forEach((t) => t.stop());
        qrStreamRef.current = null;
      }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia no disponible');
      }
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: mode } },
          audio: false
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }
      qrStreamRef.current = stream;
      setQrNativePhoto(null);
      setQrCameraActive(true);
      if (qrVideoRef.current) {
        qrVideoRef.current.srcObject = stream;
        qrVideoRef.current.setAttribute('playsinline', 'true');
        qrVideoRef.current.setAttribute('webkit-playsinline', 'true');
        qrVideoRef.current.muted = true;
        qrVideoRef.current.play().catch(() => {});
      }
    } catch {
      setQrCameraError(
        tx(
          'Permiso de cámara bloqueado. Pulsa "📷 Activar Cámara / Usar Cámara del Teléfono".',
          'Camera permission blocked. Tap "📷 Enable Camera / Use Phone Camera".'
        )
      );
      setQrCameraActive(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !showChallengeModal) {
      stopQrCamera();
    }
    return () => {
      if (qrStreamRef.current) {
        qrStreamRef.current.getTracks().forEach((t) => t.stop());
        qrStreamRef.current = null;
      }
    };
  }, [isOpen, showChallengeModal]);

  if (!isOpen) return null;

  const localizedCp = localizeCheckpoint(selectedCheckpoint, lang);
  const completedCount = playerProfile.completedCheckpoints?.length || 0;
  const isRouteComplete = completedCount >= 8 || playerProfile.hasRouteCompleteSeal;
  const isCurrentCheckpointCompleted = playerProfile.completedCheckpoints?.includes(selectedCheckpoint.id);

  // Ecological role & conservation risks per station (Layer 2 of Miro Board: "2. Comprender")
  const getStationEcologicalContext = (cpId: number) => {
    const data: Record<number, { roleEs: string; roleEn: string; riskEs: string; riskEn: string; soundKey: string }> = {
      1: {
        roleEs: 'Dispersión de semillas nativas de Mora Negra y control de insectos en el sotobosque húmedo.',
        roleEn: 'Dispersal of native Black Mulberry seeds and insect control in the humid understory.',
        riskEs: 'Riesgo: Ruidos fuertes al inicio del sendero y presencia de mascotas sueltas que ahuyentan a la Pava de Monte.',
        riskEn: 'Risk: Loud noises at the trailhead and unleashed pets scaring away the Yungas Guan.',
        soundKey: 'chiricote'
      },
      2: {
        roleEs: 'Los nidos colgantes del Yapú y el planeo del Taguató regulan poblaciones de insectos y pequeños vertebrados.',
        roleEn: 'Crested Oropendola hanging nests and Roadside Hawk soaring regulate insects and small vertebrates.',
        riskEs: 'Riesgo: Pérdida de árboles altos en bordes de ladera y residuos plásticos en miradores.',
        riskEn: 'Risk: Loss of tall border trees on slopes and plastic litter at viewpoints.',
        soundKey: 'toucan'
      },
      3: {
        roleEs: 'El Chinchero Chico y el Carpintero revisan cortezas extrayendo larvas xilófagas, manteniendo sanos los árboles.',
        roleEn: 'Narrow-billed Woodcreeper and Woodpeckers inspect bark for wood-boring larvae, keeping trees healthy.',
        riskEs: 'Riesgo: Extracción de ramas muertas o musgos epífitos que sirven de refugio y alimento.',
        riskEn: 'Risk: Removal of dead branches or epiphytic mosses that provide shelter and food.',
        soundKey: 'chinchero'
      },
      4: {
        roleEs: 'Polinización de bromelias y flores tubulares por el Picaflor Cometa y dispersión frugívora de tangarás.',
        roleEn: 'Pollination of bromeliads and tubular flowers by the Red-tailed Comet and fruit dispersal by tanagers.',
        riskEs: 'Riesgo: Introducción de especies vegetales exóticas invasoras que reemplazan la flora nativa.',
        riskEn: 'Risk: Introduction of invasive exotic plant species replacing native Yungas flora.',
        soundKey: 'hummingbird'
      },
      5: {
        roleEs: 'Corredor biológico de dosel para el Loro Alisero (En Peligro) y el Tucán Grande entre los 1334 y 1463 m.s.n.m.',
        roleEn: 'Canopy biological corridor for the Endangered Alder Amazon and Toco Toucan between 1334 and 1463 m.a.s.l.',
        riskEs: 'Riesgo: Fragmentación de la Selva Montana de las Yungas y captura ilegal de psitácidos.',
        riskEn: 'Risk: Fragmentation of the Yungas Montane Forest and illegal capture of parrots.',
        soundKey: 'parrot'
      },
      6: {
        roleEs: 'Regulación de insectos crepusculares por atajacaminos y lechuzas en los sectores sombríos del sendero.',
        roleEn: 'Regulation of crepuscular insects by nightjars and owls in shaded trail sectors.',
        riskEs: 'Riesgo: Uso de linternas o flash fotográfico directo que encandila a las aves de hábitos ocultos.',
        riskEn: 'Risk: Direct flash photography or bright lights dazzling cryptic and nocturnal birds.',
        soundKey: 'urutau'
      },
      7: {
        roleEs: 'Ciclado de nutrientes en el suelo forestal y dispersión de frutos silvestres por zorzales y cerqueros.',
        roleEn: 'Nutrient cycling on the forest floor and wild fruit dispersal by thrushes and brushfinches.',
        riskEs: 'Riesgo: Erosión del sendero cuando los visitantes salen del camino demarcado.',
        riskEn: 'Risk: Trail erosion when visitors step off the marked path.',
        soundKey: 'zorzal'
      },
      8: {
        roleEs: 'Limpieza ecológica del ecosistema por el Jote Real planeando en corrientes térmicas sobre el Valle de Jujuy.',
        roleEn: 'Ecological cleanup by the King Vulture soaring on thermal currents above the Jujuy Valley.',
        riskEs: 'Riesgo: Contaminación visual y lumínica en la frontera urbano-natural del barrio Los Perales.',
        riskEn: 'Risk: Visual and light pollution along the urban-nature boundary of Los Perales neighborhood.',
        soundKey: 'raptor'
      }
    };
    return data[cpId] || data[1];
  };

  const stationContext = getStationEcologicalContext(selectedCheckpoint.id);

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

  const circuitMapBgImage =
    completedCount >= 3
      ? '/assets/aistudio/Toucan_speaking_in_jungle_1ddde10b.jpg'
      : completedCount >= 1
      ? '/assets/aistudio/Buttons_with_padlocks_9c3df4ab.jpg'
      : '/assets/aistudio/Buttons_with_padlocks_2b5ce3b6.jpg';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-sm max-h-[95vh] flex flex-col rounded-3xl overflow-hidden bg-slate-900 border-2 border-teal-500 shadow-2xl">
        {/* Cabecera Oficial */}
        <div className="px-3.5 py-2.5 bg-slate-950 border-b border-teal-900/60">
          <div className="flex items-center justify-between gap-1.5 mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <Map className="w-5 h-5 text-teal-400 shrink-0" />
              <div className="min-w-0">
                <h3 className="font-extrabold text-xs sm:text-sm text-white tracking-wide truncate">
                  {tx('Estaciones Digitales y Senderos', 'Digital Stations & Trail Map')}
                </h3>
                <p className="text-[10px] text-teal-300 truncate">
                  {tx('Parque Botánico Municipal Barón Schuel', 'Barón Schuel Municipal Botanical Park')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <LanguageSelector />
              <button
                onClick={() => {
                  soundManager.playClick();
                  onClose();
                }}
                className="px-2.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-teal-200 hover:text-white text-[10px] font-bold flex items-center gap-1 border border-teal-700/60 shrink-0 shadow active:scale-95 transition-all"
              >
                <span>{tx('← Menú', '← Menu')}</span>
              </button>
            </div>
          </div>

          {/* Subheader info strip */}
          <div className="flex items-center justify-between text-[10px] text-teal-200/90 pt-1 border-t border-slate-800">
            <span className="flex items-center gap-1">
              <Mountain className="w-3 h-3 text-amber-400" />
              {tx('Altitud: 1334 - 1463 m.s.n.m.', 'Altitude: 1334 - 1463 m.a.s.l.')}
            </span>
            <span className="font-semibold text-amber-300">
              {tx('Recorrido: 2720 m (~2 hs)', 'Trail: 2720 m (~2 hrs)')}
            </span>
          </div>

          {/* Sello de Ruta Completa - Barra de Progreso */}
          <div className="mt-1.5 p-2 rounded-xl bg-teal-950/70 border border-teal-800/60">
            <div className="flex items-center justify-between text-[10px] font-bold mb-1">
              <span className="text-amber-300 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                {tx('Sello de Ruta Completa (8 Estaciones)', 'Complete Route Seal (8 Stations)')}
              </span>
              <span className={isRouteComplete ? 'text-emerald-300 font-extrabold' : 'text-teal-200'}>
                {completedCount}/8 {tx('estaciones', 'stations')} {isRouteComplete && '✓'}
              </span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-teal-900">
              <div
                className="h-full bg-gradient-to-r from-teal-400 via-amber-400 to-emerald-400 transition-all duration-500"
                style={{ width: `${Math.min(100, (completedCount / 8) * 100)}%` }}
              />
            </div>

            {isRouteComplete && (
              <button
                onClick={() => {
                  soundManager.playSuccess();
                  setShowRareBirdsModal(true);
                }}
                className="mt-1.5 w-full py-1 px-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-400/60 text-[10px] font-bold text-amber-300 flex items-center justify-center gap-1.5 animate-pulse"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {tx('¡Sello Logrado! Ver Aves Raras: Urutaú y Jote Real', 'Seal Unlocked! View Rare Birds: Common Potoo & King Vulture')}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Mapa Interactivo con Conmutador entre Circuito 3D con Candados (public/assets/aistudio/) y Plano Físico */}
        <div className="relative h-56 bg-[#D9E6B8] overflow-hidden border-b-2 border-teal-800 shrink-0">
          {mapVisualMode === 'circuit_3d' ? (
            <img
              src={circuitMapBgImage}
              alt="Circuito 3D con Candados"
              className="absolute inset-0 w-full h-full object-cover object-top"
            />
          ) : (
            <>
              {/* Marco Verde Oscuro del Plano Físico del Parque Botánico */}
              <div className="absolute inset-0 border-8 border-[#166534] pointer-events-none z-10" />

              {/* Vegetación de Yungas y Sendero Azul Serpenteante idéntico al Plano del Tablero de Miro */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <circle cx="24" cy="30" r="12" fill="#3F6212" opacity="0.35" />
                <circle cx="66" cy="24" r="14" fill="#365314" opacity="0.35" />
                <circle cx="32" cy="60" r="15" fill="#3F6212" opacity="0.35" />
                <circle cx="75" cy="68" r="14" fill="#365314" opacity="0.35" />

                <path
                  d="M 10 90 Q 14 85 18 82 Q 22 75 28 70 Q 34 78 42 75 Q 49 68 55 62 Q 62 52 68 48 Q 60 40 50 38 Q 42 32 38 26 Q 52 18 74 16 L 85 14"
                  fill="none"
                  stroke="#1E3A8A"
                  strokeWidth="4.6"
                  strokeLinecap="round"
                />
                <path
                  d="M 10 90 Q 14 85 18 82 Q 22 75 28 70 Q 34 78 42 75 Q 49 68 55 62 Q 62 52 68 48 Q 60 40 50 38 Q 42 32 38 26 Q 52 18 74 16 L 85 14"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />
              </svg>

              {/* Cartel Rojo "DESVÍO" del Plano Oficial en el Tablero de Miro */}
              <div
                className="absolute z-20 px-1.5 py-0.5 rounded bg-red-600 text-white font-black text-[8px] tracking-wider uppercase shadow-md border border-white transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{ left: '54%', top: '46%' }}
              >
                {tx('DESVÍO', 'DETOUR')}
              </div>
            </>
          )}

          {/* Marcadores Interactivos de las 8 Estaciones Digitales (Con Candados/Check) */}
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
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 ${
                    isDone
                      ? 'bg-emerald-600 text-white border-white shadow-md'
                      : isSelected
                      ? 'bg-amber-400 text-slate-950 border-slate-950'
                      : 'bg-slate-950/90 text-amber-300 border-amber-400 shadow'
                  }`}
                >
                  {isDone ? '✓' : `🔒${cp.id}`}
                </div>
              </button>
            );
          })}

          {/* Conmutador Superior entre Circuito 3D con Candados y Plano Físico */}
          <div className="absolute top-2 inset-x-2.5 z-30 flex items-center justify-between gap-1">
            <span className="px-2 py-0.5 rounded-full bg-slate-950/90 text-[9px] text-amber-300 font-black border border-amber-400/50 shadow">
              {mapVisualMode === 'circuit_3d'
                ? tx('🔒 Circuito 3D con Candados', '🔒 3D Padlock Circuit')
                : tx('🧭 Plano de Senderos', '🧭 Physical Trail Plan')}
            </span>
            <button
              onClick={() => {
                soundManager.playClick();
                setMapVisualMode(prev => (prev === 'circuit_3d' ? 'physical_plan' : 'circuit_3d'));
              }}
              className="px-2.5 py-0.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-[9px] font-black uppercase border border-slate-950 shadow cursor-pointer"
            >
              {mapVisualMode === 'circuit_3d'
                ? tx('Ver Plano Sendero', 'View Trail Plan')
                : tx('Ver Circuito 3D', 'View 3D Circuit')}
            </button>
          </div>
        </div>

        {/* Panel Inferior: Las 3 Capas de Experiencia de cada Estación Digital (Según Tablero de Miro) */}
        <div className="p-3 bg-slate-950/95 space-y-2.5 flex-1 overflow-y-auto">
          {/* Título de la Estación */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                  { localizedCp.id }
                </span>
                <h4 className="text-xs sm:text-sm font-black text-white">
                  {tx('Estación', 'Station')} #{localizedCp.id}: {localizedCp.name}
                </h4>
              </div>
              <div className="text-[10px] text-amber-400 font-semibold mt-0.5">
                {tx('Distancia:', 'Distance:')} {localizedCp.distanceMeters} m · {tx('Tipo:', 'Type:')} {localizedCp.type}
              </div>
            </div>

            <span
              className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border shrink-0 ${
                isCurrentCheckpointCompleted
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                  : 'bg-amber-950 text-amber-300 border-amber-500'
              }`}
            >
              {isCurrentCheckpointCompleted ? tx('VALIDADA ✓', 'VALIDATED ✓') : tx('ACTIVA', 'ACTIVE')}
            </span>
          </div>

          {/* CONMUTADOR DE LAS 3 CAPAS DE EXPERIENCIA DE LA ESTACIÓN (MIRO BOARD) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[9px] font-black text-teal-300 uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3 text-amber-400" />
                {tx('3 Capas de Experiencia en esta Estación:', '3 Experience Layers at this Station:')}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 bg-slate-900 p-1 rounded-2xl border border-teal-800/70">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setActiveStationLayer(1);
                }}
                className={`py-1.5 px-2 rounded-xl text-[10px] font-black transition-all flex flex-col items-center ${
                  activeStationLayer === 1
                    ? 'bg-sky-500 text-slate-950 shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>{tx('1. Descubrir', '1. Discover')}</span>
                <span className="text-[8px] font-bold opacity-80">{tx('Especies / RA', 'Species / AR')}</span>
              </button>

              <button
                onClick={() => {
                  soundManager.playClick();
                  setActiveStationLayer(2);
                }}
                className={`py-1.5 px-2 rounded-xl text-[10px] font-black transition-all flex flex-col items-center ${
                  activeStationLayer === 2
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>{tx('2. Comprender', '2. Understand')}</span>
                <span className="text-[8px] font-bold opacity-80">{tx('Ecología y Riesgo', 'Ecology & Risk')}</span>
              </button>

              <button
                onClick={() => {
                  soundManager.playClick();
                  setActiveStationLayer(3);
                }}
                className={`py-1.5 px-2 rounded-xl text-[10px] font-black transition-all flex flex-col items-center ${
                  activeStationLayer === 3
                    ? 'bg-emerald-400 text-slate-950 shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>{tx('3. Actuar', '3. Act')}</span>
                <span className="text-[8px] font-bold opacity-80">{tx('Desafío y Acción', 'Challenge & Act')}</span>
              </button>
            </div>
          </div>

          {/* CONTENIDO DE LA CAPA 1: DESCUBRIR (Visualizar e identificar mediante Realidad Aumentada) */}
          {activeStationLayer === 1 && (
            <div className="space-y-2 animate-fadeIn">
              <div className="text-[10px] font-bold text-sky-300 flex items-center gap-1">
                <Feather className="w-3 h-3" />
                <span>
                  {tx(
                    'Capa 1 (Descubrir): Visualiza e identifica las especies de esta estación:',
                    'Layer 1 (Discover): Visualize and identify the species at this station:'
                  )}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                {selectedCheckpoint.probableSpecies.map((bird, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-teal-950/60 border border-teal-800/50 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg p-1 rounded-lg bg-teal-900/60 border border-teal-700/50 shrink-0">
                        {bird.silhouetteIcon}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{bird.common}</div>
                        <div className="text-[9px] italic text-teal-300 font-serif truncate">{bird.scientific}</div>
                        <p className="text-[9px] text-slate-300 line-clamp-1">{bird.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => soundManager.playBirdSound(bird.common)}
                      className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 text-[9px] font-black flex items-center gap-1 shrink-0"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>{tx('Canto', 'Call')}</span>
                    </button>
                  </div>
                ))}
              </div>

              {onOpenXRVision && (
                <button
                  onClick={() => {
                    soundManager.playClick();
                    onClose();
                    onOpenXRVision();
                  }}
                  className="w-full py-2.5 px-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg"
                >
                  <Binoculars className="w-4 h-4" />
                  <span>{tx('Abrir Visor de Realidad Aumentada (XR)', 'Open Augmented Reality (XR) Viewer')}</span>
                </button>
              )}
            </div>
          )}

          {/* CONTENIDO DE LA CAPA 2: COMPRENDER (Función ecológica y riesgos que enfrenta) */}
          {activeStationLayer === 2 && (
            <div className="space-y-2 animate-fadeIn">
              <div className="p-2.5 rounded-2xl bg-teal-950/80 border border-teal-500/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-teal-300 uppercase">
                    🌿 {tx('Función Ecológica en las Yungas:', 'Ecological Role in the Yungas:')}
                  </span>
                  <button
                    onClick={() => soundManager.playBirdSound(stationContext.soundKey)}
                    className="px-2 py-0.5 rounded-lg bg-amber-400 text-slate-950 text-[9px] font-black flex items-center gap-1"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>{tx('Escuchar Bioacústica', 'Listen Bioacoustics')}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-100 leading-snug">
                  {lang === 'en' ? stationContext.roleEn : stationContext.roleEs}
                </p>
              </div>

              <div className="p-2.5 rounded-2xl bg-rose-950/60 border border-rose-500/50 space-y-1">
                <span className="text-[10px] font-black text-rose-300 uppercase flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>{tx('Riesgos de Conservación en el Entorno:', 'Conservation Risks in the Area:')}</span>
                </span>
                <p className="text-[11px] text-rose-100 leading-snug">
                  {lang === 'en' ? stationContext.riskEn : stationContext.riskEs}
                </p>
              </div>

              {onOpenBirdsCatalog && (
                <button
                  onClick={() => {
                    soundManager.playClick();
                    onClose();
                    onOpenBirdsCatalog();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-[11px] border border-amber-400/40 flex items-center justify-center gap-1.5"
                >
                  <span>{tx('Ver Fichas Técnicas y Siluetas de la Guía', 'View Guide Technical Sheets & Silhouettes')}</span>
                </button>
              )}
            </div>
          )}

          {/* CONTENIDO DE LA CAPA 3: ACTUAR (Responder un desafío y reconocer acciones de conservación) */}
          {activeStationLayer === 3 && (
            <div className="space-y-2 animate-fadeIn">
              <div className="p-2.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 space-y-1.5 text-[11px] text-emerald-100">
                <div className="font-black text-amber-300 text-[10px] uppercase">
                  🛡️ {tx('Capa 3 (Actuar): Desafío de Conservación in situ', 'Layer 3 (Act): On-site Conservation Challenge')}
                </div>
                <p className="leading-snug">
                  {tx(
                    'Responde el desafío de esta estación digital para validar tu paso por el sendero y comprometerte con el cuidado de la Reserva Barón Schuel.',
                    'Answer this digital station challenge to validate your trail progress and commit to protecting Baron Schuel Reserve.'
                  )}
                </p>
              </div>

              <button
                onClick={handleOpenChallenge}
                className="w-full py-2.5 px-3 rounded-2xl game-btn-orange text-white text-xs font-black tracking-wide uppercase flex items-center justify-center gap-2 shadow-lg"
              >
                <QrCode className="w-4 h-4" />
                <span>
                  {isCurrentCheckpointCompleted
                    ? tx('Repasar Desafío de la Estación (+25 XP)', 'Review Station Challenge (+25 XP)')
                    : tx('Responder Desafío de la Estación (+25 XP)', 'Answer Station Challenge (+25 XP)')}
                </span>
              </button>

              {onOpenSquadsAndSeasons && (
                <button
                  onClick={() => {
                    soundManager.playClick();
                    onClose();
                    onOpenSquadsAndSeasons();
                  }}
                  className="w-full py-2 px-3 rounded-2xl game-btn-mint text-emerald-950 text-[11px] font-black tracking-wide uppercase flex items-center justify-center gap-1.5 shadow"
                >
                  <span>{tx('🛡️ Sumar Avance a Cuadrillas y Temporadas', '🛡️ Add Progress to Squads & Seasons')}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL DEL DESAFÍO QR / GPS DE LA PARADA */}
      {showChallengeModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md animate-fadeIn">
          <input
            ref={qrFileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                if (typeof reader.result === 'string') {
                  stopQrCamera();
                  setQrCameraError(null);
                  setQrNativePhoto(reader.result);
                }
              };
              reader.readAsDataURL(file);
            }}
            className="hidden"
          />
          <div className="relative w-full max-w-xs max-h-[92vh] overflow-y-auto rounded-3xl bg-slate-900 border-2 border-teal-400 p-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-teal-800">
              <div className="flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white">
                  {tx('ESCÁNER QR Y DESAFÍO DE ESTACIÓN', 'QR SCANNER & STATION CHALLENGE')}
                </h4>
              </div>
              <button
                onClick={() => {
                  soundManager.playClick();
                  stopQrCamera();
                  setShowChallengeModal(false);
                }}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Visor de Cámara QR para Móviles (Android / iOS Safari) */}
            <div className="mt-2.5 space-y-1.5">
              <div className="flex items-center justify-between gap-1">
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    if (qrCameraActive) stopQrCamera();
                    else startQrCamera(qrFacingMode);
                  }}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-[10px] font-black flex items-center justify-center gap-1 border border-teal-400 shadow cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>
                    {qrCameraActive
                      ? tx('Cerrar Escáner QR', 'Close QR Scanner')
                      : tx('📷 Activar Cámara QR', '📷 Enable QR Camera')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    const nextMode: 'environment' | 'user' =
                      qrFacingMode === 'environment' ? 'user' : 'environment';
                    setQrFacingMode(nextMode);
                    startQrCamera(nextMode);
                  }}
                  className="py-1.5 px-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-black flex items-center gap-1 border border-slate-900 shadow cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>🔄 Girar Cámara</span>
                </button>
              </div>

              {(qrCameraActive || qrNativePhoto || qrCameraError) && (
                <div className="relative h-36 rounded-2xl overflow-hidden bg-black border-2 border-teal-400 flex items-center justify-center">
                  {qrCameraActive ? (
                    <video
                      ref={(el) => {
                        qrVideoRef.current = el;
                        if (el && qrStreamRef.current && el.srcObject !== qrStreamRef.current) {
                          el.srcObject = qrStreamRef.current;
                          el.setAttribute('playsinline', 'true');
                          el.setAttribute('webkit-playsinline', 'true');
                          el.muted = true;
                          el.play().catch(() => {});
                        }
                      }}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover ${
                        qrFacingMode === 'user' ? 'transform -scale-x-100' : ''
                      }`}
                    />
                  ) : qrNativePhoto ? (
                    <img
                      src={qrNativePhoto}
                      alt="Código QR capturado"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="p-3 text-center space-y-1.5">
                      <p className="text-[10px] text-amber-300">{qrCameraError}</p>
                      <button
                        type="button"
                        onClick={() => qrFileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 text-[10px] font-black"
                      >
                        📷 Usar Cámara del Teléfono
                      </button>
                    </div>
                  )}

                  {/* Marco de enfoque QR */}
                  <div className="absolute inset-4 border-2 border-dashed border-amber-400/80 rounded-xl pointer-events-none flex items-end justify-center pb-1">
                    <span className="px-2 py-0.5 rounded bg-black/70 text-[9px] text-amber-300 font-bold">
                      {tx('Apunta al QR del poste del sendero', 'Point at the trail post QR')}
                    </span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => qrFileInputRef.current?.click()}
                className="w-full py-1 text-[10px] text-teal-300 underline hover:text-white text-center cursor-pointer"
              >
                {tx('¿Cámara bloqueada? Usar Cámara Nativa del Teléfono', 'Camera blocked? Use Native Phone Camera')}
              </button>
            </div>

            <div className="py-3 space-y-2.5">
              <div className="text-[10px] text-teal-300 font-semibold">
                {tx('Estación', 'Station')} {localizedCp.id}: {localizedCp.name} (+25 XP)
              </div>
              <p className="text-xs font-bold text-white leading-snug">
                {localizedCp.challenge.question}
              </p>

              <div className="space-y-1.5 pt-1">
                {localizedCp.challenge.options.map((option, idx) => {
                  const isSelected = selectedChallengeOption === idx;
                  const isCorrect = idx === localizedCp.challenge.correctIndex;

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

              {challengeSubmitted && (
                <div
                  className={`p-2.5 rounded-xl text-[10px] leading-relaxed ${
                    selectedChallengeOption === localizedCp.challenge.correctIndex
                      ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-200'
                      : 'bg-amber-950/80 border border-amber-500/50 text-amber-200'
                  }`}
                >
                  <span className="font-bold block mb-0.5">
                    {selectedChallengeOption === localizedCp.challenge.correctIndex
                      ? tx('¡ESTACIÓN VALIDADA CON ÉXITO! (+25 XP)', 'STATION VALIDATED! (+25 XP)')
                      : tx('CONSEJO DE CONSERVACIÓN:', 'CONSERVATION TIP:')}
                  </span>
                  {localizedCp.challenge.explanation}
                </div>
              )}
            </div>

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
                  {tx('CONFIRMAR RESPUESTA', 'CONFIRM ANSWER')}
                </button>
              ) : (
                <button
                  onClick={() => {
                    soundManager.playClick();
                    stopQrCamera();
                    setShowChallengeModal(false);
                  }}
                  className="w-full py-2.5 rounded-xl game-btn-mint text-emerald-950 font-bold text-xs"
                >
                  {tx('LISTO · CONTINUAR RECORRIDO', 'DONE · CONTINUE TRAIL')}
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
                <h4 className="text-xs font-bold text-white uppercase">
                  {tx('Aves Raras Desbloqueadas', 'Unlocked Rare Birds')}
                </h4>
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

            <div className="flex gap-2 py-2">
              {RARE_BIRDS_DATA.map((bird) => (
                <button
                  key={bird.id}
                  onClick={() => {
                    soundManager.playBirdSound(bird.soundType || bird.id);
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
                  <span className="font-bold text-amber-300 block mb-0.5">
                    📜 {tx('LEYENDA ANCESTRAL:', 'ANCESTRAL LEGEND:')}
                  </span>
                  {selectedRareBird.legend}
                </div>
              )}

              <div className="p-2 rounded-xl bg-teal-950/60 border border-teal-800/40 text-[10px] text-teal-200">
                <span className="font-bold text-teal-300 block mb-0.5">
                  🌿 {tx('CURIOSIDAD DE LAS YUNGAS:', 'YUNGAS FUN FACT:')}
                </span>
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
                {tx('Cerrar y Continuar Explorando', 'Close & Continue Exploring')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
