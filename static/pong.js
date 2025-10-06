// pong.js — Paw Pong 🐾

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// --- config ---
const paddleH = 90, paddleW = 12, ballR = 8;
const cpuSpeed = 3.2;
const startSpeedX = 4.0;
const maxScore = 5;

// --- state ---
let playerY = (canvas.height - paddleH)/2;
let cpuY    = (canvas.height - paddleH)/2;
let ballX = canvas.width/2, ballY = canvas.height/2;
let vx = startSpeedX, vy = 2.2;

let playerScore = 0, cpuScore = 0;
let state = "serve";  // "serve" | "play" | "gameover"
let nextServeDir = Math.random() < 0.5 ? -1 : 1; // -1 = to left, 1 = to right

// --- helpers ---
function randVy() {
  // random vertical speed avoiding tiny values
  let v = (Math.random() * 3.5 + 1.2) * (Math.random() < 0.5 ? -1 : 1);
  if (Math.abs(v) < 1.2) v = 1.2 * Math.sign(v || 1);
  return v;
}

function resetBall(dir) {
  ballX = canvas.width/2;
  ballY = canvas.height/2;
  vx = startSpeedX * dir;
  vy = randVy();
}

function clamp(v, lo, hi) {
  return Math.min(Math.max(v, lo), hi);
}

function drawNet() {
  ctx.save();
  ctx.globalAlpha = 0.2;
  for (let y = 0; y < canvas.height; y += 16) {
    ctx.fillRect(canvas.width/2 - 1, y, 2, 10);
  }
  ctx.restore();
}

function drawScores() {
  ctx.font = "28px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(String(playerScore), canvas.width * 0.25, 40);
  ctx.fillText(String(cpuScore),    canvas.width * 0.75, 40);
}

function drawOverlay(title, sub="Press Space / Click to continue") {
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.font = "bold 36px system-ui, sans-serif";
  ctx.fillText(title, canvas.width/2, canvas.height/2 - 10);
  ctx.font = "18px system-ui, sans-serif";
  ctx.fillText(sub, canvas.width/2, canvas.height/2 + 26);
  ctx.restore();
}

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // net + scores
  drawNet();
  drawScores();

  // paddles
  ctx.fillRect(0, playerY, paddleW, paddleH);
  ctx.fillRect(canvas.width - paddleW, cpuY, paddleW, paddleH);

  // ball
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballR, 0, Math.PI*2);
  ctx.fill();

  if (state === "serve") {
    drawOverlay("Ready? UwU?");
  } else if (state === "gameover") {
    const who = playerScore > cpuScore ? "You Win LOL! 🐾" : "You Lose U Crazy Loozer 😿";
    drawOverlay(who, "Press Space / Click to play again");
  }
}

function update() {
  if (state !== "play") return;

  // ball motion
  ballX += vx; ballY += vy;

  // top/bottom bounce
  if (ballY - ballR <= 0) { ballY = ballR; vy = -vy; }
  if (ballY + ballR >= canvas.height) { ballY = canvas.height - ballR; vy = -vy; }

  // player paddle collision
  if (ballX - ballR <= paddleW) {
    if (ballY >= playerY && ballY <= playerY + paddleH) {
      ballX = paddleW + ballR; // prevent sticking
      vx = Math.abs(vx);
      // add a bit of "spin" based on hit position
      const hitPos = (ballY - (playerY + paddleH/2)) / (paddleH/2);
      vy += hitPos * 1.6;
    }
  }

  // cpu paddle collision
  if (ballX + ballR >= canvas.width - paddleW) {
    if (ballY >= cpuY && ballY <= cpuY + paddleH) {
      ballX = canvas.width - paddleW - ballR;
      vx = -Math.abs(vx);
      const hitPos = (ballY - (cpuY + paddleH/2)) / (paddleH/2);
      vy += hitPos * 1.6;
    }
  }

  // scoring (passed left/right)
  if (ballX + ballR < 0) {
    // CPU scores
    cpuScore++;
    if (cpuScore >= maxScore) {
      state = "gameover";
    } else {
      state = "serve";
      nextServeDir = 1; // serve to the right (towards player)
    }
    return; // stop this frame
  }
  if (ballX - ballR > canvas.width) {
    // Player scores
    playerScore++;
    if (playerScore >= maxScore) {
      state = "gameover";
    } else {
      state = "serve";
      nextServeDir = -1; // serve to the left (towards CPU)
    }
    return;
  }

  // CPU AI (only in play)
  const cpuCenter = cpuY + paddleH/2;
  if (cpuCenter < ballY - 6) cpuY += cpuSpeed;
  if (cpuCenter > ballY + 6) cpuY -= cpuSpeed;
  cpuY = clamp(cpuY, 0, canvas.height - paddleH);
}

// input: mouse controls player paddle
document.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  playerY = clamp(e.clientY - rect.top - paddleH/2, 0, canvas.height - paddleH);
});

// start/continue with click or space
function serveOrRestart() {
  if (state === "serve") {
    resetBall(nextServeDir);
    state = "play";
  } else if (state === "gameover") {
    // reset everything
    playerScore = 0; cpuScore = 0;
    playerY = (canvas.height - paddleH)/2;
    cpuY = (canvas.height - paddleH)/2;
    nextServeDir = Math.random() < 0.5 ? -1 : 1;
    state = "serve";
  }
}
document.addEventListener('click', serveOrRestart);
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') { e.preventDefault(); serveOrRestart(); }
});

function loop() { update(); draw(); requestAnimationFrame(loop); }
loop();

