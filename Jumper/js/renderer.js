
/* RENDERER */

let Renderer = {

    init: function () {

        this.canvas = document.getElementById('canvas');
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;

        this.ctx = this.canvas.getContext('2d');

        this.stars = this.createStars();
        this.ground = this.createGround();
        this.score = document.getElementById('score');
        this.visualized_score = 0;
        this.platformWidth = COL_WIDTH;

        return this;
    },

    render: function (deltaTime) {

        player.rx = normalizeX(Game.Math.lerp(player.x, player.dx, deltaTime));
        player.ry = Game.Math.lerp(player.y, player.dy, deltaTime);

        player.ry = Math.max(0, player.ry); // don't let sub-frame interpolation take the player below the horizon

        this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        this.renderStars(this.ctx);
        this.ctx.save();
        this.ctx.translate(CANVAS_WIDTH / 2, 0);
        this.renderFront(this.ctx);
        this.renderGround(this.ctx);
        this.renderPlayer(this.ctx);
        this.renderScore(this.ctx);
        this.ctx.restore();
    },

    renderStars: function (ctx) {

        ctx.drawImage(this.stars, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    },

    renderGround: function (ctx) {

        let ground = this.ground,
            x = ground.w * (player.rx / playground.width),
            y = ty(0),
            w = Math.min(CANVAS_WIDTH, ground.w - x),
            w2 = CANVAS_WIDTH - w;

        ctx.drawImage(ground.image, x, 0, w, ground.h, -CANVAS_WIDTH / 2, y, w, ground.h);

        if (w2 > 0) {
            ctx.drawImage(ground.image, 0, 0, w2, ground.h, -CANVAS_WIDTH / 2 + w, y, w2, ground.h);
        }
    },

    renderBack: function (ctx) {

        ctx.strokeStyle = playground.color.stroke;
        ctx.lineWidth = 2;

        let left = x2col(player.rx - playground.width / 4),
            right = x2col(player.rx + playground.width / 4);

        this.renderQuadrant(ctx, normalizeColumn(left - 3), left, +1);
        this.renderQuadrant(ctx, normalizeColumn(right + 3), right, -1);
    },

    renderFront: function (ctx) {

        ctx.strokeStyle = playground.color.stroke;
        ctx.lineWidth = 2;

        let left = x2col(player.rx - playground.width / 4),
            center = x2col(player.rx),
            right = x2col(player.rx + playground.width / 4);

        this.renderQuadrant(ctx, left, normalizeColumn(center + 0), +1);
        this.renderQuadrant(ctx, right, normalizeColumn(center - 1), -1);

    },

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
                else if (cell.coin)
                    this.renderCoin(ctx, c, y);
                else if (cell.spikes)
                    this.renderSpikes(ctx, c, y);
            }

            c = normalizeColumn(c + direction);
        }
    },

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

    renderCoin: function (ctx, col, y) {

        let coinImg = document.getElementById(IMAGES.coinImgID),
            x = col2x(col + 0.5),
            spriteCoins = 32,
            spriteCoinIndex = ((frameCounter / 3) | 0) % 32, // coin rotation delayed
            spriteRow = (spriteCoinIndex / 8) | 0,
            spriteCol = spriteCoinIndex - (spriteRow * 8);

        ctx.drawImage(
            coinImg,
            spriteCol * 64,
            spriteRow * 64,
            64,
            64,
            tx(x) - 64 / 2,
            y - 64,
            coinImg.width / 8,
            coinImg.height / 4);
    },

    renderSpikes: function (ctx, col, y) {

        let spikesImg = document.getElementById(IMAGES.spikesImgID),
            x = col2x(col + 0.5);

        ctx.drawImage(
            spikesImg,
            tx(x) - SPIKES.WIDTH / 2,
            y - SPIKES.HEIGHT,
            SPIKES.WIDTH,
            SPIKES.HEIGHT)
    },

    renderPlayer: function (ctx) {

        let playerImg = document.getElementById(IMAGES.playerImgID);

        ctx.drawImage(
            playerImg,
            player.animation.x + (player.animationFrame * player.animation.w),
            player.animation.y,
            player.animation.w,
            player.animation.h,
            tx(player.rx) - player.w / 2,
            ty(player.ry) - player.h,
            player.w,
            player.h);
    },

    renderScore: function (ctx) {

        if (player.score > this.visualized_score) {
    
            // smooth score increase
            this.visualized_score += 1;
            score.innerHTML = this.visualized_score;
        }
    },

    createStars: function () {

        let starsCanvas = document.createElement('canvas');

        starsCanvas.width = CANVAS_WIDTH;
        starsCanvas.height = CANVAS_HEIGHT;

        let ctx = starsCanvas.getContext('2d'),
            x, y, radius,
            max = 500,
            colors = ["#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"],
            radius_lengths = [0.3, 0.3, 0.3, 0.4, 0.4, 0.4, 0.5, 0.5, 0.5, 0.6, 0.6, 0.7, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3];

        for (let n = 0; n < max; n++) {

            x = Game.Math.randomInt(2, CANVAS_WIDTH - 4);
            y = Game.Math.randomInt(2, CANVAS_HEIGHT - 4);
            radius = Game.Math.randomChoice(radius_lengths);

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.fillStyle = Game.Math.randomChoice(colors);
            ctx.fill();
        }

        return starsCanvas;
    },

    createGround: function () {

        let width = CANVAS_WIDTH * GROUND_SPEED,
            height = HORIZON_HEIGHT,
            groundImg = document.getElementById(IMAGES.groundImgID),
            tile = groundImg,
            max = Math.floor(width / tile.width),
            dw = width / max;

        let groundCanvas = document.createElement('canvas');

        groundCanvas.width = width;
        groundCanvas.height = height;

        let ctx = groundCanvas.getContext('2d');

        for (let n = 0; n < max; n++) {
            ctx.drawImage(tile, 0, 0, tile.width, tile.height, n * dw, 0, dw, height);
        }

        return { w: width, h: height, image: groundCanvas };
    }
};