//fields: 
// [      x1,x2, x3, x4, x5  
//    y1: [0, 1, -1, 1, 0]
//    y2: [0, 1, -1, 1, 0]
// ],
//  row = y, column = x

const fieldWidth = 10;
const fieldHeight = 10;
const numberOfMines = 10;

const mineMark = -1;
const DIRECTIONS = {
    north: "n",
    south: "s",
    west: "w",
    east: "e",
    north_east: "ns",
    north_west: "nw",
    south_west: "sw",
    south_east: "se"
};

let field, traversedFields;


const createField = (width, height) => {
    return Array(height).fill(0).map(_ => Array(width).fill(0));
};

// **** **** ****
// GENERATE MINE POSITIONS
// **** **** ****
const getMinePositions = (width, height, mines, safePositions) => {
    const randomPositions = getRandomPositions(width - 1, height - 1, mines, safePositions || []);
    for (let i = 0; i < safePositions.length; i++) {
        randomPositions.shift();
    }
    return randomPositions;
};

const getRandomPositions = (width, height, mines, safePositions) => {
    const positions = [...safePositions];
    for (let i = 0; i < mines; i++) {
        getUniquePosition(width, height, positions);
    }
    return positions;
};

const isSamePosition = (pos1, pos2) => pos1.x === pos2.x && pos1.y === pos2.y;
const getUniquePosition = (width, height, unavailablePositions) => {
    var position = randPosition(0, width, 0, height);
    unavailablePositions.some(previousPosition => isSamePosition(previousPosition, position)) ?
        getUniquePosition(width, height, unavailablePositions) :
        unavailablePositions.push(position);
};

const randPosition = (minWidth, maxWidth, minHeight, maxHeight) => {
    return {
        x: Math.floor(Math.random() * (maxWidth - minWidth + 1)) + minWidth,
        y: Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight,
    };
};





// **** **** ****
// MARK FIELD FOR MINES AND NEARBY MINES
// **** **** ****
const placeMinesInField = (minePositions, field) => {
    minePositions.forEach(minePosition => {
        field[minePosition.y][minePosition.x] = mineMark;
    });
};

const markNearbyPositions = (minePositions, field, width, height) => {
    const directions = Object.entries(DIRECTIONS).map(x => x[1]); // get all possible directions
    minePositions.forEach(minePosition => {
        const nearByPositions = getPositionNearbyGrid(minePosition.x, minePosition.y, width, height, directions);
        nearByPositions.forEach(nearByPosition => {
            // start from the positions of the mines, so all nearby fields are counted up
            // except if it is a mine itself
            field[nearByPosition.y][nearByPosition.x] !== mineMark && field[nearByPosition.y][nearByPosition.x]++;
        });
    });
};





const getPositionNearbyGrid = (x, y, maxX, maxY, directions) => {
    const positions = [];
    // west
    if (directions.includes(DIRECTIONS.west)) {
        const newX = x - 1;
        if (newX >= 0) {
            positions.push({ x: newX, y, direction: DIRECTIONS });
        }
    }
    // east
    if (directions.includes(DIRECTIONS.east)) {
        const newX = x + 1;
        if (newX <= maxX) {
            positions.push({ x: newX, y, direction: DIRECTIONS.east });
        }
    }
    // north 
    if (directions.includes(DIRECTIONS.north)) {
        const newY = y - 1;
        if (newY >= 0) {
            positions.push({ x, y: newY, direction: DIRECTIONS.north });
        }
    };
    // south
    if (directions.includes(DIRECTIONS.south)) {
        const newY = y + 1;
        if (newY <= maxY) {
            positions.push({ x, y: newY, direction: DIRECTIONS.south });
        }
    }
    // north-east
    if (directions.includes(DIRECTIONS.north_east)) {
        const newX = x - 1;
        const newY = y + 1;
        if (newY <= maxY && newX >= 0) {
            positions.push({ x: newX, y: newY, direction: DIRECTIONS.north_east });
        }
    }
    // north-west 
    if (directions.includes(DIRECTIONS.north_west)) {
        const newY = y - 1;
        const newX = x - 1;
        if (newY >= 0 && newX >= 0) {
            positions.push({ x: newX, y: newY, direction: DIRECTIONS.north_west });
        }
    }
    // south-east
    if (directions.includes(DIRECTIONS.south_east)) {
        const newX = x + 1;
        const newY = y + 1;
        if (newX <= maxX && newY <= maxY) {
            positions.push({ x: newX, y: newY, direction: DIRECTIONS.south_east });
        }
    }
    // south-west 
    if (directions.includes(DIRECTIONS.south_west)) {
        const newX = x + 1;
        const newY = y - 1;
        if (newX <= maxX && newY >= 0) {
            positions.push({ x: newX, y: newY, direction: DIRECTIONS.south_west });
        }
    }
    return positions;
};

/**
 * @param {*} startPosition 
 * @returns safe posititions that are guaranteed no mines, and as such can be uncovered and help the user start the game
 */
const initGame = startPosition => {
    const safePositionsDirections = Object.entries(DIRECTIONS).map(x => x[1]); // get all possible directions
    const randomClosePositions = getRandomClosePositions(startPosition, 8, safePositionsDirections);
    const minePositions = getMinePositions(fieldWidth, fieldHeight, numberOfMines, randomClosePositions);
    field = createField(fieldWidth, fieldHeight);
    traversedFields = createField(fieldWidth, fieldHeight);

    placeMinesInField(minePositions, field);
    markNearbyPositions(minePositions, field, fieldWidth - 1, fieldHeight - 1);
    return randomClosePositions;
};

