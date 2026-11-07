import { BirdSpecies, TriviaQuestion, ParkTrail, Mission, CheckPoint, CatalogBird } from '../types/game';

export const BIRDS_DATA: BirdSpecies[] = [
  {
    id: 'tucan-grande',
    commonName: 'Tucán Grande',
    scientificName: 'Ramphastos toco',
    family: 'Ramphastidae',
    size: '55 - 63 cm',
    weight: '500 - 860 g',
    habitat: 'Selva Montana y Bosque de Transición de las Yungas',
    stratum: 'Dosel superior',
    description: 'Ave insignia del Parque Botánico. Presenta un inconfundible pico amarillo-anaranjado de 20 cm con mancha negra en la punta, babero blanco inmaculado, piel periocular turquesa y plumaje negro azabache.',
    diet: 'Frutos silvestres (higuerones, laureles de la falda), insectos, huevos y pequeños vertebrados.',
    callDescription: 'Croar grave y resonante "grrr-ock" que retumba en las laderas boscosas.',
    soundType: 'toucan',
    silhouette: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',
    image: '/assets/aistudio/Toucan_perched_on_branch_8ab41bfc_230157f9.jpg',
    funFact: 'Su pico parece pesado pero es sumamente liviano: posee una estructura trabecular interna de queratina que actúa además como radiador térmico para regular su temperatura corporal en los días cálidos de Jujuy.'
  },
  {
    id: 'benteveo-comun',
    commonName: 'Benteveo Común',
    scientificName: 'Pitangus sulphuratus',
    family: 'Tyrannidae',
    size: '22 - 25 cm',
    weight: '60 - 75 g',
    habitat: 'Bordes de selva, claros y arroyos de montaña',
    stratum: 'Estrato medio y sotobosque',
    description: 'Muy conspicuo y vivaz. Luce una ancha corona con plumas amarillas ocultas, antifaz negro sobre ceja blanca, y un pecho amarillo brillante inconfundible.',
    diet: 'Omnívoro cazador: insectos voladores, pequeños peces en pozas, lagartijas y bayas.',
    callDescription: 'Grito sonoro y bisilábico: "¡Bicho-feo! ¡Bicho-feo!" con notas de alarma.',
    soundType: 'benteveo',
    silhouette: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
    image: '/assets/aistudio/Toucan_perched_on_branch_8ab41bfc_230157f9.jpg',
    funFact: 'Es un ave centinela: cuando percibe un gavilán o una serpiente en el sendero, emite una alarma que avisa a todas las demás especies del bosque.'
  },
  {
    id: 'chinchero-chico',
    commonName: 'Chinchero Chico',
    scientificName: 'Lepidocolaptes angustirostris',
    family: 'Furnariidae',
    size: '18 - 20 cm',
    weight: '30 - 38 g',
    habitat: 'Troncos añosos de tipas, laureles y cebiles',
    stratum: 'Troncos y fustes',
    description: 'Especialista en trepar cortezas. Posee un pico esbelto, suavemente curvado color marfil, ceja blanca larga y pecho estriado de canela.',
    diet: 'Insectos, larvas y arañas ocultas bajo el musgo y las cortezas.',
    callDescription: 'Trino descendente rápido y agudo "ti-ti-ti-tirrr".',
    soundType: 'chinchero',
    silhouette: 'M12 3L2 12h3v8h14v-8h3L12 3z',
    image: '/assets/aistudio/Toucan_perched_on_branch_8ab41bfc_230157f9.jpg',
    funFact: 'Sus plumas timoneras de la cola tienen raquis rígidos como púas que utiliza como un trípode para sostenerse en posición vertical mientras martilla la corteza.'
  },
  {
    id: 'loro-alisero',
    commonName: 'Loro Alisero / Maracaná',
    scientificName: 'Psittacara leucophthalmus',
    family: 'Psittacidae',
    size: '32 - 35 cm',
    weight: '140 - 170 g',
    habitat: 'Laderas boscosas y alisedas de altura',
    stratum: 'Dosel y vuelo libre sobre las copas',
    description: 'Plumaje verde esmeralda con salpicaduras rojas en mejillas y hombros. Vuelo rápido y en bandadas muy ruidosas.',
    diet: 'Semillas de aliso del cerro, frutos carnosos y brotes tiernos.',
    callDescription: 'Gritos metálicos estridentes en coro al cruzar los valles de San Salvador.',
    soundType: 'parrot',
    silhouette: 'M12 2l10 10-10 10L2 12z',
    image: '/assets/aistudio/Toucan_perched_on_branch_8ab41bfc_230157f9.jpg',
    funFact: 'Forman parejas de por vida y vuelan juntos a gran velocidad sorteando las corrientes térmicas ascendentes de las serranías de Jujuy.'
  },
  {
    id: 'picaflor-comun',
    commonName: 'Picaflor Común',
    scientificName: 'Chlorostilbon lucidus',
    family: 'Trochilidae',
    size: '8 - 10 cm',
    weight: '3.2 - 4.1 g',
    habitat: 'Orquídeas, bromelias y flores tubulares de las Yungas',
    stratum: 'Flores epífitas y sotobosque',
    description: 'Joya alada. El macho luce un plumaje verde esmeralda iridiscente resplandeciente, cola ahorquillada azulada y pico rojo con punta negra.',
    diet: 'Néctar floral rico en azúcares y diminutos insectos suspendidos en el aire.',
    callDescription: 'Chirrido seco y zumbido ultrasónico de alas (hasta 80 aleteos por segundo).',
    soundType: 'hummingbird',
    silhouette: 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z',
    image: '/assets/aistudio/Toucan_perched_on_branch_8ab41bfc_230157f9.jpg',
    funFact: 'Es el polinizador clave de las bromelias epífitas que cuelgan de las ramas gigantes en el Parque Botánico Schuel.'
  },
  {
    id: 'picaflor-cometa',
    commonName: 'Picaflor Cometa',
    scientificName: 'Sappho sparganurus',
    family: 'Trochilidae',
    size: '19 - 22 cm (incluyendo cola)',
    weight: '5.5 - 6.5 g',
    habitat: 'Quebradas y laderas floridas de las Yungas',
    stratum: 'Estrato medio y arbustivo',
    description: 'Espectacular colibrí de cola bífida extremadamente larga y lustrosa, con tonalidades doradas, rubíes y bronce resplandeciente.',
    diet: 'Néctar de bromelias, salvias y pequeñas moscas cazadas al vuelo.',
    callDescription: 'Vibrante zumbido de cola y gorjeo agudo "tsik-tsik".',
    soundType: 'hummingbird',
    silhouette: 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z',
    image: '/assets/aistudio/Toucan_perched_on_branch_8ab41bfc_230157f9.jpg',
    funFact: 'Cuando realiza el vuelo nupcial sobre el Mirador de la Cruz, despliega su cola como un cometa de fuego reflejando la luz solar.'
  }
];

