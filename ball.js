/**
 * Ball — Sterling's face bouncing around the screen!
 *
 * The ball moves in a direction (vx, vy) and bounces off walls, the
 * paddle, and bricks. When it hits the bottom, you lose a life.
 *
 * HOW IT WORKS:
 * The ball has a position (x, y) and velocity (vx, vy). Each frame
 * we add velocity to position. When it hits something, we flip the
 * appropriate velocity component (like a mirror reflection).
 */

const CANVAS_W = 480;
const CANVAS_H = 640;

class Ball {
    constructor() {
        this.img = new Image();
        this.img.src = 'assets/sterling_ball.png';
        this.imgLoaded = false;
        this.img.onload = () => { this.imgLoaded = true; };
        this.radius = 10;
        this.reset();
    }

    /** Reset ball to center with a random launch angle */
    reset() {
        this.x = CANVAS_W / 2;
        this.y = CANVAS_H / 2 + 40;
        // Launch in a random-ish direction (always upward first)
        const angle = -Math.PI / 4 + (Math.random() - 0.5) * 0.6;
        const speed = 6;
        this.vx = Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1);
        this.vy = Math.sin(angle) * speed;
    }

    /** Move the ball, return collision info */
    update(paddle, bricks) {
        this.x += this.vx;
        this.y += this.vy;

        // --- WALL BOUNCES ---

        // Left wall
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx = -this.vx;
        }
        // Right wall
        if (this.x + this.radius > CANVAS_W) {
            this.x = CANVAS_W - this.radius;
            this.vx = -this.vx;
        }
        // Top wall
        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.vy = -this.vy;
        }
        // Bottom — fell off screen (lose life!)
        if (this.y + this.radius > CANVAS_H) {
            return { type: 'fall' };
        }

        // --- PADDLE BOUNCE ---
        if (this.vy > 0 &&  // Ball moving downward
            this.y + this.radius >= paddle.y &&
            this.y + this.radius <= paddle.y + paddle.h &&
            this.x >= paddle.x - paddle.w/2 - this.radius &&
            this.x <= paddle.x + paddle.w/2 + this.radius) {
            
            // Push ball above paddle
            this.y = paddle.y - this.radius;

            // Calculate bounce angle based on WHERE ball hit the paddle
            // Hit center → goes straight up. Hit edge → goes sideways.
            const hitPos = (this.x - paddle.x) / (paddle.w / 2);  // -1 to 1
            const angle = hitPos * Math.PI / 3;  // Max 60° angle
            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            this.vx = Math.sin(angle) * speed;
            this.vy = -Math.cos(angle) * speed;

            // Keep minimum vertical speed so ball doesn't get stuck
            if (Math.abs(this.vy) < 2) this.vy = -3;

            return { type: 'paddle' };
        }

        // --- BRICK COLLISION ---
        for (let i = 0; i < bricks.length; i++) {
            const b = bricks[i];
            if (b.hit) continue;  // Already destroyed

            // Check if ball overlaps this brick
            const bx = b.x, by = b.y, bw = b.w, bh = b.h;

            // Find closest point on brick to ball center
            const closestX = Math.max(bx, Math.min(this.x, bx + bw));
            const closestY = Math.max(by, Math.min(this.y, by + bh));
            const distX = this.x - closestX;
            const distY = this.y - closestY;
            const dist = Math.sqrt(distX * distX + distY * distY);

            if (dist < this.radius) {
                // Collision! Determine which side was hit
                const overlapX = this.radius - Math.abs(distX);
                const overlapY = this.radius - Math.abs(distY);

                if (overlapX < overlapY) {
                    this.vx = -this.vx;  // Side hit
                } else {
                    this.vy = -this.vy;  // Top/bottom hit
                }

                return { type: 'brick', index: i };
            }
        }

        return { type: 'none' };
    }

    /** Draw the ball — Sterling's face! */
    draw(ctx) {
        if (this.imgLoaded) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(this.img, this.x - this.radius, this.y - this.radius,
                         this.radius * 2, this.radius * 2);
            ctx.restore();
        } else {
            // Fallback — pink circle
            ctx.fillStyle = '#ff4081';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Soft glow effect
        ctx.shadowColor = 'rgba(255, 64, 129, 0.3)';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 64, 129, 0.08)';
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}
