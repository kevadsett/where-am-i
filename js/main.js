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
        game.load.spritesheet('things', 'thingSprite.png', cellSize, cellSize);
        game.load.spritesheet('answer', 'rightWrongSprite.png', cellSize, cellSize);
        game.load.spritesheet('button', 'button.png', 150, 50);
    },
    create: function() {
        game.stage.backgroundColor = 0xd2ba72;
        var graphics = game.add.graphics(0, 0),
            i, row, col, x, y, cell,
            correctCellCoords = getRandomCell(),
            things = [{
                name: "mountain",
                frame: 0
            }, {
                name: "forest",
                frame: 1
            }, {
                name: "swamp",
                frame: 2
            }, {
                name: "field",
                frame: 3
            }, {
                name: "beacon",
                frame: 4
            }, {
                name: "bridge",
                frame: 5
            }, {
                name: "cave",
                frame: 6
            }/*, {
                name: "ship",
                colour: 0xB58E6D
            }, {
                name: "beach",
                colour: 0xF0D175
            }*/];
        graphics.beginFill(0);
        graphics.drawRect(0, game.world.height - 50, game.world.width, 50);
        cells = new Array(rows);
        for (i = 0; i < cells.length; i++) {
            cells[i] = new Array(columns);
        }
        for (row = 0; row < rows; row++) {
            for (col = 0; col < columns; col++) {
                var x = cellSize * col,
                    y = cellSize * row;
                cell = game.add.sprite(x, y, 'things', 12);
                cell.events.onInputDown.add(onCellClicked, this);
                cell.inputEnabled = true;
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
            cell.frame = thing.frame;
           /* var thing = things.splice(Math.floor(Math.random() * things.length), 1)[0];
            graphics.beginFill(thing.colour);
            x = cellSize * coords.column;
            y = cellSize * coords.row;
            graphics.drawRect(x, y, cellSize,cellSize);
            cell.thing = thing;*/
            thingCells[thing.name] = cell;
            // cellText = game.add.text(cell.x, cell.y, thing.name, {font: "12px Arial", fill:"#000000"});
        }
        while(cells[correctCellCoords.row][correctCellCoords.column].thing) {
            correctCellCoords = getRandomCell();
        }
        correctCell = cells[correctCellCoords.row][correctCellCoords.column];
        correctCell.isCorrect = true;
        correctCell.descriptions = describeCell(correctCell);
        correctCell.descriptionIndex = correctCell.descriptions.length - 1;
        var text = correctCell.descriptions[correctCell.descriptionIndex].description;
        var style = { font: "12px Arial", fill: "#dddddd", align: "center" };
        clueText = game.add.text(0, game.world.height - 50, text, style);

        button = game.add.button(game.world.width - 150, game.world.height - 50, 'button', onButtonPressed, this, 0, 0, 1, 0);
    },
    update: function() {

    }
};

function onButtonPressed() {
    var currentDescriptionIndex = correctCell.descriptionIndex - 1;
    if (currentDescriptionIndex < 0) {
        currentDescriptionIndex = correctCell.descriptions.length - 1;
    }
    correctCell.descriptionIndex = currentDescriptionIndex;
    clueText.text = correctCell.descriptions[currentDescriptionIndex].description;
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
    game.add.sprite(cell.x, cell.y, 'answer', cell.isCorrect ? 0 : 1);
    if (cell.isCorrect) {
        clueText.text = "You found me!";
    } else {
        clueText.text = "No that's not it";
    }
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
    console.log(name, colDist, rowDist);
    var distance = Math.max(Math.abs(colDist), Math.abs(rowDist));
    switch (distance) {
        case 0:
            description = "I'm at a %s";
            break;
        case 1:
            description = "I'm next to a %s";
            break;
        case 2:
            description = "I'm pretty near to a %s";
            break;
        case 3:
            description = "I can see a %s close to the " + direction;
            break;
        case 4:
            description = "There's a %s to the " + direction;
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

var game = new Phaser.Game(cellSize * columns, cellSize * rows + 50, Phaser.AUTO, 'gameDiv');
game.state.add('main', main);
game.state.start('main');