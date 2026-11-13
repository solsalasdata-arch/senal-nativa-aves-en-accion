export type CompanionBirdId = 'Tucán Grande' | 'Benteveo' | 'Chinchero Chico' | 'Picaflor Cometa';

export interface JournalEntry {
  id: string;
  birdName: string;
  scientificName: string;
  trailName: string;
  notes: string;
  timestamp: number;
  photoUrl?: string;
  stars?: number;
  // 4 Toques Científicos (Paso 13)
  behavior?: 'Alimentándose' | 'Cantando' | 'En reposo' | 'En vuelo';
  count?: '1 individuo' | 'Pareja (2)' | 'Bandada (3 o más)';
  stratum?: 'Sotobosque' | 'Subdosel' | 'Dosel' | 'Zona urbanizada' | 'Zona Urbanizada' | 'En vuelo' | 'En Vuelo';
  weather?: 'Soleado' | 'Nublado' | 'Llovizna de Yungas';
}

export interface ShopItem {
  id: string;
  name: string;
  category: string;
  cost: number;
  description: string;
  icon: string;
  defaultEquipped?: boolean;
}

export interface SquadMember {
  id: string;
  name: string;
  avatarIcon: string;
  favoriteBird: CompanionBirdId;
  isDeviceProfile?: boolean;
  contributedSpecies: string[];
  journalCount: number;
}

export interface Squad {
  id: string;
  name: string;
  schoolOrGroup?: string;
  members: SquadMember[]; // max 5 players
  sharedSightings: string[];
  goalTarget: number;
  goalRewardClaimed?: boolean;
  createdAt: number;
}

export interface PlayerProfile {
  id: string;
  name: string;
  avatarId: string;
  avatarName: string;
  avatarIcon: string;
  favoriteBird: CompanionBirdId;
  level: number;
  xp: number;
  sightingsCompleted: number; // target: 1
  questionsAnswered: number; // target: 5
  hasRisingObserverBadge: boolean;
  hasRouteCompleteSeal: boolean; // Sello de Ruta Completa (8/8 checkpoints)
  hasDetailObserverBadge: boolean; // Insignia Observador de Detalles (10 entradas en diario)
  completedCheckpoints: number[]; // IDs of checkpoints completed 1-8
  birdPhotoStars: Record<string, number>; // best rating (1-3 stars) per species
  unlockedRareBirds: string[]; // e.g. 'urutau', 'jote-real'
  unlockedSilhouettes: string[]; // IDs of illuminated birds in catalog
  unlockedAcoustics: string[]; // IDs of bird songs identified
  addedPackBirdIds?: string[]; // Extra silhouettes added via Sobre Selva Montana
  freeSilhouetteHints?: number; // Free hints from Sobre Selva Montana
  packsOpenedCount?: number; // Number of Sobre Selva Montana packs opened
  purchasedGear?: string[]; // IDs of shop items unlocked
  equippedItems?: string[]; // IDs of shop items currently equipped on avatar
  unlockedSpecialEvents?: string[]; // 'global-big-day' | 'qmi-raymi'
  registeredMigrantIds?: string[]; // IDs of Season Migrant birds registered
  missions: Mission[]; // 3 daily missions
  fieldJournal: JournalEntry[]; // 0/10 entries
  unlockedPhotos: string[];
  equippedGear: {
    hat: string;
    backpack: string;
    binoculars: string;
  };
  createdAt: number;
  lastPlayedAt: number;
}

export type PlayerState = PlayerProfile;

export interface Mission {
  id: string;
  title: string;
  difficulty: 'Fácil' | 'Media' | 'Desafiante';
  duration: string; // e.g. "20 min", "30 min", "40 min"
  description: string;
  xpReward: number;
  extraReward: string;
  progress: number;
  target: number;
  completed: boolean;
}

export interface CatalogBird {
  id: string;
  catalogNumber: string; // '011', '012', ...
  commonName: string;
  scientificName: string;
  size: string;
  weight: string;
  family: string;
  habitat: string;
  stratum: 'Sotobosque' | 'Subdosel' | 'Dosel' | 'Zona urbanizada' | 'En vuelo';
  conservationStatus: 'NA' | 'VU' | 'AM'; // No Amenazada | Vulnerable | Amenazada
  presence: 'R' | 'M'; // Residente | Migrante
  observationPossibility: 'A' | 'M' | 'B'; // Alta | Media | Baja
  beakDescription: string;
  songDescription: string;
  plumageDescription: string;
  cp: number; // e.g. 2579
  hp: string; // e.g. '125/125'
  hints: {
    size: string;
    habitat: string;
    morphology: string;
    loreOrFact: string;
  };
  legend?: string;
  soundType: string;
  image: string;
  imageFocus?: string; // CSS object-position so the bird stays in frame when the photo fills a card
  audioUrl: string;
  silhouetteIcon: string;
}

export interface BirdSpecies {
  id: string;
  commonName: string;
  scientificName: string;
  family: string;
  size: string;
  weight: string;
  habitat: string;
  stratum: string;
  description: string;
  diet: string;
  callDescription: string;
  soundType: string;
  silhouette: string;
  image: string;
  audioUrl?: string;
  funFact: string;
  isRare?: boolean;
  legend?: string;
}

export interface TriviaQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  birdId?: string;
}

export interface CheckPoint {
  id: number;
  name: string;
  distanceMeters: number;
  type: 'Descanso' | 'Mirador' | 'Puente';
  probableSpecies: {
    common: string;
    scientific: string;
    silhouetteIcon: string;
    description: string;
  }[];
  challenge: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  coords: { x: number; y: number };
}

export interface ParkTrail {
  id: string;
  name: string;
  elevation: string;
  distance: string;
  difficulty: string;
  description: string;
  keyBird: string;
  coordinates: { x: number; y: number };
}

export interface ExplorerAvatar {
  id: string;
  name: string;
  title: string;
  icon: string;
  description: string;
}
