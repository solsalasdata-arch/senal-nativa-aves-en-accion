import React, { createContext, useContext, useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { soundManager } from './audio';
import { CatalogBird, CheckPoint, Mission, TriviaQuestion } from '../types/game';

export type Language = 'es' | 'en';

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  tx: (es: string, en: string) => string;
}

const STORAGE_LANG_KEY = 'senial_nativa_lang';

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'es',
  setLang: () => {},
  toggleLang: () => {},
  tx: (es) => es
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LANG_KEY);
      if (saved === 'en' || saved === 'es') return saved;
    } catch {
      // ignore
    }
    return 'es';
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_LANG_KEY, lang);
      document.documentElement.lang = lang;
    } catch {
      // ignore
    }
  }, [lang]);

  const setLang = (next: Language) => {
    setLangState(next);
  };

  const toggleLang = () => {
    soundManager.playClick();
    setLangState((prev) => (prev === 'es' ? 'en' : 'es'));
  };

  const tx = (es: string, en: string) => (lang === 'en' ? en : es);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, tx }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

// Compact Language Selector Pill for Top Bars (next to Options Gear)
export const LanguageSelector: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { lang, toggleLang } = useLanguage();

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleLang();
      }}
      className={`h-8 px-2 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-teal-400/60 text-[10px] font-black text-white flex items-center gap-1 shadow-md active:scale-95 transition-all cursor-pointer shrink-0 ${className}`}
      title={lang === 'es' ? 'Cambiar idioma a Inglés / Switch to English' : 'Switch language to Spanish / Cambiar a Español'}
      aria-label="Language Selector"
    >
      <Globe className="w-3 h-3 text-amber-300 shrink-0" />
      <span className={lang === 'es' ? 'text-amber-300 underline' : 'text-slate-400'}>ES</span>
      <span className="text-teal-500">/</span>
      <span className={lang === 'en' ? 'text-amber-300 underline' : 'text-slate-400'}>EN</span>
    </button>
  );
};

// Localization helpers for dynamic data structures (Missions, Trivia, Checkpoints, Catalog Birds)
export function localizeMission(mission: Mission, lang: Language): Mission {
  if (lang === 'es') return mission;
  const map: Record<string, { title: string; difficulty: Mission['difficulty']; description: string; extraReward: string }> = {
    'm-facil': {
      title: 'Mountain Forest Fruits',
      difficulty: 'Fácil',
      description: 'Identify and photograph the Toco Toucan near native fruit trees in the canopy.',
      extraReward: 'Yungas Explorer Cap'
    },
    'm-media': {
      title: 'Mid-Stratum Sentinels',
      difficulty: 'Media',
      description: 'Complete a full bird sighting using the XR binoculars along the Park trails.',
      extraReward: 'Winged Silhouettes Pack'
    },
    'm-desafiante': {
      title: 'Guardian of Barón Schuel',
      difficulty: 'Desafiante',
      description: 'Correctly answer all 5 questions in the Yungas Biodiversity Quiz.',
      extraReward: 'Rising Observer Badge'
    }
  };
  const tr = map[mission.id];
  if (!tr) return mission;
  return {
    ...mission,
    title: tr.title,
    description: tr.description,
    extraReward: tr.extraReward
  };
}

export function localizeDifficultyLabel(diff: string, lang: Language): string {
  if (lang === 'es') return diff;
  if (diff === 'Fácil') return 'Easy';
  if (diff === 'Media') return 'Medium';
  if (diff === 'Desafiante') return 'Challenging';
  return diff;
}