export const EXPLORER_AVATARS: { id: string; name: string; title: string; icon: string; description: string }[] = [
  {
    id: 'avatar-mateo',
    name: 'Mateo',
    title: 'Rastreador de Senderos',
    icon: '🧢',
    description: 'Especialista en identificar huellas y nidos entre los helechos de la selva montana.'
  },
  {
    id: 'avatar-sol',
    name: 'Sol',
    title: 'Exploradora Botánica',
    icon: '🎒',
    description: 'Siempre con su cuaderno de campo anotando frutos y épocas de floración de las Yungas.'
  },
  {
    id: 'avatar-carlos',
    name: 'Carlos',
    title: 'Guardaparque Mayor',
    icon: '🌲',
    description: 'Conoce cada curva del Barón Schuel desde la entrada hasta el Mirador de la Cruz.'
  },
  {
    id: 'avatar-vale',
    name: 'Valentina',
    title: 'Ornitóloga de las Yungas',
    icon: '🔭',
    description: 'Experta en cantos alados y en enfocar prismáticos en las copas de los árboles.'
  }
];

export const COMPANION_BIRDS_OPTIONS: {
  name: 'Tucán Grande' | 'Benteveo' | 'Chinchero Chico' | 'Picaflor Cometa';
  scientific: string;
  badge: string;
  asset: string;
  desc: string;
}[] = [
  {
    name: 'Tucán Grande',
    scientific: 'Ramphastos toco',
    badge: 'Ave Emblema',
    asset: '/assets/aistudio/Toucan_perched_on_branch_8ab41bfc_230157f9.jpg',
    desc: 'Majestuoso pico naranja y babero blanco. Guía oficial del Parque.'
  },
  {
    name: 'Benteveo',
    scientific: 'Pitangus sulphuratus',
    badge: 'Centinela',
    asset: '/assets/aistudio/Remove_text_from_screen_248c7528_824b6a34.jpg',
    desc: 'Vigilante alegre de pecho amarillo y ceja blanca en los senderos.'
  },
  {
    name: 'Chinchero Chico',
    scientific: 'Lepidocolaptes angustirostris',
    badge: 'Trepador',
    asset: '/assets/aistudio/c3da3f37-f246-40f4-8d25-1958fb93d2f1_0d2a7f41.jpeg',
    desc: 'Pico arqueado color marfil para trepar cortezas añosas.'
  },
  {
    name: 'Picaflor Cometa',
    scientific: 'Sappho sparganurus',
    badge: 'Joya Alada',
    asset: '/assets/aistudio/Botanical_park_start_screen_logo_546dfb3b_47fb3d00.jpg',
    desc: 'Cola resplandeciente como cometa dorado en las quebradas floridas.'
  }
];

export const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  {
    id: 1,
    question: '¿Cuál es la función termorreguladora principal del pico del Tucán Grande (Ramphastos toco)?',
    options: [
      'Almacenar agua de lluvia como un depósito',
      'Disipar o conservar calor gracias a su rica red de vasos sanguíneos',
      'Romper piedras para triturar semillas duras',
      'Servir exclusivamente para el cortejo sin función física'
    ],
    correctIndex: 1,
    explanation: 'El pico del tucán cuenta con una vasta red capilar superficial: al aumentar el flujo sanguíneo hacia el pico, el ave irradia calor y se refresca; al reducirlo, conserva su temperatura en las mañanas frías de las Yungas.'
  },
  {
    id: 2,
    question: '¿En qué rango altitudinal y ecorregión se ubica la Reserva Natural Urbana Parque Botánico Barón Schuel?',
    options: [
      'Entre 2800 y 3200 m.s.n.m. en la Puna árida',
      'Al nivel del mar en la costa marítima',
      'Entre 1334 y 1463 m.s.n.m. en la Selva Montana de las Yungas',
      'A 500 m.s.n.m. en la llanura chaqueña'
    ],
    correctIndex: 2,
    explanation: 'El Parque Botánico Municipal abarca 15.5 hectáreas en San Salvador de Jujuy, en un gradiente de 1334 a 1463 m.s.n.m., protegiendo la rica Selva Montana de las Yungas.'
  },
  {
    id: 3,
    question: '¿Por qué la norma del Parque exige desactivar el flash y mantener distancia respetuosa de las aves?',
    options: [
      'Para ahorrar batería en el teléfono celular',
      'El flash enceguece temporalmente a las aves, desorientándolas y provocando abandono de nidos o choques',
      'Porque las aves son atraídas violentamente por la luz',
      'Solo es una sugerencia estética para fotos de mejor contraste'
    ],
    correctIndex: 1,
    explanation: 'Las aves poseen ojos extremadamente sensibles a la luz. Los destellos de flash causan ceguera temporal, pánico y estrés, poniendo en riesgo a sus pichones en la reserva.'
  },
  {
    id: 4,
    question: '¿Qué adaptación anatómica especial utiliza el Chinchero Chico para trepar verticalmente los troncos?',
    options: [
      'Membranas interdigitales para nadar en la corteza',
      'Picos ganchudos con ventosas adhesivas',
      'Plumas timoneras rígidas en la cola que hacen de apoyo o trípode',
      'Garras con veneno paralizante'
    ],
    correctIndex: 2,
    explanation: 'El Chinchero Chico apoya con firmeza las plumas caudales modificadas contra la corteza de laureles y tipas, lo que le permite descansar y ascender como un verdadero trepador.'
  },
  {
    id: 5,
    question: '¿Qué rol ecológico primordial cumplen aves como el Tucán Grande para la regeneración de la selva?',
    options: [
      'Dispersión de semillas nativas a través de sus heces tras digerir la pulpa',
      'Polinización de flores nocturnas',
      'Construcción de diques para embalsar agua',
      'Control exclusivo de plagas acuáticas'
    ],
    correctIndex: 0,
    explanation: 'Al alimentarse de frutos carnosos en las copas de los árboles y regurgitar o defecar las semillas intactas en otros sectores, el Tucán planta miles de árboles nuevos cada año en las Yungas.'
  }
];

