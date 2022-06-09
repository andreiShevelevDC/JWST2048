// CELL: one hex of the field
// EMPTY CELL: CELL has value !== CELL_EMPTY
// DISABLED CELL: CELL that has value === CELL_DISABLED and can't be changed
// TILE: any not EMPTY or DISABLED CELL

import * as GAME from "../configs/Game";

type Cell = {
    x: number;
    y: number;
    z: number;
    value: number;
    merged: boolean; // become true if tile was merged this turn
};

export default class LogicComponent {
    private gameEvents: Phaser.Events.EventEmitter;
    private readonly fieldRings = [
        //[0,0],  // center cell, created in GameLogic.createCircularField()
        [0, 1, 1, 0, 1, -1, 0, -1, -1, 0, -1, 1], // ring 2 (+6 cells)
        [0, 2, 1, 1, 2, 0, 2, -1, 2, -2, 1, -2, 0, -2, -1, -1, -2, 0, -2, 1, -2, 2, -1, 2], //ring 3 (+12 cells)
        [
            0, 3, 1, 2, 2, 1, 3, 0, 3, -1, 3, -2, 3, -3, 2, -3, 1, -3, 0, -3, -1, -2, -2, -1, -3, 0, -3, 1, -3, 2, -3,
            3, -2, 3, -1, 3,
        ], // ring 4 (+18 cells)
    ];
    private field: Cell[] = [];

    public constructor(gameEvents: Phaser.Events.EventEmitter) {
        this.gameEvents = gameEvents;
        this.createCircularField();
    }

    public getFieldValues(): number[] {
        const fieldValues: number[] = [];
        this.field.forEach((cell) => {
            fieldValues.push(cell.value);
        });
        return fieldValues;
    }

    // Adds new tiles to the field,
    // tilesNum - number of cells to add values to (create new "tiles")
    // newValues - array of values to randomly choose from, ex. [2], or [2, 4],
    // or [2, 2, 2, 4] - where 4 will be created with 25% chance
    public addNewTiles(tilesNum: number, newValues: number[]): number[] {
        const maxTilesToAdd: number = this.getEmptyCellsNum();
        if (tilesNum > maxTilesToAdd) {
            console.log("ERROR: can't add ", tilesNum, " tiles. Adding maximum of ", maxTilesToAdd);
            tilesNum = maxTilesToAdd;
        }
        const emptyCellsIndices: number[] = this.field
            .map((cell, index) => (cell.value === GAME.CELL_EMPTY ? index : -1))
            .filter((val) => val > -1);
        let randomEmptyCellIndex: number;
        const newTilesIndices: number[] = [];
        for (let i = 0; i < tilesNum; i++) {
            randomEmptyCellIndex = this.getRandomVal(emptyCellsIndices.length);
            this.field[emptyCellsIndices[randomEmptyCellIndex]].value = newValues[this.getRandomVal(newValues.length)];
            newTilesIndices.push(emptyCellsIndices[randomEmptyCellIndex]);
            emptyCellsIndices.splice(randomEmptyCellIndex, 1);
        }
        return newTilesIndices;
    }

    public makeMove(dirVector: number[]): number[] {
        const mergedCellsIndices: number[] = [];
        while (true) {
            if (!this.shift(dirVector)) break; // not a single tile moved
            //console.log("tiles shifted");
        }
        const newMergedCellsIndices = this.merge(dirVector);
        if (newMergedCellsIndices.length > 0) {
            // there are merged tiles, start shifting tiles again
            mergedCellsIndices.push(...newMergedCellsIndices);
            this.makeMove(dirVector); // recursive call
        } else {
            // no merged tiles
            this.field.forEach((cell) => {
                cell.merged = false;
            });
        }
        return mergedCellsIndices;
    }

    // check if the tile with goal value has been made
    // TODO: remake to accept and check goal as an array of values
    public checkGoal(goalValue: number): boolean {
        this.field.forEach((cell) => {
            if (cell.value >= goalValue) return true;
        });
        return false;
    }

    // returns the number of empty tiles
    public getEmptyCellsNum(): number {
        let num = 0;
        this.field.forEach((cell) => {
            if (cell.value === GAME.CELL_EMPTY) num++;
        });
        return num;
    }

    // create circular field of size <gameSize> without gaps
    private createCircularField(): void {
        this.field[0] = {
            x: 0,
            y: 0,
            z: 0,
            value: GAME.CELL_EMPTY,
            merged: false,
        };
        for (let ring = 2; ring <= GAME.SIZE; ring++) this.makeRing(ring);
    }

    private makeRing(ringNum: number): void {
        let x: number;
        let y: number;

        for (let i = 0; i < this.fieldRings[ringNum - 2].length; i++) {
            x = this.fieldRings[ringNum - 2][i];
            y = this.fieldRings[ringNum - 2][++i];
            this.field.push({
                x: x,
                y: y,
                z: 0 - x - y,
                value: GAME.CELL_EMPTY,
                merged: false,
            });
        }
    }

    // returns random integer, where 0 <= return < max
    private getRandomVal = (max: number): number => Math.floor(Math.random() * max);

    // Shifting tiles in a given direction by one cell
    // dirVector = [x, y]
    private shift(dirVector: number[]): boolean {
        let changedTiles = false;
        let neighbour: { cell: Cell; index: number } | null;

        this.field.forEach((cell) => {
            neighbour = this.getNeighbour(cell, dirVector);
            if (
                cell.value !== GAME.CELL_EMPTY &&
                cell.value !== GAME.CELL_DISABLED &&
                neighbour &&
                neighbour.cell.value === GAME.CELL_EMPTY
            ) {
                neighbour.cell.value = cell.value;
                cell.value = GAME.CELL_EMPTY;
                changedTiles = true;
            }
        });
        return changedTiles;
    }

    private merge(dirVector: number[]): number[] {
        const changedTilesIndices: number[] = [];
        let neighbour: { cell: Cell; index: number } | null;
        this.field.forEach((cell) => {
            neighbour = this.getNeighbour(cell, dirVector);
            if (
                cell.value !== GAME.CELL_EMPTY &&
                cell.value !== GAME.CELL_DISABLED &&
                neighbour &&
                neighbour.cell.value === cell.value &&
                !neighbour.cell.merged
            ) {
                neighbour.cell.value = cell.value * GAME.BASE_TILE;
                neighbour.cell.merged = true;
                this.gameEvents.emit(GAME.EVENT.SCOREUPDATE, neighbour.cell.value);
                cell.value = GAME.CELL_EMPTY;
                changedTilesIndices.push(neighbour.index);
            }
        });
        return changedTilesIndices;
    }

    // returns the next to current cell in the given direction
    private getNeighbour(cell: Cell, dirVector: number[]): { cell: Cell; index: number } | null {
        for (let i = 0; i < this.field.length; i++) {
            if (
                this.field[i].x === cell.x + dirVector[0] &&
                this.field[i].y === cell.y + dirVector[1] &&
                this.field[i].z === cell.z - dirVector[0] - dirVector[1]
            )
                return { cell: this.field[i], index: i };
        }
        return null;
    }
}
