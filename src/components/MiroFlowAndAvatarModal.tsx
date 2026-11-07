import React, { useState } from 'react';
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
import { useLanguage, LanguageSelector } from '../utils/i18n';

interface MiroFlowAndAvatarModalProps {
  isOpen: boolean;
  initialMode?: 'yo_jugadores' | 'miro_flow' | 'character_study';
  onClose: () => void;
  activeProfile: PlayerProfile;
  profiles: PlayerProfile[];
  onSelectProfile: (profileId: string) => void;
  onSelectCompanionBird: (birdName: CompanionBirdId) => void;
  onUpdateAvatar?: (avatarId: string, avatarIcon: string) => void;
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

  React.useEffect(() => {
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

                {/* Escena Central: Avatar de Cuerpo Entero con Ave en el Hombro (Izquierda) + Tucán Guía con Globo (Derecha) */}
                <div className="relative z-10 grid grid-cols-12 gap-2 items-center my-1">
                  {/* Columna Izquierda (7 cols): Explorador de Cuerpo Entero + Ave Compañera en el hombro */}
                  <div className="col-span-7 flex flex-col items-center">
                    <div className="relative w-40 h-56 rounded-3xl bg-gradient-to-b from-emerald-900/15 via-teal-900/10 to-amber-900/20 border-2 border-amber-600/30 flex flex-col items-center justify-center p-2 shadow-inner overflow-hidden">
                      {/* Ilustración SVG de Explorador de las Yungas de Cuerpo Entero con Mochila y Ave en el Hombro */}
                      <svg viewBox="0 0 180 240" className="w-36 h-48 drop-shadow-md">
                        {/* Sombra en el suelo */}
                        <ellipse cx="85" cy="226" rx="42" ry="8" fill="rgba(15, 23, 42, 0.22)" />

                        {/* Ave Compañera Posada en el Hombro Derecho del Explorador (Como en el Miro) */}
                        <g transform="translate(105, 42)">
                          {/* Cola larga del ave compañera */}
                          <path d="M18 32 L26 56 L14 52 Z" fill="#1E293B" />
                          {/* Cuerpo del ave */}
                          <ellipse cx="14" cy="22" rx="11" ry="15" fill="#0F172A" />
                          {/* Pecho / Garganta amarilla-dorada */}
                          <ellipse cx="11" cy="20" rx="6" ry="8" fill="#FACC15" />
                          {/* Pico prominente */}
                          <path d="M18 10 Q32 8 34 16 Q24 18 17 16 Z" fill="#F97316" />
                          {/* Ojo celeste */}
                          <circle cx="14" cy="13" r="2.2" fill="#38BDF8" />
                        </g>

                        {/* Mochila de Campo Verde Yungas */}
                        <rect x="46" y="74" width="76" height="68" rx="14" fill="#115E59" stroke="#042F2E" strokeWidth="2.5" />
                        {/* Botas de Senderismo */}
                        <rect x="58" y="198" width="22" height="24" rx="6" fill="#1E293B" />
                        <rect x="90" y="198" width="22" height="24" rx="6" fill="#1E293B" />
                        {/* Pantalones Cargo de Explorador */}
                        <rect x="59" y="142" width="21" height="58" rx="6" fill="#1F2937" />
                        <rect x="90" y="142" width="21" height="58" rx="6" fill="#1F2937" />
                        {/* Campera / Remera de Campo Azul-Acero y Chaleco */}
                        <path d="M52 78 C52 70 116 70 116 78 L122 144 L46 144 Z" fill="#3B82F6" stroke="#1E3A8A" strokeWidth="2" />
                        {/* Correas de la Mochila */}
                        <rect x="60" y="76" width="8" height="55" rx="3" fill="#0F766E" />
                        <rect x="100" y="76" width="8" height="55" rx="3" fill="#0F766E" />
                        {/* Binoculares en el pecho */}
                        <rect x="74" y="98" width="20" height="14" rx="3" fill="#0F172A" stroke="#FBBF24" strokeWidth="1.5" />
                        {/* Cabeza y Rostro del Explorador */}
                        <circle cx="84" cy="48" r="20" fill="#FDE68A" stroke="#78350F" strokeWidth="2" />
                        {/* Ojos y sonrisa */}
                        <circle cx="77" cy="47" r="2.2" fill="#1E293B" />
                        <circle cx="91" cy="47" r="2.2" fill="#1E293B" />
                        <path d="M78 55 Q84 60 90 55" fill="none" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
                        {/* Gorra / Visera Oficial del Parque Botánico */}
                        <path d="M62 40 C62 24 106 24 106 40 Z" fill="#15803D" stroke="#052E16" strokeWidth="2" />
                        <path d="M60 39 Q84 34 114 42" fill="none" stroke="#FACC15" strokeWidth="4" strokeLinecap="round" />
                      </svg>

                      {/* Etiqueta del Ave Compañera en el hombro */}
                      <div className="absolute bottom-1.5 inset-x-2 px-2 py-0.5 rounded-full bg-slate-900/85 text-amber-300 text-[9px] font-black text-center truncate">
                        🦜 {tx('Compañera:', 'Companion:')} {activeProfile.favoriteBird}
                      </div>
                    </div>
                  </div>

                  {/* Columna Derecha (5 cols): Globo de Diálogo + Tucán Guía (Exacto al Tablero de Miro) */}
                  <div className="col-span-5 flex flex-col items-center justify-between h-full space-y-2">
                    <div className="relative bg-white text-slate-900 p-2.5 rounded-2xl border-2 border-slate-900 shadow-lg text-center">
                      <p className="text-[10px] font-black leading-snug">
                        {tx(
                          '"Puedes hacer tu propio avatar teniendo como compañera a una de las aves"',
                          '"You can create your own avatar having one of the birds as your companion"'
                        )}
                      </p>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-r-2 border-b-2 border-slate-900 rotate-45" />
                    </div>

                    <div className="relative w-24 h-24 rounded-full border-3 border-amber-500 overflow-hidden shadow-xl bg-teal-950">
                      <img
                        src="/assets/aistudio/Toucan_perched_on_branch_8ab41bfc_230157f9.jpg"
                        alt="Tucán Guía"
                        className="w-full h-full object-cover object-[center_18%] scale-125"
                      />
                    </div>

                    <button
                      onClick={() => {
                        soundManager.playClick();
                        onClose();
                        onOpenShop();
                      }}
                      className="w-full py-1.5 px-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] uppercase shadow border border-amber-700/40 flex items-center justify-center gap-1"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>{tx('Equipar Avatar', 'Equip Avatar')}</span>
                    </button>
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
                                onUpdateAvatar(av.id, av.icon);
                              }}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border flex items-center gap-1 ${
                                isCurrent
                                  ? 'bg-amber-400 text-slate-950 border-amber-600 font-black'
                                  : 'bg-white text-slate-700 border-slate-300'
                              }`}
                            >
                              <span>{av.icon}</span>
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
                          <span className="text-2xl p-1.5 rounded-xl bg-amber-400/20">
                            {prof.avatarIcon || '🧢'}
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
                        src="/assets/aistudio/c3da3f37-f246-40f4-8d25-1958fb93d2f1_0d2a7f41.jpeg"
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

            {/* Lámina Visual Original del Tablero de Miro ("Aves en Acción") */}
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-white uppercase">
                  {tx('LÁMINA OFICIAL DEL TABLERO MIRO', 'OFFICIAL MIRO BOARD REFERENCE')}
                </span>
                <button
                  onClick={() => setZoomBoard(!zoomBoard)}
                  className="px-2 py-1 rounded-lg bg-slate-800 text-teal-300 text-[10px] font-bold flex items-center gap-1"
                >
                  {zoomBoard ? <ZoomOut className="w-3 h-3" /> : <ZoomIn className="w-3 h-3" />}
                  <span>{zoomBoard ? tx('Ajustar', 'Fit') : tx('Ampliar', 'Zoom')}</span>
                </button>
              </div>
              <div className={`rounded-xl overflow-auto border border-teal-800/60 bg-white ${zoomBoard ? 'max-h-72' : 'max-h-48'}`}>
                <img
                  src="/assets/aistudio/Aves_en_Acci_n_5f43966c.jpg"
                  alt="Tablero Oficial Miro - Aves en Acción"
                  className={zoomBoard ? 'w-[640px] max-w-none' : 'w-full h-auto object-contain'}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
