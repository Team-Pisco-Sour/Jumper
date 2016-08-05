
/* GAME LOOP */

let Game = {

    animate: function (fps, entity, animation) {
        animation = animation || entity.animation;
        entity.animationFrame = entity.animationFrame || 0;
        entity.animationCounter = entity.animationCounter || 0;

        if (entity.animation !== animation) {
            entity.animation = animation;
            entity.animationFrame = 0;
            entity.animationCounter = 0;
        }
        else if (++(entity.animationCounter) === Math.round(fps / animation.fps)) {
            entity.animationFrame = Game.Math.normalize(entity.animationFrame + 1, 0, entity.animation.frames);
            entity.animationCounter = 0;
        }
    }

};

/* CANVAS UTILITIES */

Game.Canvas = {

    init: function (canvas, width, height) {
        canvas.width = width;
        canvas.height = height;

        return canvas;
    },

    create: function (width, height) {
        return this.init(document.createElement('canvas'), width, height);
    },    

    render: function (width, height, render, canvas) {
        canvas = canvas || this.create(width, height);
        render(canvas.getContext('2d'), width, height);

        return canvas;
    }
};

/* ASSET LOADING UTILITIES */

Game.Load = {

    // load multiple images and callback when ALL images have loaded
    images: function (names, callback) { 

        let name,
            result = {},
            count = names.length,
            onload = function () {
                if (--count === 0) {
                    callback(result);
                }
            };

        for (let i = 0, len = names.length; i < len; i += 1) {
            name = names[i];

            result[name] = document.createElement('img');

            result[name].addEventListener('load', onload);

            result[name].src = "img/" + name + ".png";
        }
    }
};

/* MATH UTILITIES */

Game.Math = {

    lerp: function (n, deltaN, deltaTime) {
        return n + (deltaN * deltaTime);
    },

    timestamp: function () {
        return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
    },

    bound: function (x, min, max) {
        return Math.max(min, Math.min(max, x));
    },

    normalize: function (n, min, max) {
        while (n < min) {
            n += (max - min);
        }

        while (n >= max) {
            n -= (max - min);
        }

        return n;
    }
};
