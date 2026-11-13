import { BirdSpecies, TriviaQuestion, ParkTrail, Mission, CheckPoint, CatalogBird, CompanionBirdId } from '../types/game';

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
    audioUrl: '/assets/aves/tucan-grande.mp3',
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
    soundType: '007-benteveo',
    silhouette: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
    image: '/assets/aves/7-Benteveo.jpg',
    audioUrl: '/assets/aves/7-Benteveo.mp3',
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
    soundType: '020-ticotico-cejicanelo',
    silhouette: 'M12 3L2 12h3v8h14v-8h3L12 3z',
    image: '/assets/aistudio/chinchero_chico_portrait.jpg',
    audioUrl: '/assets/aves/20-Ticotico cejicanelo.mp3',
    funFact: 'Sus plumas timoneras de la cola tienen raquis rígidos como púas que utiliza como un trípode para sostenerse en posición vertical mientras martilla la corteza.'
  },
  {
    id: 'loro-alisero',
    commonName: 'Loro Alisero / Calancate',
    scientificName: 'Psittacara mitratus',
    family: 'Psittacidae',
    size: '32 - 36 cm',
    weight: '140 - 220 g',
    habitat: 'Laderas boscosas y alisedas de altura',
    stratum: 'Dosel y vuelo libre sobre las copas',
    description: 'Plumaje verde esmeralda con salpicaduras rojas en frente y mejillas. Vuelo rápido y en bandadas muy ruidosas.',
    diet: 'Semillas de aliso del cerro, frutos carnosos y brotes tiernos.',
    callDescription: 'Gritos metálicos estridentes en coro al cruzar los valles de San Salvador.',
    soundType: '018-aratinga-mitrada',
    silhouette: 'M12 2l10 10-10 10L2 12z',
    image: '/assets/aves/18-Aratinga mitrada.jpg',
    audioUrl: '/assets/aves/18-Aratinga mitrada.mp3',
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
    image: '/assets/aistudio/picaflor_comun.jpg',
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
    image: '/assets/aistudio/picaflor_cometa.jpg',
    funFact: 'Cuando realiza el vuelo nupcial sobre el Mirador de la Cruz, despliega su cola como un cometa de fuego reflejando la luz solar.'
  }
];

