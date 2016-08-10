/* CONSTANTS */

const FRAMES_PER_SECOND = 60,                                            // 'update' frame rate fixed at 60fps independent of rendering loop
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
    GRAVITY = 9.8 * 3.5,//1.5,                                               // gravity
    MAX_DELTA_X = 10,                                                  // player max horizontal speed (meters per second)
    MAX_DELTA_Y = (ROW_SURFACE * FRAMES_PER_SECOND / PIXELS_IN_METER), // player max vertical speed (meters per second) - ENSURES CANNOT FALL THROUGH PLATFORM SURFACE
    ACCELERATION = 1 / 4,                                              // player take 1/4 second to reach maxDeltaX (horizontal acceleration)
    FRICTION = 1 / 8,                                                  // player take 1/8 second to stop from maxDeltaX (horizontal friction)
    IMPULSE = 1500 * FRAMES_PER_SECOND, //15 * FRAMES_PER_SECOND,                                  // player jump impulse
    FALLING_JUMP = FRAMES_PER_SECOND / 5,                              // player allowed to jump for 1/5 second after falling off a platform
    DIRECTION = { NONE: 0, LEFT: 1, RIGHT: 2 },                        // useful enum for declaring an abstract direction
    STEP = { FRAMES: 8, W: COL_WIDTH / 10, H: ROW_HEIGHT },            // attributes of player stepping up
    IMAGES = {                                                         // image file ID's
        groundImgID: 'ground',
        playerImgID: 'player'
    },
    PLAYER = {
        RIGHT: { x: 1008, y: 0, w: 72, h: 96, frames: 6, fps: 30 },    // animation - player running right
        STAND: { x: 1008, y: 0, w: 72, h: 96, frames: 1, fps: 30 },    // animation - player standing still
        LEFT: { x: 576, y: 0, w: 72, h: 96, frames: 6, fps: 30 }       // animation - player running left
    };

/* UTILITY METHODS */

function normalizeX(x) { return Game.Math.normalize(x, 0, playground.width); }         // wrap x-coord around to stay within playground boundary
function normalizeColumn(col) { return Game.Math.normalize(col, 0, playground.cols); } // wrap column  around to stay within playground boundary
function x2col(x) { return Math.floor(normalizeX(x) / COL_WIDTH); }                    // convert x-coord to playground column index
function y2row(y) { return Math.floor(y / ROW_HEIGHT); }                               // convert y-coord to playground row index
function col2x(col) { return col * COL_WIDTH; }                                        // convert playground column index to x-coord
function row2y(row) { return row * ROW_HEIGHT; }                                       // convert playground row index to y-coord
function tx(x) {                                                                       // transform x-coord for rendering
    x = normalizeX(x - player.rx);
    if (x > (playground.width / 2)) {
        x = -(playground.width - x);
    }

    return x;
}
function ty(y) { return CANVAS_HEIGHT - HORIZON_HEIGHT - (y - player.ry); }       // transform y-coord for rendering
function nearRowSurface(y, row) {                                                 // is y-coord "near" the surface of a playground row
    return y > (row2y(row + 1) - ROW_SURFACE);
}

/* GLOBAL VARIABLES */

let playground,
    player,
    renderer,
    isGamePaused = false;

window.addEventListener('load', function () {

    'use strict';

    /* GAME - SETUP/UPDATE/RENDER */

    function onkey(event, key, pressed) {

        let KEY = { SPACE: 32, LEFT: 37, RIGHT: 39 }; // input key codes

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
                player.input.jump = pressed && player.input.jumpAvailable;
                player.input.jumpAvailable = !pressed;
                break;
        }
    }

    function run() {

        let level = 0,
            levelData = window.getLevelData(level);

        // SETUP
        playground = Object.create(Playground).init(levelData);
        player = Object.create(Player).init();
        renderer = Object.create(Renderer).init();

        document.addEventListener('keydown', function (event) {
            return onkey(event, event.keyCode, true);
        }, false);

        document.addEventListener('keyup', function (event) {
            return onkey(event, event.keyCode, false);
        }, false);

        document.addEventListener('onPlayerDeath',
            function (event) {
                //TODO: show game over screen
                console.log("Player is dead.");
                // isGamePaused = true;
                // showGameOverScreen();
                // tearDown();

            });
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

            last = now;

            requestAnimationFrame(frame);
        }

        //===== Game Loop =====//

        frame();
    }
    /* PLAY THE GAME! */

    run();

});
