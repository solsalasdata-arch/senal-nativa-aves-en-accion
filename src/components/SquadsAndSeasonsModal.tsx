import React, { useState } from 'react';
import {
  Users,
  Sparkles,
  Award,
  CheckCircle2,
  Plus,
  UserPlus,
  Calendar,
  Shield,
  Feather,
  Star,
  Trophy,
  X,
  Eye,
  Compass
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import {
  SEASON_MIGRANT_BIRDS,
  SPECIAL_EVENT_CARDS,
  CATALOG_BIRDS_DATA,
  PACK_EXTRA_BIRDS_DATA
} from '../data/birdsData';
import { PlayerProfile, Squad, SquadMember, CompanionBirdId } from '../types/game';
import { loadSquadsList, saveSquadsList } from '../utils/storage';

interface SquadsAndSeasonsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfile: PlayerProfile;
  allProfiles: PlayerProfile[];
  onRegisterMigrantBird: (migrantId: string, xpReward: number) => void;
  onUnlockSpecialEvent: (eventId: string, xpReward: number) => void;
  onClaimSquadGoalReward: (xpReward: number) => void;
  initialTab?: 'squads' | 'seasons' | 'ranking';
}

export const SquadsAndSeasonsModal: React.FC<SquadsAndSeasonsModalProps> = ({
  isOpen,
  onClose,
  activeProfile,
  allProfiles,
  onRegisterMigrantBird,
  onUnlockSpecialEvent,
  onClaimSquadGoalReward,
  initialTab = 'squads'
}) => {
  const [activeTab, setActiveTab] = useState<'squads' | 'seasons' | 'ranking'>(initialTab);
  const [squads, setSquads] = useState<Squad[]>(() => loadSquadsList());
  const [selectedSquadIdx, setSelectedSquadIdx] = useState<number>(0);

  // Create new squad state
  const [showCreateSquadForm, setShowCreateSquadForm] = useState(false);
  const [newSquadName, setNewSquadName] = useState('');
  const [newSquadSchool, setNewSquadSchool] = useState('Colegio / Escuela de Jujuy');

  // Add teammate state
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberBird, setNewMemberBird] = useState<CompanionBirdId>('Benteveo');

  // Inspecting Special Event Exclusive Card
  const [inspectingEventCard, setInspectingEventCard] = useState<(typeof SPECIAL_EVENT_CARDS)[0] | null>(null);

  if (!isOpen) return null;

  const currentSquad: Squad | undefined = squads[selectedSquadIdx] || squads[0];

  // Collect all species observed by activeProfile
  const getProfileSpeciesNames = (prof: PlayerProfile): string[] => {
    const allCatalog = [...CATALOG_BIRDS_DATA, ...PACK_EXTRA_BIRDS_DATA];
    const fromSilhouettes = (prof.unlockedSilhouettes || [])
      .map(id => allCatalog.find(b => b.id === id)?.commonName)
      .filter((n): n is string => Boolean(n));
    const fromJournal = (prof.fieldJournal || []).map(j => j.birdName);
    const fromMigrants = (prof.registeredMigrantIds || [])
      .map(id => SEASON_MIGRANT_BIRDS.find(m => m.id === id)?.commonName)
      .filter((n): n is string => Boolean(n));
    return Array.from(new Set([prof.favoriteBird, ...fromSilhouettes, ...fromJournal, ...fromMigrants]));
  };

  // Compute combined shared sightings for currentSquad
  const computeSharedSightings = (sq: Squad | undefined): {
    species: string;
    contributors: string[];
  }[] => {
    if (!sq) return [];
    const map = new Map<string, Set<string>>();

    sq.members.forEach(m => {
      // If member corresponds to a real device profile, pull live data
      const realProf = allProfiles.find(p => p.id === m.id);
      const speciesList = realProf ? getProfileSpeciesNames(realProf) : m.contributedSpecies;
      speciesList.forEach(sp => {
        if (!map.has(sp)) map.set(sp, new Set());
        map.get(sp)!.add(realProf ? realProf.name : m.name);
      });
    });

    return Array.from(map.entries()).map(([species, set]) => ({
      species,
      contributors: Array.from(set)
    }));
  };

  const sharedSightingsList = computeSharedSightings(currentSquad);

  // Create a new Squad
  const handleCreateSquad = (presetName?: string) => {
    const finalName = (presetName || newSquadName).trim();
    if (!finalName) return;
    soundManager.playSuccess();

    const newSq: Squad = {
      id: 'squad_' + Date.now(),
      name: finalName,
      schoolOrGroup: newSquadSchool.trim() || 'Grupo Escolar Parque Barón Schuel',
      members: [
        {
          id: activeProfile.id,
          name: activeProfile.name,
          avatarIcon: activeProfile.avatarIcon || '🧢',
          favoriteBird: activeProfile.favoriteBird,
          isDeviceProfile: true,
          contributedSpecies: getProfileSpeciesNames(activeProfile),
          journalCount: (activeProfile.fieldJournal || []).length
        }
      ],
      sharedSightings: getProfileSpeciesNames(activeProfile),
      goalTarget: 8,
      goalRewardClaimed: false,
      createdAt: Date.now()
    };

    const updated = [newSq, ...squads];
    setSquads(updated);
    saveSquadsList(updated);
    setSelectedSquadIdx(0);
    setNewSquadName('');
    setShowCreateSquadForm(false);
  };

  // Add a device profile or schoolmate to currentSquad (up to 5 players)
  const handleAddMemberToSquad = (member: SquadMember) => {
    if (!currentSquad || currentSquad.members.length >= 5) return;
    if (currentSquad.members.some(m => m.id === member.id || m.name.toLowerCase() === member.name.toLowerCase())) {
      return;
    }
    soundManager.playSuccess();

    const updatedMembers = [...currentSquad.members, member];
    const updatedSquad: Squad = {
      ...currentSquad,
      members: updatedMembers
    };
    const nextSquads = squads.map((s, idx) => (idx === selectedSquadIdx ? updatedSquad : s));
    setSquads(nextSquads);
    saveSquadsList(nextSquads);
    setNewMemberName('');
  };

  const handleAddSchoolmateByName = () => {
    const trimmed = newMemberName.trim();
    if (!trimmed || !currentSquad || currentSquad.members.length >= 5) return;

    const extraSpeciesByBird: Record<CompanionBirdId, string[]> = {
      'Tucán Grande': ['Tucán Grande', 'Yapú', 'Jote Real'],
      'Benteveo': ['Benteveo', 'Hornero', 'Chiricote'],
      'Chinchero Chico': ['Chinchero Chico', 'Carpintero Lomo Blanco', 'Zorzal Colorado'],
      'Picaflor Cometa': ['Picaflor Cometa', 'Loro Alisero', 'Urutaú']
    };

    handleAddMemberToSquad({
      id: 'mate_' + Date.now(),
      name: trimmed,
      avatarIcon: '🎒',
      favoriteBird: newMemberBird,
      isDeviceProfile: false,
      contributedSpecies: extraSpeciesByBird[newMemberBird] || [newMemberBird],
      journalCount: 2
    });
  };

  // Friendly Ranking Calculation (Pestaña C)
  const calculateFriendlyStats = (prof: PlayerProfile) => {
    const allCatalog = [...CATALOG_BIRDS_DATA, ...PACK_EXTRA_BIRDS_DATA];
    const journalCount = (prof.fieldJournal || []).length;
    const completedMissions = (prof.missions || []).filter(m => m.completed).length;
    const checkpointsCount = (prof.completedCheckpoints || []).length;

    // Constancia Score: Journal entries + missions completed + checkpoints
    const constanciaScore = journalCount * 15 + completedMissions * 25 + checkpointsCount * 10;

    // Biological Variety: Distinct Families (out of 33 families in the Park Guide) & Distinct Strata (5 strata)
    const familiesSet = new Set<string>(['RAMPHASTIDAE']); // Toucan Guide base
    const strataSet = new Set<string>();

    (prof.unlockedSilhouettes || []).forEach(id => {
      const bird = allCatalog.find(b => b.id === id);
      if (bird) {
        familiesSet.add(bird.family);
        strataSet.add(bird.stratum);
      }
    });

    (prof.registeredMigrantIds || []).forEach(id => {
      const mig = SEASON_MIGRANT_BIRDS.find(m => m.id === id);
      if (mig) {
        familiesSet.add(mig.family);
        strataSet.add(mig.stratum.includes('vuelo') ? 'En vuelo' : 'Dosel');
      }
    });

    (prof.fieldJournal || []).forEach(entry => {
      if (entry.stratum) {
        const normalized =
          entry.stratum.toLowerCase().includes('urban')
            ? 'Zona Urbanizada'
            : entry.stratum.toLowerCase().includes('vuelo')
            ? 'En Vuelo'
            : entry.stratum;
        strataSet.add(normalized);
      }
      const matched = allCatalog.find(
        b => b.commonName.toLowerCase() === entry.birdName.toLowerCase()
      );
      if (matched) familiesSet.add(matched.family);
    });

    if (prof.unlockedSpecialEvents?.includes('qmi-raymi')) {
      familiesSet.add('CRACIDAE');
    }

    const familiesCount = familiesSet.size;
    const strataCount = Math.max(1, Math.min(5, strataSet.size));
    const variedadScore = familiesCount * 20 + strataCount * 25;

    return {
      journalCount,
      completedMissions,
      familiesCount,
      strataCount,
      constanciaScore,
      variedadScore,
      friendlyTotal: constanciaScore + variedadScore,
      hasConstanciaMedal: journalCount >= 2 || completedMissions >= 1,
      hasVariedadMedal: familiesCount >= 3 || strataCount >= 2
    };
  };

  // Build Ranking List combining device profiles + reference Park explorers
  const deviceEntries = allProfiles.map(p => {
    const stats = calculateFriendlyStats(p);
    return {
      id: p.id,
      name: p.name,
      avatarIcon: p.avatarIcon || '🧢',
      favoriteBird: p.favoriteBird,
      isCurrent: p.id === activeProfile.id,
      xp: p.xp,
      ...stats
    };
  });

  const referenceExplorers = [
    {
      id: 'ref_1',
      name: 'Valentina (Club Aves Jujuy)',
      avatarIcon: '🔭',
      favoriteBird: 'Picaflor Cometa' as CompanionBirdId,
      isCurrent: false,
      xp: 340,
      journalCount: 6,
      completedMissions: 3,
      familiesCount: 9,
      strataCount: 5,
      constanciaScore: 165,
      variedadScore: 305,
      friendlyTotal: 470,
      hasConstanciaMedal: true,
      hasVariedadMedal: true
    },
    {
      id: 'ref_2',
      name: 'Joaquín (Escuadra Yungas)',
      avatarIcon: '🌲',
      favoriteBird: 'Tucán Grande' as CompanionBirdId,
      isCurrent: false,
      xp: 210,
      journalCount: 4,
      completedMissions: 2,
      familiesCount: 6,
      strataCount: 4,
      constanciaScore: 110,
      variedadScore: 220,
      friendlyTotal: 330,
      hasConstanciaMedal: true,
      hasVariedadMedal: true
    }
  ];

  const rankingRows = [...deviceEntries, ...referenceExplorers].sort(
    (a, b) => b.friendlyTotal - a.friendlyTotal
  );

  const registeredMigrants = activeProfile.registeredMigrantIds || ['mig-loro-alisero'];
  const unlockedEvents = activeProfile.unlockedSpecialEvents || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-3 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-sm max-h-[94vh] flex flex-col rounded-3xl overflow-hidden bg-slate-900 border-2 border-teal-400 shadow-2xl">
        {/* TOP HEADER */}
        <div className="px-3.5 pt-3 pb-2.5 bg-slate-950 border-b border-teal-900/70 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 shrink-0 shadow">
                <Users className="w-4 h-4" />
              </div>
              <div className="truncate">
                <h3 className="font-black text-xs text-white uppercase tracking-wider">
                  COMUNIDAD Y TEMPORADAS · PASO 15
                </h3>
                <p className="text-[10px] text-teal-300 font-semibold truncate">
                  Cuadrillas Escolares, Aves Migrantes y Ranking Amigable
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
              <span>← Volver</span>
            </button>
          </div>

          {/* 3 TABS: CUADRILLAS | TEMPORADAS Y EVENTOS | RANKING AMIGABLE */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 rounded-xl border border-teal-900 text-[10px] font-black">
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('squads');
              }}
              className={`py-1.5 rounded-lg transition-all flex flex-col items-center justify-center ${
                activeTab === 'squads'
                  ? 'bg-teal-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5 mb-0.5" />
              <span>Cuadrillas (5)</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('seasons');
              }}
              className={`py-1.5 rounded-lg transition-all flex flex-col items-center justify-center ${
                activeTab === 'seasons'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 mb-0.5" />
              <span>Temporadas</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('ranking');
              }}
              className={`py-1.5 rounded-lg transition-all flex flex-col items-center justify-center ${
                activeTab === 'ranking'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 mb-0.5" />
              <span>Ranking Amigable</span>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* PESTAÑA A: CUADRILLAS (HASTA 5 JUGADORES - IDEAL PARA ESCUELAS) */}
        {/* ============================================================== */}
        {activeTab === 'squads' && (
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
            {/* Squad Selector + Create Squad Button */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {squads.map((sq, idx) => (
                  <button
                    key={sq.id}
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedSquadIdx(idx);
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black whitespace-nowrap border transition-all ${
                      idx === selectedSquadIdx
                        ? 'bg-teal-600 text-white border-teal-300 shadow'
                        : 'bg-slate-950 text-slate-300 border-slate-800'
                    }`}
                  >
                    🛡️ {sq.name} ({sq.members.length}/5)
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setShowCreateSquadForm(!showCreateSquadForm);
                }}
                className="px-2.5 py-1.5 rounded-xl game-btn-orange text-white text-[10px] font-black shrink-0 flex items-center gap-1 shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nueva</span>
              </button>
            </div>

            {/* Create Squad Form */}
            {showCreateSquadForm && (
              <div className="p-3 rounded-2xl bg-slate-950 border-2 border-amber-400 space-y-2 animate-fadeIn">
                <span className="text-[10px] font-black text-amber-300 uppercase block">
                  Crear Nueva Cuadrilla Escolar (Máx. 5 Integrantes)
                </span>
                <input
                  type="text"
                  value={newSquadName}
                  onChange={e => setNewSquadName(e.target.value)}
                  placeholder="Ej: Exploradores Los Perales o Escuadra Yungas"
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-teal-700 text-xs text-white outline-none focus:border-amber-400"
                />
                <div className="flex gap-1.5 flex-wrap">
                  {['Exploradores Los Perales', 'Escuadra Yungas', 'Guardianes del Schuel'].map(preset => (
                    <button
                      key={preset}
                      onClick={() => handleCreateSquad(preset)}
                      className="px-2 py-1 rounded-lg bg-teal-950 hover:bg-teal-900 text-teal-200 border border-teal-700 text-[9px] font-bold"
                    >
                      + "{preset}"
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setShowCreateSquadForm(false)}
                    className="flex-1 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-[10px] font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleCreateSquad()}
                    className="flex-1 py-1.5 rounded-xl game-btn-mint text-emerald-950 text-[10px] font-black"
                  >
                    Crear Cuadrilla
                  </button>
                </div>
              </div>
            )}

            {currentSquad && (
              <>
                {/* Squad Banner & Cooperative Goal */}
                <div className="p-3 rounded-2xl bg-gradient-to-br from-teal-950 via-slate-950 to-emerald-950 border border-teal-500/70 space-y-2 text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] font-black text-amber-300 uppercase tracking-wider">
                        {currentSquad.schoolOrGroup || 'Reto Cooperativo para Escuelas'}
                      </span>
                      <h4 className="text-sm font-black text-white uppercase">
                        {currentSquad.name}
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-teal-900 border border-teal-400 text-[10px] font-black text-teal-200">
                      {currentSquad.members.length}/5 Jugadores
                    </span>
                  </div>

                  {/* Cooperative Goal Progress */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-teal-200">
                        Meta Grupal Cooperativa: {sharedSightingsList.length}/{currentSquad.goalTarget} Especies
                      </span>
                      <span className="text-amber-300 font-black">+150 XP Grupal</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-teal-800">
                      <div
                        className="h-full bg-gradient-to-r from-teal-400 to-amber-400 transition-all duration-500"
                        style={{
                          width: `${Math.min(100, (sharedSightingsList.length / currentSquad.goalTarget) * 100)}%`
                        }}
                      />
                    </div>
                  </div>

                  {sharedSightingsList.length >= currentSquad.goalTarget && !currentSquad.goalRewardClaimed && (
                    <button
                      onClick={() => {
                        soundManager.playSuccess();
                        onClaimSquadGoalReward(150);
                        const next = squads.map((s, i) =>
                          i === selectedSquadIdx ? { ...s, goalRewardClaimed: true } : s
                        );
                        setSquads(next);
                        saveSquadsList(next);
                      }}
                      className="w-full py-2 rounded-xl game-btn-orange text-white text-xs font-black uppercase shadow-lg"
                    >
                      🎉 ¡Reclamar Recompensa Cooperativa (+150 XP)!
                    </button>
                  )}
                </div>

                {/* Members List (Up to 5 Players) */}
                <div className="p-3 rounded-2xl bg-slate-950 border border-teal-900 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-teal-300 uppercase">
                      Integrantes de la Cuadrilla ({currentSquad.members.length}/5)
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {currentSquad.members.map((member, idx) => (
                      <div
                        key={member.id}
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-7 h-7 rounded-lg bg-teal-950 border border-teal-600/50 flex items-center justify-center text-sm shrink-0">
                            {member.avatarIcon}
                          </span>
                          <div className="min-w-0">
                            <div className="font-black text-white truncate flex items-center gap-1">
                              <span>{idx + 1}. {member.name}</span>
                              {member.isDeviceProfile && (
                                <span className="text-[8px] px-1.5 py-0.2 rounded bg-teal-900 text-teal-200">
                                  Este dispositivo
                                </span>
                              )}
                            </div>
                            <div className="text-[9px] text-teal-300">
                              Ave compañera: {member.favoriteBird}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-amber-300 shrink-0">
                          {member.contributedSpecies.length} aves
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Link another Device Profile or Add Schoolmate up to 5 */}
                  {currentSquad.members.length < 5 && (
                    <div className="pt-2 border-t border-slate-800 space-y-2">
                      {/* Link other device profiles if available */}
                      {allProfiles.filter(p => !currentSquad.members.some(m => m.id === p.id)).length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-teal-300 block">
                            Vincular otro perfil de este teléfono:
                          </span>
                          <div className="flex gap-1.5 flex-wrap">
                            {allProfiles
                              .filter(p => !currentSquad.members.some(m => m.id === p.id))
                              .map(prof => (
                                <button
                                  key={prof.id}
                                  onClick={() =>
                                    handleAddMemberToSquad({
                                      id: prof.id,
                                      name: prof.name,
                                      avatarIcon: prof.avatarIcon || '🧢',
                                      favoriteBird: prof.favoriteBird,
                                      isDeviceProfile: true,
                                      contributedSpecies: getProfileSpeciesNames(prof),
                                      journalCount: (prof.fieldJournal || []).length
                                    })
                                  }
                                  className="px-2 py-1 rounded-lg bg-teal-900 hover:bg-teal-800 text-teal-100 border border-teal-500 text-[10px] font-bold flex items-center gap-1"
                                >
                                  <UserPlus className="w-3 h-3 text-amber-300" />
                                  <span>+ {prof.name}</span>
                                </button>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Add classmate / companion */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold text-amber-300 block">
                          Agregar compañero de escuela ({5 - currentSquad.members.length} lugares disponibles):
                        </span>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={newMemberName}
                            onChange={e => setNewMemberName(e.target.value)}
                            placeholder="Nombre del compañero..."
                            className="flex-1 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-teal-400"
                          />
                          <select
                            value={newMemberBird}
                            onChange={e => setNewMemberBird(e.target.value as CompanionBirdId)}
                            className="px-2 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-[10px] text-teal-200 font-bold"
                          >
                            <option value="Benteveo">Benteveo</option>
                            <option value="Tucán Grande">Tucán</option>
                            <option value="Chinchero Chico">Chinchero</option>
                            <option value="Picaflor Cometa">Picaflor</option>
                          </select>
                          <button
                            onClick={handleAddSchoolmateByName}
                            className="px-3 py-1.5 rounded-xl game-btn-mint text-emerald-950 text-[10px] font-black shrink-0"
                          >
                            Sumar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Shared Sightings List */}
                <div className="p-3 rounded-2xl bg-slate-950 border border-teal-900 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-amber-300 uppercase flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Lista Compartida de Avistamientos ({sharedSightingsList.length})
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300">
                    Combina todas las especies avistadas, fotografiadas y registradas en el Diario de Campo por los miembros de la cuadrilla:
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {sharedSightingsList.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-slate-900 border border-teal-800/60 flex flex-col justify-between"
                      >
                        <div className="text-[11px] font-black text-white flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="truncate">{item.species}</span>
                        </div>
                        <div className="text-[9px] text-teal-300 truncate mt-0.5">
                          Por: {item.contributors.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* PESTAÑA B: TEMPORADAS Y EVENTOS ESPECIALES */}
        {/* ============================================================== */}
        {activeTab === 'seasons' && (
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
            {/* Active Season Collection: "Temporada de Aves Migrantes de las Yungas" */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950 via-slate-950 to-teal-950 border-2 border-teal-400/80 space-y-2.5 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400 text-[9px] font-black text-amber-300 uppercase">
                  COLECCIÓN DE ESTACIÓN ACTIVA
                </span>
                <span className="text-xs font-black text-emerald-300">
                  {registeredMigrants.length}/{SEASON_MIGRANT_BIRDS.length} Avistadas
                </span>
              </div>

              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-wide">
                  Temporada de Aves Migrantes de las Yungas
                </h4>
                <p className="text-[10px] text-teal-200 leading-snug mt-0.5">
                  Registra a las 5 especies migrantes reales de la Guía del Parque Botánico que visitan la Selva Montana en época estival:
                </p>
              </div>

              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-teal-800">
                <div
                  className="h-full bg-gradient-to-r from-teal-400 to-amber-400 transition-all duration-500"
                  style={{
                    width: `${(registeredMigrants.length / SEASON_MIGRANT_BIRDS.length) * 100}%`
                  }}
                />
              </div>

              {/* List of 5 Migrant Birds */}
              <div className="space-y-2 pt-1">
                {SEASON_MIGRANT_BIRDS.map((bird, idx) => {
                  const isRegistered = registeredMigrants.includes(bird.id);
                  return (
                    <div
                      key={bird.id}
                      className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2.5 ${
                        isRegistered
                          ? 'bg-slate-900/95 border-emerald-500/70'
                          : 'bg-slate-950/90 border-slate-800'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-teal-950 border border-teal-700/60 flex items-center justify-center text-xl shrink-0">
                        {bird.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-black text-white">
                            {idx + 1}) {bird.commonName}
                          </span>
                          <span className="text-[9px] italic text-teal-300 font-serif">
                            ({bird.scientificName})
                          </span>
                        </div>
                        <div className="text-[9px] text-amber-300 font-bold mt-0.5">
                          {bird.size} · {bird.stratum} · {bird.status}
                        </div>
                        <p className="text-[10px] text-slate-300 leading-tight mt-0.5">
                          {bird.description}
                        </p>
                      </div>

                      <div className="shrink-0">
                        {isRegistered ? (
                          <span className="px-2 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/50 text-[9px] font-black flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Registrada</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              soundManager.playSuccess();
                              onRegisterMigrantBird(bird.id, 40);
                            }}
                            className="px-2.5 py-1.5 rounded-xl game-btn-mint text-emerald-950 text-[10px] font-black shadow cursor-pointer"
                          >
                            Registrar (+40 XP)
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Special Date Events with Exclusive Unlockable Cards */}
            <div className="space-y-2">
              <span className="text-xs font-black text-amber-300 uppercase tracking-wider px-1 block">
                Eventos de Fechas Especiales · Fichas Exclusivas
              </span>

              {SPECIAL_EVENT_CARDS.map(ev => {
                const isUnlocked = unlockedEvents.includes(ev.id);
                return (
                  <div
                    key={ev.id}
                    className={`p-3.5 rounded-2xl border-2 space-y-2 transition-all ${
                      isUnlocked
                        ? 'bg-gradient-to-br from-amber-950/60 via-slate-950 to-teal-950 border-amber-400 shadow-lg'
                        : 'bg-slate-950 border-teal-800/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-2xl shrink-0">
                        {ev.badgeIcon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-black text-amber-300 uppercase tracking-wider block">
                          {ev.eventSubtitle}
                        </span>
                        <h5 className="text-xs font-black text-white uppercase">
                          {ev.eventTitle}
                        </h5>
                        <p className="text-[10px] text-teal-200 font-bold mt-0.5">
                          Especie Emblema: {ev.birdCommonName} ({ev.birdScientificName}, {ev.size})
                        </p>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-300 leading-snug">
                      {ev.specialNote}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-black text-amber-400">
                        Recompensa: +{ev.xpReward} XP + Ficha Exclusiva
                      </span>

                      {isUnlocked ? (
                        <button
                          onClick={() => {
                            soundManager.playClick();
                            setInspectingEventCard(ev);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-black flex items-center gap-1 shadow cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Ficha Exclusiva</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            soundManager.playSuccess();
                            onUnlockSpecialEvent(ev.id, ev.xpReward);
                            setInspectingEventCard(ev);
                          }}
                          className="px-3 py-1.5 rounded-xl game-btn-orange text-white text-[10px] font-black shadow cursor-pointer"
                        >
                          Participar (+{ev.xpReward} XP)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PESTAÑA C: RANKING AMIGABLE (CONSTANCIA Y VARIEDAD BIOLÓGICA) */}
        {/* ============================================================== */}
        {activeTab === 'ranking' && (
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
            {/* Friendly Ranking Rule Banner */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-teal-950 via-slate-950 to-emerald-950 border border-teal-500/70 space-y-1.5 text-white">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-300 uppercase">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Regla del Ranking Amigable · Barón Schuel</span>
              </div>
              <p className="text-[10px] text-teal-100 leading-relaxed">
                Aquí premiamos la <strong>CONSTANCIA</strong> (registros en el Diario de Campo y misiones diarias cumplidas) y la <strong>VARIEDAD BIOLÓGICA</strong> (Familias observadas de las 33 de la Guía y los 5 estratos: Sotobosque, Subdosel, Dosel, Zona Urbanizada y En Vuelo) por encima del puntaje bruto.
              </p>
            </div>

            {/* Active Player Summary Cards: Constancia & Variedad Medals */}
            {(() => {
              const myStats = calculateFriendlyStats(activeProfile);
              return (
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-2xl bg-slate-950 border border-amber-500/60 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-amber-300 uppercase">
                        MEDALLA CONSTANCIA
                      </span>
                      <span className="text-base">{myStats.hasConstanciaMedal ? '🏅' : '⏳'}</span>
                    </div>
                    <div className="text-xs font-black text-white">
                      {myStats.journalCount} Diarios · {myStats.completedMissions}/3 Misiones
                    </div>
                    <div className="text-[9px] text-teal-300 font-bold">
                      Índice Constancia: {myStats.constanciaScore} pts
                    </div>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-950 border border-emerald-500/60 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-emerald-300 uppercase">
                        VARIEDAD BIOLÓGICA
                      </span>
                      <span className="text-base">{myStats.hasVariedadMedal ? '🌿' : '🌱'}</span>
                    </div>
                    <div className="text-xs font-black text-white">
                      {myStats.familiesCount}/33 Familias · {myStats.strataCount}/5 Estratos
                    </div>
                    <div className="text-[9px] text-teal-300 font-bold">
                      Índice Variedad: {myStats.variedadScore} pts
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Classification Table */}
            <div className="space-y-2">
              <span className="text-xs font-black text-teal-300 uppercase tracking-wider px-1 block">
                Tabla de Exploradores del Parque
              </span>

              {rankingRows.map((row, idx) => (
                <div
                  key={row.id}
                  className={`p-3 rounded-2xl border transition-all space-y-2 ${
                    row.isCurrent
                      ? 'bg-teal-950/90 border-amber-400 shadow-lg'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                          idx === 0
                            ? 'bg-amber-400 text-slate-950'
                            : idx === 1
                            ? 'bg-slate-300 text-slate-950'
                            : idx === 2
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-800 text-teal-300'
                        }`}
                      >
                        #{idx + 1}
                      </div>
                      <span className="text-lg shrink-0">{row.avatarIcon}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-black text-white truncate flex items-center gap-1">
                          <span>{row.name}</span>
                          {row.isCurrent && (
                            <span className="text-[8px] px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-black">
                              TÚ
                            </span>
                          )}
                        </div>
                        <div className="text-[9px] text-teal-300">
                          Compañero: {row.favoriteBird} · {row.xp} XP brutos
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-amber-300">
                        {row.friendlyTotal} Reconoc.
                      </div>
                      <div className="text-[9px] text-emerald-300 font-bold">
                        Constancia + Variedad
                      </div>
                    </div>
                  </div>

                  {/* Badges of Constancia and Variedad Biológica above raw score */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800/80 text-[9px] font-bold">
                    <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-200 border border-amber-500/50">
                      🏅 Constancia: {row.journalCount} diarios / {row.completedMissions} misiones
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-200 border border-emerald-500/50">
                      🌿 Variedad: {row.familiesCount}/33 Familias · {row.strataCount}/5 Estratos
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUBMODAL: INSPECCIÓN DE FICHA EXCLUSIVA DE EVENTO ESPECIAL */}
        {inspectingEventCard && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col p-4 animate-fadeIn text-white">
            <div className="flex items-center justify-between pb-2 border-b border-amber-500/50">
              <div>
                <span className="text-[9px] font-black text-amber-300 uppercase tracking-widest block">
                  FICHA EXCLUSIVA CONMEMORATIVA
                </span>
                <h4 className="text-xs font-black text-white uppercase">
                  {inspectingEventCard.eventTitle}
                </h4>
              </div>
              <button
                onClick={() => setInspectingEventCard(null)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-3">
              <div className="relative h-44 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-2xl">
                <img
                  src={inspectingEventCard.image}
                  alt={inspectingEventCard.birdCommonName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase shadow">
                  {inspectingEventCard.badgeIcon} EDICIÓN ESPECIAL JUJUY
                </div>
                <div className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-full bg-black/80 text-emerald-300 border border-emerald-400 text-[10px] font-black">
                  Tamaño: {inspectingEventCard.size}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-amber-500/50 space-y-1.5">
                <h3 className="text-base font-black text-amber-300 uppercase">
                  {inspectingEventCard.birdCommonName}
                </h3>
                <p className="text-xs italic text-teal-200 font-serif">
                  {inspectingEventCard.birdScientificName} · Familia {inspectingEventCard.family}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] font-bold">
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-teal-700 text-teal-200">
                    Estrato: {inspectingEventCard.stratum}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-500 text-amber-300">
                    Estado: {inspectingEventCard.status}
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed pt-2 border-t border-slate-800">
                  {inspectingEventCard.specialNote}
                </p>
              </div>

              <button
                onClick={() => setInspectingEventCard(null)}
                className="w-full py-3 rounded-2xl game-btn-orange text-white text-xs font-black uppercase"
              >
                Cerrar Ficha Conmemorativa
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
