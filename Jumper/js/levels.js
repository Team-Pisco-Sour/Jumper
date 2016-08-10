(function () {
    /* 
        Legend:
            X - platform
    */
    let levels = [
        {
            "name": "Level 1",
            "color": {
                "platform": "#467911",
                "stroke": "#C0C0C0"
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
                "                                   X                       X                                                                        ",
                "                                                                                                                                    ",
                "                                                                                                                                    ",
                "                                                                                                                                    ",
                "            X            X                                      X          X                                                        ",
                "                                                        X                                                                           ",
                "                                                                                                                                    ",
                "                                                                                                       X                            ",
                "                                                                                                                                    ",
                "    X                              X                                                                                                ",
                "                        XX                  XXX                 X                   XX               XXXX                   XX      ",
                "         XXX                                      X                                                                                 ",
                "                                                                        X            X                                              ",
                "   XXX                                                                                                                              ",
                "  X                                                                                                                                 ",
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