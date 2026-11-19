/**
 * SYNTHESIZED WEB AUDIO API SOUND ENGINE
 * Zero external audio files or MP3 dependencies.
 * Works 100% offline and cross-browser with instant response.
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.enabled = localStorage.getItem('aura_sound_enabled') !== 'false';
        this.isSpinning = false;
        this.humOsc = null;
        this.humGain = null;
    }

    init() {
        if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('aura_sound_enabled', this.enabled ? 'true' : 'false');
        if (this.enabled) {
            this.init();
            this.playClick();
        } else {
            this.stopSpinHum();
        }
        return this.enabled;
    }

    playClick() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.05);
    }

    /**
     * Mechanical wheel tick sound fired as the wheel pegs pass the indicator.
     * Pitch and velocity adapt dynamically with rotation velocity.
     * @param {number} speedRatio (0.1 to 1.0)
     */
    playWheelTick(speedRatio = 0.5) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const baseFreq = 750 + Math.min(speedRatio * 500, 600);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.035);

        // Volume scales gently with speed
        const volume = Math.min(0.08 + speedRatio * 0.1, 0.22);
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.035);
    }

    startSpinHum() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        this.stopSpinHum();

        const now = this.ctx.currentTime;
        this.humOsc = this.ctx.createOscillator();
        this.humGain = this.ctx.createGain();

        this.humOsc.type = 'triangle';
        this.humOsc.frequency.setValueAtTime(110, now);
        this.humOsc.frequency.linearRampToValueAtTime(180, now + 1.2);

        this.humGain.gain.setValueAtTime(0.001, now);
        this.humGain.gain.linearRampToValueAtTime(0.04, now + 0.3);

        this.humOsc.connect(this.humGain);
        this.humGain.connect(this.ctx.destination);
        this.humOsc.start(now);
    }

    stopSpinHum() {
        if (this.humOsc) {
            try {
                const now = this.ctx ? this.ctx.currentTime : 0;
                if (this.humGain && this.ctx) {
                    this.humGain.gain.linearRampToValueAtTime(0.0001, now + 0.2);
                }
                setTimeout(() => {
                    if (this.humOsc) {
                        try { this.humOsc.stop(); this.humOsc.disconnect(); } catch (e) {}
                        this.humOsc = null;
                    }
                }, 250);
            } catch (e) {
                this.humOsc = null;
            }
        }
    }

    /**
     * Celebratory victory fanfare chord sequence
     */
    playWinFanfare() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        // Ascending major arpeggio: C5, E5, G5, B5, C6
        const notes = [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51];
        
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const noteStart = now + idx * 0.09;
            const duration = 0.45 + idx * 0.08;

            osc.type = idx === notes.length - 1 ? 'sine' : 'triangle';
            osc.frequency.setValueAtTime(freq, noteStart);

            gain.gain.setValueAtTime(0.001, noteStart);
            gain.gain.linearRampToValueAtTime(0.18, noteStart + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(noteStart);
            osc.stop(noteStart + duration);
        });

        // Add a sparkling shimmer bell on top
        setTimeout(() => {
            if (!this.ctx || !this.enabled) return;
            const bellNow = this.ctx.currentTime;
            [1567.98, 2093.00, 2637.02].forEach((bellFreq, i) => {
                const bOsc = this.ctx.createOscillator();
                const bGain = this.ctx.createGain();
                bOsc.type = 'sine';
                bOsc.frequency.setValueAtTime(bellFreq, bellNow + i * 0.06);
                bGain.gain.setValueAtTime(0.09, bellNow + i * 0.06);
                bGain.gain.exponentialRampToValueAtTime(0.0001, bellNow + 0.8);
                bOsc.connect(bGain);
                bGain.connect(this.ctx.destination);
                bOsc.start(bellNow + i * 0.06);
                bOsc.stop(bellNow + 0.85);
            });
        }, 550);
    }

    /**
     * Gentle comforting chime for non-winner outcome
     */
    playNonWinChime() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [440, 392, 349.23]; // A4, G4, F4 gentle resolve

        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const noteStart = now + idx * 0.2;
            const duration = 0.6;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, noteStart);

            gain.gain.setValueAtTime(0.001, noteStart);
            gain.gain.linearRampToValueAtTime(0.1, noteStart + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(noteStart);
            osc.stop(noteStart + duration);
        });
    }
}

// Global Sound Engine Instance
window.soundEngine = new SoundEngine();
