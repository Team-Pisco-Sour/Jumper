(function () { // private module pattern
    'use strict';

    /* CONSTANTS */

    let FRAMES_PER_SECOND = 60,                                            // 'update' frame rate fixed at 60fps independent of rendering loop
        CANVAS_WIDTH = 720,                                                // may have various width
        CANVAS_HEIGHT = 540,                                               // ... and 4:3 width:height ratio
        HORIZON_HEIGHT = CANVAS_HEIGHT / 5,                                // how much ground to show below the playground
        PIXELS_IN_METER = CANVAS_HEIGHT / 20,                              // how many pixels represent 1 meter
        COL_WIDTH = PIXELS_IN_METER * 3,                                   // 2D column width
        ROW_HEIGHT = PIXELS_IN_METER,                                      // 2D row height
        ROW_SURFACE = ROW_HEIGHT * 0.3,                                    // amount of row considered 'near' enough to surface to allow jumping onto that row (instead of bouncing off again)
        PLAYER_WIDTH = PIXELS_IN_METER * 1.5,                              // player logical width
        PLAYER_HEIGHT = PIXELS_IN_METER * 2,                               // player logical height
        GROUND_SPEED = 2,                                                  // how fast ground scrolls left-right
        GRAVITY = 9.8 * 1.5,                                               // gravity
        MAX_DELTA_X = 10,                                                  // player max horizontal speed (meters per second)
        MAX_DELTA_Y = (ROW_SURFACE * FRAMES_PER_SECOND / PIXELS_IN_METER), // player max vertical speed (meters per second) - ENSURES CANNOT FALL THROUGH PLATFORM SURFACE
        ACCELERATION = 1 / 4,                                              // player take 1/4 second to reach maxDeltaX (horizontal acceleration)
        FRICTION = 1 / 8,                                                  // player take 1/8 second to stop from maxDeltaX (horizontal friction)
        IMPULSE = 15 * FRAMES_PER_SECOND,                                  // player jump impulse
        FALLING_JUMP = FRAMES_PER_SECOND / 5,                              // player allowed to jump for 1/5 second after falling off a platform
        //ICECUBE = { WIDTH: ROW_HEIGHT, HEIGHT: ROW_HEIGHT },             // logical size of iceCube
        DIRECTION = { NONE: 0, LEFT: 1, RIGHT: 2 },                        // useful enum for declaring an abstract direction
        STEP = { FRAMES: 8, W: COL_WIDTH / 10, H: ROW_HEIGHT },            // attributes of player stepping up
        //IMAGES = ['ground', 'player', 'iceCubes'],                       // sprite image files for loading
        IMAGES = ['ground', 'player'],                                     // sprite image files for loading
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
    //function x2a(x) { return 360 * (normalizeX(x) / playground.width); }                   // convert x-coord to an angle around the playground
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

    /* Playground */

    let Playground = {

        init: function (levelData) {

            levelData.map.reverse(); // reverse map to make 0 index the ground, increasing towards the sky

            this.name = levelData.name;
            this.color = levelData.color;
            this.rows = levelData.map.length;
            this.cols = levelData.map[0].length;
            this.width = this.cols * COL_WIDTH;
            this.height = this.rows * ROW_HEIGHT;
            this.map = this.createMap(levelData.map);
            this.ground = { platform: true };
            this.air = { platform: false };

            return this;
        },

        //-------------------------------------------------------------------------

        getCell: function (row, col) {

            if (row < 0) {
                return this.ground;
            }

            if (row >= this.rows) {
                return this.air;
            }

            return this.map[row][normalizeColumn(col)];
        },

        //-------------------------------------------------------------------------

        createMap: function (source) {

            let map = [];

            for (let row = 0; row < this.rows; row += 1) {
                map[row] = [];

                for (let col = 0; col < this.cols; col += 1) {
                    let cell = source[row][col];

                    map[row][col] = {
                        platform: (cell === "X")
                    };
                }
            }

            return map;
        }

    };

    
})();
