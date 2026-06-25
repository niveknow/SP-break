/**
 * Audio — brick smash sounds!
 *
 * Different bricks make different breaking sounds!
 */

class AudioManager {
    constructor() {
        this.ctx = null;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (e) { /* silent */ }
    }

    _tone(freq, dur, type = 'square', vol = 0.15) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + dur);
    }

    /** Sushi brick — soft pop */
    playSushi() { this._tone(600, 0.1, 'sine', 0.1); }

    /** Candy brick — higher sparkle */
    playCandy() {
        this._tone(800, 0.08, 'square', 0.08);
        setTimeout(() => this._tone(1000, 0.1, 'square', 0.06), 40);
    }

    /** Ice cream brick — deep thud */
    playIceCream() { this._tone(300, 0.15, 'triangle', 0.12); }

    /** Paddle bounce — quick blip */
    playPaddle() { this._tone(440, 0.06, 'sine', 0.08); }

    /** Lose a life — sad descending tone */
    playLose() {
        this._tone(400, 0.2, 'sawtooth', 0.1);
        setTimeout(() => this._tone(250, 0.3, 'sawtooth', 0.08), 150);
    }

    /** Win level/Game — ascending celebration */
    playWin() {
        this._tone(523, 0.12, 'square', 0.1);
        setTimeout(() => this._tone(659, 0.12, 'square', 0.1), 120);
        setTimeout(() => this._tone(784, 0.12, 'square', 0.1), 240);
        setTimeout(() => this._tone(1047, 0.3, 'square', 0.12), 360);
    }

    /** Game over */
    playGameOver() {
        this._tone(400, 0.2, 'sawtooth', 0.1);
        setTimeout(() => this._tone(300, 0.3, 'sawtooth', 0.08), 200);
        setTimeout(() => this._tone(200, 0.5, 'sawtooth', 0.06), 400);
    }
}
