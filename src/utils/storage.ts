import { PlayerProfile, CompanionBirdId, Squad } from '../types/game';
import { INITIAL_MISSIONS, EXPLORER_AVATARS } from '../data/birdsData';

const STORAGE_KEY_PROFILES = 'senial_nativa_profiles_list_v2';
const STORAGE_KEY_ACTIVE_ID = 'senial_nativa_active_profile_id_v2';
const STORAGE_KEY_SQUADS = 'senial_nativa_squads_list_v1';

export function createDefaultProfile(
  name = 'Explorador Yungas',
  avatarId = 'avatar-sol',
  favoriteBird: CompanionBirdId = 'Tucán Grande'
): PlayerProfile {
  const avatar = EXPLORER_AVATARS.find(a => a.id === avatarId) || EXPLORER_AVATARS[0];
  const now = Date.now();
  return {
    id: 'prof_' + now + '_' + Math.random().toString(36).substring(2, 7),
    name: name.trim() || 'Explorador',
    avatarId: avatar.id,
    avatarName: avatar.name,
    avatarIcon: avatar.icon,
    favoriteBird,
    level: 1,
    xp: 0,
    sightingsCompleted: 0,
    questionsAnswered: 0,
    hasRisingObserverBadge: false,
    hasRouteCompleteSeal: false,
    hasDetailObserverBadge: false,
    completedCheckpoints: [],
    birdPhotoStars: {},
    unlockedRareBirds: [],
    unlockedSilhouettes: ['016-benteveo'],
    unlockedAcoustics: [],
    addedPackBirdIds: [],
    freeSilhouetteHints: 0,
    packsOpenedCount: 0,
    purchasedGear: ['visera-oficial'],
    equippedItems: ['visera-oficial'],
    unlockedSpecialEvents: [],
    registeredMigrantIds: ['mig-loro-alisero'],
    missions: JSON.parse(JSON.stringify(INITIAL_MISSIONS)),
    fieldJournal: [
      {
        id: 'j_init',
        birdName: favoriteBird,
        scientificName: favoriteBird === 'Tucán Grande' ? 'Ramphastos toco' : 'Especie Nativa',
        trailName: 'Sendero de las Yungas (Entrada)',
        notes: '¡Compañero alado elegido para la expedición en el Parque Barón Schuel!',
        timestamp: now,
        behavior: 'Cantando',
        count: '1 individuo',
        stratum: 'Subdosel',
        weather: 'Soleado'
      }
    ],
    unlockedPhotos: [],
    equippedGear: {
      hat: 'visera-oficial',
      backpack: 'mochila-schuel',
      binoculars: 'prismaticos-oro'
    },
    createdAt: now,
    lastPlayedAt: now
  };
}

export function loadProfilesList(): PlayerProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILES);
    if (!raw) {
      // Seed initial default explorer if completely empty
      const defaultProf = createDefaultProfile('Mateo Guardián', 'avatar-mateo', 'Tucán Grande');
      saveProfilesList([defaultProf]);
      setActiveProfileId(defaultProf.id);
      return [defaultProf];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const defaultProf = createDefaultProfile('Mateo Guardián', 'avatar-mateo', 'Tucán Grande');
      saveProfilesList([defaultProf]);
      setActiveProfileId(defaultProf.id);
      return [defaultProf];
    }
    return parsed.map((p: Partial<PlayerProfile>) => ({
      ...createDefaultProfile(),
      ...p,
      completedCheckpoints: p.completedCheckpoints || [],
      hasRouteCompleteSeal: p.hasRouteCompleteSeal ?? false,
      hasDetailObserverBadge: p.hasDetailObserverBadge ?? false,
      unlockedSilhouettes: p.unlockedSilhouettes || ['016-benteveo'],
      unlockedAcoustics: p.unlockedAcoustics || [],
      addedPackBirdIds: p.addedPackBirdIds || [],
      freeSilhouetteHints: p.freeSilhouetteHints ?? 0,
      packsOpenedCount: p.packsOpenedCount ?? 0,
      purchasedGear: Array.from(new Set(['visera-oficial', ...(p.purchasedGear || [])])),
      equippedItems: p.equippedItems && p.equippedItems.length > 0 ? p.equippedItems : ['visera-oficial'],
      unlockedSpecialEvents: p.unlockedSpecialEvents || [],
      registeredMigrantIds: p.registeredMigrantIds || ['mig-loro-alisero'],
      birdPhotoStars: p.birdPhotoStars || {},
      unlockedRareBirds: p.unlockedRareBirds || [],
      fieldJournal: p.fieldJournal || []
    }));
  } catch {
    const defaultProf = createDefaultProfile('Mateo Guardián', 'avatar-mateo', 'Tucán Grande');
    return [defaultProf];
  }
}

export function saveProfilesList(profiles: PlayerProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
  } catch {
    // ignore
  }
}