export function localizeTriviaQuestions(questions: TriviaQuestion[], lang: Language): TriviaQuestion[] {
  if (lang === 'es') return questions;
  const enMap: Record<number, { question: string; options: string[]; explanation: string }> = {
    1: {
      question: 'What is the main thermoregulatory function of the Toco Toucan (Ramphastos toco) bill?',
      options: [
        'Storing rainwater like a reservoir',
        'Dissipating or conserving heat thanks to its rich network of blood vessels',
        'Breaking rocks to crush hard seeds',
        'Serving exclusively for courtship with no physical function'
      ],
      explanation: 'The toucan bill has an extensive superficial capillary network: by increasing blood flow to the bill, the bird radiates heat and cools down; by reducing it, it conserves body heat on cool Yungas mornings.'
    },
    2: {
      question: 'In what altitude range and ecoregion is the Barón Schuel Botanical Park Urban Nature Reserve located?',
      options: [
        'Between 2800 and 3200 m.a.s.l. in the arid Puna',
        'At sea level along the Atlantic coast',
        'Between 1334 and 1463 m.a.s.l. in the Yungas Mountain Forest',
        'At 500 m.a.s.l. in the Chaco plain'
      ],
      explanation: 'The Municipal Botanical Park covers 15.5 hectares in San Salvador de Jujuy, ranging from 1334 to 1463 m.a.s.l., protecting the biodiverse Yungas Mountain Forest.'
    },
    3: {
      question: 'Why do Park rules require turning off the camera flash and keeping a respectful distance from birds?',
      options: [
        'To save smartphone battery',
        'Flash temporarily blinds birds, disorienting them and causing nest abandonment or collisions',
        'Because birds are violently attracted to light',
        'It is only an aesthetic suggestion for higher contrast photos'
      ],
      explanation: 'Birds have eyes that are extremely sensitive to light. Camera flashes cause temporary blindness, panic, and severe stress, endangering chicks in the reserve.'
    },
    4: {
      question: 'What special anatomical adaptation does the Narrow-billed Woodcreeper (Chinchero Chico) use to climb trunks vertically?',
      options: [
        'Webbed feet to swim across bark',
        'Hooked beaks with adhesive suction cups',
        'Stiffened tail feathers (rectrices) that act as a prop or tripod',
        'Claws with paralyzing venom'
      ],
      explanation: 'The Narrow-billed Woodcreeper braces its stiffened tail feathers firmly against the bark of laurel and tipa trees, allowing it to rest and climb vertically like a true treecreeper.'
    },
    5: {
      question: 'What primary ecological role do birds like the Toco Toucan play in forest regeneration?',
      options: [
        'Dispersing native seeds through their droppings after digesting fruit pulp',
        'Pollinating nocturnal flowers',
        'Building dams to hold back water',
        'Exclusive control of aquatic pests'
      ],
      explanation: 'By feeding on fleshy fruits in the tree canopy and regurgitating or defecating intact seeds across different sectors, the Toucan plants thousands of new trees every year in the Yungas.'
    }
  };

  return questions.map((q) => {
    const tr = enMap[q.id];
    return tr ? { ...q, ...tr } : q;
  });
}

export function localizeTucanConsignas(questions: TriviaQuestion[], lang: Language): TriviaQuestion[] {
  if (lang === 'es') return questions;
  const enMap: Record<number, { question: string; options: string[]; explanation: string }> = {
    1: {
      question: 'What is the main characteristic of the Great Kiskadee / Benteveo (Pitangus sulphuratus)?',
      options: [
        'Black head with white eyestripe, hidden yellow crown, yellow belly, and "bien-te-veo" call',
        'Completely bright blue plumage with a long forked tail',
        '20 cm crimson red bill and subterranean nocturnal habits',
        'Webbed feet for swimming in high-altitude lagoons'
      ],
      explanation: 'The Benteveo (Great Kiskadee) is unmistakable for its black mask, broad white supercilium, bright yellow breast, and cheerful onomatopoeic "¡bien-te-veo!" call.'
    },
    2: {
      question: 'What is the bill of the Narrow-billed Woodcreeper / Chinchero Chico (Lepidocolaptes angustirostris) like?',
      options: [
        'Thick, conical, and short for crushing corn kernels',
        'Pale, slender, and downward-curved, ideal for probing insects in bark crevices',
        'Spatulate and wide for filtering algae in water',
        'Short with serrated claws along the edges'
      ],
      explanation: 'The Chinchero Chico has a slender, awl-like decurved bill that allows it to extract larvae and insects from deep bark crevices.'
    },
    3: {
      question: 'In which forest stratum does the Toco Toucan (Ramphastos toco) usually move?',
      options: [
        'Subcanopy & canopy (measures 55 cm and has turquoise periocular skin)',
        'Swimming in rocky streambeds',
        'Exclusively walking on the leaf litter without flying',
        'Underground in tunnels dug with its claws'
      ],
      explanation: 'The Toco Toucan hops agilely among the branches of the subcanopy and upper canopy of fig and laurel trees in the Yungas.'
    },
    4: {
      question: 'What conservation status does the Yungas Guan / Pava de Monte (Penelope bridgesi) have in the Park?',
      options: [
        'Invasive urban pest species',
        'Extinct across the entire continent',
        'Vulnerable (VU), measures 72 cm and has a red throat wattle',
        'Common domestic farm bird'
      ],
      explanation: 'The Yungas Guan (Pava de Monte Yungueña) is categorized as Vulnerable (VU) and finds protected sanctuary in the 15.5 hectares of Barón Schuel Botanical Park.'
    },
    5: {
      question: 'What feature distinguishes the male Red-tailed Comet / Picaflor Cometa (Sappho sparganurus)?',
      options: [
        'Its long iridescent orange/magenta forked tail and magenta back',
        'A curved yellow bill 15 cm long',
        'Webbed feet for perching on water',
        'Black and white feathers identical to a penguin'
      ],
      explanation: 'The male Red-tailed Comet dazzles with an extraordinary forked tail that flashes like golden, ruby, and magenta fire as it crosses the Mirador de la Cruz.'
    }
  };

  return questions.map((q) => {
    const tr = enMap[q.id];
    return tr ? { ...q, ...tr } : q;
  });
}

