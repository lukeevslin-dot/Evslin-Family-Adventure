// Procedural music & sound effects via Web Audio API.
// Hawaiian / Polynesian pentatonic feel — evokes the Moana soundtrack.
//
// C-major pentatonic: C  D  E  G  A
// Frequencies (Hz):   C3=130.81  D3=146.83  E3=164.81  G3=196.00  A3=220.00
//                     C4=261.63  D4=293.66  E4=329.63  G4=392.00  A4=440.00
//                     C5=523.25  G5=784.00  A5=880.00

const C3=130.81, D3=146.83, E3=164.81, G3=196.00, A3=220.00;
const C4=261.63, D4=293.66, E4=329.63, G4=392.00, A4=440.00;
const C5=523.25, A5=880.00;

// ── Theme definitions ────────────────────────────────────────────────────────
// Each entry: [frequency_Hz, duration_sec]  (freq = 0 → rest)
const THEMES = {
  // Gentle, floating — "the horizon calls"
  title: {
    melody: [
      [E4,.50],[G4,.38],[A4,.65],
      [G4,.30],[E4,.38],[C4,.75],
      [D4,.28],[E4,.28],[G4,.48],[A4,.55],
      [0,.35],
      [A4,.42],[G4,.32],[E4,.38],[D4,.28],
      [C4,.32],[D4,.28],[E4,.48],[G4,.90],
      [0,.40],
      [G4,.28],[A4,.32],[G4,.28],[E4,.42],
      [C4,.38],[D4,.32],[C4,1.10],
      [0,.55],
    ],
    bass: [
      [C3,1.5],[G3,1.5],[A3,1.5],[E3,1.5],
      [C3,1.5],[G3,1.5],[A3,1.5],[G3,1.5],
    ],
    vol: 0.18, bvol: 0.11,
  },

  // Lively, rhythmic — paddling between islands
  island: {
    melody: [
      [C4,.22],[E4,.22],[G4,.22],[A4,.38],
      [G4,.32],[E4,.32],[0,.18],
      [D4,.22],[E4,.22],[G4,.45],[A4,.45],
      [0,.28],
      [E4,.22],[G4,.22],[A4,.28],[G4,.22],[E4,.28],
      [D4,.32],[E4,.48],
      [0,.28],
      [C4,.28],[D4,.28],[E4,.28],[G4,.75],
      [0,.35],
    ],
    bass: [
      [C3,.50],[G3,.50],[A3,.50],[G3,.50],
      [C3,.50],[E3,.50],[G3,.50],[G3,.50],
      [A3,.50],[G3,.50],[E3,.50],[C3,.50],
      [G3,.50],[G3,.50],[C3,.50],[C3,.50],
    ],
    vol: 0.19, bvol: 0.13,
  },

  // Tense, minor-leaning — puzzle/battle encounters
  battle: {
    melody: [
      [A4,.20],[G4,.20],[E4,.35],[0,.12],
      [D4,.18],[E4,.18],[G4,.38],[0,.12],
      [A4,.18],[A4,.18],[G4,.28],[E4,.28],
      [0,.18],
      [G4,.18],[E4,.18],[D4,.18],[C4,.38],
      [D4,.18],[E4,.18],[G4,.55],
      [0,.25],
      [A4,.22],[G4,.22],[E4,.22],[D4,.22],
      [E4,.35],[G4,.65],
      [0,.30],
    ],
    bass: [
      [A3,.38],[A3,.38],[G3,.38],[E3,.38],
      [A3,.38],[G3,.38],[E3,.38],[D3,.38],
      [A3,.38],[A3,.38],[G3,.38],[E3,.38],
      [G3,.38],[E3,.38],[D3,.38],[A3,.38],
    ],
    vol: 0.20, bvol: 0.13,
  },

  // Warm, celebratory — village & ending
  village: {
    melody: [
      [C4,.22],[E4,.22],[G4,.22],[A4,.32],
      [G4,.22],[E4,.22],[G4,.55],[0,.18],
      [A4,.28],[G4,.22],[E4,.28],[D4,.22],
      [E4,.22],[G4,.22],[A4,.75],[0,.28],
      [G4,.22],[A4,.22],[G4,.22],[E4,.22],
      [C4,.32],[D4,.32],[E4,.72],[0,.32],
      [C5,.28],[A4,.28],[G4,.28],[E4,.52],
      [C4,.40],[G4,.35],[C5,1.10],
      [0,.45],
    ],
    bass: [
      [C3,.55],[E3,.55],[G3,.55],[G3,.55],
      [A3,.55],[G3,.55],[E3,.55],[C3,.55],
      [C3,.55],[G3,.55],[A3,.55],[G3,.55],
      [E3,.55],[G3,.55],[C3,.55],[C3,.55],
    ],
    vol: 0.19, bvol: 0.12,
  },
};

// ── Simon Says pad tones — pentatonic, bright and distinct ──────────────────
// Red=C5  Blue=E5  Green=G5  Yellow=A5
export const PAD_TONES = [523.25, 659.25, 784.00, 880.00];

