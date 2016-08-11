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
                "                                                           o                                                                        ",
                "X                        X                                                                                                          ",
                "X                                            oo            X                                                                        ",
                "X            X                                                                                                                      ",
                "X                oo            o             XX               X            X                                    X                   ",
                "X                                                       X                                oo      XX         X            ooooo      ",
                "X         o      XX  XX  ^   XXX   X                                                        XX                         X            ",
                "X          ^            XX             XXX                       X       XX     XX       XX         XXXXXX         X   XXXXX XX XX  ",
                "X   o    XXX                                      X   X                X                                                            ",
                "X    ^                                                               XXX              X                                             ",
                "X ^XXX                         ^                                                                                                    ",
                "X X    ^                       XX                                                                                                   ",
                "XX     X                                                                                                                            "
            ]
        },
        {
            "name": "Level 2",
            "color": {
                "platform": "#c0392b",
            },
            "map": [
                "                                   X                                                                                                ",
                "                                                                                                                                    ",
                "                                                                                                                                    ",
                "X                                                                                                                                   ",
                "X                        X                                                                                                          ",
                "X                                                          X                                                                        ",
                "X            X                                                                                                                      ",
                "X                oo            o             XX               X            X                                    X                   ",
                "X                                                       X                                        XX         X                       ",
                "X         o      XX  XX  ^   XXX   X                                                        XX                         X            ",
                "X          ^            XX             XXX                       X       XX     XX       XX         XXXXXX         X   XXXXX XX  XX ",
                "X   o    XXX                                      X   X                X                                                            ",
                "X    ^                                                               XXX              X                                             ",
                "X ^XXX                         ^                                                                                                    ",
                "X X    ^                       XX                                                                                                   ",
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