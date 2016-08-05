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
        DIRECTION = { NONE: 0, LEFT: 1, RIGHT: 2 },                        // useful enum for declaring an abstract direction
        STEP = { FRAMES: 8, W: COL_WIDTH / 10, H: ROW_HEIGHT },            // attributes of player stepping up
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

    /* PLAYER */

    let Player = {

        init: function () {

            this.x = col2x(0.5);                        // player x-coord
            this.y = row2y(0);                          // player y-coord
            this.w = PLAYER_WIDTH;
            this.h = PLAYER_HEIGHT;
            this.dx = 0;                                // deltaX (player horizontal speed (meters per second))
            this.dy = 0;                                // deltaY (player vertical speed (meters per second))
            this.gravity = PIXELS_IN_METER * GRAVITY;
            this.maxdX = PIXELS_IN_METER * MAX_DELTA_X; // max deltaX (player max horizontal speed (meters per second))
            this.maxdY = PIXELS_IN_METER * MAX_DELTA_Y; // max deltaY (player max vertical speed (meters per second))
            this.impulse = PIXELS_IN_METER * IMPULSE;   // player jump impulse
            this.accel = this.maxdX / ACCELERATION;     // player horizontal acceleration
            this.friction = this.maxdX / FRICTION;      // player horizontal friction
            this.input = { left: false, right: false, jump: false, jumpAvailable: true };
            this.falling = false;
            this.stepping = DIRECTION.NONE,
            this.collision = this.createCollisionPoints();
            this.animation = PLAYER.STAND;

            return this;

        },

        createCollisionPoints: function () {

            return {
                topLeft: { x: -this.w / 4, y: this.h - 2 },
                topRight: { x: this.w / 4, y: this.h - 2 },
                middleLeft: { x: -this.w / 2, y: this.h / 2 },
                middleRight: { x: this.w / 2, y: this.h / 2 },
                bottomLeft: { x: -this.w / 4, y: 0 },
                bottomRight: { x: this.w / 4, y: 0 },
                underLeft: { x: -this.w / 4, y: -1 },
                underRight: { x: this.w / 4, y: -1 }
            };

        },

        update: function (deltaTime) {

            this.animate();

            let wasLeft = this.dx < 0,
                wasRight = this.dx > 0,
                falling = this.falling,
                friction = this.friction * (this.falling ? 0.5 : 1),
                accel = this.accel * (this.falling ? 0.5 : 1);

            if (this.stepping)
                return this.stepUp();

            this.ddx = 0;
            this.ddy = falling ? -this.gravity : 0;

            if (this.input.left)
                this.ddx = this.ddx - accel;
            else if (wasLeft)
                this.ddx = this.ddx + friction;

            if (this.input.right)
                this.ddx = this.ddx + accel;
            else if (wasRight)
                this.ddx = this.ddx - friction;

            if (this.input.jump && (!falling || this.fallingJump))
                this.performJump();

            this.updatePosition(deltaTime);

            while (this.checkCollision()) {
                // iterate until no more collisions
            }

            // clamp deltaX at zero to prevent friction from making us jiggle side to side
            if ((wasLeft && (this.dx > 0)) || (wasRight && (this.dx < 0))) {
                this.dx = 0;
            }

            // if falling, track short period of time during which we're falling but can still jump
            if (this.falling && (this.fallingJump > 0)) {
                this.fallingJump = this.fallingJump - 1;
            }

            if (this.falling && (this.fallingJump === 0) && (this.y < 0)) {
                this.dy = 0;
            }

        },

        updatePosition: function (deltaTime) {

            this.x = normalizeX(this.x + (deltaTime * this.dx));
            this.y = this.y + (deltaTime * this.dy);
            this.dx = Game.Math.bound(this.dx + (deltaTime * this.ddx), -this.maxdX, this.maxdX);
            this.dy = Game.Math.bound(this.dy + (deltaTime * this.ddy), -this.maxdY, this.maxdY);

        },

        animate: function () {

            if (this.input.left || (this.stepping === DIRECTION.LEFT))
                Game.animate(FRAMES_PER_SECOND, this, PLAYER.LEFT);
            else if (this.input.right || (this.stepping === DIRECTION.RIGHT))
                Game.animate(FRAMES_PER_SECOND, this, PLAYER.RIGHT);
            else
                Game.animate(FRAMES_PER_SECOND, this, PLAYER.STAND);

        },

        updateCollisionPoint: function (point) {

            point.row = y2row(this.y + point.y);
            point.col = x2col(this.x + point.x);
            point.cell = playground.getCell(point.row, point.col);
            point.blocked = point.cell.platform;
            point.platform = point.cell.platform;

        },

        checkCollision: function () {

            let falling = this.falling,
                fallingUp = this.falling && (this.dy > 0),
                fallingDown = this.falling && (this.dy <= 0),
                runningLeft = this.dx < 0,
                runningRight = this.dx > 0,
                tl = this.collision.topLeft,     // top-left
                tr = this.collision.topRight,    // top-right
                ml = this.collision.middleLeft,  // middle-left
                mr = this.collision.middleRight, // middle-right
                bl = this.collision.bottomLeft,  // bottom-left
                br = this.collision.bottomRight, // bottom-right
                ul = this.collision.underLeft,   // under-left
                ur = this.collision.underRight;  // under-right

            this.updateCollisionPoint(tl);
            this.updateCollisionPoint(tr);
            this.updateCollisionPoint(ml);
            this.updateCollisionPoint(mr);
            this.updateCollisionPoint(bl);
            this.updateCollisionPoint(br);
            this.updateCollisionPoint(ul);
            this.updateCollisionPoint(ur);

            if (fallingDown && bl.blocked && !ml.blocked && !tl.blocked && nearRowSurface(this.y + bl.y, bl.row))
                return this.collideDown(bl);

            if (fallingDown && br.blocked && !mr.blocked && !tr.blocked && nearRowSurface(this.y + br.y, br.row))
                return this.collideDown(br);

            if (fallingUp && tl.blocked && !ml.blocked && !bl.blocked)
                return this.collideUp(tl);

            if (fallingUp && tr.blocked && !mr.blocked && !br.blocked)
                return this.collideUp(tr);

            if (runningRight && tr.blocked && !tl.blocked)
                return this.collide(tr);

            if (runningRight && mr.blocked && !ml.blocked)
                return this.collide(mr);

            if (runningRight && br.blocked && !bl.blocked) {
                if (falling)
                    return this.collide(br);
                else
                    return this.startSteppingUp(DIRECTION.RIGHT);
            }

            if (runningLeft && tl.blocked && !tr.blocked)
                return this.collide(tl, true);

            if (runningLeft && ml.blocked && !mr.blocked)
                return this.collide(ml, true);

            if (runningLeft && bl.blocked && !br.blocked) {
                if (falling)
                    return this.collide(bl, true);
                else
                    return this.startSteppingUp(DIRECTION.LEFT);
            }

            if (!falling && !ul.blocked && !ur.blocked)
                return this.startFalling(true);

            return false; // done, we didn't collide with anything

        },

        startFalling: function (allowFallingJump) {

            this.falling = true;
            this.fallingJump = allowFallingJump ? FALLING_JUMP : 0;

        },

        collide: function (point, left) {

            this.x = normalizeX(col2x(point.col + (left ? 1 : 0)) - point.x);
            this.dx = 0;

            return true;

        },

        collideUp: function (point) {

            this.y = row2y(point.row) - point.y;
            this.dy = 0;

            return true;

        },

        collideDown: function (point) {

            this.y = row2y(point.row + 1);
            this.dy = 0;
            this.falling = false;

            return true;

        },

        performJump: function () {

            this.dy = 0;
            this.ddy = this.impulse; // an instant big force impulse
            this.startFalling(false);
            this.input.jump = false;

        },

        startSteppingUp: function (direction) {

            this.stepping = direction;
            this.stepCount = STEP.FRAMES;
            return false; // NOT considered a collision

        },

        stepUp: function () {

            let left = (this.stepping === DIRECTION.LEFT),
                dx = STEP.W / STEP.FRAMES,
                dy = STEP.H / STEP.FRAMES;

            this.dx = 0;
            this.dy = 0;
            this.x = normalizeX(this.x + (left ? -dx : dx));
            this.y = this.y + dy;

            if (--(this.stepCount) === 0)
                this.stepping = DIRECTION.NONE;

        }
    };

    /* RENDERER */

    let Renderer = {

        init: function (images) {

            this.images = images;
            this.canvas = Game.Canvas.init(document.getElementById('canvas'), CANVAS_WIDTH, CANVAS_HEIGHT);
            this.ctx = this.canvas.getContext('2d');
            this.ground = this.createGround();
            this.platformWidth = COL_WIDTH;

            return this;

        },

        //-------------------------------------------------------------------------

        render: function (deltaTime) {

            player.rx = normalizeX(Game.Math.lerp(player.x, player.dx, deltaTime));
            player.ry = Game.Math.lerp(player.y, player.dy, deltaTime);

            player.ry = Math.max(0, player.ry); // don't let sub-frame interpolation take the player below the horizon

            this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            this.ctx.save();
            this.ctx.translate(CANVAS_WIDTH / 2, 0);
            this.renderFront(this.ctx);
            this.renderGround(this.ctx);
            this.renderPlayer(this.ctx);
            this.ctx.restore();

        },

        //-------------------------------------------------------------------------

        renderGround: function (ctx) {

            let ground = this.ground,
                x = ground.w * (player.rx / playground.width),
                y = ty(0),
                w = Math.min(CANVAS_WIDTH, ground.w - x),
                w2 = CANVAS_WIDTH - w;

            ctx.drawImage(ground.image, x, 0, w, ground.h, -CANVAS_WIDTH / 2, y, w, ground.h);

            if (w2 > 0)
                ctx.drawImage(ground.image, 0, 0, w2, ground.h, -CANVAS_WIDTH / 2 + w, y, w2, ground.h);

        },

        //-------------------------------------------------------------------------

        renderBack: function (ctx) {

            ctx.strokeStyle = playground.color.stroke;
            ctx.lineWidth = 2;

            let left = x2col(player.rx - playground.width / 4),
                right = x2col(player.rx + playground.width / 4);

            this.renderQuadrant(ctx, normalizeColumn(left - 3), left, +1);
            this.renderQuadrant(ctx, normalizeColumn(right + 3), right, -1);

        },

        //-------------------------------------------------------------------------

        renderFront: function (ctx) {

            ctx.strokeStyle = playground.color.stroke;
            ctx.lineWidth = 2;

            let left = x2col(player.rx - playground.width / 4),
                center = x2col(player.rx),
                right = x2col(player.rx + playground.width / 4);

            this.renderQuadrant(ctx, left, normalizeColumn(center + 0), +1);
            this.renderQuadrant(ctx, right, normalizeColumn(center - 1), -1);

        },

        //-------------------------------------------------------------------------

        renderQuadrant: function (ctx, min, max, direction) {

            let r, y, cell,
                rmin = Math.max(0, y2row(player.ry - HORIZON_HEIGHT) - 1),
                rmax = Math.min(playground.rows - 1, rmin + (CANVAS_HEIGHT / ROW_HEIGHT + 1)),
                c = min;

            while (c !== max) {

                for (r = rmin; r <= rmax; r++) {

                    y = ty(r * ROW_HEIGHT);
                    cell = playground.getCell(r, c);

                    if (cell.platform)
                        this.renderPlatform(ctx, c, y);
                }

                c = normalizeColumn(c + direction);
            }

        },

        //-------------------------------------------------------------------------

        renderPlatform: function (ctx, col, y) {

            let x = col2x(col + 0.5),
                x0 = tx(x),
                x1 = x0 - this.platformWidth / 2,
                x2 = x0 + this.platformWidth / 2;

            ctx.fillStyle = playground.color.platform;
            ctx.fillRect(x1, y - ROW_HEIGHT, x2 - x1, ROW_HEIGHT);
            ctx.lineWidth = 1;
            ctx.strokeRect(x1, y - ROW_HEIGHT, x2 - x1, ROW_HEIGHT);

        },

        //-------------------------------------------------------------------------

        renderPlayer: function (ctx) {

            ctx.drawImage(
                this.images.player,
                player.animation.x + (player.animationFrame * player.animation.w),
                player.animation.y,
                player.animation.w,
                player.animation.h,
                tx(player.rx) - player.w / 2,
                ty(player.ry) - player.h,
                player.w,
                player.h);

        },

        //-------------------------------------------------------------------------

        createGround: function () {

            let w = CANVAS_WIDTH * GROUND_SPEED,
                h = HORIZON_HEIGHT,
                tile = this.images.ground,
                tw = tile.width,
                th = tile.height,
                max = Math.floor(w / tile.width),
                dw = w / max,
                image = Game.Canvas.render(w, h, function (ctx) {

                    for (let n = 0; n < max; n++)
                        ctx.drawImage(tile, 0, 0, tw, th, n * dw, 0, dw, h);
                });

            return { w: w, h: h, image: image };

        }

    };

    /* VARIABLES */

    let playground,
        player,
        renderer;

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

        // load multiple images and callback when ALL images have loaded
        Game.Load.images(IMAGES, function (images) {

            // SETUP
            playground = Object.create(Playground).init(levelData);
            player = Object.create(Player).init();
            renderer = Object.create(Renderer).init(images);

            document.addEventListener('keydown', function (event) {
                return onkey(event, event.keyCode, true);
            }, false);

            document.addEventListener('keyup', function (event) {
                return onkey(event, event.keyCode, false);
            }, false);

            let now,
                deltaTime = 0,
                last = Game.Math.timestamp(),
                oneFrameTime = 1 / FRAMES_PER_SECOND;

            //===== Game Loop =====//

            function frame() {

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
        });
    }

    /* PLAY THE GAME! */

    run();

})();
