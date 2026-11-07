import { PlayerProfile, CompanionBirdId } from '../types/game';
import { INITIAL_MISSIONS, EXPLORER_AVATARS } from '../data/birdsData';

const STORAGE_KEY_PROFILES = 'senial_nativa_profiles_list_v2';
const STORAGE_KEY_ACTIVE_ID = 'senial_nativa_active_profile_id_v2';

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
      hat: 'visera-verde',
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