export const PARK_TRAILS: ParkTrail[] = [
  {
    id: 'sendero-yungas',
    name: 'Sendero de las Yungas',
    elevation: '1334 - 1390 m',
    distance: '850 m',
    difficulty: 'Baja',
    description: 'Caminata sombreada entre laureles, cebiles y epífitas. Ideal para avistar Benteveos y Chincheros.',
    keyBird: 'Chinchero Chico',
    coordinates: { x: 30, y: 40 }
  },
  {
    id: 'mirador-cruz',
    name: 'Mirador de la Cruz',
    elevation: '1463 m (Cima)',
    distance: '1.4 km',
    difficulty: 'Media-Alta',
    description: 'Punto panorámico más alto con vista completa a los cerros de Los Perales. Zona de planeo del Tucán Grande.',
    keyBird: 'Tucán Grande',
    coordinates: { x: 75, y: 22 }
  },
  {
    id: 'aguada-zorro',
    name: 'Aguada del Zorro',
    elevation: '1350 m',
    distance: '620 m',
    difficulty: 'Baja',
    description: 'Quebradilla fresca con afloramiento de vertiente natural y helechos gigantes. Baño de Picaflores.',
    keyBird: 'Picaflor Común',
    coordinates: { x: 45, y: 68 }
  },
  {
    id: 'sendero-loros',
    name: 'Sendero Los Loros',
    elevation: '1410 m',
    distance: '1.1 km',
    difficulty: 'Media',
    description: 'Borde de cornisa hacia la quebrada donde sobrevuelan bandadas de Loros Aliseros al atardecer.',
    keyBird: 'Loro Alisero',
    coordinates: { x: 62, y: 52 }
  }
];

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'm-facil',
    title: 'Frutos de la Selva Montana',
    difficulty: 'Fácil',
    duration: '20 min',
    description: 'Identifica y fotografía al Tucán Grande cerca de árboles con frutos nativos en el dosel.',
    xpReward: 50,
    extraReward: 'Gorra Exploradora de las Yungas',
    progress: 0,
    target: 1,
    completed: false
  },
  {
    id: 'm-media',
    title: 'Vigías del Estrato Medio',
    difficulty: 'Media',
    duration: '30 min',
    description: 'Registra un avistamiento completo usando los prismáticos en los senderos del Parque.',
    xpReward: 100,
    extraReward: 'Sobre de Siluetas Aladas',
    progress: 0,
    target: 1,
    completed: false
  },
  {
    id: 'm-desafiante',
    title: 'Guardián del Barón Schuel',
    difficulty: 'Desafiante',
    duration: '40 min',
    description: 'Responde correctamente las 5 preguntas del Cuestionario de Biodiversidad de las Yungas.',
    xpReward: 200,
    extraReward: 'Insignia de Observador en Ascenso',
    progress: 0,
    target: 5,
    completed: false
  }
];

