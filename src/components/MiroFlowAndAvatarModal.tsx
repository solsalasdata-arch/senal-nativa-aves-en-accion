import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  User,
  Binoculars,
  Sparkles,
  Map,
  Camera,
  BookOpen,
  ShoppingBag,
  Award,
  ArrowRight,
  Compass,
  Eye,
  ShieldCheck,
  Volume2,
  Layers,
  ZoomIn,
  ZoomOut,
  Check
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { PlayerProfile, CompanionBirdId } from '../types/game';
import { COMPANION_BIRDS_OPTIONS, SHOP_ITEMS, EXPLORER_AVATARS } from '../data/birdsData';
import { AvatarIcon } from './AvatarIcon';
import { useLanguage, LanguageSelector } from '../utils/i18n';

interface MiroFlowAndAvatarModalProps {
  isOpen: boolean;
  initialMode?: 'yo_jugadores' | 'miro_flow' | 'character_study';
  onClose: () => void;
  activeProfile: PlayerProfile;
  profiles: PlayerProfile[];
  onSelectProfile: (profileId: string) => void;
  onSelectCompanionBird: (birdName: CompanionBirdId) => void;
  onUpdateAvatar?: (avatarId: string, avatarIcon: string, favoriteBird?: CompanionBirdId) => void;
  onNavigateToScreen: (screen: 'screen1' | 'screen2' | 'screen3' | 'screen4') => void;
  onOpenMap: () => void;
  onOpenSighting: () => void;
  onOpenBirds: () => void;
  onOpenShop: () => void;
  onOpenSquads: () => void;
  onOpenQuiz: () => void;
}

