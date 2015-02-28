var rows = 8;
var columns = 10;
var cells;
var cellSize = 64;
var thingCells = {};
var correctCell;
var clueText;
var clueDiv;
var turnsUntilLost;

var main = {
    preload: function() {
        game.load.spritesheet('things', 'thingSprite.png', cellSize, cellSize);
        game.load.spritesheet('answer', 'rightWrongSprite.png', cellSize, cellSize);
    },
    create: function() {
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        clueList = document.getElementById('clueList');
        turnsText = document.getElementById('turnsUntilLost');
        game.stage.backgroundColor = 0xffffff;
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
            }];
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
            cell.thing = thing;
            thingCells[thing.name] = cell;
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
        clueList.innerHTML = "<li>" + text + "</li>";

        events.on('newClue', getNewClue);
        events.on('restart', restart);

        turnsText.innerHTML = turnsUntilLost;
    },
    update: function() {

    }
};

function getNewClue() {
    var currentDescriptionIndex = correctCell.descriptionIndex - 1;
    if (currentDescriptionIndex < 0) {
        currentDescriptionIndex = correctCell.descriptions.length - 1;
    }
    correctCell.descriptionIndex = currentDescriptionIndex;
    clueList.innerHTML += "<li>" + correctCell.descriptions[currentDescriptionIndex].description + "</li>";
    turnsText.innerHTML = --turnsUntilLost;
    if (turnsUntilLost <= 2) {
        var button = document.getElementById('newClueButton');
        button.className = "hidden";
    }
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
    turnsUntilLost = cellDescriptions.length + 1;
    return cellDescriptions;
}
function onCellClicked(cell) {
    if (turnsUntilLost <= 0) return;
    game.add.sprite(cell.x, cell.y, 'answer', cell.isCorrect ? 0 : 1);
    turnsUntilLost--;
    if (cell.isCorrect) {
        $('#cluePanel').addClass('hidden');
        $('#gameWonPanel').removeClass('hidden');
    } else {
        if (turnsUntilLost > 0) {
            turnsText.innerHTML = turnsUntilLost;
        } else {
            $('#cluePanel').addClass('hidden');
            $('#gameLostPanel').removeClass('hidden');
        }
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
        // description += " (distance:" + distance + ")";
    }
    return {description: description, distance: distance};
}

function restart() {
    game.state.start('main');
    $('#cluePanel').removeClass('hidden');
    $('#gameWonPanel').addClass('hidden');
    $('#gameLostPanel').addClass('hidden');
}

var game = new Phaser.Game(cellSize * columns, cellSize * rows, Phaser.AUTO, 'gameDiv');
game.state.add('main', main);
game.state.start('main');