export function localizeCatalogBird(bird: CatalogBird, lang: Language): CatalogBird {
  if (lang === 'es') return bird;

  const enBirds: Record<string, Partial<CatalogBird>> = {
    '001': {
      habitat: 'Clearings, trail edges, and park groves',
      beakDescription: 'Short, conical, strong bill adapted for cracking grass seeds and catching insects.',
      songDescription: 'Melodious whistle of three or four clear notes followed by a vibrant final trill.',
      plumageDescription: 'Gray crest with black stripes, rufous-cinnamon collar on the nape, and white throat.',
      hints: {
        size: '15 cm',
        habitat: 'Stratum: understory and open trail edges',
        morphology: 'Unmistakable black-striped gray crest and rufous-cinnamon nape collar.',
        loreOrFact: 'One of the earliest and most confiding songbirds along the trails of San Salvador de Jujuy.'
      }
    },
    '002': {
      habitat: 'Sunlit canopies and fruit trees of the Mountain Forest',
      beakDescription: 'Medium, stout bluish-gray bill ideal for slicing fleshy fruits and buds.',
      songDescription: 'High-pitched, crystalline warbling notes from high branches.',
      plumageDescription: 'Soft bluish-gray overall plumage with bright turquoise-edged wings and tail.',
      hints: {
        size: '17 cm',
        habitat: 'Stratum: canopy and subcanopy',
        morphology: 'Ashy sky-blue plumage with luminous turquoise wing edges.',
        loreOrFact: 'A key seed disperser for native trees across the Jujuy Yungas.'
      }
    },
    '003': {
      habitat: 'Thickets, fallen logs, and park clearings',
      beakDescription: 'Fine, sharp, slightly curved bill for catching spiders and small insects.',
      songDescription: 'Bubbling, complex, and remarkably loud warble for its tiny size.',
      plumageDescription: 'Uniform cinnamon-brown with fine dark bars on wings and an upright tail.',
      hints: {
        size: '12 cm',
        habitat: 'Stratum: understory and low thickets',
        morphology: 'Tiny, barred brown, and restless, often holding its tail cocked nearly vertical.',
        loreOrFact: 'Tirelessly inspects every hollow and tree root in search of small invertebrates.'
      }
    },
    '004': {
      habitat: 'Mountain Forest and shady groves',
      beakDescription: 'Bright orange-yellow bill in adult males for harvesting wild berries and earthworms.',
      songDescription: 'Melodious, flute-like song rich in musical phrases before dawn.',
      plumageDescription: 'Olive-brown back, white-streaked throat, and brick-orange rufous belly.',
      hints: {
        size: '24 cm',
        habitat: 'Stratum: subcanopy and understory',
        morphology: 'Grayish-brown back, yellow eye-ring, streaked throat, and bright rufous belly.',
        loreOrFact: 'Legend of the Zorzal Colorado: The Guaraní youth Zorzal played the flute for his beloved Agüaí; from his chest emerged this red-bellied thrush with a flute-like song.'
      },
      legend: 'Legend of the Zorzal Colorado: The Guaraní youth Zorzal played the flute for his beloved Agüaí; from his chest emerged this red-bellied thrush with a flute-like song.'
    },
    '005': {
      habitat: 'High canopies of tipa, cebil, and laurel trees',
      beakDescription: 'Short grayish bill with whitish cere at the base for consuming fruits and seeds.',
      songDescription: 'Deep, rhythmic guttural cooing "coo-coo-cooo" echoing through the canopy.',
      plumageDescription: 'Vinaceous-pink head and breast, scaled blue-and-black nape collar, and white wing band.',
      hints: {
        size: '34 cm',
        habitat: 'Stratum: tree canopy',
        morphology: 'Large vinaceous pigeon with scaled neck crescent and white wing stripe.',
        loreOrFact: 'Its name comes from Guaraní "picasú-ró" (bitter dove), due to the taste imparted by wild fruits.'
      }
    },
    '006': {
      habitat: 'Shrubby slopes and wooded ravine edges',
      beakDescription: 'Thick, conical, bright golden-orange bill.',
      songDescription: 'Energetic, clear, melodious whistle "pi-ti-chuuu" from mid-level branches.',
      plumageDescription: 'Black head with long white postocular supercilium, slate-gray back, and buff-cinnamon breast.',
      hints: {
        size: '20 cm',
        habitat: 'Stratum: subcanopy and shrubland',
        morphology: 'Unmistakable strong golden-orange bill, black hood with white supercilium, and cinnamon belly.',
        loreOrFact: 'Also known as Golden-billed Saltator, famous for its powerful song at the Park viewpoints.'
      }
    },
    '007': {
      habitat: 'Woodlands, clearings, and urban edges of the Park',
      beakDescription: 'Straight, strong black bill with a hooked tip for varied prey.',
      songDescription: 'Loud, cheerful three-syllable call: "¡bien-te-veo! ¡bien-te-veo!".',
      plumageDescription: 'Bright yellow belly, black mask, pure white eyestripe, and hidden yellow crown.',
      hints: {
        size: '22 cm',
        habitat: 'Urbanized zone and forest edges',
        morphology: 'Black head with white supercilium, hidden yellow crown, white throat, and bright yellow belly.',
        loreOrFact: "Its common name imitates its unmistakable three-syllable call: 'bien-te-veo'."
      }
    },
    '008': {
      habitat: 'Open areas, grasslands, and Reserve access zones',
      beakDescription: 'Short straight bill with pinkish-red base and black tip for ground insects.',
      songDescription: 'Sharp metallic alarm call "¡te-ro, te-ro, te-ro!" defending its territory.',
      plumageDescription: 'Black breast, black forehead, fine occipital crest, bronze-gray back, and red wing spurs.',
      hints: {
        size: '35 cm',
        habitat: 'Stratum: ground and open clearings',
        morphology: 'Long reddish legs, black breast, fine nape crest, and red shoulder spurs.',
        loreOrFact: 'Famous sentinel that feigns a broken wing away from its nest to distract intruders.'
      }
    },
    '009': {
      habitat: 'Open groves and sunny edges of the Park',
      beakDescription: 'Short, strong conical bill for husking small wild seeds.',
      songDescription: 'Varied, rapid, and musical trill delivered from exposed branches.',
      plumageDescription: 'Adult male gleaming golden-yellow with a distinctive bright saffron-orange forehead.',
      hints: {
        size: '14 cm',
        habitat: 'Stratum: subcanopy and sunny clearings',
        morphology: 'Bright golden-yellow plumage with a vivid saffron-orange forehead in the male.',
        loreOrFact: 'Often seen in pairs or small flocks foraging for seeds in clearings of Barón Schuel.'
      }
    },
    '010': {
      habitat: 'Groves, clearings, and urban edges of the Park',
      beakDescription: 'Conical, straight, jet-black bill adapted to an omnivorous diet of seeds and insects.',
      songDescription: 'Liquid, bubbling warble accompanied by high notes while puffing its feathers.',
      plumageDescription: 'Male glossy black with iridescent violet and metallic blue sheen in sunlight; female grayish-brown.',
      hints: {
        size: '20 cm',
        habitat: 'Stratum: subcanopy and open areas',
        morphology: 'Male entirely black with intense purple and blue iridescent reflections.',
        loreOrFact: 'A brood parasite that lays its eggs in the nests of other species such as the Chingolo.'
      }
    },
    '011': {
      habitat: 'Interior and ravines of the Yungas Mountain Forest',
      beakDescription: 'Stout, versatile black bill for fruits, insects, and small vertebrates.',
      songDescription: 'Wide repertoire of metallic voices, whistles, and social flock calls in the forest.',
      plumageDescription: 'Plush black crest, sky-blue patches above and below the golden-yellow eye, violet-blue nape, and cream breast.',
      hints: {
        size: '34 cm',
        habitat: 'Stratum: canopy and subcanopy of the Yungas',
        morphology: 'Unmistakable black crest, yellow eyes, violet-blue nape, and creamy belly and tail tip.',
        loreOrFact: 'Highly intelligent, social jay that travels along trails in alert family groups.'
      }
    },
    '012': {
      habitat: 'High, exposed canopy branches of the Park',
      beakDescription: 'Wide, hooked black bill ideal for catching large insects in aerial acrobatics.',
      songDescription: 'High-pitched, vibrant trill "sirirí-sirirí" from the highest perches at dawn.',
      plumageDescription: 'Gray head with dark mask, pale throat, bright yellow breast, olive back, and notched tail.',
      hints: {
        size: '21 cm',
        habitat: 'Stratum: exposed canopy (Migrant Species)',
        morphology: 'Gray head without white supercilium, bright yellow belly, and V-notched tail.',
        loreOrFact: 'Perches on the highest treetops to launch elastic sally flights after flying insects.'
      }
    },
    '013': {
      habitat: 'Soaring over slopes, clearings, and viewpoints of the Park',
      beakDescription: 'High, compressed, hooked bluish-gray bill with orange-red facial cere.',
      songDescription: 'Harsh guttural "kra-kra-kra" call while tossing its head back.',
      plumageDescription: 'Black crest, white neck, finely barred black-and-cream chest, and pale wing patches in flight.',
      hints: {
        size: '58 cm',
        habitat: 'Stratum: in flight and open clearings',
        morphology: 'Large raptor with black cap, bare orange-red face, and barred chest.',
        loreOrFact: 'Unlike other falcons, it walks comfortably on the ground thanks to its long yellow legs.'
      }
    },
    '014': {
      habitat: 'Park clearings and groves',
      beakDescription: 'Slightly curved brown bill used to knead mud and plant fibers.',
      songDescription: 'Jubilant synchronized duet with wing-beating by male and female.',
      plumageDescription: 'Earthy rufous-brown back, white throat, and bright rufous tail.',
      hints: {
        size: '18 cm',
        habitat: 'Urbanized zone and forest clearings',
        morphology: 'Earthy brown plumage with white throat, elegant walk on the ground, and rufous tail.',
        loreOrFact: 'Legend of the Hornero: Argentina’s National Bird, famous for building its sturdy clay oven-shaped nest.'
      },
      legend: 'Legend of the Hornero: Two young potters in love were transformed into Argentina’s national bird, which models its home in dome-shaped clay nests.'
    },
    '015': {
      habitat: 'Humid understory and ravines of the Mountain Forest',
      beakDescription: 'Fine black bill specialized in catching small insects among foliage.',
      songDescription: 'Sweet, crystalline series of high whistles that liven up the forest interior.',
      plumageDescription: 'Rufous-chestnut crown, white eye crescents, gray back, bright yellow breast, and black tail with white edges.',
      hints: {
        size: '13 cm',
        habitat: 'Stratum: understory and subcanopy',
        morphology: 'Rufous-brown cap, split white eye-ring, yellow breast, and fanned tail with white outer feathers.',
        loreOrFact: 'Constantly fans and wags its black-and-white tail to flush insects hidden on leaves.'
      }
    },
    '016': {
      habitat: 'Lichen-draped canopies and air plants in the Yungas',
      beakDescription: 'Tiny pointed bill with dark upper mandible and yellowish lower mandible.',
      songDescription: 'Rapid ascending buzzing trill ending in a sharp snap.',
      plumageDescription: 'Bluish-gray back with olive-green dorsal patch, orange-tinted yellow throat and breast, and two white wing bars.',
      hints: {
        size: '10 cm',
        habitat: 'Stratum: canopy and subcanopy',
        morphology: 'Very small, bluish back with olive dorsal patch and yellow breast with orange wash.',
        loreOrFact: 'Builds its nest hidden inside hanging beard lichens and epiphytes on high branches.'
      }
    },
    '017': {
      habitat: 'Dense interior of the Botanical Park Mountain Forest',
      beakDescription: 'Strong dark brown bill for gathering native laurel, chal-chal, and fig fruits.',
      songDescription: 'Deep, hoarse barking call and resonant wing-whirring at dawn.',
      plumageDescription: 'Dark bronze-brown with fine white streaking on chest and wing coverts, and prominent red throat wattle.',
      hints: {
        size: '72 cm',
        habitat: 'Stratum: subcanopy and understory (Vulnerable Species - VU)',
        morphology: 'Large size, white-streaked bronze-brown plumage, and striking red throat dewlap.',
        loreOrFact: 'Flagship conservation species of the Yungas; finds safe sanctuary in the 15.5 ha of Barón Schuel Reserve.'
      }
    },
    '018': {
      habitat: 'Mountain Forest canopy and cliffs of the Yungas',
      beakDescription: 'Large, strong ivory-horn hooked bill capable of cracking hard seeds.',
      songDescription: 'Loud metallic calls uttered in unison while flying in swift flocks.',
      plumageDescription: 'Bright green with striking scarlet-red forehead and cheek mask, bare white eye-ring, and long pointed tail.',
      hints: {
        size: '36 cm',
        habitat: 'Stratum: canopy and in flight over ravines',
        morphology: 'Long-tailed green parakeet with forehead and face splashed with crimson red.',
        loreOrFact: 'Its flocks announce dusk as they cross the Botanical Park sky toward their roosts.'
      }
    },
    '019': {
      habitat: 'Forest edges and fruit trees of the Park',
      beakDescription: 'Short, stout bluish bill with dark tip for slicing sweet fruits.',
      songDescription: 'High, lively warble of repeated notes in sunlit treetops.',
      plumageDescription: 'Turquoise-blue hood, black mask and back, and fiery yellow-orange breast.',
      hints: {
        size: '17 cm',
        habitat: 'Stratum: canopy and subcanopy',
        morphology: 'Bright sky-blue head and wings, black mask, and glowing orange-yellow breast.',
        loreOrFact: 'Brings the most vibrant colors to the sunlit canopies of Barón Schuel Botanical Park.'
      }
    },
    '020': {
      habitat: 'Vines, epiphytes, and dense Mountain Forest tangles',
      beakDescription: 'Straight, strong wedge-shaped bill for probing bromeliads and aerial leaf litter.',
      songDescription: 'Accelerated series of dry, vibrant metallic notes among branches.',
      plumageDescription: 'Olive-brown back, distinct buff-cinnamon supercilium, creamy-white streaked brown chest, and rufous tail.',
      hints: {
        size: '17 cm',
        habitat: 'Stratum: subcanopy and understory with epiphytes',
        morphology: 'Well-defined cinnamon eyebrow, heavily streaked chest, and rufous-chestnut tail.',
        loreOrFact: 'Specialist in inspecting the interior of bromeliads and dead leaf clusters hanging from branches.'
      }
    },
    '021': {
      habitat: 'Open groves and edges of the Botanical Park',
      beakDescription: 'Short conical black bill surrounded by a well-defined dark mask.',
      songDescription: 'Melodious, varied choral song performed by several individuals together in the branches.',
      plumageDescription: 'Soft brownish-gray body contrasting with bright rufous-chestnut (bay) wings.',
      hints: {
        size: '18 cm',
        habitat: 'Stratum: subcanopy and open groves',
        morphology: 'Ashy-gray body with black mask and striking rufous-chestnut (bay) wings.',
        loreOrFact: 'Called "Músico" (Musician) for its pleasant group concerts in the treetops.'
      }
    }
  };

  const tr = enBirds[bird.catalogNumber];
  return tr ? { ...bird, ...tr } : bird;
}

