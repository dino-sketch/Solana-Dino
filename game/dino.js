let playerName = "";
let walletAddress = null;

let provider = null;
let connection =null;
let program = null;

const IDL = {
    "version": "0.1.0",
    "name": "dino_leaderboard",
    "instructions": [
        {
            "name": "submitDistance",
            "accounts": [
                {"name": "playerAccount", "isMut": true, "isSigner": false},
                {"name": "leaderboard", "isMut": true, "isSigner": false},
                {"name": "player", "isMut": true, "isSigner": true},
                {"name": "systemProgram", "isMut": false, "isSigner": false}
            ],
            "args": [
                {"name": "distance", "type": "u64"},
                {"name": "playerName", "type": "string"}
            ]
        },
        {
            "name": "initializeLeaderboard",
            "accounts": [
                {"name": "leaderboard", "isMut": true, "isSigner": false},
                {"name": "authority", "isMut": true, "isSigner": true},
                {"name": "systemProgram", "isMut": false, "isSigner": false}
            ],
            "args": []
        }
    ],
    "accounts": [
        {
            "name": "PlayerAccount",
            "type": {
                "kind": "struct",
                "fields": [
                    {"name": "player", "type": "publicKey"},
                    {"name": "distance", "type": "u64"},
                    {"name": "playerName", "type": "string"}
                ]
            }
        },
        {
            "name": "Leaderboard",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "entries",
                        "type": {"vec": {"defined": "LeaderboardEntry"}}
                    }
                ]
            }
        }
    ],
    "types": [
        {
            "name": "LeaderboardEntry",
            "type": {
                "kind": "struct",
                "fields": [
                    {"name": "player", "type": "publicKey"},
                    {"name": "distance", "type": "u64"},
                    {"name": "playerName", "type": "string"}
                ]
            }
        }
    ],
    "errors": [
        {
            "code": 6000,
            "name": "PlayerNameTooLong",
            "msg": "Player name too long"
        }
    ]
};
//in future version
/*async function connectWallet() {
    const walletStatus = document.getElementById("wallet-status");
    const startButton = document.getElementById("start-game");
    const playerNameInput = document.getElementById("player-name");

    try {
        // Check for Phantom wallet extension
        if (!window.solana || !window.solana.isPhantom) {
            walletStatus.innerHTML = 'Phantom wallet not detected. <a href="https://phantom.app/download" target="_blank" style="color: #007bff; text-decoration: underline;">Install Phantom Extension</a>';
            walletStatus.classList.add("error");
            console.log("Phantom wallet not found");
            return;
        }

        provider = window.solana;

        // Check if already connected (e.g., on page reload)
        if (provider.isConnected) {
            walletAddress = provider.publicKey.toString();
            console.log("Using existing Phantom connection:", walletAddress);
            walletStatus.textContent = `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
            walletStatus.classList.remove("error");
            walletStatus.classList.add("connected");
        } else {
            // Request new connection
            walletStatus.textContent = "Connecting to Phantom...";
            walletStatus.classList.remove("error", "connected");
            const resp = await provider.connect();
            walletAddress = resp.publicKey.toString();
            console.log("Connected to Phantom:", walletAddress);
            walletStatus.textContent = `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
            walletStatus.classList.add("connected");
        }

        // Initialize Solana connection and Anchor program
        connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl("devnet"), "confirmed");
        const anchorProvider = new Anchor.Provider(connection, {
            publicKey: provider.publicKey,
            signTransaction: provider.signTransaction.bind(provider),
            signAllTransactions: provider.signAllTransactions.bind(provider)
        }, { commitment: "confirmed" });
        program = new Anchor.Program(IDL, PROGRAM_ID, anchorProvider);

        // Update start button state
        checkStartGameButton();

        // Handle wallet events
        provider.on("connect", (publicKey) => {
            walletAddress = publicKey.toString();
            walletStatus.textContent = `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
            walletStatus.classList.add("connected");
            walletStatus.classList.remove("error");
            console.log("Phantom connected:", walletAddress);
            checkStartGameButton();
        });

        provider.on("disconnect", () => {
            walletStatus.textContent = "Phantom wallet disconnected.";
            walletStatus.classList.add("error");
            walletStatus.classList.remove("connected");
            startButton.disabled = true;
            console.log("Phantom disconnected");
        });

        provider.on("accountChanged", (publicKey) => {
            if (publicKey) {
                walletAddress = publicKey.toString();
                walletStatus.textContent = `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
                walletStatus.classList.add("connected");
                walletStatus.classList.remove("error");
                console.log("Phantom account changed:", walletAddress);
                checkStartGameButton();
            } else {
                walletStatus.textContent = "Phantom wallet disconnected.";
                walletStatus.classList.add("error");
                walletStatus.classList.remove("connected");
                startButton.disabled = true;
                console.log("Phantom account changed to none");
            }
        });

    } catch (error) {
        console.error("Phantom connection failed:", error);
        if (error.code === 4001) {
            walletStatus.textContent = "Connection rejected. Please try again.";
        } else {
            walletStatus.textContent = "Failed to connect to Phantom. Please try again.";
        }
        walletStatus.classList.add("error");
        walletStatus.classList.remove("connected");
    }
}*/
//document.getElementById("connect-wallet").addEventListener("click", connectWallet);

