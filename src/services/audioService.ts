// Audio Synthesizer for Emergency Sirens and Notification Beeps
// Uses Web Audio API without needing external MP3 dependencies, works completely offline.

class EmergencyAudioService {
  private audioCtx: AudioContext | null = null;
  private isSirenActive = false;
  private sirenIntervalId: number | null = null;

  private initContext() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Play a single attention tone (e.g. for incoming risk changes or tests)
  playAttentionChime() {
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch (e) {
      console.warn('Audio play prevented or unsupported:', e);
    }
  }

  // Play high priority evacuation / severe flood warning siren sequence
  startEmergencySiren() {
    if (this.isSirenActive) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;
      this.isSirenActive = true;

      // Warble modulation (Euro/Disaster style)
      const playCycle = () => {
        if (!this.isSirenActive || !this.audioCtx) return;
        const now = this.audioCtx.currentTime;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sawtooth';
        // Sweep 650Hz to 1100Hz and back
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.linearRampToValueAtTime(1050, now + 0.6);
        osc.frequency.linearRampToValueAtTime(650, now + 1.2);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.1);
        gain.gain.setValueAtTime(0.25, now + 1.1);
        gain.gain.linearRampToValueAtTime(0.01, now + 1.2);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now);
        osc.stop(now + 1.2);
      };

      playCycle();
      this.sirenIntervalId = window.setInterval(playCycle, 1250);
    } catch (e) {
      console.warn('Emergency siren trigger failed:', e);
    }
  }

  stopEmergencySiren() {
    this.isSirenActive = false;
    if (this.sirenIntervalId) {
      clearInterval(this.sirenIntervalId);
      this.sirenIntervalId = null;
    }
  }

  getIsSirenPlaying(): boolean {
    return this.isSirenActive;
  }

  // Device vibration pattern
  vibrate(pattern: number[] = [400, 200, 400, 200, 800]) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        console.warn('Vibration not permitted or failed:', e);
      }
    }
  }

  stopVibrate() {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(0);
      } catch (e) {
        console.warn('Vibration stop error:', e);
      }
    }
  }
}

export const emergencyAudio = new EmergencyAudioService();
