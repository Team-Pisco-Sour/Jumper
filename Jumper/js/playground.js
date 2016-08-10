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

    getCell: function (row, col) {

        if (row < 0) {
            return this.ground;
        }

        if (row >= this.rows) {
            return this.air;
        }

        return this.map[row][normalizeColumn(col)];
    },

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