document.getElementById("player-name").addEventListener("input", (e) => {
    playerName = e.target.value.trim();
    checkStartGameButton();
});

function checkStartGameButton() {
    const startButton = document.getElementById("start-game");
    startButton.disabled = !playerName;// || !walletAddress;
}

document.getElementById("start-game").addEventListener("click", () => {
    console.log("Start game button clicked");
    document.getElementById("login-screen").classList.add("hidden");
    startCountdown(startGame);
});

// Countdown Logic
function startCountdown(callback) {
    const countdownElement = document.getElementById("countdown");
    const countdownNumber = document.getElementById("countdown-number");
    const gameScreen = document.getElementById("game-screen");
    if (!countdownElement || !countdownNumber) {
        console.error("Countdown elements not found!");
        callback();
        return;
    }

    const countdownSequence = ["3", "2", "1", "Start", "Go"];
    let index = 0;

    // Hide game screen and ensure canvas/scoreboard are not visible
    gameScreen.classList.add("hidden");
    countdownElement.classList.remove("hidden");
    countdownElement.style.display = "flex";

    console.log("Countdown started");
    countdownNumber.textContent = countdownSequence[index];

    const countdownInterval = setInterval(() => {
        index++;
        if (index < countdownSequence.length) {
            countdownNumber.textContent = countdownSequence[index];
            console.log("Countdown:", countdownSequence[index]);
        } else {
            clearInterval(countdownInterval);
            countdownElement.classList.add("hidden");
            // Show game screen after countdown
            gameScreen.classList.remove("hidden");
            console.log("Countdown ended, starting game");
            callback();
        }
    }, 1000);
}

// Game Logic
let board;
let boardWidth = 1000;
let boardHeight = 400;
let context;

// Ground properties
let groundHeight = 40;

// Dinosaur
let dinoWidth = 88;
let dinoHeight = 94;
let dinoX = 50;
let dinoY = boardHeight - dinoHeight - groundHeight;
let dinoImg, dinoDeadImg, dinoJumpImg, dinoRun1Img, dinoRun2Img, dinoDuck1Img, dinoDuck2Img;
let dino = {
    x: dinoX,
    y: dinoY,
    width: dinoWidth,
    height: dinoHeight,
    state: "run",
    frame: 0,
    ducking: false
};

// Cacti and Birds
let cactusArray = [];
let cactus1Width = 34;
let cactus2Width = 69;
let cactus3Width = 102;
let bigCactus1Width = 50;
let bigCactus2Width = 80;
let bigCactus3Width = 120;
let birdWidth = 60;
let birdHeight = 70;
let cactusHeight = 70;
let birdY = boardHeight - 150 - groundHeight;
let cactusY = boardHeight - cactusHeight - groundHeight;
let cactusX = 700;

let cactus1Img, cactus2Img, cactus3Img, bigCactus1Img, bigCactus2Img, bigCactus3Img, bird1Img, bird2Img;

// Background - Added parallax layers and ground
let cloudImg, trackImg, groundImg;
let plx1Img, plx2Img, plx3Img, plx4Img, plx5Img;
let clouds = [];
let floatingClouds = [];
let trackX = 0;
let groundX = 0;
let plx1X = 0, plx2X = 0, plx3X = 0, plx4X = 0, plx5X = 0;

// Physics
let velocityX = -8;
let velocityY = 0;
let gravity = 0.4;
let gameOver = false;
let score = 0;
let difficulty = 1;

// Sounds
let jumpSound, duckSound, gameOverSound;