export const EXPLORER_AVATARS: { id: string; name: string; title: string; icon: string; description: string; favoriteBird: CompanionBirdId }[] = [
  {
    id: 'avatar-santi',
    name: 'Santi',
    title: 'Explorador de las Yungas',
    icon: '/assets/characters/yunga-nino.jpg',
    description: 'Niño de la comunidad yunga con vincha roja; conoce los árboles y sus dueños birds.',
    favoriteBird: 'Benteveo'
  },
  {
    id: 'avatar-lucia',
    name: 'Lucía',
    title: 'Guardiana del Dosel',
    icon: '/assets/characters/yunga-nina.jpg',
    description: 'Observadora de las copas de las Yungas; anota cada canto que escucha.',
    favoriteBird: 'Picaflor Cometa'
  },
  {
    id: 'avatar-bruno',
    name: 'Bruno',
    title: 'Centinela de la Quebrada',
    icon: '/assets/characters/quebrada-nino.jpg',
    description: 'Guía de los arroyos y quebradas; lee las huellas en la tierra mojada.',
    favoriteBird: 'Chinchero Chico'
  },
  {
    id: 'avatar-mora',
    name: 'Mora',
    title: 'Rastreadora de Arroyos',
    icon: '/assets/characters/quebrada-nina.jpg',
    description: 'Especialista en aves de quebrada y sus nidos colgantes.',
    favoriteBird: 'Benteveo'
  },
  {
    id: 'avatar-aimar',
    name: 'Aimar',
    title: 'Andino de Altura',
    icon: '/assets/characters/puna-nino.jpg',
    description: 'Centinela de la Puna; conoce las aves que cruzan las quebradas hacia la alta montaña.',
    favoriteBird: 'Tucán Grande'
  },
  {
    id: 'avatar-viento',
    name: 'Viento',
    title: 'Eco de la Puna',
    icon: '/assets/characters/puna-nina.jpg',
    description: 'Guía de altura; escucha los cantos lejanos del quebradón.',
    favoriteBird: 'Picaflor Cometa'
  },
  {
    id: 'avatar-nido',
    name: 'Dr. Nido',
    title: 'Científico de Campo',
    icon: '/assets/characters/cientifico.jpg',
    description: 'Joven científico con su ave en el hombro; estudia comportamiento y conservación.',
    favoriteBird: 'Tucán Grande'
  },
  {
    id: 'avatar-vale-calle',
    name: 'Vale',
    title: 'Exploradora Urbana',
    icon: '/assets/characters/exploradora.jpg',
    description: 'Niña de la ciudad que descubre la selva montana del Parque Schuel.',
    favoriteBird: 'Chinchero Chico'
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
    asset: '/assets/aves/7-Benteveo.jpg',
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
    asset: '/assets/aistudio/picaflor_cometa.jpg',
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
    id: 'visera-oficial',
    name: 'Visera Oficial del Parque Botánico',
    category: 'Prenda Oficial',
    cost: 0,
    defaultEquipped: true,
    description: 'Equipada por defecto. Visera verde esmeralda con el sello de la Reserva Natural Urbana Barón Schuel.',
    icon: '🧢'
  },
  {
    id: 'binoculares-dosel',
    name: 'Binoculares de Dosel de Alta Precisión',
    category: 'Óptica XR',
    cost: 100,
    description: 'Lentes de prisma luminoso para distinguir aves en el dosel alto de laureles y cebiles entre la niebla.',
    icon: '🔭'
  },
  {
    id: 'chaleco-guardaparque',
    name: 'Chaleco de Guardaparque de las Yungas',
    category: 'Indumentaria',
    cost: 150,
    description: 'Chaleco multipropósito con bolsillos para libreta científica, guía de aves y lupas botánicas.',
    icon: '🦺'
  },
  {
    id: 'camara-teleobjetivo',
    name: 'Cámara Teleobjetivo Respetuosa Sin Flash',
    category: 'Fotografía',
    cost: 200,
    description: 'Teleobjetivo silencioso de 400 mm que captura primeros planos nítidos respetando la distancia ética sin usar flash.',
    icon: '📷'
  },
  {
    id: 'pin-aliado-aves',
    name: 'Pin Dorado "Aliado del Grupo Aves Jujuy"',
    category: 'Distinción',
    cost: 250,
    description: 'Insignia honorífica dorada para los guardianes comprometidos con la conservación de las 125 especies del Parque.',
    icon: '🏅'
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
    soundType: 'urutau',
    silhouette: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',
    image: '/assets/aistudio/urutau.jpg',
    funFact: 'Inspiró la conmovedora leyenda quichua del Kakuy: el lamento de la hermana abandonada en la cima de un árbol seco que ruega perdón en las noches de luna.',
    isRare: true,
    legend: 'Leyenda del Kakuy: Según la tradición ancestral de las Yungas, una hermana que desobedeció a su hermano fue dejada en lo alto de un árbol talado. Al caer la noche sus pies se volvieron garras y sus brazos alas de plumaje ceniciento, clamando eternamente su canto en la selva.'
  },
  {
    id: 'jote-real',
    commonName: 'Jote Real / Cóndor de la Selva',
    scientificName: 'Coragyps atratus',
    family: 'Cathartidae',
    size: '71 - 81 cm (Envergadura: 1.8 a 2 m)',
    weight: '3000 - 3800 g',
    habitat: 'Dosel superior y cañadones de las Yungas jujeñas',
    stratum: 'Vuelo termal alto sobre las cumbres',
    description: 'El monarca de las aves carroñeras neotropicales. Plumaje blanco cremoso con rémiges y cola negras. Cabeza y cuello desnudos con pliegues vivamente coloreados en naranja, carmín y amarillo.',
    diet: 'Carroñero estricto: gracias a su tamaño y pico descomunal es el primero en abrir los restos de grandes mamíferos.',
    callDescription: 'Siseos y chasquidos sordos en los riscos.',
    soundType: 'raptor',
    silhouette: 'M12 2l10 10-10 10L2 12z',
    image: '/assets/aistudio/jote_real.jpg',
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
    id: '001-chingolo',
    catalogNumber: '001',
    commonName: 'Chingolo',
    scientificName: 'Zonotrichia capensis',
    size: '15 cm',
    weight: '22 g',
    family: 'PASSERELLIDAE',
    habitat: 'Claros, bordes de sendero y arboledas del Parque',
    stratum: 'Sotobosque',
    conservationStatus: 'NA',
    presence: 'R',
    observationPossibility: 'A',
    beakDescription: 'Pico corto, cónico y fuerte adaptado para partir semillas de gramíneas e insectos.',
    songDescription: 'Silbido melodioso de tres o cuatro notas claras seguido de un trino vibrante final.',
    plumageDescription: 'Copete gris con franjas negras, semicollar nucal canela rufo encendido y garganta blanca.',
    cp: 2579,
    hp: '125 / 125 HP',
    hints: {
      size: '15 cm',
      habitat: 'Estrato: sotobosque y bordes abiertos del sendero',
      morphology: 'Inconfundible semicopete gris rayado de negro y collar canela rojizo en la nuca.',
      loreOrFact: 'Es uno de los cantores más madrugadores y confiados de los senderos de San Salvador de Jujuy.'
    },
    soundType: '001-chingolo',
    image: '/assets/aves/1-Chingolo.jpg',
    audioUrl: '/assets/aves/1-Chingolo.mp3',
    silhouetteIcon: '🐦'
  },
  {
    id: '002-tangara-sayaca',
    catalogNumber: '002',
    commonName: 'Tangara sayaca (Celestino)',
    scientificName: 'Thraupis sayaca',
    size: '17 cm',
    weight: '33 g',
    family: 'THRAUPIDAE',
    habitat: 'Copas soleadas y árboles frutales de Selva Montana',
    stratum: 'Dosel',
    conservationStatus: 'NA',
    presence: 'R',
    observationPossibility: 'A',
    beakDescription: 'Pico mediano y robusto gris azulado ideal para trozar frutos carnosos y brotes.',
    songDescription: 'Gorjeo agudo, cristalino y entrecortado desde las ramas altas.',
    plumageDescription: 'Coloración general celeste grisácea suave con alas y cola de reflejos turquesa brillante.',
    cp: 2579,
    hp: '125 / 125 HP',
    hints: {
      size: '17 cm',
      habitat: 'Estrato: dosel y subdosel',
      morphology: 'Plumaje enteramente celeste ceniciento con bordes alares azul turquesa luminoso.',
      loreOrFact: 'Importantísimo dispersor de semillas de árboles nativos en las Yungas jujeñas.'
    },
    soundType: '002-tangara-sayaca',
    image: '/assets/aves/2-Tangara sacaya.jpg',
    audioUrl: '/assets/aves/2-Tangara sacaya.mp3',
    silhouetteIcon: '💎'
  },
  {
    id: '003-chercan',
    catalogNumber: '003',
    commonName: 'Chercán (Ratona)',
    scientificName: 'Troglodytes aedon',
    size: '12 cm',
    weight: '12 g',
    family: 'TROGLODYTIDAE',
    habitat: 'Matorrales, troncos caídos y claros del Parque',
    stratum: 'Sotobosque',
    conservationStatus: 'NA',
    presence: 'R',
    observationPossibility: 'A',
    beakDescription: 'Pico fino, agudo y levemente curvado para capturar arañas y pequeños insectos.',
    songDescription: 'Gorjeo burbujeante, complejo y sumamente potente para su pequeño tamaño.',
    plumageDescription: 'Pardo acanelado uniforme con finas barras oscuras en alas y cola siempre erguida.',
    cp: 2579,
    hp: '125 / 125 HP',
    hints: {
      size: '12 cm',
      habitat: 'Estrato: sotobosque y zonas bajas',
      morphology: 'Pequeña, parda barrada e inquieta, suele llevar la cola levantada casi vertical.',
      loreOrFact: 'Recorre incansablemente cada hueco y raíz del bosque buscando pequeños invertebrados.'
    },
    soundType: '003-chercan',
    image: '/assets/aves/3-Chercán.jpg',
    audioUrl: '/assets/aves/3-Chercán.mp3',
    silhouetteIcon: '🪶'
  },
  {
    id: '004-zorzal-colorado',
    catalogNumber: '004',
    commonName: 'Zorzal colorado',
    scientificName: 'Turdus rufiventris',
    size: '24 cm',
    weight: '72 g',
    family: 'TURDIDAE',
    habitat: 'Selva Montana y arboledas umbrías',
    stratum: 'Subdosel',
    conservationStatus: 'NA',
    presence: 'R',
    observationPossibility: 'A',
    beakDescription: 'Pico amarillo anaranjado brillante en machos adultos para cosechar bayas y lombrices.',
    songDescription: 'Canto melodioso, aflautado y rico en frases musicales antes del amanecer.',
    plumageDescription: 'Dorso pardo oliváceo, garganta blanca estriada y vientre naranja rojizo ladrillo encendido.',
    cp: 2579,
    hp: '125 / 125 HP',
    hints: {
      size: '24 cm',
      habitat: 'Estrato: subdosel y sotobosque',
      morphology: 'Dorso pardo grisáceo, anillo ocular amarillo, garganta estriada y abdomen rufo encendido.',
      loreOrFact: 'Leyenda del Zorzal Colorado: El joven guaraní Zorzal tocaba la flauta dulce para su amada Agüaí; de su pecho surgió esta ave de canto aflautado.'
    },
    legend: 'Leyenda del Zorzal Colorado: El joven guaraní Zorzal tocaba la flauta dulce para su amada Agüaí; de su pecho surgió esta ave de pecho rojo y bello canto de flauta.',
    soundType: '004-zorzal-colorado',
    image: '/assets/aves/4-Zorzal colorado.jpg',
    audioUrl: '/assets/aves/4-Zorzal colorado.mp3',
    silhouetteIcon: '🎻'
  },
  {
    id: '005-paloma-picazuro',
    catalogNumber: '005',
    commonName: 'Paloma picazuró',
    scientificName: 'Patagioenas picazuro',
    size: '34 cm',
    weight: '280 g',
    family: 'COLUMBIDAE',
    habitat: 'Copas altas de tipas, cebiles y laureles',
    stratum: 'Dosel',
    conservationStatus: 'NA',
    presence: 'R',
    observationPossibility: 'A',
    beakDescription: 'Pico corto grisáceo con cera blanquecina en la base para consumir frutos y semillas.',
    songDescription: 'Arrullo grave, rítmico y gutural "cuu-cu-cuuu" que resuena en el dosel.',
    plumageDescription: 'Cabeza y pecho vinoso rosado, semicollar nucal escamado de celeste y negro, banda alar blanca.',
    cp: 2579,
    hp: '125 / 125 HP',
    hints: {
      size: '34 cm',
      habitat: 'Estrato: dosel arbóreo',
      morphology: 'Paloma grande de tonos vinosos con medialuna de plumas escamadas en el cuello y filete blanco en el ala.',
      loreOrFact: 'Su nombre proviene del guaraní "picasú-ró" (paloma amarga), debido al sabor que le dan ciertos frutos silvestres.'
    },
    soundType: '005-paloma-picazuro',
    image: '/assets/aves/5-Paloma picazuro.jpg',
    audioUrl: '/assets/aves/5-Paloma picazuro.mp3',
    silhouetteIcon: '🕊️'
  },
  {
    id: '006-saltator-pico-dorado',
    catalogNumber: '006',
    commonName: 'Saltator de pico dorado (Rey del bosque)',
    scientificName: 'Saltator aurantiirostris',
    size: '20 cm',
    weight: '48 g',
    family: 'THRAUPIDAE',
    habitat: 'Laderas arbustivas y bordes de quebradas boscosas',
    stratum: 'Subdosel',
    conservationStatus: 'NA',
    presence: 'R',
    observationPossibility: 'A',
    beakDescription: 'Pico grueso, cónico y de intenso color amarillo anaranjado dorado.',
    songDescription: 'Silbido enérgico, claro y melodioso "pi-ti-chuuu" desde las ramas medias.',
    plumageDescription: 'Cabeza negra con larga ceja blanca postocular, dorso gris plomizo y pecho canela anteado.',
    cp: 2579,
    hp: '125 / 125 HP',
    hints: {
      size: '20 cm',
      habitat: 'Estrato: subdosel y arbustal',
      morphology: 'Inconfundible pico fuerte color naranja dorado, capucha negra con ceja blanca y vientre canela.',
      loreOrFact: 'Conocido también como Pepitero de Collar, destaca por su canto potente en los miradores del Parque.'
    },
    soundType: '006-saltator-pico-dorado',
    image: '/assets/aves/6-Saltator de pico dorado.jpg',
    audioUrl: '/assets/aves/6-Saltator de pico dorado.mp3',
    silhouetteIcon: '👑'
  },
  {
    id: '007-benteveo',
    catalogNumber: '007',
    commonName: 'Benteveo',
    scientificName: 'Pitangus sulphuratus',
    size: '22 cm',
    weight: '60 g',
    family: 'TYRANNIDAE',
    habitat: 'Campos, bosques y borde urbano del Parque',
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
      habitat: 'Zona urbanizada y bordes de selva',
      morphology: 'Cabeza negra con ceja blanca, corona oculta amarilla, garganta blanca y vientre amarillo intenso.',
      loreOrFact: "Su nombre común imita su fuerte canto trisilábico: 'bien-te-veo'."
    },
    soundType: '007-benteveo',
    image: '/assets/aves/7-Benteveo.jpg',
    audioUrl: '/assets/aves/7-Benteveo.mp3',
    silhouetteIcon: '🐤'
  },
  {
    id: '008-tero',
    catalogNumber: '008',
    commonName: 'Tero',
    scientificName: 'Vanellus chilensis',
    size: '35 cm',
    weight: '310 g',
    family: 'CHARADRIIDAE',
    habitat: 'Áreas abiertas, pastizales y accesos de la Reserva',
    stratum: 'Zona urbanizada',
    conservationStatus: 'NA',
    presence: 'R',
    observationPossibility: 'A',
    beakDescription: 'Pico corto recto de base rosada rojiza y punta negra para capturar insectos del suelo.',
    songDescription: 'Grito estridente y metálico de alerta "¡te-ro, te-ro, te-ro!" en defensa de su territorio.',
    plumageDescription: 'Pecho negro, frente negra, fino copete occipital, dorso gris bronceado y espolones alares rojos.',
    cp: 2579,
    hp: '125 / 125 HP',
    hints: {
      size: '35 cm',
      habitat: 'Estrato: suelo y claros abiertos',
      morphology: 'Patas largas rojizas, pecho negro, copete fino en la nuca y espolones rojos en los hombros.',
      loreOrFact: 'Famoso centinela que simula tener un ala herida lejos de su nido para distraer a posibles intrusos.'
    },
    soundType: '008-tero',
    image: '/assets/aves/8-Tero.jpg',
    audioUrl: '/assets/aves/8-Tero.mp3',
    silhouetteIcon: '🛡️'
  },
  {
    id: '009-jilguero-azafranado',
    catalogNumber: '009',
    commonName: 'Jilguero azafranado',
    scientificName: 'Sicalis flaveola',
    size: '14 cm',
    weight: '18 g',
    family: 'THRAUPIDAE',
    habitat: 'Arboledas abiertas y bordes soleados del Parque',
    stratum: 'Subdosel',
    conservationStatus: 'NA',
    presence: 'R',
    observationPossibility: 'A',
    beakDescription: 'Pico cónico corto y fuerte para descascarar pequeñas semillas silvestres.',
    songDescription: 'Trino variado, rápido y muy musical emitido desde ramas expuestas.',
    plumageDescription: 'Macho adulto amarillo dorado resplandeciente con característica frente naranja azafrán encendido.',
    cp: 2579,
    hp: '125 / 125 HP',
    hints: {
      size: '14 cm',
      habitat: 'Estrato: subdosel y claros soleados',
      morphology: 'Plumaje amarillo oro brillante con la frente teñida de naranja azafrán vivo en el macho.',
      loreOrFact: 'Suele observarse en parejas o pequeños grupos buscando semillas en los claros del Barón Schuel.'
    },
    soundType: '009-jilguero-azafranado',
    image: '/assets/aves/9-Jilguero azafranado.jpg',
    audioUrl: '/assets/aves/9-Jilguero azafranado.mp3',
    silhouetteIcon: '☀️'
  },
  {
    id: '010-tordo-renegrido',
    catalogNumber: '010',
    commonName: 'Tordo renegrido',
    scientificName: 'Molothrus bonariensis',
    size: '20 cm',
    weight: '52 g',
    family: 'ICTERIDAE',
    habitat: 'Arboledas, claros y bordes urbanos del Parque',
    stratum: 'Subdosel',
    conservationStatus: 'NA',
    presence: 'R',
    observationPossibility: 'A',
    beakDescription: 'Pico cónico, recto y negro azabache adaptado a una dieta omnívora de semillas e insectos.',
    songDescription: 'Gorjeo líquido y burbujeante acompañado de notas agudas mientras infla el plumaje.',
    plumageDescription: 'Macho negro intenso con brillo tornasolado violáceo y azul metálico al sol; hembra pardo grisácea.',
    cp: 2579,
    hp: '125 / 125 HP',
    hints: {
      size: '20 cm',
      habitat: 'Estrato: subdosel y áreas abiertas',
      morphology: 'Macho enteramente negro con intensos reflejos morados y azulados iridiscentes.',
      loreOrFact: 'Practica el parasitismo de cría, depositando sus huevos en nidos de otras especies como el Chingolo.'
    },
    soundType: '010-tordo-renegrido',
    image: '/assets/aves/10-Tordo renegrido.jpg',
    audioUrl: '/assets/aves/10-Tordo renegrido.mp3',
    silhouetteIcon: '🐦‍⬛'
  },
  {
    id: '011-urraca-morada',
    catalogNumber: '011',
    commonName: 'Urraca morada (Urraca criolla)',
    scientificName: 'Cyanocorax chrysops',
    size: '34 cm',
    weight: '165 g',
    family: 'CORVIDAE',
    habitat: 'Interior y quebradas de la Selva Montana de las Yungas',
    stratum: 'Subdosel',
    conservationStatus: 'NA',
    presence: 'R',
    observationPossibility: 'A',
    beakDescription: 'Pico negro robusto y versátil para frutos, insectos y pequeños vertebrados.',
    songDescription: 'Amplio repertorio de voces metálicas, silbidos y llamados grupales en el bosque.',
    plumageDescription: 'Copete afelpado negro, manchas celestes sobre y bajo el ojo amarillo oro, nuca azul violácea y pecho crema.',
    cp: 2579,
    hp: '125 / 125 HP',
    hints: {
      size: '34 cm',
      habitat: 'Estrato: dosel y subdosel de las Yungas',
      morphology: 'Inconfundible jopo negro, ojos amarillos, nuca celeste-violácea y vientre más punta de la cola crema.',
      loreOrFact: 'Ave sumamente inteligente y gregaria que recorre los senderos en grupos familiares alertas.'
    },
    soundType: '011-urraca-morada',
    image: '/assets/aves/11-Urraca morada.JPG',
    audioUrl: '/assets/aves/11-Urraca morada.mp3',
    silhouetteIcon: '🪶'
  },
  {
    id: '012-suiriri-real',
    catalogNumber: '012',
    commonName: 'Suirirí real',
    scientificName: 'Tyrannus melancholicus',
    size: '21 cm',
    weight: '42 g',
    family: 'TYRANNIDAE',
    habitat: 'Ramas altas y expuestas del dosel del Parque',
    stratum: 'Dosel',
    conservationStatus: 'NA',
    presence: 'M',
    observationPossibility: 'A',
    beakDescription: 'Pico negro ancho y ganchudo ideal para atrapar insectos grandes en acrobacias aéreas.',
    songDescription: 'Trino agudo y vibrante "sirirí-sirirí" desde las perchas más altas al amanecer.',
    plumageDescription: 'Cabeza gris con antifaz oscuro, garganta clara, pecho amarillo intenso, dorso oliváceo y cola ahorquillada.',
    cp: 2579,
    hp: '125 / 125 HP',
    hints: {
      size: '21 cm',
      habitat: 'Estrato: dosel expuesto (Especie Migrante)',
      morphology: 'Cabeza gris sin ceja blanca, vientre amarillo brillante y cola escotada en V.',
      loreOrFact: 'Se posa en las puntas más altas de los árboles para lanzarse en vuelos elásticos tras insectos.'
    },
    soundType: '012-suiriri-real',
    image: '/assets/aves/12-Suirirí real.jpg',
    audioUrl: '/assets/aves/12-Suirirí real.mp3',
    silhouetteIcon: '⚡'
  },
  {
    id: '013-carancho',
    catalogNumber: '013',
    commonName: 'Carancho',
    scientificName: 'Caracara plancus',
    size: '58 cm',
    weight: '1150 g',
    family: 'FALCONIDAE',
    habitat: 'Sobrevuelo de laderas, claros y miradores del Parque',
    stratum: 'En vuelo',
    conservationStatus: 'NA',
    presence: 'R',
    observationPossibility: 'A',
    beakDescription: 'Pico alto, comprimido y ganchudo azul grisáceo con cera facial rojo-anaranjada.',
    songDescription: 'Voz áspera y gutural "kra-kra-kra" echando la cabeza hacia atrás.',
    plumageDescription: 'Boina negra despeinada, cuello blanco y pecho finamente barrado de negro y crema; manchas alares claras en vuelo.',
    cp: 2579,
    hp: '125 / 125 HP',
    hints: {
      size: '58 cm',
      habitat: 'Estrato: en vuelo y claros abiertos',
      morphology: 'Rapaz grande con capuchón negro, cara desnuda naranja-rojiza y pecho barrado.',
      loreOrFact: 'A diferencia de otros halcones, camina con soltura por el suelo gracias a sus largas patas amarillas.'
    },
    soundType: '013-carancho',
    image: '/assets/aves/13-Carancho.jpg',
    audioUrl: '/assets/aves/13-Carancho.mp3',
    silhouetteIcon: '🦅'
  },
  {
    id: '014-hornero',
    catalogNumber: '014',
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
    beakDescription: 'Pico pardo ligeramente curvado para amasar bolitas de barro con fibras vegetales.',
    songDescription: 'Dueto sincronizado jubiloso y potente con batido de alas de macho y hembra.',
    plumageDescription: 'Dorso pardo rojizo terroso, garganta blanca y cola rufo encendido.',
    cp: 2579,
    hp: '125 / 125 HP',
    hints: {
      size: '18 cm',
      habitat: 'Zona urbanizada y claros de bosque',
      morphology: 'Plumaje pardo terroso con garganta blanca, paso elegante en el suelo y cola rufa.',
      loreOrFact: 'Leyenda del Hornero: Ave Nacional Argentina famosa por construir su resistente nido de barro con forma de horno.'
    },
    legend: 'Leyenda del Hornero: Dos jóvenes alfareros enamorados fueron transformados en el ave nacional que modela su hogar en nidos de barro.',
    soundType: '014-hornero',
    image: '/assets/aves/14-Hornero.jpg',
    audioUrl: '/assets/aves/14-Hornero.mp3',
    silhouetteIcon: '🏺'
  },
  {
    id: '015-candelita-gorro-pardo',
    catalogNumber: '015',
    commonName: 'Candelita de gorro pardo (Arañero corona rojiza)',
    scientificName: 'Myioborus brunniceps',
    size: '13 cm',
    weight: '10 g',
    family: 'PARULIDAE',
    habitat: 'Sotobosque húmedo y quebradas de Selva Montana',
    stratum: 'Sotobosque',
    conservationStatus: 'NA',
    presence: 'R',
    observationPossibility: 'A',
    beakDescription: 'Pico fino y negro especializado en capturar pequeños insectos entre el follaje.',
    songDescription: 'Serie dulce y cristalina de silbidos agudos que animan el interior del bosque.',
    plumageDescription: 'Corona castaño rojiza, medialunas oculares blancas, dorso gris, pecho amarillo vivo y cola negra con bordes blancos.',
    cp: 2579,
    hp: '125 / 125 HP',
    hints: {
      size: '13 cm',
      habitat: 'Estrato: sotobosque y subdosel',
      morphology: 'Gorro castaño rojizo, anteojos blancos partidos, pecho amarillo y cola en abanico con plumas externas blancas.',
      loreOrFact: 'Despliega y agita constantemente su cola blanca y negra para espantar insectos ocultos en las hojas.'
    },
    soundType: '015-candelita-gorro-pardo',
    image: '/assets/aves/15-Candelita de gorro pardo.jpg',
    audioUrl: '/assets/aves/15-Candelita de gorro pardo.mp3',
    silhouetteIcon: '✨'
  },
  {
    id: '016-parula-tropical',
    catalogNumber: '016',
    commonName: 'Parula tropical (Pitiayumí)',
    scientificName: 'Setophaga pitiayumi',
    size: '10 cm',
    weight: '7.5 g',
    family: 'PARULIDAE',
    habitat: 'Copas con líquenes y barbas de monte en las Yungas',
    stratum: 'Dosel',
    conservationStatus: 'NA',
    presence: 'R',
    observationPossibility: 'A',
    beakDescription: 'Pico diminuto y puntiagudo con mandíbula superior oscura e inferior amarillenta.',
    songDescription: 'Trino ascendente rápido y zumbador que culmina en un chasquido agudo.',
    plumageDescription: 'Dorso azul grisáceo con parche verdoso en la espalda, garganta y pecho amarillo anaranjado y dos filetes alares blancos.',
    cp: 2579,
    hp: '125 / 125 HP',
    hints: {
      size: '10 cm',
      habitat: 'Estrato: dosel y subdosel',
      morphology: 'Muy pequeña, dorso azulado con mancha verde oliva dorsal y pecho amarillo con tinte naranja.',
      loreOrFact: 'Construye su nido oculto dentro de los colgajos de líquenes y claveles del aire en las ramas altas.'
    },
    soundType: '016-parula-tropical',
    image: '/assets/aves/16-Parula tropical.jpg',
    audioUrl: '/assets/aves/16-Parula tropical.mp3',
    silhouetteIcon: '🎶'
  },
  {
    id: '017-pava-de-las-yungas',
    catalogNumber: '017',
    commonName: 'Pava de las yungas (Pava de monte yungueña)',
    scientificName: 'Penelope bridgesi',
    size: '72 cm',
    weight: '1450 g',
    family: 'CRACIDAE',
    habitat: 'Interior denso de la Selva Montana del Parque Botánico',
    stratum: 'Subdosel',
    conservationStatus: 'VU',
    presence: 'R',
    observationPossibility: 'M',
    beakDescription: 'Pico fuerte pardo oscuro para recolectar frutos nativos de laurel, chal-chal e higuerón.',
    songDescription: 'Voz grave y potente tipo ladrido ronco y batido de alas sonoro al amanecer.',
    plumageDescription: 'Pardo bronceado oscuro con fino estriado blanco en pecho y cobertoras alares, y prominente carúncula gular roja.',
    cp: 2579,
    hp: '125 / 125 HP',
    hints: {
      size: '72 cm',
      habitat: 'Estrato: subdosel y sotobosque (Especie Vulnerable - VU)',
      morphology: 'Gran tamaño, plumaje pardo bronceado estriado de blanco y llamativa papada roja en la garganta.',
      loreOrFact: 'Especie emblema de conservación de las Yungas; encuentra un refugio seguro en las 15,5 ha de la Reserva Barón Schuel.'
    },
    soundType: '017-pava-de-las-yungas',
    image: '/assets/aves/17-Pava de los yungas.png',
    audioUrl: '/assets/aves/17-Pava de los yungas.mp3',
    silhouetteIcon: '🌿'
  },
  {
    id: '018-aratinga-mitrada',
    catalogNumber: '018',
    commonName: 'Aratinga mitrada (Calancate cara roja)',
    scientificName: 'Psittacara mitratus',
    size: '36 cm',
    weight: '220 g',
    family: 'PSITTACIDAE',
    habitat: 'Dosel de la Selva Montana y barrancas de las Yungas',
    stratum: 'Dosel',
    conservationStatus: 'NA',
    presence: 'R',
    observationPossibility: 'A',
    beakDescription: 'Pico ganchudo grande y robusto color hueso marfil capaz de partir semillas duras.',
    songDescription: 'Gritos metálicos estridentes emitidos al unísono mientras vuelan en bandadas veloces.',
    plumageDescription: 'Verde brillante con llamativa máscara frontal y mejillas rojo escarlata, periocular blanco desnudo y cola larga aguda.',
    cp: 2579,
    hp: '125 / 125 HP',
    hints: {
      size: '36 cm',
      habitat: 'Estrato: dosel y en vuelo sobre las quebradas',
      morphology: 'Loro de cola larga graduada, plumaje verde intenso con frente y cara salpicadas de rojo carmesí.',
      loreOrFact: 'Sus bandadas anuncian el atardecer cruzando el cielo del Parque Botánico hacia sus dormideros.'
    },
    soundType: '018-aratinga-mitrada',
    image: '/assets/aves/18-Aratinga mitrada.jpg',
    audioUrl: '/assets/aves/18-Aratinga mitrada.mp3',
    silhouetteIcon: '🦜'
  },
  {
    id: '019-tangara-azul-y-amarilla',
    catalogNumber: '019',
    commonName: 'Tangara azul y amarilla (Naranjero)',
    scientificName: 'Pipraeidea bonariensis',
    size: '17 cm',
    weight: '34 g',
    family: 'THRAUPIDAE',
    habitat: 'Bordes de selva y árboles frutales del Parque',
    stratum: 'Dosel',
    conservationStatus: 'NA',
    presence: 'R',
    observationPossibility: 'A',
    beakDescription: 'Pico corto y robusto azulado con punta oscura para trozar frutas dulces.',
    songDescription: 'Gorjeo agudo y vivaz de notas repetidas en las copas soleadas.',
    plumageDescription: 'Capucha celeste turquesa, antifaz y dorso negros, y pecho amarillo-naranja fuego intenso.',
    cp: 2579,
    hp: '125 / 125 HP',
    hints: {
      size: '17 cm',
      habitat: 'Estrato: dosel y subdosel',
      morphology: 'Cabeza y alas celeste intenso, antifaz negro y pecho amarillo anaranjado brillante.',
      loreOrFact: 'Aporta los colores más vibrantes a las copas soleadas del Parque Botánico Municipal Barón Schuel.'
    },
    soundType: '019-tangara-azul-y-amarilla',
    image: '/assets/aves/19-Tangara azul y amarilla.png',
    audioUrl: '/assets/aves/19-Tangara azul y amarilla.mp3',
    silhouetteIcon: '🍊'
  },
  {
    id: '020-ticotico-cejicanelo',
    catalogNumber: '020',
    commonName: 'Ticotico cejicanelo (Ticotico estriado)',
    scientificName: 'Syndactyla rufosuperciliata',
    size: '17 cm',
    weight: '29 g',
    family: 'FURNARIIDAE',
    habitat: 'Enredaderas, epífitas y espesura de la Selva Montana',
    stratum: 'Subdosel',
    conservationStatus: 'NA',
    presence: 'R',
    observationPossibility: 'M',
    beakDescription: 'Pico recto y fuerte en forma de cuña para explorar bromelias y hojarasca aérea.',
    songDescription: 'Serie acelerada de notas metálicas secas y vibrantes entre el ramaje.',
    plumageDescription: 'Dorso pardo oliváceo, marcada ceja ante-canela, pecho pardo estriado de blanco cremoso y cola rufa.',
    cp: 2579,
    hp: '125 / 125 HP',
    hints: {
      size: '17 cm',
      habitat: 'Estrato: subdosel y sotobosque con epífitas',
      morphology: 'Ceja canela bien definida, pecho profusamente estriado y cola castaño rojiza.',
      loreOrFact: 'Especialista en revisar el interior de bromelias y manojos de hojas secas suspendidas en las ramas.'
    },
    soundType: '020-ticotico-cejicanelo',
    image: '/assets/aves/20-Ticotico cejicanelo.jpg',
    audioUrl: '/assets/aves/20-Ticotico cejicanelo.mp3',
    silhouetteIcon: '🍂'
  },
  {
    id: '021-tordo-bayo',
    catalogNumber: '021',
    commonName: 'Tordo bayo (Músico)',
    scientificName: 'Agelaioides badius',
    size: '18 cm',
    weight: '42 g',
    family: 'ICTERIDAE',
    habitat: 'Arboledas abiertas y bordes del Parque Botánico',
    stratum: 'Subdosel',
    conservationStatus: 'NA',
    presence: 'R',
    observationPossibility: 'A',
    beakDescription: 'Pico cónico corto y negro rodeado por un antifaz oscuro bien definido.',
    songDescription: 'Canto coral melodioso y variado que realizan varios individuos juntos desde las ramas.',
    plumageDescription: 'Plumaje general gris parduzco suave en contraste con las alas color castaño rufo (bayo) encendido.',
    cp: 2579,
    hp: '125 / 125 HP',
    hints: {
      size: '18 cm',
      habitat: 'Estrato: subdosel y arboledas abiertas',
      morphology: 'Cuerpo gris ceniciento con antifaz negro y alas de color castaño rojizo (bayo) muy notable.',
      loreOrFact: 'Llamado "Músico" por sus agradables conciertos grupales en las copas de los árboles.'
    },
    soundType: '021-tordo-bayo',
    image: '/assets/aves/21-Tordo bayo.jpg',
    audioUrl: '/assets/aves/21-Tordo bayo.mp3',
    silhouetteIcon: '🎵'
  }
];

