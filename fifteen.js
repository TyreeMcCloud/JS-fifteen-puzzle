console.log("Script loaded successfully");

// Constants
const gridSize = 4;
const tileSize = 100;
let emptyTile = { row: gridSize - 1, col: gridSize - 1 };
let board = [];
let timer, timerElement, shuffleButton, backgroundSelector;

// Backgrounds
const backgrounds = [
    "img/background1.png",
    "img/background2.png",
    "img/background3.png",
    "img/background4.png",
];
let presentBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)]; //gets random background


// make the Board
function makeBoard() {
    const gameContainer = document.getElementById("game-container");
    gameContainer.style.width = (gridSize * tileSize) + "px"; //computes width of the board
    gameContainer.style.height = (gridSize * tileSize) + "px"; //computes height of the board

    // Create tiles
    let tileCount = 1; //reflects numbers on tiles
    for (let row = 0; row < gridSize; row++) {
        board[row] = [];
        for (let col = 0; col < gridSize; col++) {
            if (row === gridSize - 1 && col === gridSize - 1) {
                board[row][col] = null; // Empty tile
            } else {
                const tile = createTile(tileCount++, row, col);
                board[row][col] = tile;
                gameContainer.appendChild(tile);
            }
        }
    }
}

// Create Tile
function createTile(number, row, col) {
    // Create the tile element
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.textContent = number;

    // Calculate left and top positions
    const leftPosition = col * tileSize + "px";
    const topPosition = row * tileSize + "px";
    tile.style.left = leftPosition;
    tile.style.top = topPosition;

    // Calculate width and height
    const tileWidth = tileSize - 4 + "px";
    const tileHeight = tileSize - 4 + "px";
    tile.style.width = tileWidth;
    tile.style.height = tileHeight;

    const tileRow = row;
    const tileCol = col;
    tile.dataset.row = tileRow;
    tile.dataset.col = tileCol;

    // Set up the background image
    const bgImageUrl = "url(" + presentBackground + ")";
    const bgSize = gridSize * tileSize + "px " + gridSize * tileSize + "px";
    const bgOffsetX = -(col * tileSize) + "px";
    const bgOffsetY = -(row * tileSize) + "px";
    tile.style.backgroundImage = bgImageUrl;
    tile.style.backgroundSize = bgSize;
    tile.style.backgroundPosition = bgOffsetX + " " + bgOffsetY;

    const clickHandler = onTileClick;
    const hoverHandler = onTileHover;
    const unhoverHandler = onTileUnhover;
    tile.addEventListener("click", clickHandler);
    tile.addEventListener("mouseover", hoverHandler);
    tile.addEventListener("mouseout", unhoverHandler);

    return tile;
}


// move Tile
function Move(tile, emptyRow, emptyCol) {
    const currentRow = parseInt(tile.dataset.row, 10);
    const currentCol = parseInt(tile.dataset.col, 10);

    // Update the tile's position
    tile.style.left = emptyCol * tileSize + "px";
    tile.style.top = emptyRow * tileSize + "px";

    // Update the tile's data
    tile.dataset.row = emptyRow;
    tile.dataset.col = emptyCol;

    // Update the empty space
    emptyRow = currentRow;
    emptyCol = currentCol;
}


// tile click
function onTileClick(event) {
    const tile = event.target;
    const row = parseInt(tile.dataset.row);
    const col = parseInt(tile.dataset.col);

    //check if tile is next to empty spot then move
    if (isMovable(row, col)) {
        board[emptyTile.row][emptyTile.col] = tile;
        board[row][col] = null;
        Move(tile, emptyTile.row, emptyTile.col);
        emptyTile = { row, col };
        checkWin();
    }
}

// Hover Effects
function onTileHover(event) {
    const tile = event.target;
    const row = parseInt(tile.dataset.row);
    const col = parseInt(tile.dataset.col);

    if (isMovable(row, col)) {
        tile.classList.add("movablepiece");
    }
}

function onTileUnhover(event) {
    event.target.classList.remove("movablepiece");
}