export function localizeCheckpoint(cp: CheckPoint, lang: Language): CheckPoint {
  if (lang === 'es') return cp;
  const enChallenges: Record<number, CheckPoint['challenge']> = {
    1: {
      question: 'What distinctive visible feature does the Yungas Guan (Pava de Monte Yungueña) have on its throat?',
      options: [
        'A collar of turquoise feathers',
        'A striking fleshy red throat wattle (caruncle)',
        'A bright golden crest',
        'A row of pearl-like white feathers'
      ],
      correctIndex: 1,
      explanation: 'The Yungas Guan has a characteristic bare red throat wattle that it displays during courtship.'
    },
    2: {
      question: 'What striking structure do Crested Oropendolas (Yapúes) build on the highest branches of the viewpoint?',
      options: [
        'Twig dams on the damp forest floor',
        'Large woven hanging nests shaped like elongated pouches',
        'Deep burrows in tuff cliffs',
        'Mud baskets attached to rocks'
      ],
      correctIndex: 1,
      explanation: 'Crested Oropendolas (Yapúes) are famous colonial weavers that build pendulous nests up to 1 meter long hanging from branch tips.'
    },
    3: {
      question: 'Where does the Buff-browed Foliage-gleaner (Ticotico Estriado) mainly search for insects in this humid sector?',
      options: [
        'Diving in the mountain stream',
        'Inspecting the inside of epiphytic bromeliads and dead leaf clusters',
        'Hunting in flight high above the hills',
        'Scratching dry grassland soil'
      ],
      correctIndex: 1,
      explanation: 'The Buff-browed Foliage-gleaner meticulously probes with its bill among bromeliad leaves and mossy branches.'
    },
    4: {
      question: 'What is the characteristic territorial sound of the Cream-backed Woodpecker (Carpintero Lomo Blanco) on tree trunks?',
      options: [
        'A continuous high-pitched whistle',
        'A powerful double knock: "toc-toc!" that echoes through the forest',
        'A guttural frog-like croak',
        'A canary-like warbling trill'
      ],
      correctIndex: 1,
      explanation: 'Campephilus woodpeckers perform an unmistakable double drum consisting of two resonant strikes on hollow wood.'
    },
    5: {
      question: 'Why does the male Red-tailed Comet (Picaflor Cometa) tail seem to ignite when turning in the sunlight?',
      options: [
        'It has chemical bioluminescence produced by bacteria',
        'Its feather barbules have prismatic microstructures that cause optical iridescence',
        'It secretes phosphorescent pollen from flowers',
        'The feathers reflect only the green color of the forest'
      ],
      correctIndex: 1,
      explanation: 'The feather microstructures of the Red-tailed Comet act like tiny prisms that refract sunlight into dazzling red-gold flashes.'
    },
    6: {
      question: 'Unlike large woodpeckers, what are the tail feathers of the White-barred Piculet (Carpinterito Barrado) like?',
      options: [
        'Rigid iron-like spines',
        'Soft and rounded, so it does not use them as a tripod prop',
        'More than 30 cm in length',
        'Webbed like those of a duck'
      ],
      correctIndex: 1,
      explanation: 'Piculets (Picumnus) lack stiffened spine-tipped tail feathers; they cling agilely to vines and thin twigs using their strong feet.'
    },
    7: {
      question: 'What is the shape of the Rufous-browed Peppershrike (Juan Chiviro) bill that allows it to tear caterpillars and tough prey?',
      options: [
        'Long and tubular for nectar',
        'Stout, deep, and strongly hooked at the tip',
        'Horizontally flattened like a spoon',
        'Short and conical like a finch'
      ],
      correctIndex: 1,
      explanation: 'The Juan Chiviro has a powerful shrike-like hooked bill used to crush large insects and tough prey.'
    },
    8: {
      question: 'Why is the Black-backed Grosbeak (Rey del Bosque) considered one of the most treasured birds of the Yungas?',
      options: [
        'Because of its giant size larger than a condor',
        'For its golden-yellow plumage and one of the most melodious, powerful whistled songs in the forest',
        'Because it swims in snowmelt streams',
        'Because it is the only bird that flies backward'
      ],
      correctIndex: 1,
      explanation: 'The Rey del Bosque stands out for its striking black-and-gold contrast and flute-like song heard across the ravine.'
    }
  };

  return {
    ...cp,
    challenge: enChallenges[cp.id] || cp.challenge
  };
}