function startGame() {
    // Initialize canvas
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    // Load Images
    dinoImg = new Image();
    dinoImg.src = "img/dino.png";
    dinoDeadImg = new Image();
    dinoDeadImg.src = "img/dino-dead.png";
    dinoJumpImg = new Image();
    dinoJumpImg.src = "img/dino-jump.png";
    dinoRun1Img = new Image();
    dinoRun1Img.src = "img/dino-run1.png";
    dinoRun2Img = new Image();
    dinoRun2Img.src = "img/dino-run2.png";
    dinoDuck1Img = new Image();
    dinoDuck1Img.src = "img/dino-duck1.png";
    dinoDuck2Img = new Image();
    dinoDuck2Img.src = "img/dino-duck2.png";

    cactus1Img = new Image();
    cactus1Img.src = "img/cactus1.png";
    cactus2Img = new Image();
    cactus2Img.src = "img/cactus2.png";
    cactus3Img = new Image();
    cactus3Img.src = "img/cactus3.png";
    bigCactus1Img = new Image();
    bigCactus1Img.src = "img/big-cactus1.png";
    bigCactus2Img = new Image();
    bigCactus2Img.src = "img/big-cactus2.png";
    bigCactus3Img = new Image();
    bigCactus3Img.src = "img/big-cactus3.png";
    bird1Img = new Image();
    bird1Img.src = "img/bird1.png";
    bird2Img = new Image();
    bird2Img.src = "img/bird2.png";

    // Load ground and parallax layer images
    cloudImg = new Image();
    cloudImg.src = "img/cloud.png";
    trackImg = new Image();
    trackImg.src = "img/track.png";
    groundImg = new Image();
    groundImg.src = "img/ground.png";

    // Load parallax background layers
    plx1Img = new Image();
    plx1Img.src = "img/plx-1.png";
    plx2Img = new Image();
    plx2Img.src = "img/plx-2.png";
    plx3Img = new Image();
    plx3Img.src = "img/plx-3.png";
    plx4Img = new Image();
    plx4Img.src = "img/plx-4.png";
    plx5Img = new Image();
    plx5Img.src = "img/plx-5.png";

    // Load Sounds
    jumpSound = new Audio("sounds/jump.mp3");
    duckSound = new Audio("sounds/duck.mp3");
    gameOverSound = new Audio("sounds/game-over.mp3");

    // Initialize Clouds
    for (let i = 0; i < 3; i++) {
        clouds.push({
            x: Math.random() * boardWidth,
            y: Math.random() * 50 + 30,
            width: 60,
            height: 30
        });
    }

    // Initialize floating clouds for beauty
    for (let i = 0; i < 10; i++) {
        floatingClouds.push({
            x: Math.random() * boardWidth * 2,
            y: Math.random() * 80 + 60,
            width: Math.random() * 40 + 80,
            height: Math.random() * 20 + 40,
            speed: Math.random() * 0.5 + 0.2
        });
    }

    // Load high score from localStorage
    const savedHighScore = localStorage.getItem("highScore") || 0;
    document.getElementById("high-score").textContent = parseInt(savedHighScore).toString().padStart(6, "0");

    requestAnimationFrame(update);
    setInterval(placeObstacle, 600);
    document.addEventListener("keydown", moveDino);
    document.addEventListener("keyup", stopDucking);
    document.getElementById("reset-button").addEventListener("click", resetGame);
}
async function submitDistance(distance) {
    if (!program || !provider) {
        console.error("Solana program or wallet not initialized");
        return;
    }

    try {
        const [playerAccountPda] = await solanaWeb3.PublicKey.findProgramAddress(
            [Buffer.from("player"), provider.publicKey.toBuffer()],
            PROGRAM_ID
        );
        const [leaderboardPda] = await solanaWeb3.PublicKey.findProgramAddress(
            [Buffer.from("leaderboard")],
            PROGRAM_ID
        );

        const tx = await program.rpc.submitDistance(
            new Anchor.BN(distance),
            playerName,
            {
                accounts: {
                    playerAccount: playerAccountPda,
                    leaderboard: leaderboardPda,
                    player: provider.publicKey,
                    systemProgram: solanaWeb3.SystemProgram.programId
                }
            }
        );
        console.log("Distance submitted, tx:", tx);
    } catch (error) {
        console.error("Failed to submit distance:", error);
    }
}
async function displayLeaderboard() {
    if (!program) {
        console.error("Solana program not initialized");
        return;
    }

    try {
        const [leaderboardPda] = await solanaWeb3.PublicKey.findProgramAddress(
            [Buffer.from("leaderboard")],
            PROGRAM_ID
        );
        const leaderboard = await program.account.leaderboard.fetch(leaderboardPda);
        const leaderboardContent = document.getElementById("leaderboard-content");
        leaderboardContent.innerHTML = "";

        if (leaderboard.entries.length === 0) {
            leaderboardContent.innerHTML = "<p>No entries yet.</p>";
            return;
        }

        leaderboard.entries.forEach((entry, index) => {
            const item = document.createElement("div");
            item.className = "leaderboard-item";
            item.innerHTML = `
                <span>${index + 1}. ${entry.playerName}</span>
                <span>${entry.player.toString().slice(0, 6)}...</span>
                <span class="distance">${entry.distance}m</span>
            `;
            leaderboardContent.appendChild(item);
        });
    } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
        document.getElementById("leaderboard-content").innerHTML = "<p>Error loading leaderboard.</p>";
    }
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) return;

    context.clearRect(0, 0, board.width, board.height);

    // LAYER 1: Background parallax layers (furthest to nearest)
    context.drawImage(plx1Img, plx1X, 0, boardWidth, boardHeight);
    context.drawImage(plx1Img, plx1X + boardWidth, 0, boardWidth, boardHeight);
    plx1X += velocityX * 0.02;
    if (plx1X <= -boardWidth) plx1X = 0;

    context.drawImage(plx2Img, plx2X, 0, boardWidth, boardHeight);
    context.drawImage(plx2Img, plx2X + boardWidth, 0, boardWidth, boardHeight);
    plx2X += velocityX * 0.05;
    if (plx2X <= -boardWidth) plx2X = 0;

    context.drawImage(plx3Img, plx3X, 0, boardWidth, boardHeight);
    context.drawImage(plx3Img, plx3X + boardWidth, 0, boardWidth, boardHeight);
    plx3X += velocityX * 0.1;
    if (plx3X <= -boardWidth) plx3X = 0;

    context.drawImage(plx4Img, plx4X, 0, boardWidth, boardHeight);
    context.drawImage(plx4Img, plx4X + boardWidth, 0, boardWidth, boardHeight);
    plx4X += velocityX * 0.15;
    if (plx4X <= -boardWidth) plx4X = 0;

    context.drawImage(plx5Img, plx5X, 0, boardWidth, boardHeight);
    context.drawImage(plx5Img, plx5X + boardWidth, 0, boardWidth, boardHeight);
    plx5X += velocityX * 0.25;
    if (plx5X <= -boardWidth) plx5X = 0;

    // LAYER 2: Floating clouds behind everything
    for (let i = 0; i < floatingClouds.length; i++) {
        let cloud = floatingClouds[i];
        cloud.x += velocityX * cloud.speed;
        if (cloud.x < -cloud.width) cloud.x = boardWidth + Math.random() * 200;
        context.drawImage(cloudImg, cloud.x, cloud.y, cloud.width, cloud.height);
    }

    // LAYER 3: Small clouds
    for (let i = 0; i < clouds.length; i++) {
        let cloud = clouds[i];
        cloud.x += velocityX * 0.3;
        if (cloud.x < -cloud.width) cloud.x = boardWidth;
        context.drawImage(cloudImg, cloud.x, cloud.y, cloud.width, cloud.height);
    }

    // LAYER 4: GROUND
    context.drawImage(groundImg, groundX, boardHeight - groundHeight, boardWidth, groundHeight);
    context.drawImage(groundImg, groundX + boardWidth, boardHeight - groundHeight, boardWidth, groundHeight);
    groundX += velocityX * 0.7;
    if (groundX <= -boardWidth) groundX = 0;

    // LAYER 5: Track
    context.drawImage(trackImg, trackX, boardHeight - 20, boardWidth, 20);
    context.drawImage(trackImg, trackX + boardWidth, boardHeight - 20, boardWidth, 20);
    trackX += velocityX * 0.6;
    if (trackX <= -boardWidth) trackX = 0;

    // LAYER 6: Dinosaur
    velocityY += gravity;
    dino.y = Math.min(dino.y + velocityY, dinoY);
    if (dino.y < dinoY) dino.state = "jump";
    else if (dino.ducking) dino.state = "duck";
    else dino.state = "run";

    dino.frame++;
    let currentDinoImg;
    if (dino.state === "jump") currentDinoImg = dinoJumpImg;
    else if (dino.state === "duck") {
        currentDinoImg = dino.frame % 20 < 10 ? dinoDuck1Img : dinoDuck2Img;
        dino.height = dinoHeight * 0.8;
        dino.y = dinoY + (dinoHeight - dino.height);
    } else {
        currentDinoImg = dino.frame % 20 < 10 ? dinoRun1Img : dinoRun2Img;
        dino.height = dinoHeight;
    }
    context.drawImage(currentDinoImg, dino.x, dino.y, dino.width, dino.height);

    // LAYER 7: Obstacles
    for (let i = 0; i < cactusArray.length; i++) {
        let obstacle = cactusArray[i];
        obstacle.x += velocityX * difficulty;
        if (obstacle.type === "bird") {
            obstacle.img = obstacle.frame % 20 < 10 ? bird1Img : bird2Img;
            obstacle.frame++;
        }
        context.drawImage(obstacle.img, obstacle.x, obstacle.y, obstacle.width, obstacle.height);

        if (detectCollision(dino, obstacle)) {
            gameOver = true;
            gameOverSound.play();
            document.getElementById("game-over-screen").classList.remove("hidden");
            // Format and update final scoreboard values
            document.getElementById("final-score").textContent = score.toString().padStart(6, "0");
            document.getElementById("level-reached").textContent = Math.floor(score / 1000) + 1;
            const currentHighScore = parseInt(localStorage.getItem("highScore") || 0);
            const newHighScore = Math.max(score, currentHighScore);
            localStorage.setItem("highScore", newHighScore);
            document.getElementById("high-score").textContent = newHighScore.toString().padStart(6, "0");
            document.getElementById("final-high-score").textContent = newHighScore.toString().padStart(6, "0");
            const distance = Math.floor(score / 10);
            document.getElementById("total-distance").textContent = `${Math.floor(score / 10)}m`;
            context.drawImage(dinoDeadImg, dino.x, dino.y, dino.width, dino.height);
            submitDistance(distance);
            
    }

    // Score and Difficulty
    score++;
    document.getElementById("score").textContent = score.toString().padStart(6, "0");
    difficulty = 1 + score / 5000;
 }
}
function moveDino(e) {
    if (gameOver) return;

    if ((e.code === "Space" || e.code === "ArrowUp") && dino.y === dinoY && !dino.ducking) {
        velocityY = -12;
        jumpSound.play();
    }
    if (e.code === "ArrowDown" && dino.y === dinoY) {
        dino.ducking = true;
        duckSound.play();
    }
}