/**
 * traverse field using breadth-first-search algorithm
 * @param {*} startPosition 
 * @param {*} field 
 */
const traversedFieldsBFS = (startPosition, field, width, height, traversedFields, directions) => {
    const allTraversedCells = [];
    const queue = [];
    queue.push(startPosition);
    allTraversedCells.push(startPosition);
    while (queue.length) {
        const currentPosition = queue.pop();

        // if cell has already been traversed don't traverse it again
        if (traversedFields[currentPosition.y][currentPosition.x] === 1) continue;

        traversedFields[currentPosition.y][currentPosition.x] = 1; // mark position as traversed
        // if this field has a neighboring field that is a mine
        if (field[currentPosition.y][currentPosition.x] !== 0) continue;

        const nearByPositions = getPositionNearbyGrid(currentPosition.x, currentPosition.y, width - 1, height - 1, directions);
        nearByPositions.forEach(nearByPosition => {
            // don't retraverse positions
            if (traversedFields[nearByPosition.y][nearByPosition.x] === 1) return;
            // traverse the fields that are either:
            // 0 cells
            // was traversing from a 0 cell and found a non zero cell
            queue.push(nearByPosition);
            allTraversedCells.push(nearByPosition);
        });
    }
    return allTraversedCells;
};

function createTable(tableData) {
    const table = document.getElementById('table');
    const tableBody = document.createElement('tbody');

    tableData.forEach(function (rowData, rowIndex) {
        const row = document.createElement('tr');
        rowData.forEach(function (cellData, columnIndex) {
            const cell = document.createElement('td');
            cell.dataset.y = rowIndex;
            cell.dataset.x = columnIndex;
            cell.classList.add("content", "uncovered");
            row.appendChild(cell);
        });
        tableBody.appendChild(row);
    });
    table.appendChild(tableBody);
}

const markCellAsMine = cell => cell.classList.add("mine");
const populateCell = (cell, cellData, rowIndex, columnIndex, traversedFields) => {
    if (traversedFields[rowIndex][columnIndex]) {
        cell.innerText = cellData === 0 ? "" : cellData;
        cell.classList.remove("uncovered");
    }
};

const getTableCell = (table, row, column) => table.rows[row].cells[column];
const iterateCells = (table, cellPositions, callback) => {
    cellPositions.forEach(({ x, y }) => callback && callback(getTableCell(table, y, x), y, x));
};

/**
 * 
 * @param {{x, y}} position close from this position
 * @param {*} numberOfClosePositions the number of safe cells
 * @param {*} fromDirections in which directions from the position would you like to have safe cells
 * @returns 
 */
const getRandomClosePositions = (position, numberOfClosePositions, fromDirections) => {
    const positions = [position];
    const directions = shuffleArray(fromDirections);
    while (directions.length && positions.length < numberOfClosePositions + 1) {
        const direction = [directions.pop()];
        const nearby = getPositionNearbyGrid(position.x, position.y, position.x + 2, position.y + 2, direction);
        if (nearby.length > 0) {
            positions.push(nearby[0]);
        }
    }
    // if no direction has been found
    // implicitly that probably means that the field is too small
    // perhaps 1x1
    return positions;
};

/**
 * The de-facto unbiased shuffle algorithm is the Fisher-Yates (aka Knuth) Shuffle.
 * @param {Array} array 
 * @returns 
 */
const shuffleArray = array => {
    let currentIndex = array.length, randomIndex;
    // While there remain elements to shuffle...
    while (currentIndex != 0) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
};

/**
 * supposes that all other checks have been passed
 * only checks if the number of untraversed fields is equal to the number of mines in the game
 * @param {*} traversedFields 
 * @param {*} numberOfMines 
 * @returns 
 */
const checkIfMinesCleared = (traversedFields, numberOfMines) => {
    const flattenedTraversed = traversedFields.flat();
    return flattenedTraversed.reduce((acc, curentValue) => acc + curentValue) === flattenedTraversed.length - numberOfMines;
};






createTable(createField(fieldWidth, fieldHeight));
const table = document.getElementById("table");
table.onclick = event => {
    const searchDirections = Object.entries(DIRECTIONS).map(x => x[1]); // get all possible directions
    // const searchDirections = [DIRECTIONS.west, DIRECTIONS.north, DIRECTIONS.east, DIRECTIONS.south];
    const clickedCell = event.target;
    const x = parseInt(clickedCell.dataset.x);
    const y = parseInt(clickedCell.dataset.y);
    let uncoveredFields;
    if (!field) {
        const safePositions = initGame({ x, y });
        uncoveredFields = [];
        uncoveredFields = safePositions
            .map(safePosition => traversedFieldsBFS({
                x: safePosition.x,
                y: safePosition.y
            }, field, fieldWidth, fieldHeight, traversedFields, searchDirections))
            .flat();
    }
    else {
        uncoveredFields = traversedFieldsBFS({ x, y }, field, fieldWidth, fieldHeight, traversedFields, searchDirections);
    }
    iterateCells(table, uncoveredFields, (cellElement, rowIndex, columnIndex) => {
        populateCell(cellElement, field[rowIndex][columnIndex], rowIndex, columnIndex, traversedFields);
    });
    if (field[y][x] === mineMark) {
        markCellAsMine(getTableCell(table, y, x));
        alert("Game Over!");
    } else if (checkIfMinesCleared(traversedFields, numberOfMines)) {
        alert("Nice!");
    }
};