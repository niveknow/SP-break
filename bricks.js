/**
 * Bricks — the blocks you smash!
 *
 * We have 3 types of bricks, each matching our food themes:
 *   🍣 SUSHI brick — orange, 1 hit to break
 *   🍬 CANDY brick — pink, 2 hits to break
 *   🍨 ICE CREAM brick — light brown, 3 hits to break
 *
 * Tougher bricks change color as they take damage, so you can see
 * how close they are to breaking!
 */

const BRICK_TYPES = {
    SUSHI:      { hp: 1, color: '#ff8a65', name: 'SUSHI' },
    CANDY:      { hp: 2, color: '#ff4081', name: 'CANDY' },
    ICE_CREAM:  { hp: 3, color: '#ce93d8', name: 'ICE CREAM' }
};

class BrickManager {
    constructor() {
        this.bricks = [];
        this.rows = 6;
        this.cols = 8;
        this.brickW = 52;
        this.brickH = 20;
        this.padding = 4;
        this.offsetTop = 60;
        this.offsetLeft = (CANVAS_W - (this.cols * (this.brickW + this.padding))) / 2;
    }

    /** Build a grid of bricks */
    build(level) {
        this.bricks = [];
        const types = [BRICK_TYPES.SUSHI, BRICK_TYPES.CANDY, BRICK_TYPES.ICE_CREAM];

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                // Higher rows = tougher bricks
                const typeIdx = Math.min(Math.floor(row / 2), 2);
                const type = types[typeIdx];

                this.bricks.push({
                    x: this.offsetLeft + col * (this.brickW + this.padding),
                    y: this.offsetTop + row * (this.brickH + this.padding),
                    w: this.brickW,
                    h: this.brickH,
                    type: type,
                    hp: type.hp,        // Current HP
                    maxHp: type.hp,      // Max HP (for color fading)
                    hit: false,          // Destroyed?
                    points: (type.hp) * 10  // More points for tougher bricks
                });
            }
        }
    }

    /** Draw all bricks */
    draw(ctx) {
        for (const b of this.bricks) {
            if (b.hit) continue;

            // Color fades as brick takes damage
            const health = b.hp / b.maxHp;
            if (health > 0.6) {
                ctx.fillStyle = b.type.color;
            } else if (health > 0.3) {
                // Mid-damage — desaturated
                ctx.fillStyle = b.type === BRICK_TYPES.ICE_CREAM ? '#b39ddb' :
                                b.type === BRICK_TYPES.CANDY ? '#f48fb1' : '#ffab91';
            } else {
                // Almost broken — pale
                ctx.fillStyle = b.type === BRICK_TYPES.ICE_CREAM ? '#d1c4e9' :
                                b.type === BRICK_TYPES.CANDY ? '#f8bbd0' : '#ffccbc';
            }

            ctx.beginPath();
            ctx.roundRect(b.x + 1, b.y + 1, b.w - 2, b.h - 2, 3);
            ctx.fill();

            // Food icon label
            const icons = { 'SUSHI': '🍣', 'CANDY': '🍬', 'ICE CREAM': '🍨' };
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(icons[b.type.name] || '', b.x + b.w / 2, b.y + b.h / 2);

            // HP indicator for multi-hit bricks
            if (b.maxHp > 1) {
                ctx.fillStyle = 'rgba(255,255,255,0.5)';
                ctx.font = '7px Arial';
                ctx.fillText(b.hp > 0 ? '❤️'.repeat(b.hp) : '', b.x + b.w / 2, b.y + b.h - 4);
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
