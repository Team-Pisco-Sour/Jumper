/* CONSTANTS */

const FRAMES_PER_SECOND = 60,                                          // 'update' frame rate fixed at 60fps independent of rendering loop
    CANVAS_WIDTH = 720,                                                // may have various width
    CANVAS_HEIGHT = 540,                                               // ... and 4:3 width:height ratio
    HORIZON_HEIGHT = CANVAS_HEIGHT / 3,                                // how much ground to show below the playground
    PIXELS_IN_METER = CANVAS_HEIGHT / 20,                              // how many pixels represent 1 meter
    COL_WIDTH = PIXELS_IN_METER * 3,                                   // 2D column width
    ROW_HEIGHT = PIXELS_IN_METER,                                      // 2D row height
    ROW_SURFACE = ROW_HEIGHT * 0.3,                                    // amount of row considered 'near' enough to surface to allow jumping onto that row (instead of bouncing off again)
    PLAYER_WIDTH = PIXELS_IN_METER * 1.5,                              // player logical width
    PLAYER_HEIGHT = PIXELS_IN_METER * 2,                               // player logical height
    GROUND_SPEED = 2,                                                  // how fast ground scrolls left-right
    GRAVITY = 9.8 * 3.5,//1.5,                                         // gravity
    MAX_DELTA_X = 10,                                                  // player max horizontal speed (meters per second)
    MAX_DELTA_Y = (ROW_SURFACE * FRAMES_PER_SECOND / PIXELS_IN_METER), // player max vertical speed (meters per second) - ENSURES CANNOT FALL THROUGH PLATFORM SURFACE
    ACCELERATION = 1 / 4,                                              // player take 1/4 second to reach maxDeltaX (horizontal acceleration)
    FRICTION = 1 / 8,                                                  // player take 1/8 second to stop from maxDeltaX (horizontal friction)
    IMPULSE = 1500 * FRAMES_PER_SECOND,                                // player jump impulse
    FALLING_JUMP = FRAMES_PER_SECOND / 5,                              // player allowed to jump for 1/5 second after falling off a platform
    STEP = {FRAMES: 8, W: COL_WIDTH / 10, H: ROW_HEIGHT},              // attributes of player stepping up
    COIN = {                                                           // coin properties
        WIDTH: 1.5 * ROW_HEIGHT,
        HEIGHT: 1.5 * ROW_HEIGHT,
        AMOUNT: 50
    },
    SPIKES = {WIDTH: COL_WIDTH, HEIGHT: ROW_HEIGHT},               // spikes size
    DIRECTION = {NONE: 0, LEFT: 1, RIGHT: 2},                          // useful enum for declaring an abstract direction
    IMAGES = {                                                         // image file ID's
        groundImgID: 'ground',
        playerImgID: 'player',
        coinImgID: 'coin',
        spikesImgID: 'spikes'
    },
    PLAYER = {
        RIGHT: {x: 1008, y: 0, w: 72, h: 96, frames: 6, fps: 30},    // animation - player running right
        STAND: {x: 1008, y: 0, w: 72, h: 96, frames: 1, fps: 30},    // animation - player standing still
        LEFT: {x: 576, y: 0, w: 72, h: 96, frames: 6, fps: 30}       // animation - player running left
    },
    COLUMNS_FROM_END_OF_LEVEL = 4,                                   // the distance in columns where player is considered to have reached end of level
    VICTORY_TEXT = "Victory!",
    GAME_OVER_TEXT = "Game over! You died!";

/* UTILITY METHODS */
function normalizeX(x) {                                            // wrap x-coord around to stay within playground boundary
    return Game.Math.normalize(x, 0, playground.width);
}
function normalizeColumn(col) {                                     // wrap column  around to stay within playground boundary
    return Game.Math.normalize(col, 0, playground.cols);
}
function x2col(x) {                                                 // convert x-coord to playground column index
    return Math.floor(normalizeX(x) / COL_WIDTH);
}
function y2row(y) {                                                 // convert y-coord to playground row index
    return Math.floor(y / ROW_HEIGHT);
}
function col2x(col) {                                               // convert playground column index to x-coord
    return col * COL_WIDTH;
}
function row2y(row) {                                               // convert playground row index to y-coord
    return row * ROW_HEIGHT;
}
function tx(x) {                                                    // transform x-coord for rendering
    x = normalizeX(x - player.rx);
    if (x > (playground.width / 2)) {
        x = -(playground.width - x);
    }
    return x;
}
function ty(y) {                                                    // transform y-coord for rendering
    return CANVAS_HEIGHT - HORIZON_HEIGHT - (y - player.ry);
}
function nearRowSurface(y, row) {                                   // is y-coord "near" the surface of a playground row
    return y > (row2y(row + 1) - ROW_SURFACE);
}

/* GLOBAL VARIABLES */
let playground,
    player,
    renderer,
    isGamePaused = false,
    button,
    buttonClose,
    buttonInstructions,
    buttonPlayAgain,
    buttonSaveScore,
    level = 0,
    nextLevelAudio = new Audio('./resources/audio/next-level.mp3'),
    mainThemeAudio = new Audio('./resources/audio/main-theme_32-old.mp3'),
    coinSound = new Audio('./resources/audio/coin.mp3'),
    totalPlayerScore = 0,
    frameCounter = 0;

