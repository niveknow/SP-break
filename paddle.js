/**
 * Paddle — you control this to bounce the ball back up.
 *
 * The paddle follows the mouse (desktop) or your finger (iPhone).
 * It only moves left and right at the bottom of the screen.
 */

class Paddle {
    constructor() {
        this.w = 80;           // Paddle width
        this.h = 14;           // Paddle height
        this.y = CANVAS_H - 40;  // Near the bottom
        this.x = CANVAS_W / 2;   // Start centered
        this.targetX = CANVAS_W / 2;
    }

    /** Move paddle toward where the mouse/finger is */
    update(mouseX) {
        this.targetX = Math.max(this.w / 2, Math.min(CANVAS_W - this.w / 2, mouseX));
        // Smooth follow — feels nicer than teleporting
        this.x += (this.targetX - this.x) * 0.3;
    }

    /** Draw a rounded paddle that looks like a little platform */
    draw(ctx) {
        const x = this.x - this.w / 2;
        const y = this.y;

        // Main paddle body — gradient for a 3D look
        const grad = ctx.createLinearGradient(x, y, x, y + this.h);
        grad.addColorStop(0, '#7c4dff');  // Purple top
        grad.addColorStop(1, '#536dfe');  // Blue bottom
        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.roundRect(x, y, this.w, this.h, 7);
        ctx.fill();

        // Shiny highlight strip
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.beginPath();
        ctx.roundRect(x + 6, y + 3, this.w - 12, 4, 2);
        ctx.fill();

        // Glow below paddle
        ctx.shadowColor = 'rgba(124, 77, 255, 0.2)';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.roundRect(x, y, this.w, this.h, 7);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}
