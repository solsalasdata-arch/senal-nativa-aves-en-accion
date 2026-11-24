import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Screen1Splash } from './components/Screen1Splash';
import { Screen2PlayerSelector } from './components/Screen2PlayerSelector';
import { Screen3HostPresentation } from './components/Screen3HostPresentation';
import { Screen4MainHub, HubSheet } from './components/Screen4MainHub';
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
import { MiroFlowAndAvatarModal } from './components/MiroFlowAndAvatarModal';
import { BIRDS_DATA, CATALOG_BIRDS_DATA, PACK_EXTRA_BIRDS_DATA } from './data/birdsData';
import {
  loadProfilesList,
  getActiveProfile,
  createDefaultProfile,
  saveProfilesList,
  setActiveProfileId,
  commitProfile,
  loadSquadsList
} from './utils/storage';
import { soundManager } from './utils/audio';
import { PlayerProfile, CompanionBirdId, JournalEntry, CatalogBird, PhotoRef } from './types/game';
import { awardJournalEntry, awardCompanionPhoto, awardQuizLevelUp } from './utils/rewards';
import { savePhoto, deletePhoto, migrateLegacyPhotos } from './utils/photoStore';
import { SAVE_ERROR, SaveResult, SightingCapture } from './utils/profileActions';
import { importBackupPhotos } from './utils/backupTransfer';
import type { BackupPhoto } from './utils/backup';
import { isRealObservation } from './utils/journal';
import { LanguageProvider } from './utils/i18n';
import { OfflineIndicator } from './components/PWAInstallButton';
import { registerMindARDiscovery, completeMindARChallenge, MindARActionResult } from './utils/mindarProgress';
import { getReturningProfile } from './utils/welcome';
import { completeStation, savePendingStationToken, readPendingStationToken, clearPendingStationToken } from './utils/stationProgress';
import { parseStationQr } from './utils/stationQr';
import { ModalHeader } from './components/ui';
import { useModalEscape } from './components/ui/useModalEscape';