export const MiroFlowAndAvatarModal: React.FC<MiroFlowAndAvatarModalProps> = ({
  isOpen,
  initialMode = 'yo_jugadores',
  onClose,
  activeProfile,
  profiles,
  onSelectProfile,
  onSelectCompanionBird,
  onUpdateAvatar,
  onNavigateToScreen,
  onOpenMap,
  onOpenSighting,
  onOpenBirds,
  onOpenShop,
  onOpenSquads,
  onOpenQuiz
}) => {
  const { tx } = useLanguage();
  const [topSection, setTopSection] = useState<'yo_jugadores' | 'miro_flow' | 'character_study'>(initialMode);
  const [profileSubTab, setProfileSubTab] = useState<'yo' | 'jugadores'>('yo');
  const [selectedStudyAngle, setSelectedStudyAngle] = useState<'flight' | 'frontal' | 'side' | 'back'>('flight');
  const [zoomBoard, setZoomBoard] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTopSection(initialMode);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  // Companion nickname mapping inspired by Miro board ("Juan01P & Jatur")
  const companionNicknames: Record<string, string> = {
    'Tucán Grande': 'Jatur (Tucán)',
    'Chinchero Chico': 'Karu (Chinchero)',
    'Benteveo': 'Inti (Benteveo)',
    'Loro Alisero': 'Yunga (Alisero)',
    'Picaflor Cometa': 'Qori (Cometa)'
  };

  const companionShortName = companionNicknames[activeProfile.favoriteBird] || activeProfile.favoriteBird;

  const studyAngles = [
    {
      id: 'flight' as const,
      title: tx('VISTA EN VUELO', 'IN-FLIGHT VIEW'),
      subtitle: tx('Alas desplegadas pardo-rufas', 'Outstretched rufous-brown wings'),
      desc: tx(
        'En vuelo corto entre troncos de la Selva Montana, despliega sus rémiges rufas y cola rígida que actúa como timón.',
        'In short flights between montane forest trunks, it spreads its rufous flight feathers and stiff tail acting as a rudder.'
      ),
      cropClass: 'object-[18%_22%] scale-[1.85]'
    },
    {
      id: 'frontal' as const,
      title: tx('RETRATO FRONTAL', 'FRONTAL PORTRAIT'),
      subtitle: tx('Ceja blanquecina y garganta clara', 'Whitish supercilium & pale throat'),
      desc: tx(
        'De frente se distingue su marcada ceja superciliar blanca, pecho estriado claro y mirada atenta para detectar artrópodos.',
        'From the front, its bold white supercilium, pale streaked chest, and alert gaze for spotting arthropods stand out.'
      ),
      cropClass: 'object-[82%_22%] scale-[1.85]'
    },
    {
      id: 'side' as const,
      title: tx('PERFIL TREPADOR', 'LATERAL BARK CLIMB'),
      subtitle: tx('Pico largo y decurvado tipo pinza', 'Long decurved forceps-like bill'),
      desc: tx(
        'Perfil característico trepando cortezas: pico fino curvado hacia abajo para extraer insectos bajo líquenes y musgos.',
        'Characteristic bark-climbing profile: slender downward-curved bill to extract insects beneath lichens and moss.'
      ),
      cropClass: 'object-[20%_82%] scale-[1.85]'
    },
    {
      id: 'back' as const,
      title: tx('PLUMAJE DORSAL', 'DORSAL PLUMAGE'),
      subtitle: tx('Camuflaje críptico en troncos', 'Cryptic tree-trunk camouflage'),
      desc: tx(
        'Dorso pardo-rojizo mimetizado con la corteza de los árboles del Parque Botánico Barón Schuel y timoneras con astiles rígidos.',
        'Reddish-brown back camouflaged with tree bark in Baron Schuel Botanical Park and tail feathers with stiff shafts.'
      ),
      cropClass: 'object-[82%_82%] scale-[1.85]'
    }
  ];

  const activeAngleInfo = studyAngles.find(a => a.id === selectedStudyAngle) || studyAngles[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 bg-black/90 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-sm h-[94vh] max-h-[860px] flex flex-col rounded-3xl overflow-hidden bg-slate-900 border-2 border-teal-400 shadow-2xl">
        {/* TOP NAVIGATION SWITCHER */}
        <div className="px-3 py-2.5 bg-slate-950 border-b border-teal-900/80 flex items-center justify-between gap-1.5 shrink-0">
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-teal-800/60 flex-1">
            <button
              onClick={() => {
                soundManager.playClick();
                setTopSection('yo_jugadores');
              }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-black uppercase tracking-wide transition-all flex items-center justify-center gap-1 ${
                topSection === 'yo_jugadores'
                  ? 'bg-amber-400 text-slate-950 shadow'
                  : 'text-teal-200 hover:text-white'
              }`}
            >
              <User className="w-3 h-3" />
              <span>{tx('YO / JUGADORES', 'ME / PLAYERS')}</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setTopSection('character_study');
              }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-black uppercase tracking-wide transition-all flex items-center justify-center gap-1 ${
                topSection === 'character_study'
                  ? 'bg-teal-400 text-slate-950 shadow'
                  : 'text-teal-200 hover:text-white'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>{tx('ESTUDIO 3D', '3D STUDY')}</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setTopSection('miro_flow');
              }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-black uppercase tracking-wide transition-all flex items-center justify-center gap-1 ${
                topSection === 'miro_flow'
                  ? 'bg-sky-400 text-slate-950 shadow'
                  : 'text-teal-200 hover:text-white'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>{tx('FLUJO MIRO', 'MIRO FLOW')}</span>
            </button>
          </div>

          <LanguageSelector />

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 shrink-0"
            title={tx('Cerrar', 'Close')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* =================================================================== */}
        {/* VISTA 1: PANTALLA "YO / JUGADORES" (DISEÑO EXACTO TABLERO DE MIRO) */}
        {/* =================================================================== */}
        {topSection === 'yo_jugadores' && (
          <div className="relative flex-1 flex flex-col justify-between overflow-y-auto bg-gradient-to-b from-[#FDF6E2] via-[#F7E8C4] to-[#EED59A] text-slate-900 p-3.5">
            {/* Sello de Agua del Parque Botánico en el Fondo */}
            <div className="pointer-events-none absolute -top-8 -left-8 w-56 h-56 rounded-full border-8 border-emerald-800/10 flex items-center justify-center opacity-25">
              <div className="w-44 h-44 rounded-full border-4 border-emerald-800/15 flex flex-col items-center justify-center text-center p-4">
                <span className="text-[9px] font-black text-emerald-950 tracking-widest uppercase">
                  PARQUE BOTÁNICO MUNICIPAL
                </span>
                <span className="text-3xl my-1">🌿</span>
                <span className="text-[8px] font-black text-emerald-950 tracking-widest uppercase">
                  BARÓN CARLOS MARÍA SCHUEL
                </span>
              </div>
            </div>

            {/* Cabecera Superior Estilo Pokémon GO / Miro: Pestañas "YO" | "JUGADORES" + Logo "AVES EN ACCIÓN" */}
            <div className="relative z-10 flex items-center justify-between border-b-2 border-amber-700/20 pb-2">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setProfileSubTab('yo');
                  }}
                  className={`text-xs font-black uppercase tracking-wider pb-1 border-b-3 transition-all cursor-pointer ${
                    profileSubTab === 'yo'
                      ? 'text-emerald-950 border-amber-500 scale-105'
                      : 'text-slate-500 border-transparent hover:text-slate-800'
                  }`}
                >
                  {tx('YO', 'ME')}
                </button>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setProfileSubTab('jugadores');
                  }}
                  className={`text-xs font-black uppercase tracking-wider pb-1 border-b-3 transition-all cursor-pointer flex items-center gap-1 ${
                    profileSubTab === 'jugadores'
                      ? 'text-emerald-950 border-amber-500 scale-105'
                      : 'text-slate-500 border-transparent hover:text-slate-800'
                  }`}
                >
                  <span>{tx('JUGADORES', 'PLAYERS')}</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-900 text-[9px] font-black">
                    {profiles.length}
                  </span>
                </button>
              </div>

              {/* Logo "AVES EN ACCIÓN" esquina superior derecha */}
              <div className="px-2.5 py-1 rounded-xl bg-gradient-to-b from-sky-500 to-teal-700 border-2 border-amber-300 shadow-md text-center">
                <div className="text-[11px] font-black text-amber-300 leading-none tracking-wider drop-shadow">
                  {tx('AVES', 'BIRDS')}
                </div>
                <div className="text-[8px] font-black text-white leading-none tracking-widest">
                  {tx('EN ACCIÓN', 'IN ACTION')}
                </div>
              </div>
            </div>

            {profileSubTab === 'yo' ? (
              <>
                {/* Nombre del Explorador & Ave Compañera ("Juan01P & Jatur") */}
                <div className="relative z-10 mt-2 flex items-start justify-between">
                  <div>
                    <div className="text-lg font-black text-amber-800 tracking-tight leading-none">
                      {activeProfile.name}
                    </div>
                    <div className="text-xs font-extrabold text-amber-700 mt-0.5 flex items-center gap-1">
                      <span>&amp; {companionShortName}</span>
                      <button
                        onClick={() => soundManager.playBirdSound(activeProfile.favoriteBird)}
                        className="w-5 h-5 rounded-full bg-amber-400/80 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow"
                        title={tx('Escuchar canto de tu ave compañera', 'Listen to your companion bird call')}
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Prendas Equipadas */}
                  <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-amber-500/40 shadow-sm">
                    {SHOP_ITEMS.filter(it =>
                      (activeProfile.equippedItems || ['visera-oficial']).includes(it.id)
                    ).map(it => (
                      <span key={it.id} className="text-sm" title={it.name}>
                        {it.icon}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Escena Central con Lámina Oficial "YO / JUGADORES" y "HISTORIAL DE AVES" de public/assets/aistudio/ */}
                <div className="relative z-10 grid grid-cols-12 gap-2 items-center my-1">
                  {/* Columna Izquierda (7 cols): Vista Oficial de Avatar de Cuerpo Entero con Ave en el Hombro */}
                  <div className="col-span-7 flex flex-col items-center">
                    <div className="relative w-full h-56 rounded-3xl bg-slate-950 border-2 border-amber-500/70 flex flex-col items-center justify-center overflow-hidden shadow-xl">
                      <img
                        src={
                          activeProfile.avatarIcon && activeProfile.avatarIcon.startsWith('/')
                            ? activeProfile.avatarIcon
                            : selectedStudyAngle === 'frontal'
                              ? '/assets/aistudio/Replace_clothing_store_with_birds_e4924cc4.jpg'
                              : '/assets/aistudio/Editing_icons_and_background_colors_c78a8c38.jpg'
                        }
                        alt="Avatar YO / JUGADORES"
                        className={`w-full h-full ${
                          activeProfile.avatarIcon && activeProfile.avatarIcon.startsWith('/')
                            ? 'object-contain bg-teal-100'
                            : 'object-cover object-top'
                        }`}
                      />
                      <div className="absolute top-1.5 right-1.5 flex gap-1">
                        <button
                          onClick={() => {
                            soundManager.playClick();
                            setSelectedStudyAngle(
                              selectedStudyAngle === 'frontal' ? 'flight' : 'frontal'
                            );
                          }}
                          className="px-2 py-0.5 rounded-full bg-slate-950/90 text-amber-300 border border-amber-400/70 text-[8px] font-black uppercase shadow"
                        >
                          {selectedStudyAngle === 'frontal'
                            ? tx('Ver Avatar YO', 'View ME Avatar')
                            : tx('Ver Historial Aves', 'View Bird History')}
                        </button>
                      </div>
                      {/* Etiqueta del Ave Compañera en el hombro */}
                      <div className="absolute bottom-1.5 inset-x-2 px-2 py-0.5 rounded-full bg-slate-900/90 text-amber-300 text-[9px] font-black text-center truncate border border-amber-400/50">
                        🦜 {tx('Compañera:', 'Companion:')} {activeProfile.favoriteBird}
                      </div>
                    </div>
                  </div>

                  {/* Columna Derecha (5 cols): Globo de Diálogo + Tucán Guía + 3 Botones Circulares del Tablero ("HISTORIAL DE AVES", "DIARIO", "ACCESORIOS") */}
                  <div className="col-span-5 flex flex-col items-center justify-between h-full space-y-2">
                    <div className="relative bg-white text-slate-900 p-2 rounded-2xl border-2 border-slate-900 shadow-lg text-center">
                      <p className="text-[9.5px] font-black leading-snug">
                        {tx(
                          '"Puedes hacer tu propio avatar teniendo como compañera a una de las aves"',
                          '"You can create your own avatar having one of the birds as your companion"'
                        )}
                      </p>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-slate-900 rotate-45" />
                    </div>

                    <div className="relative w-20 h-20 rounded-full border-3 border-amber-500 overflow-hidden shadow-xl bg-teal-950">
                      <img
                        src="/assets/aistudio/Toucan_perched_on_branch_8ab41bfc_230157f9.jpg"
                        alt="Tucán Guía"
                        className="w-full h-full object-cover object-[center_18%] scale-125"
                      />
                    </div>

                    {/* 3 Botones Circulares Oficiales del Prototipo: HISTORIAL DE AVES | DIARIO | ACCESORIOS */}
                    <div className="grid grid-cols-3 gap-1 w-full pt-0.5">
                      <button
                        onClick={() => {
                          soundManager.playClick();
                          setSelectedStudyAngle(
                            selectedStudyAngle === 'frontal' ? 'flight' : 'frontal'
                          );
                        }}
                        className="flex flex-col items-center p-1 rounded-xl bg-teal-700 hover:bg-teal-600 text-white border border-amber-300 shadow"
                        title={tx('Historial de Aves', 'Bird History')}
                      >
                        <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                        <span className="text-[7px] font-black uppercase leading-tight mt-0.5 text-center">
                          {tx('HISTORIAL', 'BIRDS')}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          soundManager.playClick();
                          onClose();
                          onOpenBirds();
                        }}
                        className="flex flex-col items-center p-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-700 shadow"
                        title={tx('Diario de Aventuras', 'Adventure Diary')}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span className="text-[7px] font-black uppercase leading-tight mt-0.5 text-center">
                          {tx('DIARIO', 'DIARY')}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          soundManager.playClick();
                          onClose();
                          onOpenShop();
                        }}
                        className="flex flex-col items-center p-1 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-amber-200 border border-amber-400 shadow"
                        title={tx('Tienda de Ropa y Accesorios', 'Clothing & Accessories Shop')}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span className="text-[7px] font-black uppercase leading-tight mt-0.5 text-center">
                          {tx('ACCESORIOS', 'GEAR')}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Selector Rápido de Ave Compañera y Personaje */}
                <div className="relative z-10 bg-white/80 backdrop-blur-sm rounded-2xl p-2.5 border border-amber-700/25 space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-emerald-950 uppercase">
                      {tx('Cambiar Ave Compañera en tu Hombro:', 'Change Shoulder Companion Bird:')}
                    </span>
                    <span className="text-[9px] font-bold text-amber-800">
                      {tx('Toca para elegir y escuchar', 'Tap to select & listen')}
                    </span>
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {COMPANION_BIRDS_OPTIONS.map((bird) => {
                      const isSelected = activeProfile.favoriteBird === bird.name;
                      return (
                        <button
                          key={bird.name}
                          onClick={() => {
                            soundManager.playBirdSound(bird.name);
                            onSelectCompanionBird(bird.name);
                          }}
                          className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black shrink-0 border transition-all flex items-center gap-1 ${
                            isSelected
                              ? 'bg-emerald-900 text-amber-300 border-amber-500 shadow'
                              : 'bg-amber-50 text-slate-800 border-amber-300 hover:bg-amber-100'
                          }`}
                        >
                          <span>{bird.name}</span>
                          {isSelected && <Check className="w-3 h-3 text-amber-300" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Selector Rápido de Personaje */}
                  {onUpdateAvatar && (
                    <div className="pt-1 border-t border-amber-700/15 flex items-center justify-between gap-1.5">
                      <span className="text-[9px] font-black text-slate-700 uppercase shrink-0">
                        {tx('Avatar:', 'Avatar:')}
                      </span>
                      <div className="flex gap-1 overflow-x-auto">
                        {EXPLORER_AVATARS.map((av) => {
                          const isCurrent = activeProfile.avatarId === av.id;
                          return (
                            <button
                              key={av.id}
                              onClick={() => {
                                soundManager.playClick();
                                onUpdateAvatar(av.id, av.icon, av.favoriteBird);
                              }}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border flex items-center gap-1 ${
                                isCurrent
                                  ? 'bg-amber-400 text-slate-950 border-amber-600 font-black'
                                  : 'bg-white text-slate-700 border-slate-300'
                              }`}
                            >
                              <AvatarIcon icon={av.icon} className="w-4 h-4" alt={av.name} />
                              <span>{av.name.split(' ')[0]}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Barra Inferior Estilo Pokémon GO del Tablero de Miro: Nivel Dorado + Barra XP + Botón Prismáticos */}
                <div className="relative z-10 mt-2 pt-2 border-t-2 border-amber-700/20 flex items-center justify-between gap-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-amber-500 drop-shadow-[0_2px_1px_rgba(0,0,0,0.35)]">
                      {activeProfile.level}
                    </span>
                    <span className="text-[10px] font-black text-amber-900 uppercase">
                      {tx('NIVEL', 'LEVEL')}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="h-3 rounded-full bg-amber-950/20 border border-amber-600/40 overflow-hidden p-0.5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-300"
                        style={{ width: `${Math.min(100, Math.max(25, (activeProfile.xp % 200) / 2))}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-black text-amber-900 mt-0.5">
                      <span>{activeProfile.xp.toLocaleString()} XP</span>
                      <span>
                        {tx('Avistamientos:', 'Sightings:')} {activeProfile.sightingsCompleted} ·{' '}
                        {tx('Estaciones:', 'Stations:')} {activeProfile.completedCheckpoints?.length || 0}/8
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      soundManager.playClick();
                      onClose();
                      onOpenSighting();
                    }}
                    className="w-11 h-11 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 border-2 border-slate-900 shadow-lg flex items-center justify-center active:scale-95 transition-transform"
                    title={tx('Ir a Avistamiento XR con Prismáticos', 'Go to XR Sighting with Binoculars')}
                  >
                    <Binoculars className="w-5 h-5 stroke-[2.5]" />
                  </button>
                </div>
              </>
            ) : (
              /* PESTAÑA "JUGADORES" (LISTA DE EXPLORADORES Y ACCESO A CUADRILLAS) */
              <div className="relative z-10 flex-1 flex flex-col justify-between py-2 space-y-2.5 overflow-y-auto">
                <div className="space-y-2">
                  <div className="text-xs font-black text-emerald-950 uppercase">
                    {tx('Exploradores Registrados en el Parque:', 'Registered Explorers in the Park:')}
                  </div>
                  {profiles.map((prof) => {
                    const isCurrent = prof.id === activeProfile.id;
                    return (
                      <div
                        key={prof.id}
                        onClick={() => {
                          soundManager.playClick();
                          onSelectProfile(prof.id);
                          setProfileSubTab('yo');
                        }}
                        className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                          isCurrent
                            ? 'bg-emerald-950 text-white border-amber-400 shadow-lg'
                            : 'bg-white/90 text-slate-900 border-amber-700/30 hover:border-emerald-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl p-1.5 rounded-xl bg-amber-400/20 flex items-center justify-center overflow-hidden">
                            <AvatarIcon icon={prof.avatarIcon} className="w-8 h-8" alt={prof.name} />
                          </span>
                          <div>
                            <div className="text-xs font-black flex items-center gap-1.5">
                              <span>{prof.name}</span>
                              <span className="text-amber-400 font-bold">
                                &amp; {prof.favoriteBird}
                              </span>
                            </div>
                            <div className={`text-[10px] ${isCurrent ? 'text-teal-200' : 'text-slate-600'}`}>
                              {tx('Nivel', 'Level')} {prof.level} · {prof.xp} XP ·{' '}
                              {prof.completedCheckpoints?.length || 0}/8 {tx('Estaciones', 'Stations')}
                            </div>
                          </div>
                        </div>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black">
                            {tx('ACTIVO', 'ACTIVE')}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-2 pt-2 border-t border-amber-800/20">
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      onClose();
                      onOpenSquads();
                    }}
                    className="w-full py-2.5 px-3 rounded-2xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Users className="w-4 h-4" />
                    <span>{tx('Ver Cuadrillas Escolares y Ranking Amigable', 'View School Squads & Friendly Ranking')}</span>
                  </button>

                  <button
                    onClick={() => {
                      soundManager.playClick();
                      onClose();
                      onNavigateToScreen('screen2');
                    }}
                    className="w-full py-2 px-3 rounded-2xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <span>{tx('+ Crear Nuevo Perfil de Explorador', '+ Create New Explorer Profile')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* VISTA 2: "WOODCREEPER - CHARACTER STUDY" (OBJETOS Y PERSONAJES 3D)  */}
        {/* =================================================================== */}
        {topSection === 'character_study' && (
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-950 text-white">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-teal-950 to-slate-900 border border-teal-500/50 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black text-amber-300 uppercase tracking-widest block">
                  {tx('OBJETOS Y PERSONAJES 3D · MIRO', '3D OBJECTS & CHARACTERS · MIRO')}
                </span>
                <h4 className="text-sm font-black text-white">
                  WOODCREEPER - CHARACTER STUDY
                </h4>
                <p className="text-[10px] text-teal-300 italic">
                  Chinchero Chico (Lepidocolaptes angustirostris) · Furnariidae
                </p>
              </div>
              <button
                onClick={() => soundManager.playChincheroCall()}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[10px] flex items-center gap-1 shadow"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{tx('Trino', 'Trill')}</span>
              </button>
            </div>

            {/* Grilla de las 4 Vistas del Estudio de Personaje del Tablero de Miro */}
            <div className="grid grid-cols-2 gap-2">
              {studyAngles.map((ang) => {
                const isSelected = selectedStudyAngle === ang.id;
                return (
                  <button
                    key={ang.id}
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedStudyAngle(ang.id);
                    }}
                    className={`p-2 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-teal-950/90 border-amber-400 shadow-lg ring-2 ring-amber-400/30'
                        : 'bg-slate-900/90 border-slate-800 hover:border-teal-600'
                    }`}
                  >
                    <div className="relative w-full h-24 rounded-xl overflow-hidden bg-white mb-1.5 border border-slate-700">
                      <img
                        src="/assets/aistudio/chinchero_chico_portrait.jpg"
                        alt={ang.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-slate-950/85 text-amber-300 text-[8px] font-black">
                        {ang.id.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[10px] font-black text-white leading-tight">{ang.title}</div>
                    <div className="text-[9px] text-teal-300 truncate">{ang.subtitle}</div>
                  </button>
                );
              })}
            </div>

            {/* Detalle Anatómico de la Vista Seleccionada */}
            <div className="p-3 rounded-2xl bg-slate-900 border border-teal-700/60 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-300">{activeAngleInfo.title}</span>
                <span className="text-[10px] font-bold text-teal-300">21 cm · 36 g</span>
              </div>
              <p className="text-[11px] text-slate-200 leading-relaxed">{activeAngleInfo.desc}</p>
            </div>

            {/* Botón directo para probar el modelo en el Visor de Realidad Aumentada */}
            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
                onOpenSighting();
              }}
              className="w-full py-3 rounded-2xl game-btn-orange text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl"
            >
              <Binoculars className="w-4 h-4" />
              <span>{tx('Abrir Chinchero Chico en Visor XR', 'Open Narrow-billed Woodcreeper in XR')}</span>
            </button>
          </div>
        )}

        {/* =================================================================== */}
        {/* VISTA 3: ARQUITECTURA Y DIAGRAMA DE FLUJO DEL TABLERO DE MIRO       */}
        {/* =================================================================== */}
        {topSection === 'miro_flow' && (
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-950 text-white">
            {/* Definición Oficial del Tablero de Miro: Sistema de Estaciones Digitales de 3 Capas */}
            <div className="p-3 rounded-2xl bg-gradient-to-br from-teal-950 via-slate-900 to-emerald-950 border-2 border-teal-400/70 space-y-2 shadow-lg">
              <div className="text-[10px] font-black text-amber-300 uppercase tracking-wider">
                {tx('ARQUITECTURA OFICIAL DEL PROYECTO · MIRO', 'OFFICIAL PROJECT ARCHITECTURE · MIRO')}
              </div>
              <p className="text-[11px] text-slate-100 font-semibold leading-snug">
                {tx(
                  'Señal Nativa funciona como un sistema de estaciones digitales conectadas a un recorrido físico real. Cada estación contiene tres capas de experiencia:',
                  'Señal Nativa works as a system of digital stations connected to a real physical trail. Each station contains three layers of experience:'
                )}
              </p>

              {/* Las 3 Capas Clickeables */}
              <div className="grid grid-cols-1 gap-1.5 pt-1">
                <button
                  onClick={() => {
                    soundManager.playClick();
                    onClose();
                    onOpenSighting();
                  }}
                  className="p-2 rounded-xl bg-slate-950/90 hover:bg-slate-900 border border-sky-400/60 text-left flex items-center justify-between group"
                >
                  <div>
                    <div className="text-[11px] font-black text-sky-300">
                      {tx('1. Descubrir (Realidad Aumentada)', '1. Discover (Augmented Reality)')}
                    </div>
                    <div className="text-[10px] text-slate-300">
                      {tx(
                        'Visualizar e identificar la especie mediante realidad aumentada.',
                        'Visualize and identify the species using augmented reality.'
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-sky-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => {
                    soundManager.playClick();
                    onClose();
                    onOpenBirds();
                  }}
                  className="p-2 rounded-xl bg-slate-950/90 hover:bg-slate-900 border border-amber-400/60 text-left flex items-center justify-between group"
                >
                  <div>
                    <div className="text-[11px] font-black text-amber-300">
                      {tx('2. Comprender (Ecología y Riesgos)', '2. Understand (Ecology & Risks)')}
                    </div>
                    <div className="text-[10px] text-slate-300">
                      {tx(
                        'Conocer su función ecológica en las Yungas, su canto y los riesgos que enfrenta.',
                        'Learn its ecological role in the Yungas, its call, and the risks it faces.'
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => {
                    soundManager.playClick();
                    onClose();
                    onOpenMap();
                  }}
                  className="p-2 rounded-xl bg-slate-950/90 hover:bg-slate-900 border border-emerald-400/60 text-left flex items-center justify-between group"
                >
                  <div>
                    <div className="text-[11px] font-black text-emerald-300">
                      {tx('3. Actuar (Desafío y Conservación)', '3. Act (Challenge & Conservation)')}
                    </div>
                    <div className="text-[10px] text-slate-300">
                      {tx(
                        'Responder un desafío en la estación y reconocer qué acciones contribuyen a su conservación.',
                        'Answer a station challenge and recognize actions that contribute to its conservation.'
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* Diagrama de Flujo de Pantallas Conectadas con Flechas (Salto Directo) */}
            <div className="p-3 rounded-2xl bg-slate-900 border border-teal-800 space-y-2">
              <div className="text-[10px] font-black text-teal-300 uppercase tracking-wider">
                {tx('MAPA DE NAVEGACIÓN ENTRE PANTALLAS (TOCA PARA IR)', 'SCREEN NAVIGATION FLOWCHART (TAP TO JUMP)')}
              </div>

              <div className="space-y-1.5 text-[10px]">
                {/* Fila 1: Pantallas 1 -> 2 -> 3 */}
                <div className="grid grid-cols-3 gap-1.5 items-center">
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      onClose();
                      onNavigateToScreen('screen1');
                    }}
                    className="p-2 rounded-xl bg-slate-950 border border-teal-700/60 hover:border-amber-400 text-center font-bold text-teal-200"
                  >
                    1. {tx('Portada', 'Splash')}
                  </button>
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      onClose();
                      onNavigateToScreen('screen2');
                    }}
                    className="p-2 rounded-xl bg-slate-950 border border-teal-700/60 hover:border-amber-400 text-center font-bold text-teal-200"
                  >
                    2. {tx('Selector / Foto', 'Player / Photo')}
                  </button>
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      onClose();
                      onNavigateToScreen('screen3');
                    }}
                    className="p-2 rounded-xl bg-slate-950 border border-teal-700/60 hover:border-amber-400 text-center font-bold text-teal-200"
                  >
                    3. {tx('Tucán Guía', 'Host Guide')}
                  </button>
                </div>

                <div className="text-center text-amber-400 font-black text-xs">⬇</div>

                {/* Fila 2: Menú Principal + Perfil YO/JUGADORES */}
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      onClose();
                      onNavigateToScreen('screen4');
                    }}
                    className="p-2 rounded-xl bg-teal-950 border border-teal-400 text-center font-black text-white"
                  >
                    4. {tx('Menú Principal (Hub)', 'Main Menu (Hub)')}
                  </button>
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      setTopSection('yo_jugadores');
                    }}
                    className="p-2 rounded-xl bg-amber-500/20 border border-amber-400 text-center font-black text-amber-300"
                  >
                    ★ {tx('Perfil YO / JUGADORES', 'ME / PLAYERS Profile')}
                  </button>
                </div>

                <div className="text-center text-amber-400 font-black text-xs">⬇</div>

                {/* Fila 3: Los 4 Módulos Conectados + Consignas y Cuadrillas */}
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      onClose();
                      onOpenMap();
                    }}
                    className="p-2 rounded-xl bg-slate-950 border border-emerald-500/60 hover:border-emerald-400 text-left font-bold text-emerald-300"
                  >
                    🗺️ {tx('Mapas y 8 Estaciones', 'Trail Map & 8 Stations')}
                  </button>
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      onClose();
                      onOpenSighting();
                    }}
                    className="p-2 rounded-xl bg-slate-950 border border-sky-500/60 hover:border-sky-400 text-left font-bold text-sky-300"
                  >
                    🔭 {tx('Avistamiento XR + Foto', 'XR Sighting + Photo')}
                  </button>
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      onClose();
                      onOpenBirds();
                    }}
                    className="p-2 rounded-xl bg-slate-950 border border-teal-500/60 hover:border-teal-400 text-left font-bold text-teal-300"
                  >
                    🦜 {tx('Aves · Siluetas · Cantos', 'Birds · Silhouettes · Calls')}
                  </button>
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      onClose();
                      onOpenShop();
                    }}
                    className="p-2 rounded-xl bg-slate-950 border border-amber-500/60 hover:border-amber-400 text-left font-bold text-amber-300"
                  >
                    🎒 {tx('Tienda · Equipo y Sobres', 'Shop · Gear & Packs')}
                  </button>
                </div>
              </div>
            </div>

            {/* Galería Interactiva de las Pantallas Oficiales del Tablero de Miro */}
            <div className="p-3 rounded-2xl bg-slate-900 border border-teal-700/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-amber-300 uppercase block">
                    {tx('PANTALLAS OFICIALES DEL TABLERO DE MIRO', 'OFFICIAL MIRO BOARD SCREENS')}
                  </span>
                  <span className="text-[9px] text-teal-300">
                    {tx('Explora cada vista original del flujo de diseño', 'Explore every original screen from the design flow')}
                  </span>
                </div>
                <button
                  onClick={() => setZoomBoard(!zoomBoard)}
                  className="px-2 py-1 rounded-lg bg-slate-800 text-teal-300 text-[10px] font-bold flex items-center gap-1"
                >
                  {zoomBoard ? <ZoomOut className="w-3 h-3" /> : <ZoomIn className="w-3 h-3" />}
                  <span>{zoomBoard ? tx('Ajustar', 'Fit') : tx('Ampliar', 'Zoom')}</span>
                </button>
              </div>

              {/* Lámina General de Referencias Visuales */}
              <div className={`rounded-xl overflow-auto border border-teal-800/60 bg-white ${zoomBoard ? 'max-h-72' : 'max-h-44'}`}>
                <img
                  src="/assets/aistudio/Aves_en_Acci_n_5f43966c.jpg"
                  alt="Tablero Oficial Miro - Aves en Acción"
                  className={zoomBoard ? 'w-[640px] max-w-none' : 'w-full h-auto object-contain'}
                />
              </div>

              {/* Grilla de Pantallas del Flujo Oficial de Miro con Acceso Directo */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                {[
                  {
                    titleEs: '1. Bienvenida al Parque',
                    titleEn: '1. Park Welcome',
                    img: '/assets/aistudio/En_el_dialogo_que_diga_c420835e.jpg',
                    action: () => { onClose(); onNavigateToScreen('screen1'); }
                  },
                  {
                    titleEs: '2. Acceso / Escuelas',
                    titleEn: '2. Login / Schools',
                    img: '/assets/aistudio/Update_button_text_and_dialogue_4d2f4b29.jpg',
                    action: () => { onClose(); onNavigateToScreen('screen2'); }
                  },
                  {
                    titleEs: '3. Menú Principal (Hub)',
                    titleEn: '3. Main Menu (Hub)',
                    img: '/assets/aistudio/Updating_game_dialogue_and_align…_defb1fbd.jpg',
                    action: () => { onClose(); onNavigateToScreen('screen4'); }
                  },
                  {
                    titleEs: '4. Circuitos y Candados',
                    titleEn: '4. Circuits & Padlocks',
                    img: '/assets/aistudio/Buttons_with_padlocks_9c3df4ab.jpg',
                    action: () => { onClose(); onOpenMap(); }
                  },
                  {
                    titleEs: '5. Avistamiento XR Chinchero',
                    titleEn: '5. XR Woodcreeper Sighting',
                    img: '/assets/aistudio/Toucan_asking_user_question_1451548d.jpg',
                    action: () => { onClose(); onOpenSighting(); }
                  },
                  {
                    titleEs: '6. Avistamiento XR Benteveo',
                    titleEn: '6. XR Kiskadee Sighting',
                    img: '/assets/aistudio/Toucan_presenting_benteveo_data_…_1e5a6f2b.jpg',
                    action: () => { onClose(); onOpenSighting(); }
                  },
                  {
                    titleEs: '7. Catálogo y Siluetas',
                    titleEn: '7. Catalog & Silhouettes',
                    img: '/assets/aistudio/Editing_bird_images_and_silhouettes_b4122078.jpg',
                    action: () => { onClose(); onOpenBirds(); }
                  },
                  {
                    titleEs: '8. Ficha y Canto Bioacústico',
                    titleEn: '8. Bioacoustic Call Sheet',
                    img: '/assets/aistudio/Add_bird_song_interface_data_9b786ba3.jpg',
                    action: () => { onClose(); onOpenBirds(); }
                  },
                  {
                    titleEs: '9. Diario de Aventuras',
                    titleEn: '9. Adventure Journal',
                    img: '/assets/aistudio/Toucan_writing_adventure_diary_9f3bf558.jpg',
                    action: () => { onClose(); onOpenBirds(); }
                  },
                  {
                    titleEs: '10. Historial de Aves / Avatar',
                    titleEn: '10. Bird History / Avatar',
                    img: '/assets/aistudio/Replace_clothing_store_with_birds_e4924cc4.jpg',
                    action: () => { setTopSection('yo_jugadores'); }
                  },
                  {
                    titleEs: '11. Tienda de Ropa y Equipo',
                    titleEn: '11. Clothing & Gear Store',
                    img: '/assets/aistudio/Clothing_store_fc9dbebd.jpg',
                    action: () => { onClose(); onOpenShop(); }
                  },
                  {
                    titleEs: '12. Tienda de Souvenirs',
                    titleEn: '12. Souvenir Store',
                    img: '/assets/aistudio/Change_bird_avatar_to_store_10abc5a2.jpg',
                    action: () => { onClose(); onOpenShop(); }
                  },
                  {
                    titleEs: '13. Trivia del Circuito',
                    titleEn: '13. Circuit Trivia',
                    img: '/assets/aistudio/Redesigning_toucan_and_trivia_la…_5d8ba7b2.jpg',
                    action: () => { onClose(); onOpenQuiz(); }
                  },
                  {
                    titleEs: '14. Ranking de Instituciones',
                    titleEn: '14. Institutions Ranking',
                    img: '/assets/aistudio/Institution_ranking_and_toucan_d…_bbc71eae.jpg',
                    action: () => { onClose(); onOpenSquads(); }
                  }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      soundManager.playClick();
                      item.action();
                    }}
                    className="p-1.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-400 text-left transition-all group flex flex-col"
                  >
                    <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-900 mb-1 border border-slate-800">
                      <img
                        src={item.img}
                        alt={item.titleEs}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <span className="text-[10px] font-black text-amber-300 truncate w-full">
                      {tx(item.titleEs, item.titleEn)}
                    </span>
                    <span className="text-[8px] text-teal-300 font-bold">
                      {tx('Toca para ir al módulo →', 'Tap to open module →')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
