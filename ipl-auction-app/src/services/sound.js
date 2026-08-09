// Web Audio API Sound Generator & Web Speech API Announcer

class SoundService {
  constructor() {
    this.audioCtx = null;
    this.muted = false;
    this.speechSynth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  }

  init() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
  }

  setMuted(muted) {
    this.muted = muted;
    if (muted && this.speechSynth) {
      this.speechSynth.cancel();
    }
  }

  isMuted() {
    return this.muted;
  }

  // Play a soft beep / bid ping
  playBidPing() {
    if (this.muted) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, this.audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.2);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // Play Gavel Hammer sound (double thud)
  playGavel() {
    if (this.muted) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;

      // First strike
      this._createThud(now);
      // Second strike 120ms later
      this._createThud(now + 0.12);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  _createThud(time) {
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(30, time + 0.1);

    gain.gain.setValueAtTime(0.8, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.12);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(time);
    osc.stop(time + 0.12);
  }

  // Play countdown tick
  playTick() {
    if (this.muted) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.05);
    } catch (e) {
      console.warn('Audio tick error:', e);
    }
  }

  // Play Victory / Fanfare chord
  playFanfare() {
    if (this.muted) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      const now = this.audioCtx.currentTime;

      freqs.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.15, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.4);
      });
    } catch (e) {
      console.warn('Audio fanfare error:', e);
    }
  }

  // Announce bid via Voice Speech Synthesis
  announceBid(teamName, bidAmount) {
    if (this.muted || !this.speechSynth) return;
    try {
      this.speechSynth.cancel();
      const text = `${teamName}, ${bidAmount} Crore`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      utterance.pitch = 1.0;
      this.speechSynth.speak(utterance);
    } catch (e) {
      console.warn('Speech error:', e);
    }
  }

  // Announce Sold
  announceSold(playerName, teamName, price) {
    if (this.muted || !this.speechSynth) return;
    try {
      this.speechSynth.cancel();
      const text = `Sold! ${playerName} goes to ${teamName} for ${price} Crore!`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.1;
      this.speechSynth.speak(utterance);
    } catch (e) {
      console.warn('Speech error:', e);
    }
  }

  // Announce Unsold
  announceUnsold(playerName) {
    if (this.muted || !this.speechSynth) return;
    try {
      this.speechSynth.cancel();
      const text = `${playerName} remains unsold.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      this.speechSynth.speak(utterance);
    } catch (e) {
      console.warn('Speech error:', e);
    }
  }
}

export const soundService = new SoundService();