// Especies destacadas vinculadas al "Sobre Selva Montana" (100 XP en Tienda)
export const PACK_EXTRA_BIRDS_DATA: CatalogBird[] = CATALOG_BIRDS_DATA.slice(15, 21);


// Paso 15 - Pestaña B: "Temporada de Aves Migrantes de las Yungas" (5 especies reales de la Guía)
export const SEASON_MIGRANT_BIRDS = [
  {
    id: 'mig-loro-alisero',
    commonName: 'Loro Alisero',
    scientificName: 'Amazona tucumana',
    size: '32 cm',
    status: 'Amenazada (AM)',
    stratum: 'Dosel y subdosel',
    family: 'PSITTACIDAE',
    description: 'Loro migrante emblemático de los bosques de aliso de las Yungas. Frente roja, periocular blanco y cobertoras rojas.',
    icon: '🦜'
  },
  {
    id: 'mig-milano-tijereta',
    commonName: 'Milano Tijereta',
    scientificName: 'Elanoides forficatus',
    size: '60 cm',
    status: 'No Amenazada (NA)',
    stratum: 'En vuelo',
    family: 'ACCIPITRIDAE',
    description: 'Rapaz migrante inconfundible por su larguísima cola ahorquillada en tijera y su elegante planeo blanco y negro sobre el Parque.',
    icon: '🦅'
  },
  {
    id: 'mig-vencejo-collar',
    commonName: 'Vencejo de Collar',
    scientificName: 'Streptoprocne zonaris',
    size: '21 cm',
    status: 'No Amenazada (NA)',
    stratum: 'En vuelo',
    family: 'APODIDAE',
    description: 'Acróbata aéreo veloz de plumaje negro hollín con un nítido collar blanco completo alrededor del cuello.',
    icon: '⚡'
  },
  {
    id: 'mig-cuclillo-canela',
    commonName: 'Cuclillo Canela',
    scientificName: 'Coccyzus melacoryphus',
    size: '27 cm',
    status: 'No Amenazada (NA)',
    stratum: 'Dosel y subdosel',
    family: 'CUCULIDAE',
    description: 'Migrante estival sigiloso de vientre canela ocráceo, antifaz oscuro y larga cola escalonada con manchas blancas.',
    icon: '🍂'
  },
  {
    id: 'mig-suiriri-real',
    commonName: 'Suirirí Real',
    scientificName: 'Tyrannus melancholicus',
    size: '21 cm',
    status: 'No Amenazada (NA)',
    stratum: 'Dosel y subdosel',
    family: 'TYRANNIDAE',
    description: 'Tiránido migrador que se posa en las ramas más altas y expuestas para cazar insectos al vuelo con su pecho amarillo y cabeza gris.',
    icon: '☀️'
  }
];