// ── AudioManager class ───────────────────────────────────────────────────────
class AudioManager {
  constructor() {
    this._ac       = null;   // AudioContext
    this._out      = null;   // master GainNode
    this._loops    = {};     // { id: timeoutId }
    this._theme    = null;   // currently playing theme name
    this._pending  = null;   // theme queued while context is suspended
    this._unlocked = false;  // iOS audio unlock flag

    // iOS requires audio to be unlocked on ANY user gesture, not just the play button.
    // Register once on the earliest possible touch/click.
    const unlock = () => this._unlock();
    ['touchstart', 'touchend', 'click'].forEach(e =>
      window.addEventListener(e, unlock, { once: true, passive: true }),
    );
  }

  // iOS audio unlock: create context + play a silent buffer to satisfy Safari
  _unlock() {
    if (this._unlocked) return;
    this._unlocked = true;
    this._init();
    if (!this._ac) return;

    // Silent 1-sample buffer — satisfies iOS WebKit's "user gesture" requirement
    const buf = this._ac.createBuffer(1, 1, 22050);
    const src = this._ac.createBufferSource();
    src.buffer = buf;
    src.connect(this._ac.destination);
    src.start(0);

    if (this._ac.state === 'suspended') {
      this._ac.resume().then(() => {
        if (this._pending) {
          this._startLoops(this._pending);
          this._pending = null;
        }
      }).catch(() => {});
    }
  }

  // Lazy-init AudioContext
  _init() {
    if (this._ac) return;
    try {
      this._ac  = new (window.AudioContext || window.webkitAudioContext)();
      this._out = this._ac.createGain();
      this._out.gain.value = 0.55;
      this._out.connect(this._ac.destination);

      // Fallback statechange listener (desktop browsers)
      this._ac.addEventListener('statechange', () => {
        if (this._ac.state === 'running' && this._pending) {
          this._startLoops(this._pending);
          this._pending = null;
        }
      });
    } catch (e) {
      console.warn('Web Audio not available:', e);
    }
  }

  // Explicit resume — call on first user interaction if needed
  resume() {
    this._unlock();
    this._init();
    if (this._ac && this._ac.state === 'suspended') {
      this._ac.resume().then(() => {
        if (this._pending) {
          this._startLoops(this._pending);
          this._pending = null;
        }
      }).catch(() => {});
    }
  }

  // Schedule a single note at Web Audio time t
  _note(freq, t, dur, vol, wave = 'triangle') {
    if (!this._ac || freq <= 0) return;
    const osc = this._ac.createOscillator();
    const g   = this._ac.createGain();
    osc.type = wave;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.88);
    osc.connect(g);
    g.connect(this._out);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  // Schedule one full pass of a note sequence, then self-reschedule
  _scheduleSeq(id, notes, vol, wave, t0) {
    let t = t0;
    for (const [f, d] of notes) {
      this._note(f, t, d, vol, wave);
      t += d;
    }
    const len = notes.reduce((s, [, d]) => s + d, 0);
    // Reschedule ~1.5 s before the loop ends to avoid gaps
    const delay = Math.max(50, (t0 + len - this._ac.currentTime - 1.5) * 1000);
    this._loops[id] = setTimeout(() => {
      if (id in this._loops) {  // still active
        delete this._loops[id];
        this._scheduleSeq(id, notes, vol, wave, t0 + len);
      }
    }, delay);
  }

  _startLoops(name) {
    const td = THEMES[name];
    if (!td || !this._ac) return;
    const t0 = this._ac.currentTime + 0.12;
    this._scheduleSeq('mel', td.melody, td.vol,  'triangle', t0);
    this._scheduleSeq('bas', td.bass,   td.bvol, 'sine',     t0);
    this._theme = name;
  }

  _stopLoops() {
    for (const id in this._loops) clearTimeout(this._loops[id]);
    this._loops  = {};
    this._theme  = null;
    this._pending = null;
  }

  // Public: switch to a theme (no-op if already playing)
  playTheme(name) {
    if (this._theme === name) return;
    this._init();
    if (!this._ac) return;
    this._stopLoops();

    if (this._ac.state === 'running') {
      this._startLoops(name);
    } else {
      this._pending = name;
      this._ac.resume(); // triggers statechange → _startLoops
    }
  }

  stopMusic() { this._stopLoops(); }

  // ── Simon Says pad sound ───────────────────────────────────────────────────
  playPadTone(index) {
    this._init();
    if (!this._ac) return;
    if (this._ac.state === 'suspended') this._ac.resume();

    const freq = PAD_TONES[index] ?? 440;
    const t    = this._ac.currentTime + 0.01;
    // Fundamental
    this._note(freq,      t, 0.55, 0.40, 'sine');
    // Soft octave overtone for warmth
    this._note(freq * 2,  t, 0.22, 0.12, 'sine');
  }
}

export const audioManager = new AudioManager();
