# 🦜 Señal Nativa: Aves en Acción (XR Web App)

> **Experiencia interactiva de Realidad Extendida (XR), educación ambiental y ciencia ciudadana para el Parque Botánico Municipal "Barón Carlos María Schuel"** — *Reserva Natural Urbana de 15.5 hectáreas en el barrio Los Perales, San Salvador de Jujuy, Argentina, ubicada entre los 1334 y 1463 m.s.n.m. en la Selva Montana de las Yungas.*

[![Repositorio Oficial](https://img.shields.io/badge/GitHub-solsalasdata--arch%2Fsenal--nativa--aves--en--accion-0C6E5A?style=for-the-badge&logo=github)](https://github.com/solsalasdata-arch/senal-nativa-aves-en-accion)
[![Modo Offline](https://img.shields.io/badge/Offline--First-100%25%20LocalStorage%20%2B%20Web%20Audio-149B7E?style=for-the-badge)](#3--tecnologías-e-instalación-local)
[![Ecorregión](https://img.shields.io/badge/Yungas-Selva%20Montana%20(1334--1463%20m.s.n.m.)-F59E0B?style=for-the-badge)](#1--descripción-y-base-científica)

---

## 1. 🌿 Descripción y Base Científica

**Señal Nativa: Aves en Acción (XR Web App)** es una aplicación web móvil interactiva en formato vertical (`9:16`) diseñada con estética de videojuego de exploración 2D/XR para acompañar a visitantes, estudiantes, familias y observadores de aves durante su recorrido por el **Parque Botánico Municipal "Barón Carlos María Schuel"** en San Salvador de Jujuy.

La experiencia funciona **100% sin conexión a internet (Offline-First)** en los senderos de montaña y combina gamificación respetuosa con la fauna, bioacústica sintetizada en tiempo real y protocolos de ciencia ciudadana.

### 📚 Créditos de Base Científica
Todo el contenido ornitológico, taxonómico, ecológico, de conservación y cultural del proyecto está basado en la obra oficial:

- **Obra de referencia:** *"Guía de Aves del Parque Botánico Municipal Barón Carlos María Schuel"* (Grupo Aves Jujuy - **EDIUNJU**, 2024).
- **Autoría científica:** Venecia Nuria Herrera, Sara Noemí Cabrera, María Verónica Tejerina, Nadia Alejandra Tejerina, Gloria Alejandra Yanina Romero y Héctor Rafael Portales.
- **Riqueza biológica documentada:** **125 especies de aves** agrupadas en **33 familias**, distribuidas en los estratos de **Sotobosque**, **Subdosel**, **Dosel**, **Zona Urbanizada** y **En Vuelo**.

| Parámetro del Área Protegida | Valor Oficial |
| :--- | :--- |
| **Nombre Oficial** | Parque Botánico Municipal "Barón Carlos María Schuel" |
| **Categoría** | Reserva Natural Urbana (Barrio Los Perales, San Salvador de Jujuy) |
| **Superficie** | 15,5 hectáreas |
| **Rango Altitudinal** | 1334 – 1463 m.s.n.m. |
| **Ecorregión / Piso Altitudinal** | Selva Montana de las Yungas |
| **Avifauna Registrada** | 125 especies pertenecientes a 33 familias |
| **Recorrido de Senderos** | 2720 metros (~2 horas de caminata interpretativa) |

---

## 2. 🧭 Arquitectura de los 4 Módulos y 15 Pasos del Proyecto

La aplicación articula el recorrido educativo y lúdico a través de **4 módulos integrados** que abarcan los **15 pasos pedagógicos y funcionales** del proyecto:

### 🎒 Módulo 1: Onboarding, Multi-Perfil Offline y Guía (Pasos 1 al 9)
- **Sistema Multi-Perfil Sin Conexión (`localStorage`)**: Permite registrar y alternar entre múltiples perfiles independientes (`profiles_list` y `active_profile_id`) en un mismo teléfono, ideal para familias o grupos escolares que comparten dispositivo. Cada perfil conserva su nombre, personaje/avatar, ave compañera favorita, nivel, XP, misiones, fotografías y entradas del Diario de Campo.
- **Fotografía Ética con el Ave Compañera**: Cámara integrada con superposición del ave compañera favorita (*Tucán Grande, Benteveo, Chinchero Chico o Picaflor Cometa*) y recordatorio permanente de la regla de oro del Parque: **prohibido el uso de flash y los ruidos fuertes**.
- **Anfitrión Oficial — Tucán Grande (*Ramphastos toco*)**: Ficha interactiva de bienvenida con sus parámetros biológicos reales (**55 – 63 cm** de longitud y **500 – 860 g** de peso) y vocalización sintetizada.
- **Misiones del Día y Misión Semanal (Paso 9)**: Propone una meta de recorrido saludable de **20 a 40 minutos** dividida en 3 misiones activas (**1 Fácil**, **1 Media** y **1 Desafiante**) más una barra de progreso para la **Misión Semanal de Fin de Semana**.

---

### 🗺️ Módulo 2: Mapa de Senderos (Paso 14) y Visor de Avistamiento XR (Paso 12)
- **Plano Interactivo de los Senderos (Paso 14)**: Representa el circuito oficial de **2720 metros (~2 hs)** entre los **1334 y 1463 m.s.n.m.** con los **8 Puntos de Control numerados**:

| Nº | Punto de Control | Distancia | Tipo | Especies Probables Destacadas |
| :-: | :--- | :---: | :---: | :--- |
| **1** | **1º Descanso "Mora Negra"** | `470 m` | Descanso | Chiricote (*Aramides cajaneus*), Pava de Monte Yungueña (*Penelope bridgesi*), Urraca Criolla (*Cyanocorax chrysops*) |
| **2** | **1º Mirador "El Guarán"** | `655 m` | Mirador | Yapú (*Psarocolius decumanus*), Taguató (*Rupornis magnirostris*), Golondrina Parda (*Progne tapera*) |
| **3** | **2º Descanso "Pucancho"** | `975 m` | Descanso | Ratona Ceja Blanca (*Troglodytes solstitialis*), Ticotico Estriado (*Syndactyla rufosuperciliata*) |
| **4** | **3º Descanso "La Tusca"** | `1290 m` | Descanso | Carpintero Lomo Blanco (*Campephilus leucopogon*), Cerquero Yungueño (*Arremon dorbignii*), Arañero Corona Rojiza (*Myioborus brunniceps*) |
| **5** | **2º Mirador "Sacha Higuera"** | `1440 m` | Mirador | Picaflor Cometa (*Sappho sparganurus*), Picaflor Frente Azul (*Eriocnemis glaucopoides*), Celestino Común (*Thraupis sayaca*) |
| **6** | **1º Puente "El Laurel"** | `1790 m` | Puente | Pitiayumí (*Setophaga pitiayumi*), Mosqueta Ojo Dorado (*Hemitriccus margaritaceiventer*), Fiofío Corona Dorada (*Myiopagis viridicata*) |
| **7** | **2º Puente "El Ceibo"** | `2000 m` | Puente | Fueguero Común (*Piranga flava*), Pepitero de Collar (*Saltator aurantiirostris*), Juan Chiviro (*Cyclarhis gujanensis*) |
| **8** | **3º Mirador "Horco Molle"** | `2345 m` | Mirador | Frutero Yungueño (*Chlorospingus flavopectus*), Rey del Bosque (*Pheucticus aureoventris*), Arañero Coronado Grande (*Myiothlypis bivittata*) |

- **Sello de Ruta Completa**: Al validar los 8 puntos mediante el desafío QR/GPS de cada parada, el explorador obtiene el **Sello de Ruta Completa** y desbloquea las fichas especiales de aves raras de las Yungas (**Urutaú** y **Jote Real**).
- **Visor XR de Avistamiento y Mecánica "Foto Perfecta" (Paso 12)**:
  - Retícula de enfoque sobre cámara real o simulación de sendero con detección en vivo del **Benteveo** (*Pitangus sulphuratus*) y del **Chinchero Chico** (*Lepidocolaptes angustirostris*).
  - **Calificación de 1 a 3 estrellas (⭐)** evaluando 3 criterios: **1) Ave centrada**, **2) Nitidez del enfoque** y **3) Distancia respetuosa sin flash**.
- **Regla de Nivelación y Feedback Amable (Paso 8B)**:
  - Completar **1 avistamiento XR** y responder correctamente las **5 consignas ornitológicas** otorga el ascenso de nivel y la **"Insignia de Observador en Ascenso"**.
  - Si el jugador falla alguna pregunta, se activa la pantalla de **Feedback Amable (8B)**: el Tucán motiva al explorador sin restar puntos y brinda pistas educativas para volver a intentar.

---

### 🔎 Módulo 3: Colección de Aves, Bioacústica y Ciencia Ciudadana (Pasos 10, 11 y 13)
- **Catálogo de Especies y Juego "Silueta Misteriosa" (Paso 10)**:
  - Presenta al **Chinchero Chico** sobre el sello circular del Parque Botánico y la grilla numerada de especies (**011 Jote Real**, **012 Loro Alisero**, **013 Picaflor Cometa**, **014 Urutaú**, **015 Chiricote**, **016 Benteveo**, **017 Hornero**, **018 Zorzal Colorado**, más las especies expandibles del Sobre Selva Montana).
  - Permite revelar progresivamente hasta **4 pistas reales de la Guía**:
    1. **Pista 1 (Tamaño)**
    2. **Pista 2 (Hábitat / Estrato y Categoría de Conservación)**
    3. **Pista 3 (Color y Morfología)**
    4. **Pista 4 (Dato Curioso y Leyendas ancestrales del Urutaú/Kakuy, Hornero y Zorzal Colorado)**
  - **Puntuación progresiva**: `+100 XP` con 1 pista, `+75 XP` con 2 pistas, `+50 XP` con 3 pistas y `+25 XP` con 4 pistas, iluminando la silueta a todo color.
- **Modo Bioacústico "Escucha el Canto (Sin Conexión)" (Paso 11)**:
  - Sintetiza **100% offline mediante Web Audio API** los cantos del **Benteveo** (*"bien-te-veo"*), **Chinchero Chico** (trino descendente), **Urutaú** (lamento nocturno *"Turay, kakuy"*), **Zorzal Colorado** (fraseo de flauta) y **Hornero** (dúo sincopado), junto con un visualizador de onda sonora en vivo. Al acertar (`+50 XP`), desbloquea el reproductor acústico dentro de la Ficha Técnica del ave.
- **Ficha Técnica Completa y "Diario de Campo" de 4 Toques (Paso 13)**:
  - Muestra arco superior con **PC 2579**, barra **125 / 125 HP**, **Peso**, **Altura**, **Familia**, **Hábitat**, **Categoría de Conservación (`NA` / `VU` / `AM`)**, **Presencia (`R` / `M`)**, **Posibilidad de observación (`A` / `M` / `B`)**, mejor calificación de **Foto Perfecta (1-3 ⭐)**, tipo de **Pico**, **Canto con onda sonora** y **Plumaje**.
  - **Registro Científico en 4 Toques (`+30 XP`)**:
    1. **Toque 1 (Comportamiento)**: *Alimentándose | Cantando | En reposo | En vuelo*
    2. **Toque 2 (Cantidad)**: *1 individuo | Pareja (2) | Grupo/Bandada (3+)*
    3. **Toque 3 (Estrato)**: *Dosel | Subdosel | Sotobosque | Zona Urbanizada | En Vuelo*
    4. **Toque 4 (Clima del momento)**: *Soleado | Nublado | Llovizna de Yungas*
  - Adjunta automáticamente **Fecha**, **Hora** y **Punto del Sendero activo**. Al completar **10 registros (10/10)**, despliega una celebración y otorga la insignia **"Observador de Detalles"**.

---

### 🛡️ Módulo 4: Comunidad, Temporadas, Tienda y Ranking Amigable (Paso 15)
- **Cuadrillas Escolares / Familiares (Hasta 5 Jugadores)**:
  - Permite crear cuadrillas (ej. *"Exploradores Los Perales"*, *"Escuadra Yungas"*), vincular perfiles del dispositivo o sumar compañeros hasta **5 integrantes**, consolidando una **Lista Compartida de Avistamientos** con meta grupal cooperativa (`+150 XP`).
- **Temporadas y Eventos Especiales**:
  - **Temporada de Aves Migrantes de las Yungas**: Destaca 5 especies migrantes reales de la Guía:
    1. **Loro Alisero** (*Amazona tucumana* — `32 cm`, Amenazada `AM`, Dosel y subdosel)
    2. **Milano Tijereta** (*Elanoides forficatus* — `60 cm`, En vuelo, cola ahorquillada)
    3. **Vencejo de Collar** (*Streptoprocne zonaris* — `21 cm`, En vuelo, collar blanco)
    4. **Cuclillo Canela** (*Coccyzus melacoryphus* — `27 cm`, Dosel y subdosel)
    5. **Suirirí Real** (*Tyrannus melancholicus* — `21 cm`, Dosel y subdosel)
  - **Eventos de Fechas Especiales con Fichas Exclusivas (`+100 XP` c/u)**:
    - 🌍 **Global Big Day - Jujuy**: Ficha conmemorativa del **Tucán Grande** (*Ramphastos toco*, `55 cm`).
    - 🌿 **Q'MI RAYMI - Fiesta Verde (Día Nacional de la Conciencia Ambiental)**: Ficha especial de conservación de la **Pava de Monte Yungueña** (*Penelope bridgesi*, `72 cm`, Vulnerable `VU`).
- **Tienda Botánica de Avatar y Sobres de Siluetas (Paso 9)**:
  - **Prendas y Equipo para el Avatar**: *Visera Oficial del Parque Botánico* (por defecto), *Binoculares de Dosel de Alta Precisión* (`100 XP`), *Chaleco de Guardaparque de las Yungas* (`150 XP`), *Cámara Teleobjetivo Respetuosa Sin Flash* (`200 XP`) y *Pin Dorado "Aliado del Grupo Aves Jujuy"* (`250 XP`).
  - **Sobre Selva Montana (`100 XP`)**: Agrega 3 nuevas siluetas de la Guía al catálogo (*Tangará Cabeza Celeste, Rey del Bosque, Carpintero Lomo Blanco, Martín Pescador Grande, Yapú, Naranjero*) o revela automáticamente **+2 pistas gratis** en la Silueta Misteriosa.
- **Ranking Amigable**:
  - Clasificación pedagógica que premia la **CONSTANCIA** (registros en el Diario de Campo y misiones cumplidas) y la **VARIEDAD BIOLÓGICA** (cantidad de **Familias** diferentes observadas sobre las 33 de la Guía y **Estratos** cubiertos) con medallas específicas por encima del puntaje bruto.

---

## 3. 🛠️ Tecnologías e Instalación Local

### Stack Tecnológico
- **Frontend & UI:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
- **Estilos y Diseño Visual:** [Tailwind CSS v4](https://tailwindcss.com/) + [Lucide React Icons](https://lucide.dev/)
- **Síntesis Bioacústica Offline:** **Web Audio API** nativa (generación procedural de cantos de aves y paisaje sonoro de selva sin archivos pesados ni dependencia de red)
- **Cámara y Visor XR:** **MediaDevices Camera API (`navigator.mediaDevices.getUserMedia`)** con fallback simulado interactivo
- **Persistencia Offline-First:** **Web Storage API (`localStorage`)** con soporte multi-perfil, cuadrillas y exportación opcional a la nube

### 🚀 Instrucciones Paso a Paso para Ejecución Local

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/solsalasdata-arch/senal-nativa-aves-en-accion.git
   cd senal-nativa-aves-en-accion
   ```

2. **Instalar las dependencias del proyecto:**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador:**
   Ingresa a `http://localhost:3000` (puedes usar la vista de dispositivo móvil en las herramientas de desarrollador para apreciar el contenedor vertical `9:16`).

---

<div align="center">
  <strong>🌲 Parque Botánico Municipal "Barón Carlos María Schuel" · San Salvador de Jujuy, Argentina 🦜</strong><br/>
  <em>"Observar sin alterar: ciencia ciudadana y conservación en el corazón de las Yungas."</em>
</div>
