var rows = 8;
var columns = 10;
var cells;
var cellSize = 64;
var thingCells = [];
var correctCell;
var clueText;
var clueDiv;
var turnsUntilLost;
var descriptionsUsed = {};
var gameOver = false;
var main = {
    preload: function() {
        game.load.spritesheet('things', 'thingSprite.png', cellSize, cellSize);
        game.load.spritesheet('answer', 'rightWrongSprite.png', cellSize, cellSize);
    },
    create: function() {
        events.off();
        turnsUntilLost = 10;
        thingCells = [];
        descriptionsUsed = {};
        gameOver = false;
        $('#turnsUntilLost').html(turnsUntilLost);
        $('#clueList').html("");
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        clueList = document.getElementById('clueList');
        turnsText = document.getElementById('turnsUntilLost');
        game.stage.backgroundColor = 0xffffff;
        var graphics = game.add.graphics(0, 0),
            i, row, col, x, y, cell,
            correctCellCoords = getRandomCell(),
            things = [{
                name: "mountains",
                frame: 0,
                isPlural: true
            }, {
                name: "forest",
                frame: 1
            }, {
                name: "swamp",
                frame: 2
            }, {
                name: "fields",
                frame: 3,
                isPlural: true
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
                if (Math.random() > 0.8) {
                    cell.thing = things[Math.floor(Math.random() * things.length)];
                    cell.frame = cell.thing.frame;
                    thingCells.push(cell);
                }
            }
        }

       /* while (things.length > 0) {
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
        }*/
        while(cells[correctCellCoords.row][correctCellCoords.column].thing) {
            correctCellCoords = getRandomCell();
        }
        correctCell = cells[correctCellCoords.row][correctCellCoords.column];
        correctCell.isCorrect = true;
        // game.add.sprite(correctCell.x, correctCell.y, 'answer', 0);
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
    checkGameOver(false);
}

function getRandomColour() {
    return parseInt(Math.floor(Math.random() * (16777215)).toString(16), 16);
}
function getRandomCell() {
    return {row: Math.floor(Math.random() * rows), column: Math.floor(Math.random() * columns)};
}
function describeCell(cell) {
    var cellDescriptions = [];
    thingCells.sort(function(a, b) {
        var colDistA = a.column - cell.column;
        var rowDistA = a.row - cell.row;
        var distA = Math.max(Math.abs(colDistA), Math.abs(rowDistA));
        var colDistB = b.column - cell.column;
        var rowDistB = b.row - cell.row;
        var distB = Math.max(Math.abs(colDistB), Math.abs(rowDistB));
        return distA - distB;
    });

    for (var i = 0; i < thingCells.length; i++) {
        var thingCell = thingCells[i];
        var colDist = thingCell.column - cell.column;
        var rowDist = thingCell.row - cell.row;
        var isDuplicate = false;
        var distance = Math.max(Math.abs(colDist), Math.abs(rowDist));
        var thingDescription = descriptionsUsed[thingCell.thing.name];
        if (!thingDescription) {
            descriptionsUsed[thingCell.thing.name] = new Array(10);
        } else {
            for (var j = distance; j > 0; j--) {
                if (thingDescription[j]) {
                    isDuplicate = true;
                }
            }
        }
        var description = getNaturalLanguage(colDist, rowDist, thingCell.thing, isDuplicate);
        if (description.description) {
            if (!descriptionsUsed[thingCell.thing.name][description.distance]) {
                descriptionsUsed[thingCell.thing.name][description.distance] = true;
                cellDescriptions.push(description);
            }
        }
    }
    cellDescriptions.sort(function(a, b) {
        return b.distance - a.distance;
    });
    return cellDescriptions;
}
function onCellClicked(cell) {
    if (turnsUntilLost <= 0 || cell.answered || gameOver) return;
    game.add.sprite(cell.x, cell.y, 'answer', cell.isCorrect ? 0 : 1);
    turnsUntilLost--;
    checkGameOver(cell.isCorrect);
    cell.answered = true;
}
function checkGameOver(answeredCorrectly) {
    if (answeredCorrectly) {
        // $('#cluePanel').addClass('hidden');
        $('#gameWonPanel').removeClass('hidden');
        $('#newClueButton').addClass('hidden');
        gameOver = true;
    } else {
        if (turnsUntilLost > 0) {
            turnsText.innerHTML = turnsUntilLost;
        } else {
            gameOver = true;
            game.add.sprite(correctCell.x, correctCell.y, 'answer', 0);
            // $('#cluePanel').addClass('hidden');
            $('#gameLostPanel').removeClass('hidden');
            $('#newClueButton').addClass('hidden');
        }
    }
}
function getNaturalLanguage(colDist, rowDist, thing, isDuplicate) {
    var direction, oppositeDirection, description, language;
    if (rowDist < 0) {
        direction = "North";
        oppositeDirection = "South";
    } else if (rowDist > 0) {
        direction = "South";
        oppositeDirection = "North";
    }
    if (colDist < 0) {
        direction = direction ? direction + "-west" : "West";
        oppositeDirection = oppositeDirection ? oppositeDirection + "-east" : "East";
    } else if (colDist > 0) {
        direction = direction ? direction + "-east" : "East";
        oppositeDirection = oppositeDirection ? oppositeDirection + "-west" : "West";
    }
    var distance = Math.max(Math.abs(colDist), Math.abs(rowDist));
    var distanceText = (distance * 50) + " metres";
    var areIs = thing.isPlural ? "are" : "is";
    var aSome = (thing.isPlural ? "some" : "a") + (isDuplicate ? (thing.isPlural ? " other" : "nother") : "");
    console.log(distance + " from " + aSome + " " + thing.name);
    var descriptions = [
        ["You're less than 100 metres from aSome %s", "You're really close to aSome %s", "You're next to aSome %s"],
        ["You're about %d %o of aSome %s", "You're only about %d %p of aSome %s,", "There areIs aSome %s %d to the %p"],
        ["You can see %s about %d to the %p", "There areIs aSome %s %d to the %p"],
        ["There areIs aSome %s %d to the %p"],
        ["There areIs aSome %s in the distance, about %d to the %p"],
        ["There areIs aSome %s %d to the %p"]

    ];
    if (distance < descriptions.length) {
        var descriptionChoices = descriptions[distance - 1];
        description = descriptionChoices[Math.floor(Math.random() * descriptionChoices.length)];
    }
    if (description) {
        description = description.replace("areIs", areIs);
        description = description.replace("aSome", aSome);
        description = description.replace("%s", thing.name);
        description = description.replace("%d", distanceText);
        description = description.replace("%p", direction);
        description = description.replace("%o", oppositeDirection);
        // description += " (distance:" + distance + ")";
    }
    return {description: description, distance: distance};
}

function restart() {
    game.state.start('main');
    $('#newClueButton').removeClass('hidden');
    $('#gameWonPanel').addClass('hidden');
    $('#gameLostPanel').addClass('hidden');
}

var game = new Phaser.Game(cellSize * columns, cellSize * rows, Phaser.AUTO, 'gameDiv');
game.state.add('main', main);
game.state.start('main');
$('#instructionModal').modal('show');