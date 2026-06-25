/**
 * Game — Breakout main loop!
 *
 * New stuff you haven't seen before:
 *   - Mouse/touch position tracking (paddle follows pointer)
 *   - Angle-based ball reflection (hit paddle edge = fly sideways)
 *   - Brick grid with varying HP (some take 2 or 3 hits!)
 *   - Level progression (clear all bricks → next level)
 *   - Lives system (3 chances)
 *   - Win condition (you can BEAT the game!)
 */

// --- SETUP ---

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const ball = new Ball();
const paddle = new Paddle();
const bricks = new BrickManager();
const score = new ScoreManager();
const audio = new AudioManager();

// Mouse/finger position tracking
let pointerX = CANVAS_W / 2;

const STATE = { MENU: 0, PLAYING: 1, GAME_OVER: 2, WIN: 3 };
let currentState = STATE.MENU;
let ballLaunched = false;  // Ball sticks to paddle until tapped

// Particle effects!
let particles = [];

// --- INPUT ---

// Mouse/touch move — paddle follows
canvas.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    pointerX = (e.clientX - rect.left) * scaleX;
});

// Tap to launch ball, start, restart
canvas.addEventListener('pointerdown', () => {
    audio.init();

    if (currentState === STATE.MENU) {
        startGame();
    } else if (currentState === STATE.GAME_OVER) {
        resetGame();
    } else if (currentState === STATE.WIN) {
        resetGame();
    } else if (!ballLaunched && currentState === STATE.PLAYING) {
        ballLaunched = true;
    }
});

// --- PARTICLES ---

function spawnParticles(x, y, color, count = 8) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 4;
        particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 30 + Math.random() * 20,
            maxLife: 30 + Math.random() * 20,
            color,
            size: 2 + Math.random() * 3
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;  // Gravity
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

function drawParticles(ctx) {
    for (const p of particles) {
        const alpha = p.life / p.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

// --- GAME FUNCTIONS ---

function startGame() {
    bricks.build(score.level);
    ball.reset();
    paddle.x = CANVAS_W / 2;
    ballLaunched = false;
    particles = [];
    currentState = STATE.PLAYING;
}

function resetGame() {
    score.reset();
    startGame();
}

function update() {
    if (currentState !== STATE.PLAYING) return;

    // Update paddle position
    paddle.update(pointerX);

    // Ball stuck on paddle until tapped
    if (!ballLaunched) {
        ball.x = paddle.x;
        ball.y = paddle.y - ball.radius;
        return;
    }

    // Move ball and check collisions
    const result = ball.update(paddle, bricks.bricks);

    if (result.type === 'fall') {
        // Lost a life!
        audio.playLose();
        if (score.loseLife()) {
            score.saveHighScore();
            audio.playGameOver();
            currentState = STATE.GAME_OVER;
        } else {
            ballLaunched = false;
            ball.reset();
        }
    } else if (result.type === 'paddle') {
        audio.playPaddle();
    } else if (result.type === 'brick') {
        const destroyed = bricks.hitBrick(result.index);
        const b = bricks.bricks[result.index];

        // Play appropriate sound and particles
        const typeName = b.type.name;
        if (typeName === 'SUSHI') {
            audio.playSushi();
            spawnParticles(b.x + b.w / 2, b.y + b.h / 2, '#ff8a65', 6);
        } else if (typeName === 'CANDY') {
            audio.playCandy();
            spawnParticles(b.x + b.w / 2, b.y + b.h / 2, '#ff4081', 8);
        } else if (typeName === 'ICE CREAM') {
            audio.playIceCream();
            spawnParticles(b.x + b.w / 2, b.y + b.h / 2, '#ce93d8', 10);
        }

        if (destroyed) {
            score.add(b.points);

            // Check win!
            if (bricks.allCleared()) {
                score.saveHighScore();
                audio.playWin();
                currentState = STATE.WIN;
            }
        }
    }

    updateParticles();
}

// --- DRAW ---

function draw() {
    // Background — dark gradient
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    grad.addColorStop(0, '#1a1a2e');
    grad.addColorStop(1, '#0a0a0a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Side decorations — faint food icons
    ctx.font = '40px Arial';
    ctx.globalAlpha = 0.03;
    ctx.textAlign = 'center';
    ctx.fillText('🍣🍬🍨🍣🍬🍨', CANVAS_W / 2, CANVAS_H / 2);
    ctx.globalAlpha = 1;

    if (currentState === STATE.MENU) {
        // --- MENU ---
        paddle.draw(ctx);
        ball.draw(ctx);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 32px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🧱 SP-BREAK', CANVAS_W / 2, 240);

        ctx.font = '18px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#aaa';
        ctx.fillText('Smash sushi, candy & ice cream bricks!', CANVAS_W / 2, 280);

        ctx.fillStyle = '#ff4081';
        ctx.font = '20px "Segoe UI", Arial, sans-serif';
        ctx.fillText('Tap to start', CANVAS_W / 2, 340);

        // Show controls
        ctx.font = '14px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#666';
        ctx.fillText('Move your finger to control the paddle', CANVAS_W / 2, 380);

    } else if (currentState === STATE.PLAYING) {
        // --- PLAYING ---
        score.draw(ctx);
        bricks.draw(ctx);
        paddle.draw(ctx);
        ball.draw(ctx);
        drawParticles(ctx);

        // "Tap to launch" hint
        if (!ballLaunched) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.font = '14px "Segoe UI", Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Tap to launch 🚀', CANVAS_W / 2, CANVAS_H / 2 - 20);
        }

    } else if (currentState === STATE.GAME_OVER) {
        // --- GAME OVER ---
        score.draw(ctx);
        bricks.draw(ctx);
        paddle.draw(ctx);
        ball.draw(ctx);
        drawParticles(ctx);

        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        ctx.fillStyle = '#f44336';
        ctx.font = 'bold 36px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', CANVAS_W / 2, 260);

        ctx.fillStyle = '#fff';
        ctx.font = '20px "Segoe UI", Arial, sans-serif';
        ctx.fillText(`Score: ${score.score}`, CANVAS_W / 2, 310);

        ctx.fillStyle = '#888';
        ctx.font = '16px "Segoe UI", Arial, sans-serif';
        ctx.fillText(`Best: ${score.highScore}`, CANVAS_W / 2, 340);

        ctx.fillStyle = '#ff4081';
        ctx.font = '18px "Segoe UI", Arial, sans-serif';
        ctx.fillText('Tap to play again', CANVAS_W / 2, 400);

    } else if (currentState === STATE.WIN) {
        // --- YOU WIN ---
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        ctx.fillStyle = '#4caf50';
        ctx.font = 'bold 36px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🎉 YOU WIN! 🎉', CANVAS_W / 2, 240);

        ctx.fillStyle = '#fff';
        ctx.font = '20px "Segoe UI", Arial, sans-serif';
        ctx.fillText(`Level ${score.level} cleared!`, CANVAS_W / 2, 290);

        ctx.fillStyle = '#ffeb3b';
        ctx.font = 'bold 24px "Segoe UI", Arial, sans-serif';
        ctx.fillText(`Score: ${score.score}`, CANVAS_W / 2, 330);

        ctx.fillStyle = '#aaa';
        ctx.font = '16px "Segoe UI", Arial, sans-serif';
        ctx.fillText('Tap to play again!', CANVAS_W / 2, 390);
    }
}

// --- GAME LOOP ---

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
