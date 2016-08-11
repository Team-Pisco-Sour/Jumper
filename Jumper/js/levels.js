(function () {
    /* 
     Legend:
     X - platform
     o - coin
     ^ - turret
     */
    let levels = [
        {
            "name": "Level 1",
            "color": {
                "platform": "#467911",
            },
            "map": [
                "                                                                                                                                    ",
                "                                                                                                                                    ",
                "                                                                                                                                    ",
                "                                                                                                                                    ",
                "                                                                                                                                    ",
                "                                                                                                                                    ",
                "                                                                                                                                    ",
                "                                                                                                                                    ",
                "                                                                                                                                    ",
                "                                                                                                                                    ",
                "                                                                                                                                    ",
                "                                                                                                                                    ",
                "                                                                                                                                    ",
                "                                                                                                                                    ",
                "                                                                                                                                    ",
                "                                                                                                                                    ",
                "                                                                                                                                    ",
                "                                                                                                                                    ",
                "                                                                                                                                    ",
                "                                                                                                                                    ",
                "                                   X                                                                                                ",
                "                                                                                                                                    ",
                "                                                                                                                                    ",
                "                                                                                                                                    ",
                "                         X                                                                                                          ",
                "                                                           X                                                                        ",
                "             X                                                                                                                      ",
                "                                             XX               X            X                                    X                   ",
                "                 oo            o                        X                                        XX         X                       ",
                "                 XX  XX  ^   XXX   X                                                        XX                         X            ",
                "          o^            XX             XXX                       X       XX     XX       XX         XXXXXX         X   XXXXX XX XX  ",
                "         XXX                                      X   X                X                                                            ",
                "    o^                                                               XXX              X                                             ",
                "  ^XXX                         ^                                                                                                    ",
                "  X    ^                       XX                                                                                                   ",
                "XX     X                                                                                                                            "
            ]
        },
        {
            "name": "Level 2",
            "color": {
                "platform": "#c0392b",
            },
            "map": [
                "                                                                                                                                    ",
                "                                                                                                                                    ",
                "                                                                                                                                    ",
                "                                                                                                                                    ",
                "                                                                                                                                    ",
                "                                                                                                                                    ",
                "                                                                                                                                    ",
                "                                                                                                                                    ",
                "                                                                                                                                    ",
                "                                                                                                                                    ",
                "                                                                                                                                    ",
                "                                                                                                                                    ",
                "                                                                                                                                    ",
                "                                                                                                                                    ",
                "                                                                                                                                    ",
                "                                                                                                                                    ",
                "                                                                                                                                    ",
                "                                                                                                                                    ",
                "                                                                                                                                    ",
                "                                                                                                                                    ",
                "                                   X                                                                                                ",
                "                                                                                                                                    ",
                "                                                                                                                                    ",
                "                                                                                                                                    ",
                "                         X                                                                                                          ",
                "                                                           X                                                                        ",
                "             X                                                                                                                      ",
                "                                             XX               X            X                                    X                   ",
                "                 oo            o                        X                                        XX         X                       ",
                "                 XX  XX  ^   XXX   X                                                        XX                         X            ",
                "          o^            XX             XXX                       X       XX     XX       XX         XXXXXX         X   XXXXX XX  XX ",
                "         XXX                                      X   X                X                                                            ",
                "    o^                                                               XXX              X                                             ",
                "  ^XXX                         ^                                                                                                    ",
                "  X    ^                       XX                                                                                                   ",
                "XX     X                                                                                                                            "
            ]
        }
    ];

    function getLevelData(i) {
        if (i < levels.length) {
            return levels.slice(0)[i];
        } else {
            throw new Error('There is no data for Level:' + i);
        }
    }

    window.getLevelData = getLevelData;
})();