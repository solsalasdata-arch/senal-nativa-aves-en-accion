// Web Audio API synthesizer for native game sound effects and bird calls

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmGain: GainNode | null = null;
  private bgmOscillators: (OscillatorNode | AudioBufferSourceNode)[] = [];
  private isBgmPlaying: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(0, this.ctx.currentTime);
    } else if (!muted && this.bgmGain && this.ctx && this.isBgmPlaying) {
      this.bgmGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    }
  }

  // UI Pop / Button Click
  public playClick() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch {
      // Audio context restricted or failed
    }
  }

  // Camera Shutter Snap
  public playShutter() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const bufferSize = this.ctx.sampleRate * 0.08;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1200;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.07);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start();
    } catch {
      // ignore
    }
  }

  // Level Up / Achievement Fanfare
  public playSuccess() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.1);
        
        gain.gain.setValueAtTime(0.2, this.ctx!.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.1 + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(this.ctx!.currentTime + idx * 0.1);
        osc.stop(this.ctx!.currentTime + idx * 0.1 + 0.35);
      });
    } catch {
      // ignore
    }
  }

  // Toucan Characteristic Call (croaking resonant "grr-ock" of Ramphastos toco)
  public playToucanCall() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [0, 0.22, 0.44].forEach((offset) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(260, now + offset);
        osc.frequency.linearRampToValueAtTime(190, now + offset + 0.16);

        gain.gain.setValueAtTime(0.25, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.005, now + offset + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.2);
      });
    } catch {
      // ignore
    }
  }

  // Benteveo Call ("¡Bicho feo, bicho feo!")
  public playBenteveoCall() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // High energetic trill
      const notes = [
        { f: 1400, t: 0.12 },
        { f: 1650, t: 0.12 },
        { f: 1200, t: 0.2 }
      ];
      let tOffset = 0;
      notes.forEach((n) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.f, now + tOffset);
        osc.frequency.exponentialRampToValueAtTime(n.f * 0.9, now + tOffset + n.t);

        gain.gain.setValueAtTime(0.2, now + tOffset);
        gain.gain.exponentialRampToValueAtTime(0.01, now + tOffset + n.t);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + tOffset);
        osc.stop(now + tOffset + n.t);
        tOffset += n.t + 0.04;
      });
    } catch {
      // ignore
    }
  }

  // Chinchero Chico Rapid Descending Trill
  public playChincheroCall() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      for (let i = 0; i < 7; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const freq = 2200 - i * 180;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.05);

        gain.gain.setValueAtTime(0.18, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.045);
      }
    } catch {
      // ignore
    }
  }

  // Urutaú Melancholy Descending Lamento ("Turay, kakuy... pua-pua-uh")
  public playUrutauCall() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [
        { f: 880, start: 0, dur: 0.35 },
        { f: 740, start: 0.38, dur: 0.35 },
        { f: 620, start: 0.76, dur: 0.4 },
        { f: 520, start: 1.18, dur: 0.55 },
        { f: 415, start: 1.75, dur: 0.8 }
      ];

      notes.forEach((n) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.f, now + n.start);
        osc.frequency.linearRampToValueAtTime(n.f * 0.88, now + n.start + n.dur);

        gain.gain.setValueAtTime(0.01, now + n.start);
        gain.gain.linearRampToValueAtTime(0.22, now + n.start + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.005, now + n.start + n.dur);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + n.start);
        osc.stop(now + n.start + n.dur);
      });
    } catch {
      // ignore
    }
  }

  // Zorzal Colorado Flute Melodious Singing
  public playZorzalCall() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const melody = [
        { f: 1046, t: 0.12 },
        { f: 1318, t: 0.15 },
        { f: 1174, t: 0.18 },
        { f: 1567, t: 0.22 },
        { f: 1396, t: 0.14 },
        { f: 1760, t: 0.3 }
      ];
      let offset = 0;
      melody.forEach((m) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(m.f, now + offset);
        osc.frequency.exponentialRampToValueAtTime(m.f * 1.05, now + offset + m.t * 0.5);
        osc.frequency.exponentialRampToValueAtTime(m.f, now + offset + m.t);

        gain.gain.setValueAtTime(0.2, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.01, now + offset + m.t);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + offset);
        osc.stop(now + offset + m.t);
        offset += m.t + 0.06;
      });
    } catch {
      // ignore
    }
  }

  // Hornero Duet Accelerating Staccato Call ("¡kye-kye-kye-kye!")
  public playHorneroCall() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const pulses = 10;
      for (let i = 0; i < pulses; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = now + i * 0.07;
        const freq = 1900 + (i % 3) * 150 - i * 30;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.85, t + 0.05);

        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.055);
      }
    } catch {
      // ignore
    }
  }

  // Soft Yungas Forest Ambience (soothing white/pink noise modulated like breeze through trees)
  public toggleForestAmbience(enable: boolean) {
    try {
      this.initCtx();
      if (!this.ctx) return;
      if (!enable || this.isMuted) {
        if (this.bgmGain) {
          this.bgmGain.gain.setValueAtTime(0, this.ctx.currentTime);
        }
        this.isBgmPlaying = false;
        return;
      }

      if (this.isBgmPlaying) return;

      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 450;

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.06, this.ctx.currentTime);

      noise.connect(filter);
      filter.connect(this.bgmGain);
      this.bgmGain.connect(this.ctx.destination);

      noise.start();
      this.bgmOscillators = [noise];
      this.isBgmPlaying = true;
    } catch {
      // ignore
    }
  }
}

export const soundManager = new SoundManager();