// Check if Tile is Movable
function isMovable(row, col) {
    const isRowAdjacent = Math.abs(emptyTile.row - row) === 1;
    const isColAdjacent = Math.abs(emptyTile.col - col) === 1;
    return (isRowAdjacent && emptyTile.col === col) || (isColAdjacent && emptyTile.row === row);
}



// Shuffle Board
function shuffleBoard() {
    clearInterval(timer);
    document.getElementById("game-container").classList.remove("no-interaction");
    document.getElementById("background-selector").classList.add("no-interaction");
    for (let i = 0; i < 300; i++) {
        const neighbors = getNeighbors();
        const randomTile = neighbors[Math.floor(Math.random() * neighbors.length)];
        const row = parseInt(randomTile.dataset.row);
        const col = parseInt(randomTile.dataset.col);

        // Move the tile and update the empty tile's position
        Move(randomTile, emptyTile.row, emptyTile.col);
        updateBoard(randomTile, row, col);
    }
    let timeRemaining = 150;//minute 30 seconds
    const timerElement = document.getElementById("timer");

    function startTimer() {
        const audio = document.getElementById('game-music');
        audio.src = "./audio/game1.mp3"; 
        audio.load();
        audio.play().catch(error => {
            console.log('Autoplay failed:', error);
        });
        updateTimerDisplay();
        timer = setInterval(() => {
            timeRemaining--;
            updateTimerDisplay();
            if (timeRemaining == 60) {
                audio.src = "./audio/game2.mp3"; 
                audio.load();
                audio.play();
            }
            if (timeRemaining <= 0) {
                clearInterval(timer);
                gameOver(false);
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        timerElement.textContent = "Time Remaining: " + minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
    }


    startTimer();
}

function updateBoard(tile, row, col) {
    board[emptyTile.row][emptyTile.col] = tile;
    board[row][col] = null;
    emptyTile = { row, col };
}


// Get Neighbors of Empty Tile
function getNeighbors() {
    const neighbors = [];

    const directions = [
        { rowOffset: -1, colOffset: 0 }, // Up
        { rowOffset: 1, colOffset: 0 },  // Down
        { rowOffset: 0, colOffset: -1 }, // Left
        { rowOffset: 0, colOffset: 1 },  // Right
    ];

    directions.forEach(({ rowOffset, colOffset }) => {
        const newRow = emptyTile.row + rowOffset;
        const newCol = emptyTile.col + colOffset;

        // Check if the new position is valid
        if (isValidPosition(newRow, newCol)) {
            neighbors.push(board[newRow][newCol]);
        }
    });

    return neighbors.filter(tile => tile !== null);
}

function isValidPosition(row, col) {
    return row >= 0 && row < gridSize && col >= 0 && col < gridSize;
}

// Check Win Condition
function checkWin() {
    let correct = 1;
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (row === gridSize - 1 && col === gridSize - 1) continue;
            if (board[row][col]?.textContent != correct++) return false;
        }
    }
    clearInterval(timer);
    gameOver(true);
}

// Game Over
function gameOver(win) {
    // Use local storage to store game result
    localStorage.setItem("gameResult", win ? "You win!" : "Time's up! You lose!");
    window.location.href = "gameover.html";
}

// Change Background Image
function changeBackgroundImage(event) {
    presentBackground = event.target.value;
    board.flat().forEach((tile) => {
        if (tile) {
            const col = parseInt(tile.dataset.col);
            const row = parseInt(tile.dataset.row);
            const bgOffsetX = -(col * tileSize);
            const bgOffsetY = -(row * tileSize);
            tile.style.backgroundImage = "url(" + presentBackground + ")";
            tile.style.backgroundPosition = bgOffsetX + "px " + bgOffsetY + "px";

        }
    });
}

// start Game
document.addEventListener("DOMContentLoaded", () => {
    makeBoard();
    const shuffleButton = document.getElementById("shuffle");
    shuffleButton.addEventListener("click", shuffleBoard);
    const backgroundSelector = document.getElementById("background-selector");
    backgroundSelector.addEventListener("change", changeBackgroundImage);
});
