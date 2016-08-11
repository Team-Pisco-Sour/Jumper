
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

    between: function (n, min, max) {
        return ((n >= min) && (n <= max));
    },

    normalize: function (n, min, max) {
        while (n < min) {
            n += (max - min);
        }

        while (n >= max) {
            n -= (max - min);
        }

        return n;
    },

    random: function (min, max) {
        return (min + (Math.random() * (max - min)));
    },

    randomInt: function (min, max) {
        return Math.round(this.random(min, max));
    },

    randomChoice: function (choices) {
        return choices[this.randomInt(0, choices.length - 1)];
    }
};
