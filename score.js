/**
 * Score — points, lives, and level tracking.
 */

class ScoreManager {
    constructor() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        const saved = localStorage.getItem('breakHighScore');
        this.highScore = saved ? parseInt(saved, 10) : 0;
    }

    add(points) {
        this.score += points;
    }

    loseLife() {
        this.lives--;
        return this.lives <= 0;
    }

    nextLevel() {
        this.level++;
    }

    saveHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('breakHighScore', this.highScore.toString());
        }
    }

    reset() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
    }

    draw(ctx) {
        // Score — top left
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`Score: ${this.score}`, 10, 30);

        // Level — top center
        ctx.textAlign = 'center';
        ctx.fillStyle = '#888';
        ctx.font = '14px "Segoe UI", Arial, sans-serif';
        ctx.fillText(`Level ${this.level}`, CANVAS_W / 2, 30);

        // Lives — top right (heart icons)
        ctx.textAlign = 'right';
        ctx.font = '16px Arial';
        let hearts = '';
        for (let i = 0; i < this.lives; i++) hearts += '❤️';
        ctx.fillText(hearts, CANVAS_W - 10, 30);

        // High score — tiny below
        ctx.fillStyle = '#555';
        ctx.font = '11px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`Best: ${this.highScore}`, 10, 46);
    }
}
