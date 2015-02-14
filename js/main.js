var rows = 8;
var columns = 10;
var cells;
var cellSize = 64;
var main = {
    preload: function() {
        game.load.spritesheet('cell', 'cellSprite.png', cellSize, cellSize);
    },
    create: function() {
        game.stage.backgroundColor = 0xffffff;
        var graphics = game.add.graphics(0, 0),
            i, row, col, x, y;
        graphics.beginFill(0);
        graphics.drawRect(0, 550, 800, 100);
        var correctCell = {row: Math.floor(Math.random() * rows), column: Math.floor(Math.random() * columns)};
        console.log(correctCell);
        
        var things = [getRandomColour(), getRandomColour(), getRandomColour(), getRandomColour(), getRandomColour(), getRandomColour()];
        cells = new Array(rows);
        for (i = 0; i < cells.length; i++) {
            cells[i] = new Array(columns);
        }
        for (row = 0; row < rows; row++) {
            for (col = 0; col < columns; col++) {
                x = cellSize * col;
                y = cellSize * row;
                var cell = game.add.sprite(x, y, 'cell');
                cell.inputEnabled = true;
                cell.events.onInputDown.add(onCellClicked, this);
                cell.isCorrect = (row === correctCell.row && col === correctCell.column);
                cells[row][col] = cell;
                if (things.length > 0) {
                    if (Math.random() < 0.1) {
                        var thing = things.splice(Math.floor(Math.random() * things.length), 1);
                        graphics.beginFill(thing);
                        graphics.drawRect(x, y, cellSize,cellSize);
                        cell.thing = true;
                    }
                }
            }
        }
    },
    update: function() {

    }
};

function getRandomColour() {
    return parseInt(Math.floor(Math.random() * (16777215)).toString(16), 16);
}
function onCellClicked(cell) {
    cell.frame = cell.isCorrect ? 2 : 1;
}

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'gameDiv');
game.state.add('main', main);
game.state.start('main');