const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const restartBtn = document.getElementById('restartBtn');
const highScoreDisplay = document.getElementById('highScore');
let highScore = 0;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const jumpSound = new Audio('https://actions.google.com/sounds/v1/cartoon/slide_whistle_to_drum_hit.ogg');
const hitSound = new Audio('https://actions.google.com/sounds/v1/impacts/crash.ogg');

const dino = {
  x: 50,
  y: canvas.height - 100,
  width: 50,
  height: 50,
  radius: 25,
  angle: 0,
  vy: 0,
  jumpPower: -15,
  gravity: 0.8,
  isJumping: false
};

let trees = [];
let treeCounter = 0;
let speed = 6;
let score = 0;
let gameOver = false;
let spawnDelay = 0;
let spawnInterval = 100;

function spawnTree() {
  let height = 60;
  if (treeCounter >= 20) {
    const previousHeights = trees.slice(-2).map(t => t.height);
    const isLastTwoSmall = previousHeights.every(h => h <= 60);

    if (isLastTwoSmall) {
      height = Math.floor(Math.random() * 60) + 90; // Bigger tree (90–150)
    } else {
      height = Math.floor(Math.random() * 60) + 40; // Regular or small tree (40–100)
    }
  }

  const tree = {
    x: canvas.width,
    y: canvas.height - 100,
    width: 30,
    height: height,
    leafColor: 'green',
    stemColor: 'brown',
    passed: false
  };
  trees.push(tree);
}

function resetGame() {
  trees = [];
  score = 0;
  speed = 6;
  spawnInterval = 100;
  treeCounter = 0;
  dino.y = canvas.height - 100;
  dino.vy = 0;
  dino.angle = 0;
  gameOver = false;
  restartBtn.style.display = 'none';
  animate();
}

function drawDino() {
  const centerX = dino.x + dino.radius;
  const centerY = dino.y + dino.radius;
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(dino.angle);

  ctx.beginPath();
  ctx.arc(0, 0, dino.radius, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, -dino.radius);
  ctx.lineTo(0, dino.radius);
  ctx.moveTo(-dino.radius, 0);
  ctx.lineTo(dino.radius, 0);
  ctx.stroke();

  ctx.restore();
}

function drawTree(tree) {
  ctx.fillStyle = tree.stemColor;
  ctx.fillRect(tree.x + 10, tree.y + 30, 10, tree.height - 30);
  ctx.fillStyle = tree.leafColor;
  ctx.beginPath();
  ctx.arc(tree.x + 15, tree.y + 25, 20, 0, Math.PI * 2);
  ctx.fill();
}

function drawGround() {
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
}

function jumpAction() {
  if (!dino.isJumping && !gameOver) {
    jumpSound.play();
    dino.vy = dino.jumpPower;
    dino.isJumping = true;
  }
}

function adjustSpawnRate() {
  if (treeCounter <= 10) {
    spawnInterval = 100;
  } else if (treeCounter <= 20) {
    spawnInterval = 70;
  } else {
    spawnInterval = 50;
  }
}

function detectCollision(ball, tree) {
  const ballLeft = ball.x;
  const ballRight = ball.x + ball.radius * 2;
  const ballTop = ball.y;
  const ballBottom = ball.y + ball.radius * 2;

  const treeLeft = tree.x;
  const treeRight = tree.x + tree.width;
  const treeTop = tree.y;
  const treeBottom = tree.y + tree.height;

  const touch = (
    ballRight > treeLeft &&
    ballLeft < treeRight &&
    ballBottom > treeTop &&
    ballTop < treeBottom
  );

  return touch;
}

function animate() {
  if (gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGround();
  drawDino();

  spawnDelay++;
  adjustSpawnRate();
  if (spawnDelay > spawnInterval) {
    spawnTree();
    spawnDelay = 0;
  }

  trees.forEach((tree) => {
    tree.x -= speed;
    drawTree(tree);

    if (detectCollision(dino, tree)) {
      hitSound.play();
      gameOver = true;
      restartBtn.style.display = 'block';
      if (score > highScore) highScore = score;
      highScoreDisplay.innerText = 'High Score: ' + highScore;
    }

    if (tree.x + tree.width < dino.x && !tree.passed) {
      tree.passed = true;
      score++;
      treeCounter++;

      if (treeCounter % 10 === 0) {
        speed += 1;
      }
    }
  });

  dino.vy += dino.gravity;
  dino.y += dino.vy;

  if (dino.y > canvas.height - 100) {
    dino.y = canvas.height - 100;
    dino.vy = 0;
    dino.isJumping = false;
  }

  if (!gameOver) {
    if (dino.y >= canvas.height - 100 && !dino.isJumping) {
      dino.angle += speed * 0.05;
    } else if (dino.isJumping) {
      dino.angle += 0.2;
    }
  }

  requestAnimationFrame(animate);
}

window.addEventListener('keydown', (e) => {
  if ((e.code === 'Space' || e.code === 'ArrowUp')) {
    jumpAction();
  }
});

canvas.addEventListener('touchstart', jumpAction);
restartBtn.addEventListener('click', resetGame);

animate();
  