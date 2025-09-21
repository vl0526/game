
class Sfx {
  private audioContext: AudioContext | null = null;

  private initializeAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    this.initializeAudioContext();
    if (!this.audioContext) return;

    // Resume context if it's suspended (e.g., due to browser policy)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

    oscillator.start(this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, this.audioContext.currentTime + duration);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  playCatch() {
    this.playTone(880, 0.1, 'sine');
  }

  playGoldenCatch() {
    this.playTone(1200, 0.05, 'triangle');
    setTimeout(() => this.playTone(1500, 0.1, 'triangle'), 60);
  }

  playMiss() {
    this.playTone(220, 0.2, 'sawtooth');
  }

  playBomb() {
    this.playTone(100, 0.5, 'square');
  }
}

export default Sfx;
