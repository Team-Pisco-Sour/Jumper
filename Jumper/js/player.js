
/* PLAYER */

let Player = {

    init: function () {

        this.x = col2x(0.5);                        // player x-coord
        this.y = row2y(3);                          // player y-coord
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
        this.playerDead = new Event('onPlayerDeath');

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

        if (this.input.left) {

            // we fix most left point of any game level to the beginning of this level
            if (this.x >= COL_WIDTH / 2) {
                this.ddx = this.ddx - accel;
            }
            else {
                this.x = COL_WIDTH / 2;
                this.dx = 0;
                this.ddx = 0;
            }
        }
        else if (wasLeft) {
            this.ddx = this.ddx + friction;
        }

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

        if (this.y <= 0) {
            document.dispatchEvent(this.playerDead);
        }

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