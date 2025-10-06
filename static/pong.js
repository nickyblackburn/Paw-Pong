// gets canvis 
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
// sets pattle hight
let paddleHeight = 80;
let paddleWidth = 10;
let ballRadius = 8;

let playerY = canvas.height/2 - paddleHeight/2;
let cpuY = canvas.height/2 - paddleHeight/2;

let ballX = canvas.width/2;
let ballY = canvas.height/2;
let ballSpeedX = 4;
let ballSpeedY = 2;
// draws stuff
function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // paddles
  ctx.fillRect(0, playerY, paddleWidth, paddleHeight);
  ctx.fillRect(canvas.width - paddleWidth, cpuY, paddleWidth, paddleHeight);
  // ball
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI*2);
  ctx.fill();
}

function update() {
  // ball movement
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  // bounce top/bottom
  if(ballY < 0 || ballY > canvas.height) {
    ballSpeedY = -ballSpeedY;
  }

  // bounce off player paddle
  if(ballX - ballRadius < paddleWidth &&
     ballY > playerY && ballY < playerY + paddleHeight) {
    ballSpeedX = -ballSpeedX;
  }

  // bounce off cpu paddle
  if(ballX + ballRadius > canvas.width - paddleWidth &&
     ballY > cpuY && ballY < cpuY + paddleHeight) {
    ballSpeedX = -ballSpeedX;
  }

  // simple cpu follow
  if(cpuY + paddleHeight/2 < ballY) cpuY += 3;
  if(cpuY + paddleHeight/2 > ballY) cpuY -= 3;
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

document.addEventListener('mousemove', (e)=>{
  playerY = e.clientY - paddleHeight/2;
});

loop();