export function getActiveProfileId(): string {
  try {
    const id = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
    if (id) return id;
  } catch {
    // ignore
  }
  const profiles = loadProfilesList();
  return profiles[0]?.id || '';
}

export function setActiveProfileId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
  } catch {
    // ignore
  }
}

export function getActiveProfile(): PlayerProfile {
  const profiles = loadProfilesList();
  const activeId = getActiveProfileId();
  const found = profiles.find(p => p.id === activeId);
  if (found) return found;
  if (profiles.length > 0) {
    setActiveProfileId(profiles[0].id);
    return profiles[0];
  }
  const newProf = createDefaultProfile();
  saveProfilesList([newProf]);
  setActiveProfileId(newProf.id);
  return newProf;
}

export function createNewProfile(
  name: string,
  avatarId: string,
  favoriteBird: CompanionBirdId
): PlayerProfile {
  const profiles = loadProfilesList();
  const newProf = createDefaultProfile(name, avatarId, favoriteBird);
  const updated = [newProf, ...profiles];
  saveProfilesList(updated);
  setActiveProfileId(newProf.id);
  return newProf;
}

export function updateActiveProfile(updates: Partial<PlayerProfile>): PlayerProfile {
  const profiles = loadProfilesList();
  const activeId = getActiveProfileId();
  const idx = profiles.findIndex(p => p.id === activeId);
  if (idx === -1) {
    const newProf = { ...createDefaultProfile(), ...updates, lastPlayedAt: Date.now() };
    saveProfilesList([newProf, ...profiles]);
    setActiveProfileId(newProf.id);
    return newProf;
  }
  const updatedProfile: PlayerProfile = {
    ...profiles[idx],
    ...updates,
    lastPlayedAt: Date.now()
  };
  profiles[idx] = updatedProfile;
  saveProfilesList(profiles);
  return updatedProfile;
}

export function switchActiveProfile(profileId: string): PlayerProfile | null {
  const profiles = loadProfilesList();
  const target = profiles.find(p => p.id === profileId);
  if (!target) return null;
  target.lastPlayedAt = Date.now();
  saveProfilesList(profiles);
  setActiveProfileId(profileId);
  return target;
}

export function deleteProfile(profileId: string): PlayerProfile[] {
  let profiles = loadProfilesList();
  profiles = profiles.filter(p => p.id !== profileId);
  if (profiles.length === 0) {
    const fresh = createDefaultProfile('Nuevo Explorador', 'avatar-sol', 'Tucán Grande');
    profiles = [fresh];
  }
  saveProfilesList(profiles);
  setActiveProfileId(profiles[0].id);
  return profiles;
}

// ============================================================================
// SQUADS (CUADRILLAS ESCOLARES / EQUIPO - HASTA 5 INTEGRANTES) PERSISTENCE
// ============================================================================

export function loadSquadsList(): Squad[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SQUADS);
    if (!raw) {
      const activeProf = getActiveProfile();
      const defaultSquad: Squad = {
        id: 'squad_init_1',
        name: 'Exploradores Los Perales',
        schoolOrGroup: 'Escuela Provincial · San Salvador de Jujuy',
        members: [
          {
            id: activeProf.id,
            name: activeProf.name,
            avatarIcon: activeProf.avatarIcon || '🧢',
            favoriteBird: activeProf.favoriteBird,
            isDeviceProfile: true,
            contributedSpecies: ['Benteveo', 'Chinchero Chico', activeProf.favoriteBird],
            journalCount: (activeProf.fieldJournal || []).length
          },
          {
            id: 'comp_1',
            name: 'Sofía (Guardiana)',
            avatarIcon: '🎒',
            favoriteBird: 'Picaflor Cometa',
            isDeviceProfile: false,
            contributedSpecies: ['Picaflor Cometa', 'Zorzal Colorado'],
            journalCount: 3
          },
          {
            id: 'comp_2',
            name: 'Lucas (Vigía)',
            avatarIcon: '🔭',
            favoriteBird: 'Loro Alisero' as unknown as CompanionBirdId,
            isDeviceProfile: false,
            contributedSpecies: ['Loro Alisero', 'Hornero'],
            journalCount: 2
          }
        ],
        sharedSightings: [
          'Benteveo',
          'Chinchero Chico',
          'Tucán Grande',
          'Picaflor Cometa',
          'Zorzal Colorado',
          'Loro Alisero',
          'Hornero'
        ],
        goalTarget: 10,
        goalRewardClaimed: false,
        createdAt: Date.now()
      };
      localStorage.setItem(STORAGE_KEY_SQUADS, JSON.stringify([defaultSquad]));
      return [defaultSquad];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveSquadsList(squads: Squad[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_SQUADS, JSON.stringify(squads));
  } catch {
    // ignore
  }
}
