/**
 * Sound & Music Controller using Web Audio API
 * Generates procedural party sound effects & "Happy Birthday" melody
 * so it works 100% offline and on GitHub Pages with zero external dependencies!
 */

class SoundController {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isPlayingMusic = false;
    this.musicTimeout = null;
    this.melodyNoteIndex = 0;
    this.bgAudioElement = null; // Optional user mp3 element
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a balloon popping sound
  playPop() {
    if (this.isMuted) return;
    this.init();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.7, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  // Play celebratory chime / sparkle sound
  playSparkle() {
    if (this.isMuted) return;
    this.init();

    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
    notes.forEach((freq, i) => {
      setTimeout(() => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.4);
      }, i * 65);
    });
  }

  // Play candle blowout wind / whoosh effect
  playBlowout() {
    if (this.isMuted) return;
    this.init();

    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1; // White noise
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(150, this.ctx.currentTime + 0.4);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.6, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
  }

  // Play pleasant party chime bell note
  playTone(freq, duration = 0.3, type = 'sine') {
    if (this.isMuted) return;
    this.init();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  // Procedural Happy Birthday Melody in F Major / C Major
  playHappyBirthdayTune() {
    if (this.isMuted || !this.isPlayingMusic) return;
    this.init();

    // Notes: [freq, durationInSeconds]
    const melody = [
      [261.63, 0.35], [261.63, 0.2], [293.66, 0.5], [261.63, 0.5], [349.23, 0.5], [329.63, 0.9], // Happy birthday to you
      [261.63, 0.35], [261.63, 0.2], [293.66, 0.5], [261.63, 0.5], [392.00, 0.5], [349.23, 0.9], // Happy birthday to you
      [261.63, 0.35], [261.63, 0.2], [523.25, 0.5], [440.00, 0.5], [349.23, 0.5], [329.63, 0.5], [293.66, 0.7], // Happy birthday dear friend
      [466.16, 0.35], [466.16, 0.2], [440.00, 0.5], [349.23, 0.5], [392.00, 0.5], [349.23, 1.2], // Happy birthday to you
    ];

    let timeOffset = 0;
    melody.forEach(([freq, duration]) => {
      this.musicTimeout = setTimeout(() => {
        if (this.isPlayingMusic && !this.isMuted) {
          this.playTone(freq, duration, 'triangle');
        }
      }, timeOffset * 1000);
      timeOffset += duration + 0.08;
    });

    // Loop the melody gently
    this.musicTimeout = setTimeout(() => {
      if (this.isPlayingMusic) {
        this.playHappyBirthdayTune();
      }
    }, (timeOffset + 2) * 1000);
  }

  toggleMusic() {
    this.init();
    this.isPlayingMusic = !this.isPlayingMusic;

    // Check if custom audio tag exists
    const customAudio = document.getElementById('custom-bg-music');
    if (customAudio && customAudio.src && !customAudio.src.endsWith('#')) {
      if (this.isPlayingMusic) {
        customAudio.play().catch(() => {});
      } else {
        customAudio.pause();
      }
    } else {
      if (this.isPlayingMusic) {
        this.playHappyBirthdayTune();
      } else {
        clearTimeout(this.musicTimeout);
      }
    }

    return this.isPlayingMusic;
  }
}

// Global Sound Instance
window.soundCtrl = new SoundController();
