var rows = 8;
var columns = 10;
var cells;
var cellSize = 64;
var thingCells = {};
var correctCell;
var button;
var clueText;
var main = {
    preload: function() {
        game.load.spritesheet('cell', 'cellSprite.png', cellSize, cellSize);
        game.load.image('button', 'button.png');
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
            }, {
                name: "castle",
                colour: 0x67646E
            }, {
                name: "beacon",
                colour: 0xFFD324
            }, {
                name: "bridge",
                colour: 0x5E3613
            }, {
                name: "cave",
                colour: 0x595959
            }, {
                name: "ship",
                colour: 0xB58E6D
            }, {
                name: "beach",
                colour: 0xF0D175
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
                cell.isCorrect = false;
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
        while(cells[correctCellCoords.row][correctCellCoords.column].thing) {
            correctCellCoords = getRandomCell();
        }
        correctCell = cells[correctCellCoords.row][correctCellCoords.column];
        correctCell.isCorrect = true;
        correctCell.descriptions = describeCell(correctCell);
        var text = correctCell.descriptions[0].description;
        var style = { font: "12px Arial", fill: "#dddddd", align: "center" };
        clueText = game.add.text(0, 550, text, style);

        button = game.add.button(game.world.width - 150, game.world.height - 50, 'button', onButtonPressed);
    },
    update: function() {

    }
};

function onButtonPressed() {
    var descriptionCount = correctCell.descriptions.length;
    console.log(descriptionCount);
    var index = Math.floor(Math.random() * descriptionCount);
    console.log(index);
    clueText.text = correctCell.descriptions[index].description;
}

function getRandomColour() {
    return parseInt(Math.floor(Math.random() * (16777215)).toString(16), 16);
}
function getRandomCell() {
    return {row: Math.floor(Math.random() * rows), column: Math.floor(Math.random() * columns)};
}
function describeCell(cell) {
    // cell.frame = cell.isCorrect ? 2 : 1;
    var cellDescriptions = [];
    for (var key in thingCells) {
        var thingCell = thingCells[key];
        var colDist = thingCell.column - cell.column;
        var rowDist = thingCell.row - cell.row;
        var description = getNaturalLanguage(colDist, rowDist, key);
        if (description.description) {
            cellDescriptions.push(description);
        }
    }
    cellDescriptions.sort(function(a, b) {
        return a.distance - b.distance;
    });
    return cellDescriptions;
}
function onCellClicked(cell) {
    cell.frame = cell.isCorrect ? 2 : 1;
}
function getNaturalLanguage(colDist, rowDist, name) {
    var direction, description, language;
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
    var distance = Math.abs(colDist) + Math.abs(rowDist);
    switch (distance) {
        case 0:
            description = "At a %s";
            break;
        case 1:
        case 2:
            description = "Next to a %s";
            break;
        case 3:
        case 4:
            description = "There's a %s quite close to the " + direction;
            break;
        case 5:
        case 6:
            description = "There's a %s in the distance to the " + direction;
            break;
    }
    if (description) {
        description = description.replace("%s", name);
    }
    return {description: description, distance: distance};
}

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'gameDiv');
game.state.add('main', main);
game.state.start('main');