export const SHOP_ITEMS = [
  {
    id: 'visera-verde',
    name: 'Visera Verde de Guardaparque',
    category: 'Gorra',
    cost: 50,
    description: 'La visera oficial con protección solar para avistar en las copas de los árboles sin deslumbramientos.',
    icon: '🧢'
  },
  {
    id: 'mochila-schuel',
    name: 'Mochila Botánica Barón Schuel',
    category: 'Mochila',
    cost: 100,
    description: 'Mochila de lona impermeable con el escudo botánico del Parque para guardar libreta y muestras.',
    icon: '🎒'
  },
  {
    id: 'prismaticos-oro',
    name: 'Prismáticos Ópticos 10x42',
    category: 'Prismáticos',
    cost: 150,
    description: 'Prismáticos con lentes antirreflejo especiales para condiciones de niebla en la selva montana.',
    icon: '🔭'
  },
  {
    id: 'cuaderno-campo',
    name: 'Libreta de Campo Yungas',
    category: 'Herramienta',
    cost: 80,
    description: 'Cuaderno con papel reciclado y claves dicotómicas de ornitología de Jujuy.',
    icon: '📓'
  }
];
export const CHECKPOINTS_DATA: CheckPoint[] = [
  {
    id: 1,
    name: '1º Descanso "Mora Negra"',
    distanceMeters: 470,
    type: 'Descanso',
    coords: { x: 18, y: 82 },
    probableSpecies: [
      {
        common: 'Chiricote',
        scientific: 'Aramides cajaneus',
        silhouetteIcon: '🦤',
        description: 'Ave caminadora de patas y cuello largo rojizo, pecho gris plomo y cola corta alzada.'
      },
      {
        common: 'Pava de Monte Yungueña',
        scientific: 'Penelope bridgesi',
        silhouetteIcon: '🦃',
        description: 'Vulnerable (VU), 72 cm, plumaje oscuro con motas claras y carúncula roja colgante.'
      },
      {
        common: 'Urraca Criolla',
        scientific: 'Cyanocorax chrysops',
        silhouetteIcon: '🦜',
        description: 'Cresta afelpada negra, pecho amarillo manteca y llamativa ceja azul celeste brillante.'
      }
    ],
    challenge: {
      question: '¿Qué rasgo distintivo visible posee la Pava de Monte Yungueña en su garganta?',
      options: [
        'Un collar de plumas turquesas',
        'Una carúncula o papada roja carnosa y llamativa',
        'Un penacho dorado brillante',
        'Una hilera de plumas blancas como perlas'
      ],
      correctIndex: 1,
      explanation: 'La Pava de Monte Yungueña posee una característica papada o carúncula roja desnuda en la garganta que infla en el cortejo.'
    }
  },
  {
    id: 2,
    name: '1º Mirador "El Guarán"',
    distanceMeters: 655,
    type: 'Mirador',
    coords: { x: 28, y: 70 },
    probableSpecies: [
      {
        common: 'Yapú',
        scientific: 'Psarocolius decumanus',
        silhouetteIcon: '🦅',
        description: 'Ictérido grande con pico marfil, ojos celestes y cola amarilla que cuelga nidos alargados.'
      },
      {
        common: 'Taguató Común',
        scientific: 'Rupornis magnirostris',
        silhouetteIcon: '🦅',
        description: 'Rapaz cazadora posada en ramas secas vigilando lagartijas e insectos en el claro.'
      },
      {
        common: 'Golondrina Parda',
        scientific: 'Progne tapera',
        silhouetteIcon: '🕊️',
        description: 'Vuelo acrobático cazando dípteros sobre las corrientes ascendentes de las laderas.'
      }
    ],
    challenge: {
      question: '¿Qué llamativa estructura construyen los Yapúes en las ramas más altas del mirador?',
      options: [
        'Diques de ramas en el suelo húmedo',
        'Grandes nidos colgantes entretejidos en forma de bolsas alargadas',
        'Cuevas profundas en los barrancos de toba',
        'Cestas de barro adheridas a las piedras'
      ],
      correctIndex: 1,
      explanation: 'Los Yapúes son famosos tejedores coloniales que construyen nidos péndulos de hasta 1 metro de largo colgados de las puntas de las ramas.'
    }
  },
  {
    id: 3,
    name: '2º Descanso "Pucancho"',
    distanceMeters: 975,
    type: 'Descanso',
    coords: { x: 42, y: 75 },
    probableSpecies: [
      {
        common: 'Ratona Ceja Blanca',
        scientific: 'Troglodytes solstitialis',
        silhouetteIcon: '🐦',
        description: 'Diminuta y activa, cola erguida, ceja ocre clara, explora musgos y bromelias bajas.'
      },
      {
        common: 'Ticotico Estriado',
        scientific: 'Syndactyla rufosuperciliata',
        silhouetteIcon: '🍂',
        description: 'Pico robusto, garganta anteada y ceja clara, busca coleópteros en bromelias epífitas.'
      }
    ],
    challenge: {
      question: '¿Dónde busca principalmente insectos el Ticotico Estriado en este sector húmedo?',
      options: [
        'Buceando en el arroyo de montaña',
        'Inspeccionando el interior de bromelias epífitas y hojas secas acumuladas',
        'Cazando al vuelo sobre el dosel de los cerros',
        'Rascando la tierra en pastizales secos'
      ],
      correctIndex: 1,
      explanation: 'El Ticotico Estriado es un buscador meticuloso que hurga con su pico entre las hojas de bromelias y ramas con musgo.'
    }
  },
  {
    id: 4,
    name: '3º Descanso "La Tusca"',
    distanceMeters: 1290,
    type: 'Descanso',
    coords: { x: 55, y: 62 },
    probableSpecies: [
      {
        common: 'Carpintero Lomo Blanco',
        scientific: 'Campephilus leucopogon',
        silhouetteIcon: '🪵',
        description: 'Gran copete rojo carmesí, lomo blanco en V y fuerte tamborileo doble en árboles secos.'
      },
      {
        common: 'Cerquero Yungueño',
        scientific: 'Arremon dorbignii',
        silhouetteIcon: '🌿',
        description: 'Antifaz negro, pico anaranjado brillante y pecho blanco en el estrato herbáceo.'
      },
      {
        common: 'Arañero Corona Rojiza',
        scientific: 'Myioborus brunniceps',
        silhouetteIcon: '✨',
        description: 'Pecho amarillo oro, corona castaña rojiza y cola desplegada en abanico blanco al saltar.'
      }
    ],
    challenge: {
      question: '¿Cuál es el sonido territorial característico del Carpintero Lomo Blanco en los troncos?',
      options: [
        'Un silbido agudo continuo',
        'Un doble golpe seco y potente: "¡tac-tac!" que retumba en la selva',
        'Un graznido gutural semejante al del sapo',
        'Un trino cantarín como el del canario'
      ],
      correctIndex: 1,
      explanation: 'Los carpinteros del género Campephilus realizan un tamborileo doble inconfundible con dos golpes secos de resonancia profunda.'
    }
  },
  {
    id: 5,
    name: '2º Mirador "Sacha Higuera"',
    distanceMeters: 1440,
    type: 'Mirador',
    coords: { x: 68, y: 48 },
    probableSpecies: [
      {
        common: 'Picaflor Cometa',
        scientific: 'Sappho sparganurus',
        silhouetteIcon: '💎',
        description: 'Cola bifurcada resplandeciente en oro y rubí que ondea al libar flores de higuera y salvias.'
      },
      {
        common: 'Tingazú',
        scientific: 'Piaya cayana',
        silhouetteIcon: '🐿️',
        description: 'Cuco ardilla de larga cola graduada con manchas blancas, plumaje canela y pico amarillo verdoso.'
      },
      {
        common: 'Jote Cabeza Negra',
        scientific: 'Coragyps atratus',
        silhouetteIcon: '🦅',
        description: 'Planeador térmico con alas anchas y puntas blancas visibles por debajo.'
      }
    ],
    challenge: {
      question: '¿Por qué la cola del Picaflor Cometa macho parece encenderse al girar bajo el sol?',
      options: [
        'Tiene bioluminiscencia química producida por bacterias',
        'Sus bárbulas poseen microestructuras prismáticas que causan iridiscencia óptica',
        'Secreta un polvillo fosforescente de las flores',
        'Las plumas reflejan únicamente el color verde del bosque'
      ],
      correctIndex: 1,
      explanation: 'La física de las plumas del colibrí cometa actúa como diminutos prismas que refractan los rayos solares en deslumbrantes destellos rojo-dorados.'
    }
  },
  {
    id: 6,
    name: '1º Puente "El Laurel"',
    distanceMeters: 1790,
    type: 'Puente',
    coords: { x: 50, y: 38 },
    probableSpecies: [
      {
        common: 'Carpinterito Barrado',
        scientific: 'Picumnus cirratus',
        silhouetteIcon: '🪵',
        description: 'Diminuto carpintero de 9 cm con frente roja en machos y pecho densamente barrado.'
      },
      {
        common: 'Picaflor Verde',
        scientific: 'Chlorostilbon lucidus',
        silhouetteIcon: '✨',
        description: 'Verde esmeralda iridiscente, pico rojo de punta negra libando epífitas en el puente.'
      }
    ],
    challenge: {
      question: 'A diferencia de los carpinteros grandes, ¿cómo son las plumas de la cola del Carpinterito Barrado?',
      options: [
        'Son espinas de hierro rígidas',
        'Son suaves y redondeadas, por lo que no las usa como trípode de apoyo',
        'Miden más de 30 cm de longitud',
        'Son palmeadas como las de un pato'
      ],
      correctIndex: 1,
      explanation: 'Los carpinteritos (Picumnus) no poseen timoneras rígidas con púas; se agarran con sus fuertes patas a lianas y ramitas delgadas.'
    }
  },
  {
    id: 7,
    name: '2º Puente "El Ceibo"',
    distanceMeters: 2000,
    type: 'Puente',
    coords: { x: 38, y: 26 },
    probableSpecies: [
      {
        common: 'Juan Chiviro',
        scientific: 'Cyclarhis gujanensis',
        silhouetteIcon: '🎵',
        description: 'Pico ganchudo robusto, ceja canela castaña brillante y potente canto melódico y alegre.'
      },
      {
        common: 'Pijuí Frente Gris',
        scientific: 'Synallaxis frontalis',
        silhouetteIcon: '🍂',
        description: 'Corona y hombros castaño rojizo, cola larga desmechada que emite su canto "pi-juí".'
      },
      {
        common: 'Chiví-chiví',
        scientific: 'Vireo chivi',
        silhouetteIcon: '🎶',
        description: 'Ojos rojo rubí, plumaje oliva y canto repetitivo incansable en las copas de los ceibos.'
      }
    ],
    challenge: {
      question: '¿Cuál es la forma del pico del Juan Chiviro que le permite desgarrar orugas y presas duras?',
      options: [
        'Largo y tubular para néctar',
        'Robusto, alto y fuertemente ganchudo en la punta',
        'Aplanado horizontalmente como una cuchara',
        'Corto y cónico como el del jilguero'
      ],
      correctIndex: 1,
      explanation: 'El Juan Chiviro posee un pico vigoroso semejante al de un alcaudón con el que tritura grandes insectos y presas correosas.'
    }
  },
  {
    id: 8,
    name: '3º Mirador "Horco Molle"',
    distanceMeters: 2345,
    type: 'Mirador',
    coords: { x: 74, y: 16 },
    probableSpecies: [
      {
        common: 'Frutero Yungueño',
        scientific: 'Chlorospingus flavopectus',
        silhouetteIcon: '🫐',
        description: 'Mancha blanca postocular distintiva, pecho amarillo brillante y hábitos gregarios en el sotobosque.'
      },
      {
        common: 'Rey del Bosque',
        scientific: 'Pheucticus aureoventris',
        silhouetteIcon: '👑',
        description: 'Pico masivo marfil, cabeza negra, vientre amarillo oro intenso moteado de blanco y canto magistral.'
      },
      {
        common: 'Arañero Coronado Grande',
        scientific: 'Myiothlypis bivittata',
        silhouetteIcon: '🍃',
        description: 'Faja coronal central castaña entre dos líneas negras, vientre amarillo brillante en el sotobosque umbrío.'
      }
    ],
    challenge: {
      question: '¿Por qué el Rey del Bosque (Pheucticus aureoventris) es considerado una de las aves más apreciadas de las Yungas?',
      options: [
        'Por su tamaño gigante mayor al cóndor',
        'Por su plumaje amarillo oro y uno de los cantos silbados más melodiosos y potentes del bosque',
        'Porque nada en arroyos de deshielo',
        'Porque es la única ave que vuela hacia atrás'
      ],
      correctIndex: 1,
      explanation: 'El Rey del Bosque destaca por su impresionante contraste negro y oro y su canto de notas aflautadas que se escucha a kilómetros en la quebrada.'
    }
  }
];