window.addEventListener('load', function () {

    'use strict';

    /* GAME - SETUP/UPDATE/RENDER */
    button = document.getElementById('hide');
    buttonClose = document.getElementById("close");
    buttonInstructions = document.getElementById("instructions-btn");
    buttonPlayAgain = document.getElementById('play-again');
    buttonSaveScore = document.getElementById('save-score');
    //Loop audio
    mainThemeAudio.addEventListener('ended', function () {
        this.currentTime = 0;
        this.play();
    }, false);
    mainThemeAudio.play();

    button.onclick = function () {
        var div = document.getElementById('new-game');
        var divInstructions = document.getElementById('instructions');
        if (div.style.display !== 'none') {
            div.style.display = 'none';
            divInstructions.style.display = 'none';
            isGamePaused = false;
        }
        else {
            div.style.display = 'block';
            isGamePaused = true;
            showGameOverScreen(GAME_OVER_TEXT)
        }
    };

    buttonClose.addEventListener('click', function () {
        var div = document.getElementById('instructions');
        if (div.style.zIndex == '6') {
            div.style.zIndex = '4';
        }
    }, false);

    buttonInstructions.addEventListener('click', function () {
        var div = document.getElementById('instructions');
        if (div.style.zIndex <= '5') {
            div.style.zIndex = '6';
        }
    }, false);

    buttonPlayAgain.addEventListener('click', reset);

    buttonSaveScore.addEventListener('click', saveScore);

    document.addEventListener('keydown', function (event) {
        return onkey(event, event.keyCode, true);
    }, false);

    document.addEventListener('keyup', function (event) {
        return onkey(event, event.keyCode, false);
    }, false);

    document.addEventListener('onPlayerDeath',
        function (event) {
            isGamePaused = true;
            totalPlayerScore = player.score;
            showGameOverScreen(GAME_OVER_TEXT);
        });

    function saveScore() {

        var input = document.getElementById("player-score-name");
        var name = input.value;

        var playerScores = getObjectFromLocalStorage();
        if (!playerScores) {
            playerScores = [];
        }

        playerScores.push({ "name": name, "playerScore": totalPlayerScore });

        playerScores.sort(function (a, b) {
            return parseInt(b.playerScore) - parseInt(a.playerScore);
        });

        //display score
        var scoreBoard = document.getElementById("leaderboard-scores");

        var scoresHolder = document.getElementById("actual-scores");
        scoresHolder.innerHTML = "";

        for (var i = 0; i < playerScores.length; i++) {
            var boldItem = false;
            if (playerScores[i]["name"]==name) {
                boldItem = true;
            }
            var currentScore = document.createElement("li");
            currentScore.innerText = playerScores[i]["name"] + ":" + playerScores[i]["playerScore"];

            if (boldItem) {
                currentScore.className = "focused";
                
            }
            scoresHolder.appendChild(currentScore);
        }

        scoreBoard.style.display = "block";


        setObjectToLocalStorage(playerScores);

       
    }

    function reset() {
        document.getElementById('game-over').style.display = 'none';
        document.getElementById('game-over-overlay').style.display = 'none';
        document.getElementById("leaderboard-scores").style.display = 'none';
        document.getElementById("player-score-name").value = "";
        isGamePaused = false;
        document.getElementById("p1").innerHTML = "GAME OVER!";
        player.score = 0;
        totalPlayerScore = 0;
        renderer.visualized_score = 0;
        level = 0;
        run();
    }

    function onkey(event, key, pressed) {

        let KEY = {SPACE: 32, LEFT: 37, RIGHT: 39}; // input key codes

        switch (key) {
            case KEY.LEFT:
                player.input.left = pressed;
                event.preventDefault();
                return false;
            case KEY.RIGHT:
                player.input.right = pressed;
                event.preventDefault();
                return false;
            case KEY.SPACE:
                event.preventDefault();
                player.input.jump = pressed && player.input.jumpAvailable;
                player.input.jumpAvailable = !pressed;
                break;
        }
    }

    // GAME OVER
    function showGameOverScreen(text) {
        document.getElementById('result').innerText = 'Score: ' + totalPlayerScore;
        document.getElementById('game-over').style.display = 'block';
        document.getElementById('game-over-overlay').style.display = 'block';
        if (text) {
            document.getElementById("p1").innerHTML = text;
        }
    }

    function gotoNextLevel() {
        level++;
        nextLevelAudio.play();
        totalPlayerScore = player.score;
        run();
    }

    function run() {

        let levelData;
        try {
            levelData = window.getLevelData(level);
        }
        catch (ex) {
            isGamePaused = true;
            if (level >= 0) {
                showGameOverScreen(VICTORY_TEXT);
            }
            else {
                throw ex;
            }
            return;
        }

        // SETUP
        player = Object.create(Player).init();
        playground = Object.create(Playground).init(levelData);

        if (!renderer) {
            renderer = Object.create(Renderer).init();
        }

        frameCounter = 0;
        score.innerHTML = totalPlayerScore;

        let now,
            deltaTime = 0,
            last = Game.Math.timestamp(),
            oneFrameTime = 1 / FRAMES_PER_SECOND;

        //===== Game Loop =====//

        function frame() {
            if (isGamePaused) {
                return;
            }

            now = Game.Math.timestamp();
            deltaTime = deltaTime + Math.min(1, (now - last) / 1000);

            while (deltaTime > oneFrameTime) {

                deltaTime = deltaTime - oneFrameTime;

                // UPDATE
                player.update(oneFrameTime);
            }
            // RENDER
            renderer.render(deltaTime);

            frameCounter += 1;

            if (frameCounter === 96)
                frameCounter = 0;

            last = now;
            if (x2col(player.x) > playground.cols - COLUMNS_FROM_END_OF_LEVEL) {
                gotoNextLevel();
                return;
            }
            requestAnimationFrame(frame);
        }

        //===== Game Loop =====//

        frame();
    }

    /* START THE GAME! */
    run();
});
