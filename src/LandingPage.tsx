import React from "react";
import {
  ArrowDown,
  ArrowRight,
  Binoculars,
  BookOpen,
  Compass,
  Leaf,
  MapPin,
} from "lucide-react";
import "./landing.css";

const birds = [
  {
    name: "Benteveo",
    scientific: "Pitangus sulphuratus",
    image: "/assets/aves/7-Benteveo.jpg",
    note: "Una silueta familiar entre las ramas.",
  },
  {
    name: "Tangara sayaca (Celestino)",
    scientific: "Thraupis sayaca",
    image: "/assets/aves/2-Tangara sacaya.jpg",
    note: "El azul resalta entre el follaje.",
  },
  {
    name: "Urraca morada (Urraca criolla)",
    scientific: "Cyanocorax chrysops",
    image: "/assets/aves/11-Urraca morada.JPG",
    note: "Atenta, curiosa y de voz inconfundible.",
  },
];

export default function LandingPage() {
  return (
    <main className="sn-landing">
      <header className="sn-nav">
        <a
          className="sn-brand"
          href="#inicio"
          aria-label="Señal Nativa, inicio"
        >
          <img src="/assets/aistudio/toucan_waving_cutout.png" alt="" />
          <span>
            SEÑAL NATIVA<small>AVES EN ACCIÓN · JUJUY</small>
          </span>
        </a>
        <nav aria-label="Navegación principal">
          <a href="#experiencia">La guía</a>
          <a href="#aves">Cuaderno de aves</a>
          <a className="sn-nav-cta" href="/app">
            Abrir la guía <ArrowRight size={16} aria-hidden="true" />
          </a>
        </nav>
      </header>

      <section className="sn-hero" id="inicio">
        <div className="sn-hero-copy">
          <span className="sn-eyebrow">
            <MapPin size={15} aria-hidden="true" /> PARQUE BOTÁNICO MUNICIPAL ·
            JUJUY
          </span>
          <p className="sn-edition">
            CUADERNO DE CAMPO <span>—</span> 01 / YUNGAS
          </p>
          <h1>
            Señal Nativa:
            <br />
            <em>Aves en Acción</em>
          </h1>
          <p className="sn-lede">
            Una guía para caminar el Parque Botánico Barón Carlos María Schuel,
            observar sus aves y conocer la vida que habita las Yungas.
          </p>
          <div className="sn-actions">
            <a className="sn-button sn-button-gold" href="/app">
              Abrir la guía <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a className="sn-text-link" href="#experiencia">
              Ver cómo recorrer <ArrowDown size={16} aria-hidden="true" />
            </a>
          </div>
          <div className="sn-location-note">
            <Leaf size={17} aria-hidden="true" /> Para explorar con atención y
            respeto por el entorno.
          </div>
        </div>
        <figure className="sn-hero-figure">
          <img
            src="/assets/aves/17-Pava de los yungas.png"
            alt="Pava de Monte Yungueña entre la vegetación de las Yungas"
          />
          <figcaption>
            <span>ENCUENTRO DE CAMPO · 01</span>
            <span>
              Pava de Monte Yungueña <i>· Penelope bridgesi</i>
            </span>
          </figcaption>
        </figure>
        <div className="sn-hero-index" aria-hidden="true">
          01 <span>/</span> 03
        </div>
      </section>

      <section className="sn-intro" id="experiencia">
        <div className="sn-section-kicker">
          <span>01</span> UNA GUÍA PARA MIRAR DE CERCA
        </div>
        <div className="sn-intro-grid">
          <h2>
            Seguí el sendero.
            <br />
            <em>Prestá atención.</em>
          </h2>
          <div className="sn-intro-copy">
            <p>
              La experiencia acompaña tu visita con información breve, especies
              para reconocer y pequeñas propuestas de observación.
            </p>
            <p>
              No hace falta saber de aves: alcanza con caminar despacio, mirar
              alrededor y dejar que el parque marque el ritmo.
            </p>
          </div>
        </div>
        <div className="sn-field-notes">
          <article className="sn-field-note">
            <span className="sn-note-mark">
              <Compass aria-hidden="true" />
            </span>
            <span className="sn-note-index">01 — RECORRER</span>
            <h3>Un paseo a tu ritmo</h3>
            <p>
              Usá la guía mientras avanzás por los senderos y sus puntos de
              interés.
            </p>
          </article>
          <article className="sn-field-note sn-note-featured">
            <span className="sn-note-mark">
              <Binoculars aria-hidden="true" />
            </span>
            <span className="sn-note-index">02 — OBSERVAR</span>
            <h3>Mirar también es descubrir</h3>
            <p>Conocé rasgos, nombres y hábitos de algunas aves del parque.</p>
          </article>
          <article className="sn-field-note">
            <span className="sn-note-mark">
              <BookOpen aria-hidden="true" />
            </span>
            <span className="sn-note-index">03 — APRENDER</span>
            <h3>Una bitácora propia</h3>
            <p>
              Explorá desafíos y registrá tus observaciones en el diario de
              campo.
            </p>
          </article>
        </div>
        <aside className="sn-offline">
          <span className="sn-offline-label">ANTES DE SALIR</span>
          <p>
            <strong>Prepará la guía con conexión.</strong> Cuando el contenido
            esté disponible en tu dispositivo, podrás consultarlo durante el
            recorrido sin depender de señal.
          </p>
        </aside>
      </section>

      <section className="sn-birds" id="aves">
        <div className="sn-birds-heading">
          <div>
            <div className="sn-section-kicker sn-kicker-light">
              <span>02</span> PÁGINAS DEL CUADERNO
            </div>
            <h2>
              Vecinas del
              <br />
              <em>bosque montano.</em>
            </h2>
          </div>
          <div className="sn-birds-context">
            <p>
              <strong>125 especies documentadas</strong> en el parque. La guía
              reúne una selección para empezar a reconocerlas.
            </p>
            <a href="/app">
              Explorar selección en la app{" "}
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
        <div className="sn-bird-grid">
          {birds.map((bird, i) => (
            <article
              className={`sn-bird-card sn-bird-${i + 1}`}
              key={bird.name}
            >
              <figure className="sn-bird-photo">
                <img
                  src={bird.image}
                  alt={`${bird.name} entre las ramas`}
                  loading="lazy"
                />
                <figcaption>FIG. 0{i + 1}</figcaption>
              </figure>
              <div className="sn-bird-info">
                <span className="sn-bird-note">{bird.note}</span>
                <h3>{bird.name}</h3>
                <i>{bird.scientific}</i>
              </div>
            </article>
          ))}
        </div>
        <div className="sn-birds-foot">
          <span>OBSERVAR CON RESPETO</span>
          <span>Sin flash ni ruidos fuertes · cuidemos su hábitat</span>
        </div>
      </section>
      <footer className="sn-footer">
        <a className="sn-brand" href="#inicio">
          <img src="/assets/aistudio/toucan_waving_cutout.png" alt="" />
          <span>
            SEÑAL NATIVA<small>AVES EN ACCIÓN</small>
          </span>
        </a>
        <p>
          Parque Botánico Municipal “Barón Carlos María Schuel”
          <br />
          San Salvador de Jujuy · Selva Montana de las Yungas
        </p>
        <a href="/app">
          Abrir la guía <ArrowRight size={16} aria-hidden="true" />
        </a>
      </footer>
    </main>
  );
}