export const RARE_BIRDS_DATA: BirdSpecies[] = [
  {
    id: 'urutau',
    commonName: 'Urutaú / Pájaro Fantasma',
    scientificName: 'Nyctibius griseus',
    family: 'Nyctibiidae',
    size: '33 - 38 cm',
    weight: '145 - 200 g',
    habitat: 'Selva Montana y Bosques de Transición de Jujuy',
    stratum: 'Ramas altas secas y fustes rotos',
    description: 'Ave nocturna legendaria. Su plumaje gris, pardo y ocre imita a la perfección un tocón o rama seca rota. Posee hendiduras en los párpados que le permiten ver con los ojos cerrados.',
    diet: 'Grandes polillas, escarabajos y dípteros nocturnos cazados en vuelos cortos silenciosos.',
    callDescription: 'Canto lastimero descendente melancólico: "¡pua-pua-pua-pua-uh!", origen del llanto del monte.',
    soundType: 'toucan',
    silhouette: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',
    image: '/assets/aistudio/Botanical_park_start_screen_logo_546dfb3b_47fb3d00.jpg',
    funFact: 'Inspiró la conmovedora leyenda quichua del Kakuy: el lamento de la hermana abandonada en la cima de un árbol seco que ruega perdón en las noches de luna.',
    isRare: true,
    legend: 'Leyenda del Kakuy: Según la tradición ancestral de las Yungas, una hermana que desobedeció a su hermano fue dejada en lo alto de un árbol talado. Al caer la noche sus pies se volvieron garras y sus brazos alas de plumaje ceniciento, clamando eternamente su canto en la selva.'
  },
  {
    id: 'jote-real',
    commonName: 'Jote Real / Cóndor de la Selva',
    scientificName: 'Sarcoramphus papa',
    family: 'Cathartidae',
    size: '71 - 81 cm (Envergadura: 1.8 a 2 m)',
    weight: '3000 - 3800 g',
    habitat: 'Dosel superior y cañadones de las Yungas jujeñas',
    stratum: 'Vuelo termal alto sobre las cumbres',
    description: 'El monarca de las aves carroñeras neotropicales. Plumaje blanco cremoso con rémiges y cola negras. Cabeza y cuello desnudos con pliegues vivamente coloreados en naranja, carmín y amarillo.',
    diet: 'Carroñero estricto: gracias a su tamaño y pico descomunal es el primero en abrir los restos de grandes mamíferos.',
    callDescription: 'Siseos y chasquidos sordos en los riscos.',
    soundType: 'parrot',
    silhouette: 'M12 2l10 10-10 10L2 12z',
    image: '/assets/aistudio/Botanical_park_start_screen_logo_546dfb3b_47fb3d00.jpg',
    funFact: 'En la cosmovisión andina y de las tierras bajas era considerado el mensajero del sol entre el cielo y la tierra por su majestuoso vuelo en las alturas del Parque.',
    isRare: true
  }
];

