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
                "X                        X                                                                                                          ",
                "X                                                          X                                                                        ",
                "X            X                                                                                                                      ",
                "X                                            XX               X            X                                    X                   ",
                "X                oo            o                        X                                        XX         X                       ",
                "X                XX  XX  ^   XXX   X                                                        XX                         X            ",
                "X         o^            XX             XXX                       X       XX     XX       XX         XXXXXX         X   XXXXX XX XX  ",
                "X        XXX                                      X   X                X                                                            ",
                "X   o^                                                               XXX              X                                             ",
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
                "X                                                                                                                                   ",
                "X                        X                                                                                                          ",
                "X                                                          X                                                                        ",
                "X            X                                                                                                                      ",
                "X                                            XX               X            X                                    X                   ",
                "X                oo            o                        X                                        XX         X                       ",
                "X                XX  XX  ^   XXX   X                                                        XX                         X            ",
                "X         o^            XX             XXX                       X       XX     XX       XX         XXXXXX         X   XXXXX XX  XX ",
                "X        XXX                                      X   X                X                                                            ",
                "X   o^                                                               XXX              X                                             ",
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