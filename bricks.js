/**
 * Bricks — BIG FOOD EMOJIS, no boring boxes! 🍣🍬🍨
 *
 * Instead of colored rectangles with tiny emojis inside, EVERY brick IS
 * the food itself. Smash 'em with Sterling's face!
 *
 *    🍣 SUSHI brick  — 1 hit. Instant pop! Gone.
 *    🍬 CANDY brick  — 2 hits. Cracks on first hit.
 *    🍨 ICE CREAM     — 3 hits. Gets more cracked each time.
 */

const BRICK_TYPES = {
    SUSHI:      { hp: 1, color: '#ff8a65', name: 'SUSHI',   emoji: '🍣' },
    CANDY:      { hp: 2, color: '#ff4081', name: 'CANDY',   emoji: '🍬' },
    ICE_CREAM:  { hp: 3, color: '#ce93d8', name: 'ICE CREAM', emoji: '🍨' }
};

class BrickManager {
    constructor() {
        this.bricks = [];
        this.rows = 6;
        this.cols = 8;
        this.brickW = 54;      // Slightly wider for emoji room
        this.brickH = 26;      // Taller so emojis aren't squished
        this.padding = 3;
        this.offsetTop = 60;
        this.offsetLeft = (CANVAS_W - (this.cols * (this.brickW + this.padding))) / 2;
    }

    /** Build a grid of tasty bricks */
    build(level) {
        this.bricks = [];
        const types = [BRICK_TYPES.SUSHI, BRICK_TYPES.CANDY, BRICK_TYPES.ICE_CREAM];

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const typeIdx = Math.min(Math.floor(row / 2), 2);
                const type = types[typeIdx];

                this.bricks.push({
                    x: this.offsetLeft + col * (this.brickW + this.padding),
                    y: this.offsetTop + row * (this.brickH + this.padding),
                    w: this.brickW,
                    h: this.brickH,
                    type: type,
                    hp: type.hp,
                    maxHp: type.hp,
                    hit: false,
                    points: type.hp * 10
                });
            }
        }
    }

    /** Draw all bricks as big food emojis! */
    draw(ctx) {
        for (const b of this.bricks) {
            if (b.hit) continue;

            const cx = b.x + b.w / 2;
            const cy = b.y + b.h / 2;

            // --- Glow underneath (matches food color) ---
            ctx.shadowColor = b.type.color;
            ctx.shadowBlur = 8;

            // --- BIG EMOJI — this IS the brick ---
            ctx.font = '22px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(b.type.emoji, cx, cy);

            ctx.shadowBlur = 0;

            // --- Damage overlays for multi-hit bricks ---
            if (b.maxHp > 1 && b.hp < b.maxHp) {
                const damage = 1 - (b.hp / b.maxHp);

                // Crack lines (white, gets more visible with damage)
                ctx.save();
                ctx.strokeStyle = `rgba(255, 255, 255, ${damage * 0.7})`;
                ctx.lineWidth = 2;

                // First crack — diagonal top-left to bottom-right
                ctx.beginPath();
                ctx.moveTo(b.x + b.w * 0.2, b.y + b.h * 0.15);
                ctx.lineTo(b.x + b.w * 0.8, b.y + b.h * 0.85);
                ctx.stroke();

                // Second crack (show only when REALLY damaged — HP=1 on a 3-HP brick)
                if (b.hp <= 1 && b.maxHp > 2) {
                    ctx.strokeStyle = `rgba(255, 200, 200, ${damage * 0.8})`;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(b.x + b.w * 0.8, b.y + b.h * 0.15);
                    ctx.lineTo(b.x + b.w * 0.2, b.y + b.h * 0.85);
                    ctx.stroke();
                }

                ctx.restore();

                // Slight white flash overlay
                ctx.fillStyle = `rgba(255, 255, 255, ${damage * 0.15})`;
                ctx.fillRect(b.x, b.y, b.w, b.h);
            }
        }
    }

    /** Hit a brick — returns true if destroyed */
    hitBrick(index) {
        const b = this.bricks[index];
        if (!b || b.hit) return false;

        b.hp--;
        if (b.hp <= 0) {
            b.hit = true;
            return true;  // Destroyed!
        }
        return false;  // Damaged but not destroyed
    }

    /** Check if all bricks are cleared */
    allCleared() {
        return this.bricks.every(b => b.hit === true);
    }
}