export const TUCAN_CONSIGNAS_QUESTIONS: TriviaQuestion[] = [
  {
    id: 1,
    question: '¿Cuál es la característica principal del Benteveo (Pitangus sulphuratus)?',
    options: [
      'Cabeza negra con ceja blanca, corona oculta amarilla, vientre amarillo y canto "bien-te-veo"',
      'Plumaje completamente azul brillante con cola larga ahorquillada',
      'Pico rojo carmesí de 20 cm y hábitos nocturnos subterráneos',
      'Patas palmeadas para nadar en lagunas de altura'
    ],
    correctIndex: 0,
    explanation: 'El Benteveo es inconfundible por su antifaz negro, ancha ceja blanca, pecho amarillo brillante y su alegre llamado onomatopéyico "¡bien-te-veo!".'
  },
  {
    id: 2,
    question: '¿Cómo es el pico del Chinchero Chico (Lepidocolaptes angustirostris)?',
    options: [
      'Grueso, cónico y corto para triturar granos de maíz',
      'Pálido, delgado y curvado hacia abajo, ideal para buscar insectos en la corteza',
      'Espatulado y ancho para filtrar algas en el agua',
      'Corto y con garras serradas en los bordes'
    ],
    correctIndex: 1,
    explanation: 'El Chinchero Chico posee un pico esbelto arqueado hacia abajo como una lezna que le permite extraer larvas e insectos de las hendiduras de la corteza.'
  },
  {
    id: 3,
    question: '¿En qué estrato de la selva suele desplazarse el Tucán Grande (Ramphastos toco)?',
    options: [
      'Subdosel (mide 55 cm y tiene periocular turquesa)',
      'Nadando en el lecho pedregoso de los arroyos',
      'Exclusivamente caminando en el piso de hojarasca sin volar',
      'Bajo tierra en túneles excavados con sus garras'
    ],
    correctIndex: 0,
    explanation: 'El Tucán Grande se desplaza en saltos ágiles entre las ramas del subdosel y dosel superior de los higuerones y laureles de las Yungas.'
  },
  {
    id: 4,
    question: '¿Qué categoría de conservación tiene la Pava de Monte Yungueña (Penelope bridgesi) en el Parque?',
    options: [
      'Especie invasora plaga en la ciudad',
      'Extinta en todo el continente',
      'Vulnerable (VU), mide 72 cm y posee una carúncula roja en la garganta',
      'Común doméstica de granja'
    ],
    correctIndex: 2,
    explanation: 'La Pava de Monte Yungueña está categorizada como Vulnerable (VU), siendo una especie prioritaria que encuentra refugio protegido en las 15.5 hectáreas del Parque Botánico Barón Schuel.'
  },
  {
    id: 5,
    question: '¿Qué rasgo distingue al macho del Picaflor Cometa (Sappho sparganurus)?',
    options: [
      'Su larga cola naranja/magenta iridiscente y espalda magenta',
      'Un pico amarillo curvo de 15 cm de largo',
      'Patas con membranas para posarse en el agua',
      'Plumas blancas y negras idénticas a un pingüino'
    ],
    correctIndex: 0,
    explanation: 'El Picaflor Cometa macho deslumbra con una cola bífida extraordinaria que destella como fuego dorado, rubí y magenta al cruzar el Mirador de la Cruz.'
  }
];

