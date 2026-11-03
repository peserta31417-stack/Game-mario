// Web Audio API Procedural Synthesizer for Retro Platformer SFX & BGM

class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isBgmPlaying = false;
  private bgmTimeoutId: number | null = null;
  private currentSettings = {
    bgmEnabled: true,
    sfxEnabled: true,
    volume: 0.7,
  };

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.bgmGain = this.ctx.createGain();
        this.sfxGain = this.ctx.createGain();

        this.updateVolumes();

        this.bgmGain.connect(this.masterGain);
        this.sfxGain.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setSettings(settings: { bgmEnabled: boolean; sfxEnabled: boolean; volume: number }) {
    this.currentSettings = { ...settings };
    this.updateVolumes();
    if (!settings.bgmEnabled && this.isBgmPlaying) {
      this.stopBGM();
    } else if (settings.bgmEnabled && !this.isBgmPlaying && this.ctx) {
      this.startBGM();
    }
  }

  private updateVolumes() {
    if (!this.masterGain || !this.bgmGain || !this.sfxGain) return;
    this.masterGain.gain.setValueAtTime(this.currentSettings.volume, this.ctx?.currentTime || 0);
    this.bgmGain.gain.setValueAtTime(this.currentSettings.bgmEnabled ? 0.35 : 0, this.ctx?.currentTime || 0);
    this.sfxGain.gain.setValueAtTime(this.currentSettings.sfxEnabled ? 0.8 : 0, this.ctx?.currentTime || 0);
  }

  // --- Sound Effects ---

  public playJump() {
    if (!this.currentSettings.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = 'square';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(450, t + 0.12);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  public playCoin() {
    if (!this.currentSettings.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = 'sine';
    // Classic dual-tone coin chime (B5 then E6)
    osc.frequency.setValueAtTime(987.77, t); // B5
    osc.frequency.setValueAtTime(1318.51, t + 0.08); // E6

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.setValueAtTime(0.4, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.36);
  }

  public playBlockBump() {
    if (!this.currentSettings.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.1);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.11);
  }

  public playStomp() {
    if (!this.currentSettings.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(350, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.15);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.16);
  }

  public playHurt() {
    if (!this.currentSettings.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.linearRampToValueAtTime(60, t + 0.25);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.26);
  }

  public playCorrect() {
    if (!this.currentSettings.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Major triad)

    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = t + idx * 0.08;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.3, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(start);
      osc.stop(start + 0.26);
    });
  }

  public playWrong() {
    if (!this.currentSettings.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.setValueAtTime(110, t + 0.15);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.36);
  }

  public playVictory() {
    if (!this.currentSettings.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    // Classic victory fanfare notes
    const fanfare = [
      { f: 523.25, d: 0.12 }, // C5
      { f: 523.25, d: 0.12 },
      { f: 523.25, d: 0.12 },
      { f: 659.25, d: 0.28 }, // E5
      { f: 783.99, d: 0.28 }, // G5
      { f: 1046.50, d: 0.6 }, // C6
    ];

    let currentOffset = 0;
    fanfare.forEach((n) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = t + currentOffset;

      osc.type = 'square';
      osc.frequency.setValueAtTime(n.f, start);

      gain.gain.setValueAtTime(0.25, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + n.d);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(start);
      osc.stop(start + n.d + 0.05);

      currentOffset += n.d * 0.95;
    });
  }

  public playGameOver() {
    if (!this.currentSettings.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const notes = [440, 392, 349.23, 311.13, 261.63]; // Descending melancholy notes

    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = t + idx * 0.18;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.3, start);
      gain.gain.linearRampToValueAtTime(0.001, start + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(start);
      osc.stop(start + 0.26);
    });
  }

  // --- Background Arcade Music Loop ---

  public startBGM() {
    if (this.isBgmPlaying || !this.currentSettings.bgmEnabled) return;
    this.initContext();
    if (!this.ctx || !this.bgmGain) return;

    this.isBgmPlaying = true;
    this.loopBgmPattern();
  }

  public stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmTimeoutId !== null) {
      window.clearTimeout(this.bgmTimeoutId);
      this.bgmTimeoutId = null;
    }
  }

  private loopBgmPattern() {
    if (!this.isBgmPlaying || !this.ctx || !this.bgmGain) return;

    // Cheerful, upbeat 8-bar chiptune melody in C Major / G
    const melody = [
      { f: 659.25, d: 0.14 }, // E5
      { f: 659.25, d: 0.14 },
      { f: 0, d: 0.14 },      // rest
      { f: 659.25, d: 0.14 },
      { f: 0, d: 0.14 },
      { f: 523.25, d: 0.14 }, // C5
      { f: 659.25, d: 0.14 },
      { f: 783.99, d: 0.28 }, // G5
      { f: 0, d: 0.28 },
      { f: 392.00, d: 0.28 }, // G4
      { f: 0, d: 0.28 },
      { f: 523.25, d: 0.2 },  // C5
      { f: 392.00, d: 0.2 },  // G4
      { f: 329.63, d: 0.2 },  // E4
      { f: 440.00, d: 0.2 },  // A4
      { f: 493.88, d: 0.2 },  // B4
      { f: 466.16, d: 0.14 }, // Bb4
      { f: 440.00, d: 0.2 },  // A4
      { f: 392.00, d: 0.2 },  // G4
      { f: 659.25, d: 0.2 },  // E5
      { f: 783.99, d: 0.2 },  // G5
      { f: 880.00, d: 0.25 }, // A5
      { f: 698.46, d: 0.15 }, // F5
      { f: 783.99, d: 0.15 }, // G5
      { f: 659.25, d: 0.25 }, // E5
      { f: 523.25, d: 0.15 }, // C5
      { f: 587.33, d: 0.15 }, // D5
      { f: 493.88, d: 0.25 }, // B4
    ];

    let offset = 0;
    const now = this.ctx.currentTime;

    melody.forEach((note) => {
      if (note.f > 0 && this.ctx && this.bgmGain) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + offset;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, start);

        gain.gain.setValueAtTime(0.08, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + note.d * 0.9);

        osc.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(start);
        osc.stop(start + note.d);
      }
      offset += note.d;
    });

    // Schedule next loop
    const totalMs = offset * 1000 + 400;
    this.bgmTimeoutId = window.setTimeout(() => {
      if (this.isBgmPlaying) {
        this.loopBgmPattern();
      }
    }, totalMs);
  }
}

export const soundManager = new SoundManager();
