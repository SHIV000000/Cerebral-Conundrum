// Cerebral Conundrum\game.js
document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    const gridSize = 5;
    const cellSize = canvas.width / gridSize;
    let currentLevel = 1;
    let currentPuzzle;
    const puzzlePatterns = [
        [
            [1, 0, 1, 0, 1],
            [0, 1, 0, 1, 0],
            [1, 0, 1, 0, 1],
            [0, 1, 0, 1, 0],
            [1, 0, 1, 0, 1]
        ],
        [
            [1, 1, 1, 1, 1],
            [1, 0, 1, 0, 1],
            [1, 1, 1, 1, 1],
            [1, 0, 1, 0, 1],
            [1, 1, 1, 1, 1]
        ],
        [
            [0, 0, 0, 0, 0],
            [0, 1, 1, 1, 0],
            [0, 1, 0, 1, 0],
            [0, 1, 1, 1, 0],
            [0, 0, 0, 0, 0]
        ]
    ];

    let score = 0;
    let timerSeconds = 60;
    let timerInterval;

    const levelTitleElement = document.getElementById("level-number");
    const scoreElement = document.getElementById("score");
    const timerElement = document.getElementById("timer");
    const hintButton = document.getElementById("hint-btn");
    const submitButton = document.getElementById("submit-btn");
    const feedbackElement = document.getElementById("feedback");

    function startGame() {
        resetGame();
        loadPuzzle();
        drawPuzzle();
        updateUI();

        // Set up timer
        timerInterval = setInterval(updateTimer, 1000);
    }

    function resetGame() {
        score = 0;
        timerSeconds = 60;
        clearInterval(timerInterval);
        feedbackElement.innerText = "";
    }

    function loadPuzzle() {
        // Generate a random puzzle for the current level
        currentPuzzle = generateRandomPuzzle();
        displayPuzzlePattern(); // Show the puzzle pattern to the player
    }

    function generateRandomPuzzle() {
        const puzzle = [];
        for (let row = 0; row < gridSize; row++) {
            puzzle[row] = [];
            for (let col = 0; col < gridSize; col++) {
                puzzle[row][col] = Math.random() < 0.5 ? 1 : 0; // 50% chance for each cell to be filled
            }
        }
        return puzzle;
    }

    function drawPuzzle() {
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const x = col * cellSize;
                const y = row * cellSize;

                // Draw filled or empty cells based on the current puzzle
                ctx.fillStyle = currentPuzzle[row][col] ? "#000" : "#fff";
                ctx.fillRect(x, y, cellSize, cellSize);

                // Draw grid lines
                ctx.strokeStyle = "#ccc";
                ctx.strokeRect(x, y, cellSize, cellSize);
            }
        }
    }

    function displayPuzzlePattern() {
        const pattern = puzzlePatterns[currentLevel - 1];
        let patternText = "Puzzle Pattern:\n";
        for (let row = 0; row < gridSize; row++) {
            patternText += pattern[row].join(" ") + "\n";
        }
        document.getElementById("puzzle-pattern").innerText = patternText;
    }

    function handleInput(event) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // Convert mouse coordinates to grid coordinates
        const col = Math.floor(mouseX / cellSize);
        const row = Math.floor(mouseY / cellSize);

        // Toggle the cell's value when clicked
        currentPuzzle[row][col] = 1 - currentPuzzle[row][col];

        // Redraw the puzzle
        drawPuzzle();
    }

    function getHint() {
        const emptyCells = getEmptyCells();
        if (emptyCells.length > 0) {
            const randomEmptyCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const [row, col] = randomEmptyCell;
            currentPuzzle[row][col] = 1; // Fill the randomly selected empty cell
            drawPuzzle();
        }
    }

    function getEmptyCells() {
        const emptyCells = [];
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                if (currentPuzzle[row][col] === 0) {
                    emptyCells.push([row, col]);
                }
            }
        }
        return emptyCells;
    }

    function updateUI() {
        levelTitleElement.innerText = `Level ${currentLevel}`;
        scoreElement.innerText = `Score: ${score}`;
        timerElement.innerText = `Time left: ${timerSeconds} seconds`;
    }

    function updateTimer() {
        timerSeconds--;
        updateUI();

        if (timerSeconds <= 0) {
            endGame("Time's up! Your final score is");
        }
    }

    function endGame(messagePrefix) {
        clearInterval(timerInterval);
        alert(`${messagePrefix} ${score}.`);
        startNextLevel();
    }

    function submitPuzzle() {
        const isPuzzleCorrect = checkPuzzle();
        if (isPuzzleCorrect) {
            score += calculateScore();
            feedbackElement.innerText = `Correct! You earned ${calculateScore()} points.`;
            setTimeout(() => {
                feedbackElement.innerText = "";
            }, 3000); // Clear feedback after 3 seconds
            startNextLevel();
        } else {
            feedbackElement.innerText = "Incorrect. Please review your solution.";
            setTimeout(() => {
                feedbackElement.innerText = "";
            }, 3000); // Clear feedback after 3 seconds
        }
    }

    function checkPuzzle() {
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                if (currentPuzzle[row][col] !== puzzlePatterns[currentLevel - 1][row][col]) {
                    return false;
                }
            }
        }
        return true;
    }

    function calculateScore() {
        const baseScore = 100;
        const timeBonus = Math.max(0, (timerSeconds / 60) * 50); // Max 50 bonus points for completing within 60 seconds
        return baseScore + timeBonus;
    }

    function startNextLevel() {
        currentLevel++;
        if (currentLevel > puzzlePatterns.length) {
            endGame("Congratulations! You completed all levels with a total score of");
            resetGame();
        } else {
            loadPuzzle();
            drawPuzzle();
            updateUI();
            timerSeconds = 60; // Reset timer for the next level
        }
    }

    // Event listeners for mouse clicks
    canvas.addEventListener("click", handleInput);
    hintButton.addEventListener("click", getHint);
    submitButton.addEventListener("click", submitPuzzle);

    // Event listener for the "Start" button
    document.getElementById("start-btn").addEventListener("click", function () {
        document.getElementById("start-screen").classList.add("hidden");
        document.getElementById("game-screen").classList.remove("hidden");
        startGame();
    });

});