type ScreenId = 'screen1' | 'screen2' | 'screen3' | 'screen4';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('screen1');
  const [profiles, setProfiles] = useState<PlayerProfile[]>(() => loadProfilesList());
  const [activeProfile, setActiveProfile] = useState<PlayerProfile>(() => getActiveProfile());
  const mindarProfileRef = useRef(activeProfile);
  mindarProfileRef.current = activeProfile;
  const pendingMindAR = useRef<{ profileId: string; action: 'register' | 'complete'; targetIndex: number } | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const handleMindARRetrySave = (): boolean => {
    const pending = pendingMindAR.current;
    return pending ? handleMindARAction(pending.action, pending.profileId, pending.targetIndex).saved : true;
  };
  const handleMindARAction = (action: 'register' | 'complete', profileId = mindarProfileRef.current.id, targetIndex = 1): MindARActionResult => {
    const checked = handleUpdateProfile(latest => (action === 'register' ? registerMindARDiscovery : completeMindARChallenge)(latest, Date.now(), targetIndex), profileId);
    pendingMindAR.current = checked.saved ? null : { profileId, action, targetIndex };
    return { status: checked.status as MindARActionResult['status'], saved: checked.saved };
  };

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
  useModalEscape(showDetailCelebration, () => setShowDetailCelebration(false));
  const [showMapModal, setShowMapModal] = useState(false);
  const [initialStationToken, setInitialStationToken] = useState<string | null>(null);
  useEffect(() => {
    const url = new URL(window.location.href);
    const parsed = parseStationQr(url.searchParams.get('sn') || '');
    if (parsed.ok) {
      savePendingStationToken(parsed.token);
      url.searchParams.delete('sn');
      window.history.replaceState(window.history.state, '', url);
    }
  }, []);
  useEffect(() => {
    if (currentScreen !== 'screen4' || !activeProfile.id) return;
    const token = readPendingStationToken();
    if (!token || !parseStationQr(token).ok) return;
    setInitialStationToken(token);
    setShowMapModal(true);
  }, [currentScreen, activeProfile.id]);
  const consumeInitialStationToken = useCallback(() => {
    clearPendingStationToken();
    setInitialStationToken(null);
  }, []);
  const [showShopModal, setShowShopModal] = useState(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showQuizConsignasModal, setShowQuizConsignasModal] = useState(false);
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [showSquadsModal, setShowSquadsModal] = useState(false);
  const [showMiroModal, setShowMiroModal] = useState(false);
  const [hubSheet, setHubSheet] = useState<HubSheet>(null);
  const [miroModalInitialMode, setMiroModalInitialMode] = useState<'yo_jugadores' | 'miro_flow' | 'character_study'>('yo_jugadores');

  // Compute current active modal identifier for History API
  const activeModalId =
    showDetailCelebration
      ? 'detail_celebration'
      : showLevelUpModal
      ? 'levelup'
      : showQuizConsignasModal
      ? 'quiz'
      : showSightingModal
      ? 'sighting'
      : showMapModal
      ? 'map'
      : showBirdsModal
      ? 'birds'
      : showShopModal
      ? 'shop'
      : showTipsModal
      ? 'tips'
      : showPhotoModal
      ? 'photo'
      : showOptionsModal
      ? 'options'
      : showDriveModal
      ? 'drive'
      : showSquadsModal
      ? 'squads'
      : showMiroModal
      ? 'miro'
      : hubSheet;

  const closeAllModals = useCallback(() => {
    setShowTipsModal(false);
    setShowPhotoModal(false);
    setShowSightingModal(false);
    setShowBirdsModal(false);
    setShowDetailCelebration(false);
    setShowMapModal(false);
    setShowShopModal(false);
    setShowLevelUpModal(false);
    setShowOptionsModal(false);
    setShowQuizConsignasModal(false);
    setShowDriveModal(false);
    setShowSquadsModal(false);
    setShowMiroModal(false);
    setHubSheet(null);
  }, []);

  const navStateRef = useRef<{ screen: ScreenId; modal: string | null }>({
    screen: currentScreen,
    modal: activeModalId
  });
  const isHandlingPopStateRef = useRef(false);

  // Keep ref updated with latest state
  useEffect(() => {
    navStateRef.current = { screen: currentScreen, modal: activeModalId };
  }, [currentScreen, activeModalId]);

  // Initialize History API and listen to physical/gesture mobile "Back" button (popstate)
  useEffect(() => {
    window.history.replaceState({ screen: 'screen1', modal: null, guard: true }, '');
    window.history.pushState({ screen: 'screen1', modal: null }, '');

    const handlePopState = () => {
      isHandlingPopStateRef.current = true;
      const { screen, modal } = navStateRef.current;

      if (modal !== null) {
        // a) If a modal is open, close it first and return to the underlying screen
        closeAllModals();
        window.history.pushState({ screen, modal: null }, '');
      } else if (screen === 'screen4' || screen === 'screen3') {
        // b) & c) From Main Hub (Screen 4) or Host Presentation (Screen 3), return to Player Selector (Screen 2)
        setCurrentScreen('screen2');
        window.history.pushState({ screen: 'screen2', modal: null }, '');
      } else if (screen === 'screen2') {
        // From Player Selector (Screen 2), return to Splash (Screen 1)
        setCurrentScreen('screen1');
        window.history.pushState({ screen: 'screen1', modal: null }, '');
      } else {
        // Already at Screen 1: re-push guard state so the app does not close
        window.history.pushState({ screen: 'screen1', modal: null }, '');
      }

      setTimeout(() => {
        isHandlingPopStateRef.current = false;
      }, 50);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [closeAllModals]);

  // Push history state whenever screen or modal changes via user UI actions
  useEffect(() => {
    if (isHandlingPopStateRef.current) return;
    window.history.pushState({ screen: currentScreen, modal: activeModalId }, '');
  }, [currentScreen, activeModalId]);

  type Change = { updates: Partial<PlayerProfile>; status?: string; birds?: CatalogBird[] };
  const handleUpdateProfile = (mutator: ((latest: PlayerProfile) => Change) | Partial<PlayerProfile>,
    profileId = mindarProfileRef.current.id): SaveResult & { profile: PlayerProfile; birds?: CatalogBird[] } => {
    let before = mindarProfileRef.current;
    try {
      const checked = commitProfile(profileId, latest => {
        before = latest;
        return typeof mutator === 'function' ? mutator(latest) : { updates: mutator };
      });
      if (!checked.saved) {
        setSaveError(SAVE_ERROR);
        return { saved: false, status: checked.result.status || 'error', error: SAVE_ERROR, profile: checked.profile };
      }
      if (mindarProfileRef.current.id === profileId) {
        mindarProfileRef.current = checked.profile;
        setActiveProfile(checked.profile);
      }
      setProfiles(loadProfilesList());
      setSaveError(null);
      return { saved: true, status: checked.result.status || 'saved', profile: checked.profile,
        xpGained: checked.profile.xp - before.xp, birds: checked.result.birds };
    } catch {
      setSaveError(SAVE_ERROR);
      return { saved: false, status: 'error', error: SAVE_ERROR, profile: before };
    }
  };
  const withLevelUp = (latest: PlayerProfile, updates: Partial<PlayerProfile>): Partial<PlayerProfile> => {
    const next = { ...latest, ...updates };
    return next.sightingsCompleted >= 1 && next.questionsAnswered >= 5 && !next.hasRisingObserverBadge
      ? { ...updates, ...awardQuizLevelUp(next).updates } : updates;
  };
  const celebrateLevel = (result: SaveResult & { profile: PlayerProfile }, hadBadge: boolean) => {
    if (result.saved && !hadBadge && result.profile.hasRisingObserverBadge) {
      soundManager.playSuccess();
      setShowLevelUpModal(true);
    }
  };
  useEffect(() => {
    const refresh = () => {
      const latest = getActiveProfile();
      mindarProfileRef.current = latest;
      setActiveProfile(latest);
      setProfiles(loadProfilesList());
    };
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
  }, []);
  const migratingProfiles = useRef(new Map<string, ReturnType<typeof migrateLegacyPhotos>>());
  useEffect(() => {
    const id = activeProfile.id;
    if (!migratingProfiles.current.has(id)) {
      migratingProfiles.current.set(id, migrateLegacyPhotos(loadProfilesList().find(p => p.id === id) || activeProfile));
    }
    let disposed = false;
    migratingProfiles.current.get(id)!.then(() => {
      if (!disposed && mindarProfileRef.current.id === id) {
        const list = loadProfilesList();
        const latest = list.find(p => p.id === id);
        if (latest) { mindarProfileRef.current = latest; setActiveProfile(latest); }
        setProfiles(list);
      }
    }).catch(() => { if (!disposed) setSaveError(SAVE_ERROR); });
    return () => { disposed = true; };
  }, [activeProfile.id]);

  // Create New Profile
  const handleCreateProfile = (name: string, avatarId: string, favoriteBird: CompanionBirdId): SaveResult => {
    const newProf = createDefaultProfile(name, avatarId, favoriteBird);
    if (!saveProfilesList([newProf, ...loadProfilesList()])) {
      setSaveError(SAVE_ERROR);
      return { saved: false, status: 'error', error: SAVE_ERROR };
    }
    setActiveProfileId(newProf.id);
    mindarProfileRef.current = newProf;
    setActiveProfile(newProf);
    setProfiles(loadProfilesList());
    return { saved: true, status: 'saved' };
  };

  // Select Existing Profile
  const handleSelectProfile = (profileId: string) => {
    const switched = handleUpdateProfile(() => ({ updates: {} }), profileId);
    if (switched.saved) {
      setActiveProfileId(profileId);
      mindarProfileRef.current = switched.profile;
      setActiveProfile(switched.profile);
      setProfiles(loadProfilesList());
    }
    return switched;
  };

  // Delete Profile
  const handleDeleteProfile = (profileId: string) => {
    const remaining = loadProfilesList().filter(p => p.id !== profileId);
    if (!remaining.length) remaining.push(createDefaultProfile());
    if (!saveProfilesList(remaining)) { setSaveError(SAVE_ERROR); return; }
    const activeId = remaining.some(profile => profile.id === mindarProfileRef.current.id)
      ? mindarProfileRef.current.id
      : remaining[0].id;
    setActiveProfileId(activeId);
    setProfiles(remaining);
    const next = remaining.find(profile => profile.id === activeId)!;
    mindarProfileRef.current = next;
    setActiveProfile(next);
  };

  const handleCompleteStation = (stationId: number, scannedToken: string, answerIndex: number) => {
    return handleUpdateProfile(latest => completeStation(latest, { stationId, scannedToken, answerIndex }));
  };

  const persistPhoto = async (source: Blob | string, kind: PhotoRef['kind'], label: string,
    mutate: (latest: PlayerProfile, ref: PhotoRef) => Change, entryId?: string): Promise<SaveResult> => {
    const profileId = mindarProfileRef.current.id;
    const latest = loadProfilesList().find(p => p.id === profileId);
    if (!latest) return { saved: false, status: 'error', error: SAVE_ERROR };
    const photo = await savePhoto(source, { profile: latest, kind, entryId, label });
    if (!photo.ok) { setSaveError(SAVE_ERROR); return { saved: false, status: photo.reason, error: SAVE_ERROR }; }
    const result = handleUpdateProfile(current => {
      const ref = current.photos?.find(p => p.hash === photo.ref.hash) || photo.ref;
      const change = mutate(current, ref);
      return { ...change, updates: { ...change.updates,
        photos: [...(current.photos || []).filter(p => p.id !== ref.id), ref] } };
    }, profileId);
    const savedRef = result.profile.photos?.find(p => p.hash === photo.ref.hash);
    if ((!result.saved || savedRef?.id !== photo.ref.id) && !latest.photos?.some(p => p.id === photo.ref.id)) await deletePhoto(photo.ref).catch(() => {});
    return { ...result, photo: result.saved ? savedRef : undefined };
  };
  const handleSightingSuccess = async (capture: SightingCapture): Promise<SaveResult> => {
    const species = CATALOG_BIRDS_DATA.find(b => b.id === capture.birdId) || BIRDS_DATA.find(b => b.id === capture.birdId);
    if (!species) return { saved: false, status: 'unknown-species', error: 'Especie no disponible' };
    let hadBadge = true;
    const result = await persistPhoto(capture.photoUrl, 'composite', 'Fotografía interactiva · composición ilustrativa', (latest, ref) => {
      hadBadge = latest.hasRisingObserverBadge;
      const entry: JournalEntry = { id: capture.entryId, speciesId: capture.birdId, source: 'ai-identification',
        birdName: species.commonName, scientificName: species.scientificName, timestamp: Date.now(),
        trailName: 'Reserva Natural Urbana Barón Schuel · Selva Montana',
        notes: 'Identificación sugerida por IA (Gemini) · puede contener errores. Composición ilustrativa; autoevaluación declarada.',
        identification: { method: 'gemini', status: 'ai-suggested' }, photoId: ref.id, photoKind: 'composite',
        selfAssessment: { checks: capture.checks, stars: Math.max(1, capture.checks.length) } };
      const reward = awardJournalEntry(latest, entry);
      if (!reward.updates.fieldJournal) return reward;
      return { ...reward, updates: withLevelUp(latest, { ...reward.updates,
        missions: latest.missions.map(m => m.id === 'm-media' ? { ...m, progress: 1, completed: true } : m),
        unlockedSilhouettes: Array.from(new Set([...latest.unlockedSilhouettes, capture.birdId])) }) };
    }, capture.entryId);
    if (result.saved && !hadBadge && getActiveProfile().hasRisingObserverBadge) setShowLevelUpModal(true);
    return result;
  };
  const handleCompanionPhoto = (photoUrl: string, bird: CompanionBirdId): Promise<SaveResult> =>
    persistPhoto(photoUrl, 'companion', 'Composición ilustrativa', latest => awardCompanionPhoto(latest, bird));

  // Questions update from 5 Consignas
  const handleLevelUpSuccessFromQuiz = () => {
    const result = handleUpdateProfile(latest => awardQuizLevelUp(latest));
    if (result.saved && result.status === 'awarded') setShowLevelUpModal(true);
    return result;
  };

  // Questions update from general trivia
  const handleQuestionsAnsweredUpdate = (count: number) => {
    let hadBadge = true;
    const result = handleUpdateProfile(latest => {
      hadBadge = latest.hasRisingObserverBadge;
      const questions = Math.max(count, latest.questionsAnswered);
      return { updates: withLevelUp(latest, { questionsAnswered: questions,
        xp: latest.xp + (count > latest.questionsAnswered ? 20 : 0),
        missions: latest.missions.map(m => m.id === 'm-desafiante' ? { ...m, progress: questions, completed: questions >= 5 } : m) }) };
    });
    celebrateLevel(result, hadBadge);
    return result;
  };

  // Change Companion Bird
  const handleSelectCompanionBird = (birdName: CompanionBirdId) => {
    return handleUpdateProfile({ favoriteBird: birdName });
  };

  // Paso 3: Desbloqueo de Silueta Misteriosa con XP progresivo
  const handleUnlockSilhouette = (birdId: string, xpGain: number) => {
    return handleUpdateProfile(latest => ({ updates: latest.unlockedSilhouettes.includes(birdId) ? {} : {
      unlockedSilhouettes: [...latest.unlockedSilhouettes, birdId], xp: latest.xp + xpGain } }));
  };

  // Paso 3: Desbloqueo de Reconocimiento Acústico
  const handleUnlockAcoustic = (birdId: string, xpGain: number) => {
    return handleUpdateProfile(latest => ({ updates: latest.unlockedAcoustics.includes(birdId) ? {} : {
      unlockedAcoustics: [...latest.unlockedAcoustics, birdId], xp: latest.xp + xpGain } }));
  };

  // Paso 13: Registro Científico en Diario de Campo (4 Toques) (+30 XP)
  const handleAddJournalEntry = (entry: Omit<JournalEntry, 'id' | 'timestamp'>, photo?: File): SaveResult | Promise<SaveResult> => {
    const newEntry: JournalEntry = {
      ...entry,
      id: 'j_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now()
    };

    let hadBadge = true;
    const award = (latest: PlayerProfile, ref?: PhotoRef) => {
      hadBadge = latest.hasDetailObserverBadge;
      return awardJournalEntry(latest, { ...newEntry, source: 'field',
        ...(ref ? { photoId: ref.id, photoKind: 'user', evidence: 'photo' } : {}) });
    };
    const finish = (result: SaveResult & { profile?: PlayerProfile }) => {
      if (result.saved && !hadBadge && (result.profile || mindarProfileRef.current).hasDetailObserverBadge) {
        soundManager.playSuccess();
        setShowDetailCelebration(true);
      }
      return result;
    };
    return photo ? persistPhoto(photo, 'user', 'Foto propia', award, newEntry.id).then(finish)
      : finish(handleUpdateProfile(latest => award(latest)));
  };

  // Paso 9 / Paso 4: Comprar y Equipar Prendas y Equipo del Avatar en Tienda
  const handleEquipItem = (itemId: string, cost: number) => {
    return handleUpdateProfile(latest => {
    const prevPurchased = latest.purchasedGear || ['visera-oficial'];
    const prevEquipped = latest.equippedItems || ['visera-oficial'];
    const alreadyOwned = prevPurchased.includes(itemId);
    const charge = alreadyOwned ? 0 : cost;
    if (latest.xp < charge) return { updates: {}, status: 'insufficient-xp' };

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

    return { updates: {
      xp: latest.xp - charge,
      purchasedGear: nextPurchased,
      equippedItems: nextEquipped,
      equippedGear: {
        ...latest.equippedGear,
        hat: itemId.includes('visera') ? itemId : latest.equippedGear.hat,
        backpack: itemId.includes('chaleco') ? itemId : latest.equippedGear.backpack,
        binoculars: itemId.includes('binoculares') ? itemId : latest.equippedGear.binoculars
      }
    } };
    });
  };

  // Paso 4: Canjear "Sobre Selva Montana" (100 XP)
  const handleBuySilhouettePack = (mode: 'hints' | 'silhouettes', cost: number) => {
    return handleUpdateProfile(latest => {
    if (latest.xp < cost) return { updates: {}, status: 'insufficient-xp', birds: [] };
    const prevAdded = latest.addedPackBirdIds || [];
    const remaining = PACK_EXTRA_BIRDS_DATA.filter(b => !prevAdded.includes(b.id));
    const newlyUnlocked = mode === 'silhouettes' ? remaining.slice(0, 3) : [];
    const newAddedIds = Array.from(new Set([...prevAdded, ...newlyUnlocked.map(b => b.id)]));

    return { updates: {
      xp: latest.xp - cost,
      addedPackBirdIds: newAddedIds,
      freeSilhouetteHints: (latest.freeSilhouetteHints || 0) + 2,
      packsOpenedCount: (latest.packsOpenedCount || 0) + 1
    }, birds: newlyUnlocked };
    });
  };

  // Consumir pistas gratis del Sobre Selva Montana al abrir una Silueta Misteriosa
  const handleConsumeFreeHints = (usedCount: number) => {
    return handleUpdateProfile(latest => ({ updates: {
      freeSilhouetteHints: Math.max(0, (latest.freeSilhouetteHints || 0) - usedCount)
    } }));
  };

  // Paso 15: Registrar especie de la Temporada de Aves Migrantes
  const handleRegisterMigrantBird = (migrantId: string, xpReward: number) => {
    return handleUpdateProfile(latest => {
      const prev = latest.registeredMigrantIds || ['mig-loro-alisero'];
      return { updates: prev.includes(migrantId) ? {} : { registeredMigrantIds: [...prev, migrantId], xp: latest.xp + xpReward } };
    });
  };

  // Paso 15: Desbloquear Ficha Exclusiva de Evento Especial (Global Big Day / Q'MI RAYMI)
  const handleUnlockSpecialEvent = (eventId: string, xpReward: number) => {
    return handleUpdateProfile(latest => {
      const prev = latest.unlockedSpecialEvents || [];
      return { updates: prev.includes(eventId) ? {} : { unlockedSpecialEvents: [...prev, eventId], xp: latest.xp + xpReward } };
    });
  };

  // Paso 15: Reclamar recompensa de Meta Grupal Cooperativa de Cuadrilla
  const handleClaimSquadGoalReward = (squadId: string) => {
    return handleUpdateProfile(latest => {
      const squad = loadSquadsList().find(s => s.id === squadId);
      const key = `squad-goal:${squadId}`;
      const profiles = loadProfilesList();
      const species = new Set(squad?.members.flatMap(member => {
        const profile = profiles.find(p => p.id === member.id);
        return profile ? profile.fieldJournal.filter(isRealObservation).map(e => e.birdName) : member.contributedSpecies;
      }));
      if (!squad || !squad.members.some(m => m.id === latest.id) || species.size < squad.goalTarget)
        return { updates: {}, status: 'not-eligible' };
      if (squad.goalRewardClaimed || profiles.some(p => p.rewardLedger?.includes(key))) return { updates: {}, status: 'already-awarded' };
      return { status: 'awarded', updates: { xp: latest.xp + 150, rewardLedger: [...(latest.rewardLedger || []), key] } };
    });
  };

  // Reset Progress of Active Profile
  const handleResetProgress = () => {
    return handleUpdateProfile(latest => ({ updates: {
      level: 1,
      xp: 0,
      sightingsCompleted: 0,
      questionsAnswered: 0,
      hasRisingObserverBadge: false,
      hasRouteCompleteSeal: false,
      hasDetailObserverBadge: false,
      rewardLedger: [],
      photos: [],
      unlockedPhotos: [],
      missions: createDefaultProfile().missions,
      completedCheckpoints: [],
      birdPhotoStars: {},
      fieldJournal: [],
      mindarDiscoveries: []
    } }));
  };

  const handleRestoreProfileData = (restored: Partial<PlayerProfile>, photos?: BackupPhoto[]): SaveResult | Promise<SaveResult> => {
    const profileId = mindarProfileRef.current.id;
    const commitRestore = (data: Partial<PlayerProfile>): SaveResult | Promise<SaveResult> => {
      const result = handleUpdateProfile(latest => {
        localStorage.setItem(`senial_nativa_pre_restore_${latest.id}`, JSON.stringify(latest));
        return { updates: { ...data, id: latest.id,
          mindarDiscoveries: (data.mindarDiscoveries || []).map(d => ({ ...d, profileId: latest.id })),
          photos: (data.photos || []).map(p => ({ ...p, profileId: latest.id })) } };
      }, profileId);
      if (!result.saved || !result.profile.unlockedPhotos.some(url => url.startsWith('data:'))) return result;
      const migration = migrateLegacyPhotos(result.profile);
      migratingProfiles.current.set(profileId, migration);
      return migration.then(() => {
        const profiles = loadProfilesList();
        const latest = profiles.find(profile => profile.id === profileId);
        if (latest && mindarProfileRef.current.id === profileId) {
          mindarProfileRef.current = latest;
          setActiveProfile(latest);
        }
        setProfiles(profiles);
        return result;
      });
    };
    if (photos === undefined) return commitRestore(restored);
    return (async () => {
      let newRefs: PhotoRef[] = [];
      try {
        const target = loadProfilesList().find(p => p.id === profileId);
        if (!target) throw new Error(SAVE_ERROR);
        localStorage.setItem(`senial_nativa_pre_restore_${profileId}`, JSON.stringify(target));
        const imported = await importBackupPhotos(restored as PlayerProfile, photos, target);
        newRefs = imported.newRefs;
        const result = await commitRestore(imported.profile);
        if (!result.saved) await Promise.all(newRefs.map(ref => deletePhoto(ref).catch(() => {})));
        return result;
      } catch (error) {
        await Promise.all(newRefs.map(ref => deletePhoto(ref).catch(() => {})));
        const message = error instanceof Error && !['QuotaExceededError', 'SecurityError'].includes(error.name) ? error.message : SAVE_ERROR;
        setSaveError(message);
        return { saved: false, status: 'error', error: message };
      }
    })();
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
      <div className="flex h-[100dvh] w-full items-start justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-[#07241E] to-slate-950 p-0 select-none sm:h-auto sm:min-h-screen sm:items-center sm:p-4">
        {/* On mobile, the parent and the app share the same dynamic viewport height.
            Using min-h-screen (100vh) here would vertically center a 100dvh child
            against Chrome UI-inclusive space, causing a top gap and clipped bottom nav. */}
        <div className="relative w-full max-w-[440px] h-[100dvh] sm:h-[880px] sm:max-h-[94vh] sm:rounded-[38px] overflow-hidden shadow-[0_0_60px_rgba(12,110,90,0.4)] border-0 sm:border-4 sm:border-teal-700/60 bg-slate-950 flex flex-col">
          <OfflineIndicator />
          {saveError && <div role="alert" className="absolute top-2 inset-x-2 z-[100] rounded-xl bg-red-950 border border-red-400 p-3 text-xs text-white">
            {saveError}<button className="ml-2 underline min-h-11" onClick={() => setSaveError(null)}>Cerrar</button>
          </div>}
          {/* Render Active Screen */}
          <div className="relative flex-1 w-full h-full overflow-hidden">
          {/* PANTALLA 1: PORTADA */}
          {currentScreen === 'screen1' && (
            <Screen1Splash
              onStartAdventure={() => setCurrentScreen('screen2')}
              returningProfile={getReturningProfile(activeProfile, profiles)}
              onContinue={() => setCurrentScreen('screen4')}
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
              onOpenMiroAvatar={() => {
                setMiroModalInitialMode('yo_jugadores');
                setShowMiroModal(true);
              }}
            />
          )}

          {/* PANTALLA 3: PRESENTACIÓN DEL ANFITRIÓN */}
          {currentScreen === 'screen3' && (
            <Screen3HostPresentation
              activeProfile={activeProfile}
              onAdvanceToMainHub={() => setCurrentScreen('screen4')}
              onBack={() => setCurrentScreen('screen2')}
              onChangePlayer={() => setCurrentScreen('screen2')}
              onOpenMiroAvatar={() => {
                setMiroModalInitialMode('yo_jugadores');
                setShowMiroModal(true);
              }}
            />
          )}

          {/* PANTALLA 4: MENÚ PRINCIPAL */}
          {currentScreen === 'screen4' && (
            <Screen4MainHub
              playerProfile={activeProfile}
              missions={activeProfile.missions}
              hubSheet={hubSheet}
              onHubSheetChange={setHubSheet}
              onOpenOptions={() => setShowOptionsModal(true)}
              onOpenTips={() => setShowTipsModal(true)}
              onOpenMap={() => setShowMapModal(true)}
              onOpenShop={() => setShowShopModal(true)}
              onOpenBirds={() => {
                setBirdsInitialTab('catalog');
                setShowBirdsModal(true);
              }}
              onOpenSighting={() => setShowSightingModal(true)}
              onOpenCompanionPhoto={() => setShowPhotoModal(true)}
              onOpenJournal={() => {
                setBirdsInitialTab('journal');
                setShowBirdsModal(true);
              }}
              onOpenBadge={() => setShowLevelUpModal(true)}
              onOpenDrive={() => setShowDriveModal(true)}
              onOpenSquadsAndSeasons={() => setShowSquadsModal(true)}
              onOpenMiroAvatar={() => {
                setMiroModalInitialMode('yo_jugadores');
                setShowMiroModal(true);
              }}
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
          onSavePhoto={handleCompanionPhoto}
        />

        {/* MODAL DE AVISTAMIENTO XR Y FOTO PERFECTA (PASO 12) */}
        <SightingSimulationModal
          onMindARRegister={(targetIndex) => handleMindARAction('register', undefined, targetIndex)}
          onMindARComplete={(targetIndex) => handleMindARAction('complete', undefined, targetIndex)}
          onMindARRetrySave={handleMindARRetrySave}
          onMindARJournal={() => { setShowSightingModal(false); setBirdsInitialTab('journal'); setShowBirdsModal(true); }}
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
          <div role="dialog" aria-modal="true" aria-label="¡OBSERVADOR DE DETALLES!" className="ui-overlay z-50 flex items-center justify-center p-3 animate-fadeIn">
            <div className="ui-card pb-safe relative w-full max-w-sm overflow-y-auto max-h-[100dvh] text-center space-y-3 shadow-xl">
              <div className="pt-safe"><ModalHeader title="¡OBSERVADOR DE DETALLES!" subtitle="Parque Botánico Barón Schuel" onClose={() => {
                  soundManager.playClick();
                  setShowDetailCelebration(false);
                }} /></div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 mx-auto flex items-center justify-center text-3xl shadow-lg ring-4 ring-amber-400/40">
                🏅
              </div>
              <div>
                <span className="text-[11px] font-black text-teal-300 uppercase tracking-widest block">
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
                +100 XP y Medalla Dorada de Detalle concedida
              </div>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setShowDetailCelebration(false);
                }}
                className="min-h-11 w-full py-2.5 rounded-xl game-btn-orange text-white text-xs font-black"
              >
                ¡CONTINUAR EXPLORANDO!
              </button>
            </div>
          </div>
        )}

        {/* MODAL DE MAPA DE SENDEROS Y 8 ESTACIONES DIGITALES */}
        <TrailMapModal
          isOpen={showMapModal}
          onClose={() => setShowMapModal(false)}
          playerProfile={activeProfile}
          onCompleteStation={handleCompleteStation}
          initialStationToken={initialStationToken}
          onConsumeInitialToken={consumeInitialStationToken}
          onOpenXRVision={() => setShowSightingModal(true)}
          onOpenBirdsCatalog={() => {
            setBirdsInitialTab('catalog');
            setShowBirdsModal(true);
          }}
          onOpenSquadsAndSeasons={() => setShowSquadsModal(true)}
        />

        {/* MODAL DE TIENDA (PRENDAS Y SOBRES DE SILUETAS) */}
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

        {/* MODAL: CUADRILLAS ESCOLARES, TEMPORADAS DE AVES MIGRANTES Y RANKING AMIGABLE */}
        <SquadsAndSeasonsModal
          isOpen={showSquadsModal}
          onClose={() => setShowSquadsModal(false)}
          activeProfile={activeProfile}
          allProfiles={profiles}
          onRegisterMigrantBird={handleRegisterMigrantBird}
          onUnlockSpecialEvent={handleUnlockSpecialEvent}
          onClaimSquadGoalReward={handleClaimSquadGoalReward}
        />

        {/* MODAL OFICIAL DEL TABLERO DE MIRO: PERFIL "YO / JUGADORES", ESTUDIO 3D Y FLUJO DE PANTALLAS */}
        <MiroFlowAndAvatarModal
          isOpen={showMiroModal}
          initialMode={miroModalInitialMode}
          onClose={() => setShowMiroModal(false)}
          activeProfile={activeProfile}
          profiles={profiles}
          onSelectProfile={handleSelectProfile}
          onSelectCompanionBird={handleSelectCompanionBird}
          onUpdateAvatar={(avatarId, avatarIcon, favoriteBird) => {
            return handleUpdateProfile({
              avatarId,
              avatarIcon,
              ...(favoriteBird ? { favoriteBird } : {})
            });
          }}
          onNavigateToScreen={(scr) => setCurrentScreen(scr)}
          onOpenMap={() => setShowMapModal(true)}
          onOpenSighting={() => setShowSightingModal(true)}
          onOpenBirds={() => {
            setBirdsInitialTab('catalog');
            setShowBirdsModal(true);
          }}
          onOpenShop={() => setShowShopModal(true)}
          onOpenSquads={() => setShowSquadsModal(true)}
          onOpenQuiz={() => setShowQuizConsignasModal(true)}
        />

        {/* MODAL DE CELEBRACIÓN DE NIVEL */}
        <LevelUpCelebrationModal
          isOpen={showLevelUpModal}
          onClose={() => setShowLevelUpModal(false)}
          level={activeProfile.level}
        />

        {/* MODAL DE OPCIONES DEL JUEGO */}
        <OptionsModal
          activeProfile={activeProfile}
          onRestoreProfileData={async (profile, photos) => handleRestoreProfileData(profile, photos)}
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
            onRestoreProfileData={handleRestoreProfileData}
          />
        </div>
      </div>
    </LanguageProvider>
  );
}
