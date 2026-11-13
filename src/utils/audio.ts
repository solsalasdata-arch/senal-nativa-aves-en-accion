// Web Audio API Synthesizer for 100% Offline Bioacoustics & UI Sounds

type ToucanVoiceLine = 'menu' | 'welcome';

// Lines of the Toucan guide recorded with the same voice as his intro videos
const TOUCAN_VOICE_LINES: Record<ToucanVoiceLine, Record<'es' | 'en', { url: string; text: string }>> = {
  menu: {
    es: {
      url: '/assets/voz/tucan-saludo-menu-es.mp3',
      text: '¡Estas son las opciones del juego! Necesitas más avistamientos para seguir obteniendo desbloqueos.'
    },
    en: {
      url: '/assets/voz/tucan-saludo-menu-en.mp3',
      text: 'These are the game options! You need more sightings to keep earning unlocks.'
    }
  },
  welcome: {
    es: {
      url: '/assets/voz/tucan-bienvenida-es.mp3',
      text: '¡Bienvenidos! Deben prestar atención al guía para luego responder las preguntas de la trivia y ganar puntos.'
    },
    en: {
      url: '/assets/voz/tucan-bienvenida-en.mp3',
      text: 'Welcome! Pay close attention to the guide so you can answer the trivia questions and earn points!'
    }
  }
};

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmInterval: number | null = null;
  private isBgmPlaying: boolean = false;
  private currentAudio: HTMLAudioElement | null = null;
  private currentAudioUrl: string | null = null;

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopForestAmbience();
      this.stopCurrentAudio();
    }
  }

  public stopCurrentAudio() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {
        // ignore
      }
      this.currentAudio = null;
    }
    this.currentAudioUrl = null;
  }

  public pauseCurrentAudio() {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
    }
  }

  // Resumes the clip that pauseCurrentAudio() paused; false when there is nothing to resume
  public resumeCurrentAudio(): boolean {
    if (this.isMuted || !this.currentAudio || !this.currentAudio.paused) return false;
    this.currentAudio.play().catch(() => {});
    return true;
  }

  public playAudioUrl(rawUrl: string, onEnd?: () => void, fallbackFn?: () => void): HTMLAudioElement | null {
    if (this.isMuted || typeof window === 'undefined') {
      if (onEnd) onEnd();
      return null;
    }
    this.stopCurrentAudio();
    try {
      const encodedSrc = rawUrl.includes('%') ? rawUrl : encodeURI(rawUrl);
      const audio = new Audio(encodedSrc);
      audio.preload = 'auto';
      this.currentAudio = audio;
      this.currentAudioUrl = rawUrl;

      let endedCalled = false;
      const finish = () => {
        if (endedCalled) return;
        endedCalled = true;
        if (this.currentAudio === audio) {
          this.currentAudio = null;
          this.currentAudioUrl = null;
        }
        if (onEnd) onEnd();
      };

      audio.onended = finish;
      audio.onerror = () => {
        if (fallbackFn) fallbackFn();
        setTimeout(finish, 1400);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          if (fallbackFn) fallbackFn();
          setTimeout(finish, 1400);
        });
      }
      return audio;
    } catch {
      if (fallbackFn) fallbackFn();
      if (onEnd) setTimeout(onEnd, 1400);
      return null;
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public playClick() {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.06);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.065);
  }

  public playShutter() {
    const ctx = this.getContext();
    if (!ctx) return;

    const bufferSize = ctx.sampleRate * 0.08;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1800;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  }

  public playSuccess() {
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const startTime = ctx.currentTime + idx * 0.09;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.008, startTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.26);
    });
  }

  // 1. Tucán Grande (Ramphastos toco): Deep rhythmic croak "grrr-ock, grrr-ock, grrr-ock"
  public playToucanCall() {
    this.stopCurrentAudio();
    const ctx = this.getContext();
    if (!ctx) return;

    [0, 0.28, 0.56].forEach((offset) => {
      const start = ctx.currentTime + offset;
      const osc = ctx.createOscillator();
      const mod = ctx.createOscillator();
      const modGain = ctx.createGain();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, start);
      osc.frequency.exponentialRampToValueAtTime(130, start + 0.21);

      // Rattle modulation for the guttural frog-like croak of Ramphastos toco
      mod.type = 'square';
      mod.frequency.setValueAtTime(38, start);
      modGain.gain.setValueAtTime(38, start);

      gain.gain.setValueAtTime(0.16, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + 0.23);

      mod.connect(modGain);
      modGain.connect(osc.frequency);
      osc.connect(gain);
      gain.connect(ctx.destination);

      mod.start(start);
      osc.start(start);
      mod.stop(start + 0.23);
      osc.stop(start + 0.24);
    });
  }

  // The Toucan guide speaking. Tapping again while the same line is playing stops it.
  public playToucanVoice(line: ToucanVoiceLine, lang: 'es' | 'en' = 'es') {
    const { url, text } = TOUCAN_VOICE_LINES[line][lang];
    const hasSpeech = typeof window !== 'undefined' && 'speechSynthesis' in window;
    if (hasSpeech) window.speechSynthesis.cancel();

    if (this.currentAudio && this.currentAudioUrl === url) {
      this.stopCurrentAudio();
      return;
    }

    this.playAudioUrl(url, undefined, () => {
      // Recording unavailable: read the line with the device voice, raised towards the Toucan's tone
      if (this.isMuted || !hasSpeech) return;
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === 'en' ? 'en-US' : 'es-AR';
        utterance.rate = 1.05;
        utterance.pitch = 1.5;
        const prefixes = lang === 'en' ? ['en'] : ['es-ar', 'es-419', 'es-mx', 'es-us', 'es'];
        const voices = window.speechSynthesis.getVoices() || [];
        for (const prefix of prefixes) {
          const voice = voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
          if (voice) {
            utterance.voice = voice;
            break;
          }
        }
        window.speechSynthesis.speak(utterance);
      } catch {
        // no voice available on this device
      }
    });
  }

  // Saludo hablado del Tucán Grande en el Menú Principal
  public playToucanGreeting(lang: 'es' | 'en' = 'es') {
    this.playToucanVoice('menu', lang);
  }

  // 2. Benteveo Común (Pitangus sulphuratus): Bright trisilábico "¡Bien-te-veo!"
  public playBenteveoCall() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Sílabas: 1) "¡BIEN-" (ascendente corto), 2) "-TE-" (agudo corto), 3) "-VEO!" (descendente largo brillante)
    const syllables = [
      { start: 0.0, dur: 0.14, fStart: 1650, fMid: 2350, fEnd: 2100 },
      { start: 0.19, dur: 0.11, fStart: 2550, fMid: 2850, fEnd: 2450 },
      { start: 0.35, dur: 0.38, fStart: 2950, fMid: 2200, fEnd: 1380 }
    ];

    syllables.forEach((s) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';

      const t0 = now + s.start;
      osc.frequency.setValueAtTime(s.fStart, t0);
      osc.frequency.exponentialRampToValueAtTime(s.fMid, t0 + s.dur * 0.4);
      osc.frequency.exponentialRampToValueAtTime(s.fEnd, t0 + s.dur);

      gain.gain.setValueAtTime(0.01, t0);
      gain.gain.linearRampToValueAtTime(0.2, t0 + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.008, t0 + s.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + s.dur + 0.02);
    });
  }

  // 3. Chinchero Chico (Lepidocolaptes angustirostris): Rapid descending woodcreeper trill "ti-ti-ti-tirrr"
  public playChincheroCall() {
    const ctx = this.getContext();
    if (!ctx) return;

    const totalNotes = 10;
    for (let i = 0; i < totalNotes; i++) {
      const start = ctx.currentTime + i * 0.068;
      const freq = 3400 - i * 195;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.86, start + 0.052);

      gain.gain.setValueAtTime(0.14, start);
      gain.gain.exponentialRampToValueAtTime(0.008, start + 0.055);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.06);
    }
  }

  // 4. Urutaú / Kakuy (Nyctibius griseus): Melancholic nocturnal lament "Turay, kakuy... pua-pua-uh"
  public playUrutauCall() {
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [
      { start: 0.0, dur: 0.34, f1: 1120, f2: 860 },
      { start: 0.38, dur: 0.32, f1: 920, f2: 710 },
      { start: 0.74, dur: 0.32, f1: 760, f2: 580 },
      { start: 1.10, dur: 0.34, f1: 630, f2: 470 },
      { start: 1.48, dur: 0.45, f1: 510, f2: 350 }
    ];

    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const t0 = ctx.currentTime + n.start;
      osc.frequency.setValueAtTime(n.f1, t0);
      osc.frequency.exponentialRampToValueAtTime(n.f2, t0 + n.dur);

      gain.gain.setValueAtTime(0.01, t0);
      gain.gain.linearRampToValueAtTime(0.18, t0 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.008, t0 + n.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + n.dur + 0.02);
    });
  }

  // 5. Zorzal Colorado (Turdus rufiventris): Melodious flute phrases
  public playZorzalCall() {
    const ctx = this.getContext();
    if (!ctx) return;

    const phrases = [
      { start: 0.0, dur: 0.22, f1: 1350, f2: 1680 },
      { start: 0.26, dur: 0.26, f1: 1680, f2: 1420 },
      { start: 0.56, dur: 0.22, f1: 1520, f2: 1980 },
      { start: 0.82, dur: 0.32, f1: 1850, f2: 1560 },
      { start: 1.18, dur: 0.38, f1: 1480, f2: 2150 }
    ];

    phrases.forEach((p) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const t0 = ctx.currentTime + p.start;
      osc.frequency.setValueAtTime(p.f1, t0);
      osc.frequency.exponentialRampToValueAtTime(p.f2, t0 + p.dur);

      gain.gain.setValueAtTime(0.01, t0);
      gain.gain.linearRampToValueAtTime(0.16, t0 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.008, t0 + p.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + p.dur + 0.02);
    });
  }

  // 6. Hornero (Furnarius rufus): Energetic rhythmic duet "ki-ki-ki-ki-kurrr"
  public playHorneroCall() {
    const ctx = this.getContext();
    if (!ctx) return;

    for (let i = 0; i < 12; i++) {
      const start = ctx.currentTime + i * 0.085;
      const freq = i % 2 === 0 ? 2250 : 1850;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.14, start + 0.06);

      gain.gain.setValueAtTime(0.14, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.075);
    }
  }

  // 7. Loro Alisero (Amazona tucumana): Metallic flock squawks "kree-ah! kree-ah!"
  public playParrotCall() {
    const ctx = this.getContext();
    if (!ctx) return;

    [0, 0.28, 0.56].forEach((offset, idx) => {
      const t0 = ctx.currentTime + offset;
      const osc = ctx.createOscillator();
      const mod = ctx.createOscillator();
      const modGain = ctx.createGain();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      const baseF = idx === 1 ? 1450 : 1280;
      osc.frequency.setValueAtTime(baseF, t0);
      osc.frequency.exponentialRampToValueAtTime(baseF * 1.35, t0 + 0.09);
      osc.frequency.exponentialRampToValueAtTime(baseF * 0.85, t0 + 0.21);

      mod.type = 'sine';
      mod.frequency.setValueAtTime(65, t0);
      modGain.gain.setValueAtTime(120, t0);

      gain.gain.setValueAtTime(0.11, t0);
      gain.gain.exponentialRampToValueAtTime(0.008, t0 + 0.22);

      mod.connect(modGain);
      modGain.connect(osc.frequency);
      osc.connect(gain);
      gain.connect(ctx.destination);

      mod.start(t0);
      osc.start(t0);
      mod.stop(t0 + 0.22);
      osc.stop(t0 + 0.23);
    });
  }

  // 8. Picaflor Cometa (Sappho sparganurus): Rapid wing hum + sharp high "tsik-tsik-tsik"
  public playHummingbirdCall() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Wing hum (low buzz)
    const humOsc = ctx.createOscillator();
    const humGain = ctx.createGain();
    humOsc.type = 'triangle';
    humOsc.frequency.setValueAtTime(78, now);
    humOsc.frequency.linearRampToValueAtTime(92, now + 0.5);
    humOsc.frequency.linearRampToValueAtTime(75, now + 1.1);
    humGain.gain.setValueAtTime(0.08, now);
    humGain.gain.exponentialRampToValueAtTime(0.008, now + 1.15);
    humOsc.connect(humGain);
    humGain.connect(ctx.destination);
    humOsc.start(now);
    humOsc.stop(now + 1.2);

    // High crystalline "tsik-tsik-tsik" chips
    [0.1, 0.26, 0.42, 0.65, 0.82].forEach((offset, i) => {
      const t0 = now + offset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const f = i % 2 === 0 ? 4200 : 3850;
      osc.frequency.setValueAtTime(f, t0);
      osc.frequency.exponentialRampToValueAtTime(2900, t0 + 0.055);

      gain.gain.setValueAtTime(0.13, t0);
      gain.gain.exponentialRampToValueAtTime(0.008, t0 + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.065);
    });
  }

  // 9. Chiricote (Aramides cajaneus): Syncopated rail chorus "¡chi-ri-co-te! ¡chi-ri-co-te!"
  public playChiricoteCall() {
    const ctx = this.getContext();
    if (!ctx) return;

    const pattern = [
      { start: 0.0, dur: 0.11, f1: 1150, f2: 1480 }, // chi
      { start: 0.13, dur: 0.10, f1: 1380, f2: 1620 }, // ri
      { start: 0.25, dur: 0.15, f1: 1820, f2: 1450 }, // co
      { start: 0.42, dur: 0.18, f1: 1250, f2: 920 },  // te!
      { start: 0.66, dur: 0.11, f1: 1180, f2: 1520 }, // chi
      { start: 0.79, dur: 0.10, f1: 1420, f2: 1680 }, // ri
      { start: 0.91, dur: 0.15, f1: 1880, f2: 1480 }, // co
      { start: 1.08, dur: 0.20, f1: 1280, f2: 880 }   // te!
    ];

    pattern.forEach((p) => {
      const t0 = ctx.currentTime + p.start;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(p.f1, t0);
      osc.frequency.exponentialRampToValueAtTime(p.f2, t0 + p.dur);

      gain.gain.setValueAtTime(0.16, t0);
      gain.gain.exponentialRampToValueAtTime(0.008, t0 + p.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + p.dur + 0.015);
    });
  }

  // 10. Jote Real (Sarcoramphus papa): Thermal soaring wind whoosh + low guttural clicks
  public playRaptorCall() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const bufferSize = Math.floor(ctx.sampleRate * 0.9);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(420, now);
    filter.frequency.exponentialRampToValueAtTime(980, now + 0.45);
    filter.frequency.exponentialRampToValueAtTime(340, now + 0.9);
    filter.Q.value = 3.5;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.9);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);

    // Low beak click/croak
    [0.25, 0.55].forEach((offset) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(190, now + offset);
      osc.frequency.exponentialRampToValueAtTime(110, now + offset + 0.12);
      g.gain.setValueAtTime(0.12, now + offset);
      g.gain.exponentialRampToValueAtTime(0.008, now + offset + 0.13);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.14);
    });
  }

  // 11. Carpintero Lomo Blanco (Campephilus leucopogon): Resonant double drum "¡toc-toc!" on hollow trunk
  public playWoodpeckerCall() {
    const ctx = this.getContext();
    if (!ctx) return;

    [0.0, 0.14, 0.65, 0.79].forEach((offset) => {
      const t0 = ctx.currentTime + offset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, t0);
      osc.frequency.exponentialRampToValueAtTime(115, t0 + 0.065);

      gain.gain.setValueAtTime(0.28, t0);
      gain.gain.exponentialRampToValueAtTime(0.008, t0 + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.075);
    });
  }

  // 12. Martín Pescador Grande (Megaceryle torquata): Dry rapid rattle "kerr-kerr-kerr"
  public playKingfisherCall() {
    const ctx = this.getContext();
    if (!ctx) return;

    for (let i = 0; i < 9; i++) {
      const t0 = ctx.currentTime + i * 0.065;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1650 + (i % 2) * 280, t0);
      osc.frequency.exponentialRampToValueAtTime(980, t0 + 0.05);

      gain.gain.setValueAtTime(0.11, t0);
      gain.gain.exponentialRampToValueAtTime(0.008, t0 + 0.055);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.06);
    }
  }

  // Exact MP3 resolver for the 21 species in /assets/aves/
  public resolveBirdMp3Url(soundTypeOrBirdId: string): string | null {
    if (soundTypeOrBirdId.startsWith('/assets/aves/') && soundTypeOrBirdId.endsWith('.mp3')) {
      return soundTypeOrBirdId;
    }
    const key = soundTypeOrBirdId.toLowerCase();
    if (key.includes('001') || key.includes('chingolo')) return '/assets/aves/1-Chingolo.mp3';
    if (key.includes('002') || key.includes('sayaca') || key.includes('sacaya') || key.includes('celestino')) return '/assets/aves/2-Tangara sacaya.mp3';
    if (key.includes('003') || key.includes('chercan') || key.includes('chercán') || key.includes('ratona')) return '/assets/aves/3-Chercán.mp3';
    if (key.includes('004') || key.includes('zorzal')) return '/assets/aves/4-Zorzal colorado.mp3';
    if (key.includes('tucan') || key.includes('tucán')) return '/assets/aves/tucan-grande.mp3';
    if (key.includes('005') || key.includes('paloma') || key.includes('picazuro') || key.includes('picazuró')) return '/assets/aves/5-Paloma picazuro.mp3';
    if (key.includes('006') || key.includes('saltator') || key.includes('rey del bosque') || key.includes('rey')) return '/assets/aves/6-Saltator de pico dorado.mp3';
    if (key.includes('007') || key.includes('benteveo')) return '/assets/aves/7-Benteveo.mp3';
    if (key.includes('008') || key.includes('tero')) return '/assets/aves/8-Tero.mp3';
    if (key.includes('009') || key.includes('jilguero') || key.includes('azafranado')) return '/assets/aves/9-Jilguero azafranado.mp3';
    if (key.includes('010') || key.includes('renegrido')) return '/assets/aves/10-Tordo renegrido.mp3';
    if (key.includes('011') || key.includes('urraca')) return '/assets/aves/11-Urraca morada.mp3';
    if (key.includes('012') || key.includes('suiriri') || key.includes('suirirí')) return '/assets/aves/12-Suirirí real.mp3';
    if (key.includes('013') || key.includes('carancho')) return '/assets/aves/13-Carancho.mp3';
    if (key.includes('014') || key.includes('hornero')) return '/assets/aves/14-Hornero.mp3';
    if (key.includes('015') || key.includes('candelita') || key.includes('arañero')) return '/assets/aves/15-Candelita de gorro pardo.mp3';
    if (key.includes('016') || key.includes('parula') || key.includes('pitiayumi') || key.includes('pitiayumí')) return '/assets/aves/16-Parula tropical.mp3';
    if (key.includes('017') || key.includes('pava')) return '/assets/aves/17-Pava de los yungas.mp3';
    if (key.includes('018') || key.includes('aratinga') || key.includes('calancate') || key.includes('loro') || key.includes('parrot')) return '/assets/aves/18-Aratinga mitrada.mp3';
    if (key.includes('019') || key.includes('naranjero') || key.includes('azul y amarilla')) return '/assets/aves/19-Tangara azul y amarilla.mp3';
    if (key.includes('020') || key.includes('ticotico') || key.includes('chinchero')) return '/assets/aves/20-Ticotico cejicanelo.mp3';
    if (key.includes('021') || key.includes('bayo') || key.includes('músico') || key.includes('musico')) return '/assets/aves/21-Tordo bayo.mp3';
    return null;
  }

  // Unified dispatcher by soundType, birdId or audioUrl so every species plays its real MP3 file (with Web Audio fallback)
  public playBirdSound(soundTypeOrBirdId: string, onEnd?: () => void) {
    const mp3Url = this.resolveBirdMp3Url(soundTypeOrBirdId);
    const fallbackSynth = () => {
      const key = soundTypeOrBirdId.toLowerCase();
      if (key.includes('benteveo')) {
        this.playBenteveoCall();
      } else if (key.includes('chinchero') || key.includes('ticotico')) {
        this.playChincheroCall();
      } else if (key.includes('urutau') || key.includes('kakuy')) {
        this.playUrutauCall();
      } else if (key.includes('zorzal') || key.includes('rey') || key.includes('tangara') || key.includes('naranjero') || key.includes('chingolo') || key.includes('jilguero')) {
        this.playZorzalCall();
      } else if (key.includes('hornero') || key.includes('tero')) {
        this.playHorneroCall();
      } else if (key.includes('chiricote') || key.includes('pava')) {
        this.playChiricoteCall();
      } else if (key.includes('jote') || key.includes('raptor') || key.includes('milano') || key.includes('carancho')) {
        this.playRaptorCall();
      } else if (key.includes('parrot') || key.includes('loro') || key.includes('aratinga') || key.includes('urraca')) {
        this.playParrotCall();
      } else if (key.includes('hummingbird') || key.includes('picaflor') || key.includes('vencejo') || key.includes('parula') || key.includes('candelita')) {
        this.playHummingbirdCall();
      } else if (key.includes('carpintero') || key.includes('woodpecker')) {
        this.playWoodpeckerCall();
      } else if (key.includes('pescador') || key.includes('kingfisher')) {
        this.playKingfisherCall();
      } else {
        this.playToucanCall();
      }
    };

    if (mp3Url) {
      this.playAudioUrl(mp3Url, onEnd, fallbackSynth);
    } else {
      fallbackSynth();
      if (onEnd) setTimeout(onEnd, 1500);
    }
  }

  public toggleForestAmbience(play?: boolean): boolean {
    const shouldPlay = play !== undefined ? play : !this.isBgmPlaying;
    if (shouldPlay && !this.isMuted) {
      this.startForestAmbience();
    } else {
      this.stopForestAmbience();
    }
    return this.isBgmPlaying;
  }

  private startForestAmbience() {
    if (this.bgmInterval) return;
    this.isBgmPlaying = true;

    const playSoftChirp = () => {
      if (!this.isBgmPlaying || this.isMuted) return;
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const baseFreq = 1800 + Math.random() * 1100;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.25, ctx.currentTime + 0.08);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, ctx.currentTime + 0.18);

      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.21);
    };

    playSoftChirp();
    this.bgmInterval = window.setInterval(playSoftChirp, 4200);
  }

  public stopForestAmbience() {
    this.isBgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

export const soundManager = new SoundManager();
