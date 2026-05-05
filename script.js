// Canvas and Context
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game Objects
const paddle = {
    x: 10,
    y: canvas.height / 2 - 40,
    width: 10,
    height: 80,
    dy: 0,
    speed: 6,
    color: '#00ff88'
};

const computer = {
    x: canvas.width - 20,
    y: canvas.height / 2 - 40,
    width: 10,
    height: 80,
    dy: 0,
    speed: 4,
    color: '#ff00ff'
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    dx: 5,
    dy: 5,
    speed: 5,
    maxSpeed: 8,
    color: '#ffff00'
};

let playerScore = 0;
let computerScore = 0;
let gameRunning = true;

// Input Handling
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Mouse movement for paddle control
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    paddle.y = Math.max(0, Math.min(canvas.height - paddle.height, mouseY - paddle.height / 2));
});

// Reset Button
document.getElementById('resetBtn').addEventListener('click', resetGame);

// Draw Functions
function drawRectangle(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawDashedLine() {
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawGame() {
    // Clear canvas
    ctx.fillStyle = '#0a0e27';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw middle line
    drawDashedLine();

    // Draw paddles
    drawRectangle(paddle.x, paddle.y, paddle.width, paddle.height, paddle.color);
    drawRectangle(computer.x, computer.y, computer.width, computer.height, computer.color);

    // Draw ball
    drawCircle(ball.x, ball.y, ball.radius, ball.color);

    // Draw border
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

// Update Functions
function updatePaddle() {
    // Arrow keys or W/S control
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
        paddle.y = Math.max(0, paddle.y - paddle.speed);
    }
    if (keys['ArrowDown'] || keys['s'] || keys['S']) {
        paddle.y = Math.min(canvas.height - paddle.height, paddle.y + paddle.speed);
    }
}

function updateComputer() {
    const computerCenter = computer.y + computer.height / 2;
    const ballCenter = ball.y;

    // Simple AI: track the ball
    const difference = ballCenter - computerCenter;
    const deadzone = 35; // AI dead zone for more realistic play

    if (difference < -deadzone) {
        computer.y = Math.max(0, computer.y - computer.speed);
    } else if (difference > deadzone) {
        computer.y = Math.min(canvas.height - computer.height, computer.y + computer.speed);
    }
}

function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom walls
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, ball.y));
    }

    // Ball collision with paddles
    collideWithPaddle(paddle);
    collideWithPaddle(computer);

    // Ball out of bounds (scoring)
    if (ball.x - ball.radius < 0) {
        computerScore++;
        resetBall();
        checkWinCondition();
    } else if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        resetBall();
        checkWinCondition();
    }

    // Update scores
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

function checkWinCondition() {
    if (playerScore >= 10 || computerScore >= 10) {
        gameRunning = false;
        const winner = playerScore >= 10 ? 'Player' : 'Computer';
        setTimeout(() => {
            alert(`${winner} wins! Game Over!\nFinal Score - Player: ${playerScore}, Computer: ${computerScore}`);
        }, 500);
    }
}

function collideWithPaddle(paddleObj) {
    // Check if ball is within paddle's vertical range
    if (
        ball.x - ball.radius < paddleObj.x + paddleObj.width &&
        ball.x + ball.radius > paddleObj.x &&
        ball.y < paddleObj.y + paddleObj.height &&
        ball.y > paddleObj.y
    ) {
        // Only collide if ball is moving towards the paddle
        if ((paddleObj === paddle && ball.dx < 0) || (paddleObj === computer && ball.dx > 0)) {
            // Collision detected
            ball.dx = -ball.dx;

            // Add spin based on where ball hits the paddle
            const collidePoint = ball.y - (paddleObj.y + paddleObj.height / 2);
            const normalizedCollide = collidePoint / (paddleObj.height / 2);
            
            const angleRad = (Math.PI / 4) * normalizedCollide;
            const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
            
            ball.dx = speed * Math.cos(angleRad) * (ball.dx > 0 ? 1 : -1);
            ball.dy = speed * Math.sin(angleRad);

            // Reposition ball to avoid overlap
            if (paddleObj === paddle) {
                ball.x = paddleObj.x + paddleObj.width + ball.radius;
            } else {
                ball.x = paddleObj.x - ball.radius;
            }
        }
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
    ball.dy = (Math.random() * 2 - 1) * ball.speed;
}

function resetGame() {
    playerScore = 0;
    computerScore = 0;
    gameRunning = true;
    resetBall();
    paddle.y = canvas.height / 2 - 40;
    computer.y = canvas.height / 2 - 40;
    document.getElementById('playerScore').textContent = '0';
    document.getElementById('computerScore').textContent = '0';
}

// Game Loop
function gameLoop() {
    drawGame();

    if (gameRunning) {
        updatePaddle();
        updateComputer();
        updateBall();
    }

    requestAnimationFrame(gameLoop);
}

// Start the game
resetBall();
gameLoop();
