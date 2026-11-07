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
    '010': {
      habitat: 'Tree trunks and bark of the Yungas',
      beakDescription: 'Pale, slender, downward-curved bill, ideal for probing insects under bark.',
      songDescription: 'Rapid descending trill "ti-ti-ti-tirrr".',
      plumageDescription: 'Crisp white supercilium, cinnamon back, and creamy-white streaked breast.',
      hints: {
        size: '21 cm',
        habitat: 'Stratum: subcanopy and tree trunks',
        morphology: 'Pale awl-like curved bill and stiff tail feathers used as a tripod.',
        loreOrFact: 'Climbs tipa and laurel trunks in spirals searching for hidden larvae.'
      }
    },
    '011': {
      habitat: 'Mountain Forest and Canyons',
      beakDescription: 'Massive hooked red-and-ivory bill capable of tearing thick hides.',
      songDescription: 'Deep hisses and low bill snaps on rocky ledges.',
      plumageDescription: 'Creamy white body with jet-black flight feathers; bare head in crimson, orange, and blue.',
      hints: {
        size: '78 cm',
        habitat: 'In flight (soars high above the Reserve)',
        morphology: 'White body with black wings and tail, bare red-orange neck and bill caruncle.',
        loreOrFact: 'Belongs to Cathartidae; glides on thermal currents without sexual dimorphism.'
      }
    },
    '012': {
      habitat: 'Alder forests and high ravines',
      beakDescription: 'Strong pale horn-colored bill adapted for opening mountain alder cones.',
      songDescription: 'Loud metallic flock calls while flying swiftly across valleys.',
      plumageDescription: 'Bright emerald green with black-edged feathers, red forehead, and pale bill.',
      hints: {
        size: '32 cm',
        habitat: 'Stratum: canopy & subcanopy (Migrant & Threatened - AM)',
        morphology: 'Green plumage with red forehead, white eye-ring, and red primary coverts.',
        loreOrFact: 'Emblematic migrant parrot of the Yungas mountain alder forests.'
      }
    },
    '013': {
      habitat: 'Flowering slopes and ravines',
      beakDescription: 'Straight, fine 2 cm black bill to reach nectar in tubular flowers.',
      songDescription: 'Tail hum and sharp territorial "tsik-tsik" notes near epiphytic flowers.',
      plumageDescription: 'Male with emerald throat, crimson back, and very long golden-ruby forked tail.',
      hints: {
        size: 'Male: 16 cm / Female: 12 cm',
        habitat: 'Stratum: subcanopy',
        morphology: 'Emerald green with iridescent magenta back and long glowing orange-red tail.',
        loreOrFact: 'Marked sexual dimorphism: the male sports a comet-like forked tail.'
      }
    },
    '014': {
      habitat: 'Mountain Forest and Transition Forest',
      beakDescription: 'Tiny bill with a wide gape surrounded by tactile bristles.',
      songDescription: 'Haunting descending nocturnal lament: "Turay, kakuy... pua-pua-uh".',
      plumageDescription: 'Master of camouflage: gray, ash, and brown tones mimicking a broken dry stump.',
      hints: {
        size: '35 cm',
        habitat: 'Stratum: canopy and subcanopy',
        morphology: 'Cryptic mottled brown-and-gray plumage, large head, and huge yellow eyes.',
        loreOrFact: "Legend of the Urutaú (Kakuy): A captive sister atop a tall tree cried out at night 'Turay, turay! Kakuy, kakuy!' (my brother) until transforming into this nocturnal bird."
      },
      legend: 'Legend of the Urutaú (Kakuy): A captive sister atop a tall tree cried out at night "Turay, turay! Kakuy, kakuy!" (my brother) until transforming into this nocturnal bird.'
    },
    '015': {
      habitat: 'Forest streams and ravines',
      beakDescription: 'Stout yellowish-green bill for probing crabs and worms in stream mud.',
      songDescription: 'Resounding synchronized duet: "¡chi-ri-co-te, chi-ri-co-te!" at dawn and dusk.',
      plumageDescription: 'Slate-gray head and neck, rufous-chestnut breast, olive back, and red legs.',
      hints: {
        size: '37 cm',
        habitat: 'Stratum: understory and stream edges',
        morphology: 'Gray head and neck, chestnut crown, red iris, green bill with yellow base, rufous belly.',
        loreOrFact: 'Has short rounded wings, strong pinkish-red legs, and long toes.'
      }
    },
    '016': {
      habitat: 'Woodlands, clearings, and urban edges',
      beakDescription: 'Straight, strong black bill with a hooked tip for varied prey.',
      songDescription: 'Loud, cheerful three-syllable call: "¡bien-te-veo! ¡bien-te-veo!".',
      plumageDescription: 'Bright yellow belly, black mask, pure white eyestripe, and hidden yellow crown.',
      hints: {
        size: '22 cm',
        habitat: 'Urbanized zone (Park entrance and clearings)',
        morphology: 'Black head with white supercilium, hidden yellow crown, white throat, and yellow belly.',
        loreOrFact: "Its common name imitates its unmistakable three-syllable call: 'bien-te-veo'."
      }
    },
    '017': {
      habitat: 'Park clearings and groves',
      beakDescription: 'Slightly curved brown bill used to knead mud and straw pellets.',
      songDescription: 'Jubilant synchronized duet with wing-beating by male and female.',
      plumageDescription: 'Earthy rufous-brown back, white throat, and soft buff belly.',
      hints: {
        size: '18 cm',
        habitat: 'Urbanized zone',
        morphology: 'Rufous-brown upperparts with white throat and bright rufous tail.',
        loreOrFact: 'Legend of the Hornero: Two young potters in love were transformed into Argentina’s national bird, which builds dome-shaped clay oven nests.'
      },
      legend: 'Legend of the Hornero: Two young potters in love were transformed into Argentina’s national bird, which builds dome-shaped clay oven nests.'
    },
    '018': {
      habitat: 'Mountain Forest and shady groves',
      beakDescription: 'Bright orange-yellow bill in adult males for harvesting wild berries.',
      songDescription: 'Melodious, flute-like song rich in musical phrases before dawn.',
      plumageDescription: 'Olive-brown back, streaked white throat, and brick-orange rufous belly.',
      hints: {
        size: '24 cm',
        habitat: 'Stratum: subcanopy and understory',
        morphology: 'Grayish-brown back, yellow eye-ring, white-streaked throat, and bright rufous belly.',
        loreOrFact: 'Legend of the Zorzal Colorado: The Guaraní youth Zorzal played the flute for his beloved Agüaí; from his chest emerged this red-bellied thrush with a flute-like song.'
      },
      legend: 'Legend of the Zorzal Colorado: The Guaraní youth Zorzal played the flute for his beloved Agüaí; from his chest emerged this red-bellied thrush with a flute-like song.'
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