function stopDucking(e) {
    if (e.code === "ArrowDown") {
        dino.ducking = false;
    }
}

function placeObstacle() {
    if (gameOver) return;

    let obstacle = {
        img: null,
        x: cactusX,
        y: cactusY,
        width: null,
        height: cactusHeight,
        type: "cactus",
        frame: 0
    };

    let chance = Math.random();
    if (chance > 0.85) {
        obstacle.img = bird1Img;
        obstacle.width = birdWidth;
        obstacle.height = birdHeight;
        obstacle.y = birdY;
        obstacle.type = "bird";
    } else if (chance > 0.75) {
        obstacle.img = bigCactus3Img;
        obstacle.width = bigCactus3Width;
    } else if (chance > 0.65) {
        obstacle.img = bigCactus2Img;
        obstacle.width = bigCactus2Width;
    } else if (chance > 0.55) {
        obstacle.img = bigCactus1Img;
        obstacle.width = bigCactus1Width;
    } else if (chance > 0.40) {
        obstacle.img = cactus3Img;
        obstacle.width = cactus3Width;
    } else if (chance > 0.35) {
        obstacle.img = cactus2Img;
        obstacle.width = cactus2Width;
    } else if (chance > 0.20) {
        obstacle.img = cactus1Img;
        obstacle.width = cactus1Width;
    }

    if (obstacle.img) cactusArray.push(obstacle);
    if (cactusArray.length > 5) cactusArray.shift();
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function resetGame() {
    const gameOverScreen = document.getElementById("game-over-screen");
    gameOverScreen.classList.add("hidden");
    gameOver = false;
    score = 0;
    difficulty = 1;
    cactusArray = [];
    dino.y = dinoY;
    velocityY = 0;
    dino.ducking = false;

    // Reset parallax positions
    trackX = 0;
    groundX = 0;
    plx1X = 0;
    plx2X = 0;
    plx3X = 0;
    plx4X = 0;
    plx5X = 0;

    document.getElementById("score").textContent = score.toString().padStart(6, "0");
}