// Paso 15 - Pestaña B: Eventos de Fechas Especiales con Fichas Exclusivas
export const SPECIAL_EVENT_CARDS = [
  {
    id: 'global-big-day',
    eventTitle: 'Global Big Day - Jujuy',
    eventSubtitle: 'Jornada Mundial de Observación de Aves',
    birdCommonName: 'Tucán Grande',
    birdScientificName: 'Ramphastos toco',
    size: '55 cm',
    status: 'No Amenazada (NA)',
    family: 'RAMPHASTIDAE',
    stratum: 'Subdosel y dosel',
    xpReward: 100,
    badgeIcon: '🌍',
    image: '/assets/aistudio/Toucan_perched_on_branch_8ab41bfc_230157f9.jpg',
    specialNote: 'Ficha Especial Conmemorativa del Global Big Day en el Parque Botánico Municipal Barón Schuel: el Tucán Grande lidera los registros de biodiversidad de San Salvador de Jujuy como dispersor estelar de semillas de las Yungas.'
  },
  {
    id: 'qmi-raymi',
    eventTitle: "Q'MI RAYMI - Fiesta Verde",
    eventSubtitle: 'Día Nacional de la Conciencia Ambiental',
    birdCommonName: 'Pava de Monte Yungueña',
    birdScientificName: 'Penelope bridgesi',
    size: '72 cm',
    status: 'Vulnerable (VU)',
    family: 'CRACIDAE',
    stratum: 'Subdosel y sotobosque',
    xpReward: 100,
    badgeIcon: '🌿',
    image: '/assets/aves/17-Pava de los yungas.png',
    specialNote: "Ficha Especial de Conservación Q'MI RAYMI (Fiesta Verde): La Pava de Monte Yungueña (72 cm, Vulnerable) encuentra en las 15,5 hectáreas del Parque Botánico un santuario vital libre de caza y perturbación urbana."
  }
];
