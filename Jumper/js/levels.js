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
                "X                                                       X                                oo      XX         X            o       o  ",
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
                "                         o                                                                                                          ",
                "X                                                          o                                                                        ",
                "X                        X                                                                                                          ",
                "X                                                          X               o                                                        ",
                "X            X                                                                                                 o                    ",
                "X                oo            o             XX         ^     X            X                                               X        ",
                "X    o                                                  X                                o       XX       X    X                 oo ",
                "X         o      XX  X  ^    XXX   X                                                        XX                         X            ",
                "X          ^            XX             XXX                       X     X        XX       XX         XXX            X   XXXXX XX  XX ",
                "X        XXX                                      X   X               XX                                                            ",
                "X                                                                    XXX              X                                             ",
                "X ^                            ^                                    XXXX                                                            ",
                "X X                            XX                                  XXXXX                                                            ",
                "XX    X                                                                                                                             "
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