export const CATALOG_BIRDS_DATA: CatalogBird[] = [
  {
    id: '011-jote-real',
    catalogNumber: '011',
    commonName: 'Jote Real',
    scientificName: 'Sarcoramphus papa',
    size: '78 cm',
    weight: '3400 g',
    family: 'CATHARTIDAE',
    habitat: 'Selva Montana y Cañadones',
    stratum: 'En vuelo',
    conservationStatus: 'NA',
    presence: 'R',
    observationPossibility: 'B',
    beakDescription: 'Pico descomunal ganchudo rojo y marfil capaz de rasgar cueros gruesos.',
    songDescription: 'Siseos profundos y chasquidos sordos en las cornisas rocosas.',
    plumageDescription: 'Blanco cremoso con rémiges negras; cabeza desnuda multicolor carmín, naranja y azul.',
    cp: 2579,
    hp: '125 / 125 HP',
    hints: {
      size: '78 cm',
      habitat: 'En vuelo (sobrevuela la Reserva)',
      morphology: 'Plumaje general blanco con alas y cola negras, cuello desnudo rojo anaranjado y carúncula sobre el pico.',
      loreOrFact: 'Pertenece a la familia Cathartidae; planea a gran altura sin dimorfismo sexual.'
    },
    soundType: 'parrot',
    image: '/assets/aistudio/Botanical_park_start_screen_logo_546dfb3b_47fb3d00.jpg',
    silhouetteIcon: '🦅'
  },
  {
    id: '012-loro-alisero',
    catalogNumber: '012',
    commonName: 'Loro Alisero',
    scientificName: 'Amazona tucumana',
    size: '32 cm',
    weight: '280 g',
    family: 'PSITTACIDAE',
    habitat: 'Alisedas y Quebradas de Altura',
    stratum: 'Dosel',
    conservationStatus: 'AM',
    presence: 'M',
    observationPossibility: 'M',
    beakDescription: 'Pico córneo pálido fuerte adaptado para desgranar conos de aliso del cerro.',
    songDescription: 'Chirridos estridentes y vocingleros en coro al pasar en bandadas veloces.',
    plumageDescription: 'Verde brillante con plumas rebordeadas de negro, frente roja y pico claro.',
    cp: 2579,
    hp: '125 / 125 HP',
    hints: {
      size: '32 cm',
      habitat: 'Estrato: dosel y subdosel (Especie Migrante y Amenazada - AM)',
      morphology: 'Plumaje enteramente verde con frente roja, periocular blanco y cobertoras primarias rojas.',
      loreOrFact: 'Es un loro migrante emblemático de los bosques de aliso de las Yungas.'
    },
    soundType: 'parrot',
    image: '/assets/aistudio/Toucan_perched_on_branch_8ab41bfc_230157f9.jpg',
    silhouetteIcon: '🦜'
  },
  {
    id: '013-picaflor-cometa',
    catalogNumber: '013',
    commonName: 'Picaflor Cometa',
    scientificName: 'Sappho sparganurus',
    size: 'Macho: 16 cm / Hembra: 12 cm',
    weight: '6 g',
    family: 'TROCHILIDAE',
    habitat: 'Laderas arbustivas y Quebradas floridas',
    stratum: 'Subdosel',
    conservationStatus: 'NA',
    presence: 'R',
    observationPossibility: 'A',
    beakDescription: 'Pico negro recto y fino de 2 cm para alcanzar el néctar de corolas tubulares.',
    songDescription: 'Zumbido de cola y agudos "tsik-tsik" territoriales junto a flores epífitas.',
    plumageDescription: 'Macho con garganta verde esmeralda, espalda carmesí y larguísima cola dorada y rubí.',
    cp: 2579,
    hp: '125 / 125 HP',
    hints: {
      size: 'Macho: 16 cm / Hembra: 12 cm',
      habitat: 'Estrato: subdosel',
      morphology: 'Verde esmeralda con espalda magenta iridiscente y larga cola naranja brillante.',
      loreOrFact: 'Presenta notable dimorfismo sexual: el macho luce una larguísima cola ahorquillada.'
    },
    soundType: 'hummingbird',
    image: '/assets/aistudio/Botanical_park_start_screen_logo_546dfb3b_47fb3d00.jpg',
    silhouetteIcon: '💎'
  },
  {
    id: '014-urutau',
    catalogNumber: '014',
    commonName: 'Urutaú',
    scientificName: 'Nyctibius griseus',
    size: '35 cm',
    weight: '175 g',
    family: 'NYCTIBIIDAE',
    habitat: 'Selva Montana y Bosque de Transición',
    stratum: 'Subdosel',
    conservationStatus: 'NA',
    presence: 'R',
    observationPossibility: 'B',
    beakDescription: 'Pico diminuto con una boca gigantesca provista de vibrisas táctiles.',
    songDescription: 'Lamento fantasmal lastimero que desciende: "Turay, kakuy... pua-pua-uh".',
    plumageDescription: 'Criptismo absoluto: tonos grises, cenicientos y pardos imitando un tronco seco roto.',
    cp: 2579,
    hp: '125 / 125 HP',
    hints: {
      size: '35 cm',
      habitat: 'Estrato: dosel y subdosel',
      morphology: 'Plumaje mimético manchado de pardos y grises, cabeza grande y enormes ojos amarillos.',
      loreOrFact: "Leyenda del Urutaú (Kakuy): Cuenta la leyenda que una joven cautiva en lo alto de un árbol gritaba en la noche '¡Turay, turay! ¡Kakuy, kakuy!' (hermano mío) hasta transformarse en esta ave nocturna."
    },
    legend: 'Leyenda del Urutaú (Kakuy): Cuenta la leyenda que una joven cautiva en lo alto de un árbol gritaba en la noche "¡Turay, turay! ¡Kakuy, kakuy!" (hermano mío) hasta transformarse en esta ave nocturna.',
    soundType: 'urutau',
    image: '/assets/aistudio/Botanical_park_start_screen_logo_546dfb3b_47fb3d00.jpg',
    silhouetteIcon: '🪵'
  },
  {
    id: '015-chiricote',
    catalogNumber: '015',
    commonName: 'Chiricote',
    scientificName: 'Aramides cajaneus',
    size: '37 cm',
    weight: '410 g',
    family: 'RALLIDAE',
    habitat: 'Arroyos y quebradillas de selva',
    stratum: 'Sotobosque',
    conservationStatus: 'NA',
    presence: 'R',
    observationPossibility: 'M',
    beakDescription: 'Pico amarillo verdoso robusto para hurgar cangrejos y lombrices en el barro.',
    songDescription: 'Dueto estruendoso al unísono: "¡chi-ri-co-te, chi-ri-co-te!" al amanecer y crepúsculo.',
    plumageDescription: 'Cabeza y cuello gris plomo, pecho rufo castaño rojizo, lomo oliváceo y patas rojas.',
    cp: 2579,
    hp: '125 / 125 HP',
    hints: {
      size: '37 cm',
      habitat: 'Estrato: sotobosque y áreas abiertas',
      morphology: 'Cabeza, cuello y pecho grises, corona castaña, iris rojo, pico verde con base amarilla y ventral rufo.',
      loreOrFact: 'Tiene alas cortas y redondas, patas fuertes rojo rosáceas y dedos largos.'
    },
    soundType: 'chinchero',
    image: '/assets/aistudio/Remove_text_from_screen_248c7528_824b6a34.jpg',
    silhouetteIcon: '🦤'
  },
  {
    id: '016-benteveo',
    catalogNumber: '016',
    commonName: 'Benteveo',
    scientificName: 'Pitangus sulphuratus',
    size: '22 cm',
    weight: '60 g',
    family: 'TYRANNIDAE',
    habitat: 'Campos, bosques y borde urbano',
    stratum: 'Zona urbanizada',
    conservationStatus: 'NA',
    presence: 'R',
    observationPossibility: 'A',
    beakDescription: 'Pico recto, negro, fuerte y robusto con extremo ganchudo para presas variadas.',
    songDescription: 'Grito alegre, sonoro y trisilábico: "¡bien-te-veo! ¡bien-te-veo!".',
    plumageDescription: 'Vientre amarillo brillante, antifaz negro, ceja blanca pura y corona amarilla oculta.',
    cp: 2579,
    hp: '125 / 125 HP',
    hints: {
      size: '22 cm',
      habitat: 'Zona urbanizada (entrada y alrededores del Parque)',
      morphology: 'Cabeza negra con ceja blanca, corona oculta amarilla, garganta blanca y vientre amarillo.',
      loreOrFact: "Su nombre común imita su fuerte canto trisilábico: 'bien-te-veo'."
    },
    soundType: 'benteveo',
    image: '/assets/aistudio/Remove_text_from_screen_248c7528_824b6a34.jpg',
    silhouetteIcon: '🐤'
  },
  {
    id: '017-hornero',
    catalogNumber: '017',
    commonName: 'Hornero',
    scientificName: 'Furnarius rufus',
    size: '18 cm',
    weight: '54 g',
    family: 'FURNARIIDAE',
    habitat: 'Claros del parque y arboledas',
    stratum: 'Zona urbanizada',
    conservationStatus: 'NA',
    presence: 'R',
    observationPossibility: 'A',
    beakDescription: 'Pico pardo ligeramente curvado para amasar bolitas de barro con paja.',
    songDescription: 'Dueto sincronizado jubiloso y potente con batido de alas de macho y hembra.',
    plumageDescription: 'Dorso pardo rojizo terroso, garganta blanca y vientre anteado suave.',
    cp: 2579,
    hp: '125 / 125 HP',
    hints: {
      size: '18 cm',
      habitat: 'Zona urbanizada',
      morphology: 'Pardo rojizo con garganta blanca y cola rufo encendido.',
      loreOrFact: 'Leyenda del Hornero: Dos jóvenes alfareros enamorados huyeron de su tribu y, al caer heridos por flechas, se transformaron en el ave nacional que modela su hogar en nidos de barro.'
    },
    legend: 'Leyenda del Hornero: Dos jóvenes alfareros enamorados huyeron de su tribu y, al caer heridos por flechas, se transformaron en el ave nacional que modela su hogar en nidos de barro.',
    soundType: 'hornero',
    image: '/assets/aistudio/c3da3f37-f246-40f4-8d25-1958fb93d2f1_0d2a7f41.jpeg',
    silhouetteIcon: '🏺'
  },
  {
    id: '018-zorzal-colorado',
    catalogNumber: '018',
    commonName: 'Zorzal Colorado',
    scientificName: 'Turdus rufiventris',
    size: '24 cm',
    weight: '72 g',
    family: 'TURDIDAE',
    habitat: 'Selva Montana y arboledas umbrías',
    stratum: 'Subdosel',
    conservationStatus: 'NA',
    presence: 'R',
    observationPossibility: 'A',
    beakDescription: 'Pico amarillo anaranjado brillante en machos adultos para cosechar bayas de agüaí.',
    songDescription: 'Canto melodioso, aflautado y rico en frases musicales antes del amanecer.',
    plumageDescription: 'Dorso pardo oliváceo, garganta estriada y vientre naranja rojizo ladrillo encendido.',
    cp: 2579,
    hp: '125 / 125 HP',
    hints: {
      size: '24 cm',
      habitat: 'Estrato: subdosel y sotobosque',
      morphology: 'Dorso pardo grisáceo, periocular amarillo, garganta estriada de blanco y abdomen rufo encendido.',
      loreOrFact: 'Leyenda del Zorzal Colorado: El joven guaraní Zorzal tocaba la flauta dulce para su amada Agüaí; de su pecho herido surgió esta ave de pecho rojo y bello canto de flauta.'
    },
    legend: 'Leyenda del Zorzal Colorado: El joven guaraní Zorzal tocaba la flauta dulce para su amada Agüaí; de su pecho herido surgió esta ave de pecho rojo y bello canto de flauta.',
    soundType: 'zorzal',
    image: '/assets/aistudio/Toucan_perched_on_branch_8ab41bfc_230157f9.jpg',
    silhouetteIcon: '🎻'
  }
];
