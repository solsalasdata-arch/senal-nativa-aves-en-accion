import React, { useState, useEffect } from 'react';
import { Screen1Splash } from './components/Screen1Splash';
import { Screen2PlayerSelector } from './components/Screen2PlayerSelector';
import { Screen3HostPresentation } from './components/Screen3HostPresentation';
import { Screen4MainHub } from './components/Screen4MainHub';
import { Screen5TipsModal } from './components/Screen5TipsModal';
import { PhotoCompanionModal } from './components/PhotoCompanionModal';
import { SightingSimulationModal } from './components/SightingSimulationModal';
import { TriviaAndBirdGuideModal } from './components/TriviaAndBirdGuideModal';
import { TrailMapModal } from './components/TrailMapModal';
import { ShopModal } from './components/ShopModal';
import { LevelUpCelebrationModal } from './components/LevelUpCelebrationModal';
import { OptionsModal } from './components/OptionsModal';
import { QuizConsignasModal } from './components/QuizConsignasModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { SquadsAndSeasonsModal } from './components/SquadsAndSeasonsModal';
import { PACK_EXTRA_BIRDS_DATA } from './data/birdsData';
import {
  loadProfilesList,
  getActiveProfile,
  createNewProfile,
  switchActiveProfile,
  deleteProfile,
  updateActiveProfile
} from './utils/storage';
import { soundManager } from './utils/audio';
import { PlayerProfile, CompanionBirdId, JournalEntry, CatalogBird } from './types/game';
import { LanguageProvider } from './utils/i18n';
import { OfflineIndicator } from './components/PWAInstallButton';

