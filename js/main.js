var rows = 8;
var columns = 10;
var cells;
var cellSize = 64;
var thingCells = {};
var correctCell;
var main = {
    preload: function() {
        game.load.spritesheet('cell', 'cellSprite.png', cellSize, cellSize);
    },
    create: function() {
        game.stage.backgroundColor = 0xffffff;
        var graphics = game.add.graphics(0, 0),
            i, row, col, x, y, cell,
            correctCellCoords = getRandomCell(),
            things = [{
                name: "mountain",
                colour:0xcccccc
            }, {
                name: "forest",
                colour: 0x12cc32
            }, {
                name: "swamp",
                colour: 0x005600
            }];
        graphics.beginFill(0);
        graphics.drawRect(0, 550, 800, 100);
        cells = new Array(rows);
        for (i = 0; i < cells.length; i++) {
            cells[i] = new Array(columns);
        }
        for (row = 0; row < rows; row++) {
            for (col = 0; col < columns; col++) {
                x = cellSize * col;
                y = cellSize * row;
                cell = game.add.sprite(x, y, 'cell');
                cell.inputEnabled = true;
                cell.events.onInputDown.add(onCellClicked, this);
                cell.isCorrect = (row === correctCellCoords.row && col === correctCellCoords.column);
                if (cell.isCorrect) {
                    correctCell = cell;
                }
                cell.row = row;
                cell.column = col;
                cells[row][col] = cell;
            }
        }
        while (things.length > 0) {
            var coords = getRandomCell();
            cell = cells[coords.row][coords.column];
            while (cell.thing) {
                coords = getRandomCell();
                cell = cells[coords.row][coords.column];
            }
            var thing = things.splice(Math.floor(Math.random() * things.length), 1)[0];
            graphics.beginFill(thing.colour);
            x = cellSize * coords.column;
            y = cellSize * coords.row;
            graphics.drawRect(x, y, cellSize,cellSize);
            cell.thing = thing;
            thingCells[thing.name] = cell;
        }

    },
    update: function() {

    }
};

function getRandomColour() {
    return parseInt(Math.floor(Math.random() * (16777215)).toString(16), 16);
}
function getRandomCell() {
    return {row: Math.floor(Math.random() * rows), column: Math.floor(Math.random() * columns)};
}
function onCellClicked(cell) {
    // cell.frame = cell.isCorrect ? 2 : 1;
    for (var key in thingCells) {
        var thingCell = thingCells[key];
        var colDist = thingCell.column - cell.column;
        var rowDist = thingCell.row - cell.row;
        var description = getNaturalLanguage(colDist, rowDist, key);
        if (description) {
            console.log(description);
        }
    }
}
function getNaturalLanguage(colDist, rowDist, name) {
    var direction, distance, language;
    if (rowDist < -1) {
        direction = "North";
    } else if (rowDist > 1) {
        direction = "South";
    }
    if (colDist < -1) {
        direction = direction ? direction + "-west" : "West";
    } else if (colDist > 1) {
        direction = direction ? direction + "-east" : "East";
    }
    var absDist = Math.abs(colDist) + Math.abs(rowDist);
    switch (absDist) {
        case 0:
        case 1:
        case 2:
            distance = "Next to a %s";
            break;
        case 3:
        case 4:
            distance = "Quite near a %s";
            break;
        case 5:
        case 6:
            distance = "There's a %s in the distance.";
            break;
    }
    if (distance) {
        distance = distance.replace("%s", name);
    }
    return distance;
}

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'gameDiv');
game.state.add('main', main);
game.state.start('main');