type ScreenId = 'screen1' | 'screen2' | 'screen3' | 'screen4';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('screen1');
  const [profiles, setProfiles] = useState<PlayerProfile[]>(() => loadProfilesList());
  const [activeProfile, setActiveProfile] = useState<PlayerProfile>(() => getActiveProfile());

  // Global Audio Toggles
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [bgmEnabled, setBgmEnabled] = useState(false);

  // Modals
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showSightingModal, setShowSightingModal] = useState(false);
  const [showBirdsModal, setShowBirdsModal] = useState(false);
  const [birdsInitialTab, setBirdsInitialTab] = useState<'catalog' | 'audio' | 'journal' | 'trivia'>('catalog');
  const [showDetailCelebration, setShowDetailCelebration] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showQuizConsignasModal, setShowQuizConsignasModal] = useState(false);
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [showSquadsModal, setShowSquadsModal] = useState(false);

  // Sync profile update helper
  const handleUpdateProfile = (updates: Partial<PlayerProfile>) => {
    const updated = updateActiveProfile(updates);
    setActiveProfile(updated);
    setProfiles(loadProfilesList());
    return updated;
  };

  // Level Up Check: 1 sighting AND 5 questions answered
  const checkLevelUp = (sightings: number, questions: number, profile: PlayerProfile) => {
    if (sightings >= 1 && questions >= 5 && !profile.hasRisingObserverBadge) {
      soundManager.playSuccess();
      const updatedMissions = profile.missions.map(m =>
        m.id === 'm-desafiante' ? { ...m, progress: 5, completed: true } : m
      );
      const updated = handleUpdateProfile({
        level: profile.level + 1,
        xp: profile.xp + 150,
        sightingsCompleted: sightings,
        questionsAnswered: questions,
        hasRisingObserverBadge: true,
        missions: updatedMissions
      });
      setShowLevelUpModal(true);
      return updated;
    }
    return profile;
  };

  // Create New Profile
  const handleCreateProfile = (name: string, avatarId: string, favoriteBird: CompanionBirdId) => {
    const newProf = createNewProfile(name, avatarId, favoriteBird);
    setActiveProfile(newProf);
    setProfiles(loadProfilesList());
  };

  // Select Existing Profile
  const handleSelectProfile = (profileId: string) => {
    const switched = switchActiveProfile(profileId);
    if (switched) {
      setActiveProfile(switched);
      setProfiles(loadProfilesList());
    }
  };

  // Delete Profile
  const handleDeleteProfile = (profileId: string) => {
    const remaining = deleteProfile(profileId);
    setProfiles(remaining);
    setActiveProfile(getActiveProfile());
  };

  // Checkpoint Validation (Paso 14 - MAPAS)
  const handleValidateCheckpoint = (checkpointId: number, xpReward: number) => {
    const existing = activeProfile.completedCheckpoints || [];
    if (existing.includes(checkpointId)) return;

    const newCheckpoints = [...existing, checkpointId];
    const isNowComplete = newCheckpoints.length >= 8;
    const newUnlockedRare = isNowComplete
      ? Array.from(new Set([...(activeProfile.unlockedRareBirds || []), 'urutau', 'jote-real']))
      : activeProfile.unlockedRareBirds || [];

    const updated = handleUpdateProfile({
      completedCheckpoints: newCheckpoints,
      hasRouteCompleteSeal: isNowComplete || activeProfile.hasRouteCompleteSeal,
      unlockedRareBirds: newUnlockedRare,
      xp: activeProfile.xp + xpReward
    });

    if (isNowComplete && !activeProfile.hasRouteCompleteSeal) {
      soundManager.playSuccess();
    }
  };

  // Sighting completion with Star Rating (Paso 12 - Foto Perfecta)
  const handleSightingSuccess = (birdId: string, stars: number) => {
    const newSightings = activeProfile.sightingsCompleted + 1;
    const newXP = activeProfile.xp + (stars === 3 ? 75 : 50);

    const prevStars = activeProfile.birdPhotoStars?.[birdId] || 0;
    const updatedStars = {
      ...(activeProfile.birdPhotoStars || {}),
      [birdId]: Math.max(prevStars, stars)
    };

    const birdDisplayName =
      birdId === 'chinchero-chico' ? 'Chinchero Chico' : 'Benteveo';

    const newJournalEntry: JournalEntry = {
      id: 'j_' + Date.now(),
      birdName: birdDisplayName,
      scientificName:
        birdId === 'chinchero-chico' ? 'Lepidocolaptes angustirostris' : 'Pitangus sulphuratus',
      trailName: 'Reserva Natural Urbana Barón Schuel · Selva Montana',
      notes: `Foto Perfecta XR (${stars} ⭐): Ave centrada, nitidez y distancia respetuosa sin flash.`,
      timestamp: Date.now(),
      stars
    };

    const updatedJournal = [newJournalEntry, ...(activeProfile.fieldJournal || [])].slice(0, 10);

    const updatedMissions = activeProfile.missions.map(m =>
      m.id === 'm-media' ? { ...m, progress: 1, completed: true } : m
    );

    const updated = handleUpdateProfile({
      sightingsCompleted: newSightings,
      birdPhotoStars: updatedStars,
      xp: newXP,
      fieldJournal: updatedJournal,
      missions: updatedMissions
    });

    checkLevelUp(newSightings, activeProfile.questionsAnswered, updated);
  };

  // Questions update from 5 Consignas
  const handleLevelUpSuccessFromQuiz = () => {
    const updated = handleUpdateProfile({
      level: activeProfile.level + 1,
      xp: activeProfile.xp + 150,
      questionsAnswered: 5,
      hasRisingObserverBadge: true,
      missions: activeProfile.missions.map(m =>
        m.id === 'm-desafiante' ? { ...m, progress: 5, completed: true } : m
      )
    });
    setShowLevelUpModal(true);
  };

  // Questions update from general trivia
  const handleQuestionsAnsweredUpdate = (count: number) => {
    const xpBonus = count > activeProfile.questionsAnswered ? 20 : 0;
    const updatedMissions = activeProfile.missions.map(m =>
      m.id === 'm-desafiante' ? { ...m, progress: count, completed: count >= 5 } : m
    );

    const updated = handleUpdateProfile({
      questionsAnswered: count,
      xp: activeProfile.xp + xpBonus,
      missions: updatedMissions
    });

    checkLevelUp(activeProfile.sightingsCompleted, count, updated);
  };

  // Change Companion Bird
  const handleSelectCompanionBird = (birdName: CompanionBirdId) => {
    handleUpdateProfile({ favoriteBird: birdName });
  };

  // Paso 3: Desbloqueo de Silueta Misteriosa con XP progresivo
  const handleUnlockSilhouette = (birdId: string, xpGain: number) => {
    const prev = activeProfile.unlockedSilhouettes || [];
    if (!prev.includes(birdId)) {
      const updatedList = [...prev, birdId];
      handleUpdateProfile({
        unlockedSilhouettes: updatedList,
        xp: activeProfile.xp + xpGain
      });
    }
  };

  // Paso 3: Desbloqueo de Reconocimiento Acústico
  const handleUnlockAcoustic = (birdId: string, xpGain: number) => {
    const prev = activeProfile.unlockedAcoustics || [];
    if (!prev.includes(birdId)) {
      const updatedList = [...prev, birdId];
      handleUpdateProfile({
        unlockedAcoustics: updatedList,
        xp: activeProfile.xp + xpGain
      });
    }
  };

  // Paso 13: Registro Científico en Diario de Campo (4 Toques) (+30 XP)
  const handleAddJournalEntry = (entry: Omit<JournalEntry, 'id' | 'timestamp'>) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: 'j_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now()
    };

    const currentJournal = activeProfile.fieldJournal || [];
    const updatedJournal = [newEntry, ...currentJournal];
    const newCount = updatedJournal.length;
    const shouldAwardDetailBadge = newCount >= 10 && !activeProfile.hasDetailObserverBadge;

    handleUpdateProfile({
      fieldJournal: updatedJournal,
      hasDetailObserverBadge: activeProfile.hasDetailObserverBadge || shouldAwardDetailBadge,
      xp: activeProfile.xp + 30 + (shouldAwardDetailBadge ? 100 : 0)
    });

    if (shouldAwardDetailBadge) {
      soundManager.playSuccess();
      setShowDetailCelebration(true);
    }
  };

  // Paso 9 / Paso 4: Comprar y Equipar Prendas y Equipo del Avatar en Tienda
  const handleEquipItem = (itemId: string, cost: number) => {
    const prevPurchased = activeProfile.purchasedGear || ['visera-oficial'];
    const prevEquipped = activeProfile.equippedItems || ['visera-oficial'];
    const alreadyOwned = prevPurchased.includes(itemId);

    const nextPurchased = alreadyOwned
      ? prevPurchased
      : Array.from(new Set([...prevPurchased, itemId]));

    let nextEquipped: string[];
    if (alreadyOwned && cost === 0) {
      // Toggle equip if already owned (keep at least 1 item equipped)
      if (prevEquipped.includes(itemId) && prevEquipped.length > 1) {
        nextEquipped = prevEquipped.filter(id => id !== itemId);
      } else {
        nextEquipped = Array.from(new Set([...prevEquipped, itemId]));
      }
    } else {
      nextEquipped = Array.from(new Set([...prevEquipped, itemId]));
    }

    handleUpdateProfile({
      xp: Math.max(0, activeProfile.xp - cost),
      purchasedGear: nextPurchased,
      equippedItems: nextEquipped,
      equippedGear: {
        ...activeProfile.equippedGear,
        hat: itemId.includes('visera') ? itemId : activeProfile.equippedGear.hat,
        backpack: itemId.includes('chaleco') ? itemId : activeProfile.equippedGear.backpack,
        binoculars: itemId.includes('binoculares') ? itemId : activeProfile.equippedGear.binoculars
      }
    });
  };

  // Paso 4: Canjear "Sobre Selva Montana" (100 XP)
  const handleBuySilhouettePack = (mode: 'hints' | 'silhouettes', cost: number): CatalogBird[] => {
    const prevAdded = activeProfile.addedPackBirdIds || [];
    const remaining = PACK_EXTRA_BIRDS_DATA.filter(b => !prevAdded.includes(b.id));
    const newlyUnlocked = mode === 'silhouettes' ? remaining.slice(0, 3) : [];
    const newAddedIds = Array.from(new Set([...prevAdded, ...newlyUnlocked.map(b => b.id)]));

    handleUpdateProfile({
      xp: Math.max(0, activeProfile.xp - cost),
      addedPackBirdIds: newAddedIds,
      freeSilhouetteHints: (activeProfile.freeSilhouetteHints || 0) + 2,
      packsOpenedCount: (activeProfile.packsOpenedCount || 0) + 1
    });

    return newlyUnlocked;
  };

  // Consumir pistas gratis del Sobre Selva Montana al abrir una Silueta Misteriosa
  const handleConsumeFreeHints = (usedCount: number) => {
    const currentHints = activeProfile.freeSilhouetteHints || 0;
    if (currentHints <= 0) return;
    handleUpdateProfile({
      freeSilhouetteHints: Math.max(0, currentHints - usedCount)
    });
  };

  // Paso 15: Registrar especie de la Temporada de Aves Migrantes
  const handleRegisterMigrantBird = (migrantId: string, xpReward: number) => {
    const prev = activeProfile.registeredMigrantIds || ['mig-loro-alisero'];
    if (prev.includes(migrantId)) return;
    handleUpdateProfile({
      registeredMigrantIds: [...prev, migrantId],
      xp: activeProfile.xp + xpReward
    });
  };

  // Paso 15: Desbloquear Ficha Exclusiva de Evento Especial (Global Big Day / Q'MI RAYMI)
  const handleUnlockSpecialEvent = (eventId: string, xpReward: number) => {
    const prev = activeProfile.unlockedSpecialEvents || [];
    if (prev.includes(eventId)) return;
    handleUpdateProfile({
      unlockedSpecialEvents: [...prev, eventId],
      xp: activeProfile.xp + xpReward
    });
  };

  // Paso 15: Reclamar recompensa de Meta Grupal Cooperativa de Cuadrilla
  const handleClaimSquadGoalReward = (xpReward: number) => {
    handleUpdateProfile({
      xp: activeProfile.xp + xpReward
    });
  };

  // Reset Progress of Active Profile
  const handleResetProgress = () => {
    handleUpdateProfile({
      level: 1,
      xp: 0,
      sightingsCompleted: 0,
      questionsAnswered: 0,
      hasRisingObserverBadge: false,
      hasRouteCompleteSeal: false,
      completedCheckpoints: [],
      birdPhotoStars: {},
      fieldJournal: []
    });
  };

  // Audio toggles
  const handleToggleSound = () => {
    const nextVal = !soundEnabled;
    soundManager.setMuted(!nextVal);
    setSoundEnabled(nextVal);
  };

  const handleToggleBgm = () => {
    const nextVal = !bgmEnabled;
    soundManager.toggleForestAmbience(nextVal);
    setBgmEnabled(nextVal);
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-[#07241E] to-slate-950 flex items-center justify-center p-0 sm:p-4 select-none">
        {/* 9:16 Centered Mobile Game Container */}
        <div className="relative w-full max-w-[440px] h-[100dvh] sm:h-[880px] sm:max-h-[94vh] sm:rounded-[38px] overflow-hidden shadow-[0_0_60px_rgba(12,110,90,0.4)] border-0 sm:border-4 sm:border-teal-700/60 bg-slate-950 flex flex-col">
          <OfflineIndicator />
          {/* Render Active Screen */}
          <div className="relative flex-1 w-full h-full overflow-hidden">
          {/* PANTALLA 1: PORTADA */}
          {currentScreen === 'screen1' && (
            <Screen1Splash
              onStartAdventure={() => setCurrentScreen('screen2')}
              soundEnabled={soundEnabled}
              onToggleSound={handleToggleSound}
            />
          )}

          {/* PANTALLA 2: SELECTOR DE JUGADOR Y FOTO COMPAÑERA */}
          {currentScreen === 'screen2' && (
            <Screen2PlayerSelector
              profiles={profiles}
              activeProfile={activeProfile}
              onSelectProfile={handleSelectProfile}
              onCreateProfile={handleCreateProfile}
              onDeleteProfile={handleDeleteProfile}
              onAdvanceToScreen3={() => setCurrentScreen('screen3')}
              onAdvanceToScreen4={() => setCurrentScreen('screen4')}
              onTakePhoto={() => setShowPhotoModal(true)}
              onBackToSplash={() => setCurrentScreen('screen1')}
            />
          )}

          {/* PANTALLA 3: PRESENTACIÓN DEL ANFITRIÓN */}
          {currentScreen === 'screen3' && (
            <Screen3HostPresentation
              activeProfile={activeProfile}
              onAdvanceToMainHub={() => setCurrentScreen('screen4')}
              onBack={() => setCurrentScreen('screen2')}
              onChangePlayer={() => setCurrentScreen('screen2')}
            />
          )}

          {/* PANTALLA 4: MENÚ PRINCIPAL */}
          {currentScreen === 'screen4' && (
            <Screen4MainHub
              playerProfile={activeProfile}
              missions={activeProfile.missions}
              onOpenOptions={() => setShowOptionsModal(true)}
              onOpenTips={() => setShowTipsModal(true)}
              onOpenMap={() => setShowMapModal(true)}
              onOpenShop={() => setShowShopModal(true)}
              onOpenBirds={() => {
                setBirdsInitialTab('catalog');
                setShowBirdsModal(true);
              }}
              onOpenSighting={() => setShowSightingModal(true)}
              onOpenCamera={() => setShowSightingModal(true)}
              onOpenBadge={() => setShowLevelUpModal(true)}
              onOpenDrive={() => setShowDriveModal(true)}
              onOpenSquadsAndSeasons={() => setShowSquadsModal(true)}
              onChangePlayer={() => setCurrentScreen('screen2')}
              onBackToSplash={() => setCurrentScreen('screen1')}
            />
          )}
        </div>

        {/* PANTALLA 5: CONSEJOS Y REGLA DE NIVEL */}
        <Screen5TipsModal
          isOpen={showTipsModal}
          onClose={() => setShowTipsModal(false)}
          playerState={activeProfile}
          onOpenMap={() => {
            setShowMapModal(true);
          }}
          onOpenBirds={() => {
            setBirdsInitialTab('trivia');
            setShowBirdsModal(true);
          }}
        />

        {/* MODAL DE FOTO COMPAÑERA / CAMBIO DE AVE */}
        <PhotoCompanionModal
          isOpen={showPhotoModal}
          onClose={() => setShowPhotoModal(false)}
          currentBirdName={activeProfile.favoriteBird}
          onSelectCompanionBird={handleSelectCompanionBird}
          onSavePhoto={(photoUrl) => {
            const updatedPhotos = [photoUrl, ...activeProfile.unlockedPhotos];
            handleUpdateProfile({
              unlockedPhotos: updatedPhotos,
              xp: activeProfile.xp + 25
            });
          }}
        />

        {/* MODAL DE AVISTAMIENTO XR Y FOTO PERFECTA (PASO 12) */}
        <SightingSimulationModal
          isOpen={showSightingModal}
          onClose={() => setShowSightingModal(false)}
          playerProfile={activeProfile}
          onSightingSuccess={handleSightingSuccess}
          onOpenQuizConsignas={() => {
            setShowSightingModal(false);
            setShowQuizConsignasModal(true);
          }}
        />

        {/* MODAL DE LAS 5 CONSIGNAS DEL TUCÁN CON BIFURCACIÓN Y FEEDBACK AMABLE 8B */}
        <QuizConsignasModal
          isOpen={showQuizConsignasModal}
          onClose={() => setShowQuizConsignasModal(false)}
          playerProfile={activeProfile}
          onLevelUpSuccess={handleLevelUpSuccessFromQuiz}
          onOpenMap={() => setShowMapModal(true)}
          onOpenBirds={() => {
            setBirdsInitialTab('catalog');
            setShowBirdsModal(true);
          }}
        />

        {/* MODAL DE AVES, SILUETA MISTERIOSA, BIOACÚSTICA Y DIARIO DE CAMPO (PASO 3) */}
        <TriviaAndBirdGuideModal
          isOpen={showBirdsModal}
          onClose={() => setShowBirdsModal(false)}
          playerProfile={activeProfile}
          onUnlockSilhouette={handleUnlockSilhouette}
          onUnlockAcoustic={handleUnlockAcoustic}
          onAddJournalEntry={handleAddJournalEntry}
          questionsAnsweredCount={activeProfile.questionsAnswered}
          onQuestionsAnsweredUpdate={handleQuestionsAnsweredUpdate}
          initialTab={birdsInitialTab}
          onOpenDrive={() => {
            setShowBirdsModal(false);
            setShowDriveModal(true);
          }}
          onConsumeFreeHints={handleConsumeFreeHints}
        />

        {/* MODAL DE CELEBRACIÓN: INSIGNIA OBSERVADOR DE DETALLES (10 ENTRADAS) */}
        {showDetailCelebration && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fadeIn">
            <div className="relative w-full max-w-xs rounded-3xl overflow-hidden bg-slate-900 border-2 border-amber-400 p-5 text-center space-y-3 shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 mx-auto flex items-center justify-center text-3xl shadow-lg ring-4 ring-amber-400/40">
                🏅
              </div>
              <div>
                <span className="text-[10px] font-black text-teal-300 uppercase tracking-widest block">
                  PARQUE BOTÁNICO BARÓN SCHUEL
                </span>
                <h4 className="text-base font-black text-amber-300 mt-0.5">
                  ¡OBSERVADOR DE DETALLES!
                </h4>
              </div>
              <p className="text-xs text-slate-200 leading-snug">
                ¡Felicitaciones, <strong>{activeProfile.name}</strong>! Has completado 10 registros científicos con los 4 toques en tu Diario de Campo.
              </p>
              <div className="p-2.5 rounded-xl bg-amber-950/70 border border-amber-600/50 text-[11px] font-bold text-amber-200">
                +120 XP y Medalla Dorada de Detalle concedida
              </div>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setShowDetailCelebration(false);
                }}
                className="w-full py-2.5 rounded-xl game-btn-orange text-white text-xs font-black"
              >
                ¡CONTINUAR EXPLORANDO!
              </button>
            </div>
          </div>
        )}

        {/* MODAL DE MAPA DE SENDEROS Y 8 PUNTOS DE CONTROL (PASO 14) */}
        <TrailMapModal
          isOpen={showMapModal}
          onClose={() => setShowMapModal(false)}
          playerProfile={activeProfile}
          onValidateCheckpoint={handleValidateCheckpoint}
          onOpenXRVision={() => setShowSightingModal(true)}
          onOpenSquadsAndSeasons={() => setShowSquadsModal(true)}
        />

        {/* MODAL DE TIENDA (PASO 9 / PASO 4: PRENDAS Y SOBRES DE SILUETAS) */}
        <ShopModal
          isOpen={showShopModal}
          onClose={() => setShowShopModal(false)}
          playerState={activeProfile}
          onEquipItem={handleEquipItem}
          onBuySilhouettePack={handleBuySilhouettePack}
          onOpenBirdsCatalog={() => {
            setBirdsInitialTab('catalog');
            setShowBirdsModal(true);
          }}
        />

        {/* MODAL PASO 15: CUADRILLAS ESCOLARES, TEMPORADAS DE AVES MIGRANTES Y RANKING AMIGABLE */}
        <SquadsAndSeasonsModal
          isOpen={showSquadsModal}
          onClose={() => setShowSquadsModal(false)}
          activeProfile={activeProfile}
          allProfiles={profiles}
          onRegisterMigrantBird={handleRegisterMigrantBird}
          onUnlockSpecialEvent={handleUnlockSpecialEvent}
          onClaimSquadGoalReward={handleClaimSquadGoalReward}
        />

        {/* MODAL DE CELEBRACIÓN DE NIVEL */}
        <LevelUpCelebrationModal
          isOpen={showLevelUpModal}
          onClose={() => setShowLevelUpModal(false)}
          level={activeProfile.level}
        />

        {/* MODAL DE OPCIONES DEL JUEGO */}
        <OptionsModal
          isOpen={showOptionsModal}
          onClose={() => setShowOptionsModal(false)}
          soundEnabled={soundEnabled}
          bgmEnabled={bgmEnabled}
          onToggleSound={handleToggleSound}
          onToggleBgm={handleToggleBgm}
          onResetProgress={handleResetProgress}
          onChangePlayer={() => setCurrentScreen('screen2')}
          onChangeCompanionOrPhoto={() => setShowPhotoModal(true)}
          onBackToSplash={() => setCurrentScreen('screen1')}
          onOpenDrive={() => setShowDriveModal(true)}
        />

          {/* MODAL DE GOOGLE DRIVE: SINCRONIZACIÓN, EXPORTACIÓN Y ARCHIVOS */}
          <GoogleDriveModal
            isOpen={showDriveModal}
            onClose={() => setShowDriveModal(false)}
            activeProfile={activeProfile}
            onRestoreProfileData={(restored) => {
              handleUpdateProfile(restored);
            }}
          />
        </div>
      </div>
    </LanguageProvider>
  );
}
