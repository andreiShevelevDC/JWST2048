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
    private currDirVector: number[];
    private currMergedTilesIndices: number[] = [];

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

    public startMove(dirVector: number[]): void {
        this.currDirVector = dirVector;
        const shiftedTilesIndices = this.shiftStart();
        if (shiftedTilesIndices.length > 0)
            this.gameEvents.emit(GAME.EVENT.TILESSHIFTSTART, shiftedTilesIndices, this.currDirVector);
        else this.continueMove();
    }

    public continueMove(): void {
        const newMergedCellsIndices = this.merge();
        if (newMergedCellsIndices.length > 0) {
            // there are merged tiles, start shifting tiles again
            this.currMergedTilesIndices.push(...newMergedCellsIndices);
            this.startMove(this.currDirVector); // recursive call
        } else {
            // no merged tiles
            this.field.forEach((cell) => {
                cell.merged = false;
            });
        }
        this.gameEvents.emit(GAME.EVENT.MOVEEND, this.currMergedTilesIndices);
        this.currMergedTilesIndices = [];
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

    public shiftEnd(shiftedTilesIndices: number[]): void {
        let neighbour: { cell: Cell; index: number } | null;
        shiftedTilesIndices.forEach((tileIndex) => {
            neighbour = this.getNeighbour(this.field[tileIndex]);
            if (neighbour) {
                neighbour.cell.value = this.field[tileIndex].value;
                this.field[tileIndex].value = GAME.CELL_EMPTY;
            }
        });
        this.startMove(this.currDirVector);
    }

    // Shifting tiles in a given direction by one cell
    public shiftStart(): number[] {
        let neighbour: { cell: Cell; index: number } | null;
        const shiftedTilesIndices: number[] = [];

        this.field.forEach((cell, index) => {
            neighbour = this.getNeighbour(cell);
            if (
                cell.value !== GAME.CELL_EMPTY &&
                cell.value !== GAME.CELL_DISABLED &&
                neighbour &&
                neighbour.cell.value === GAME.CELL_EMPTY
            )
                shiftedTilesIndices.push(index);
        });
        return shiftedTilesIndices;
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

    private merge(): number[] {
        const mergedTilesIndices: number[] = [];
        let neighbour: { cell: Cell; index: number } | null;
        this.field.forEach((cell) => {
            neighbour = this.getNeighbour(cell);
            if (
                cell.value !== GAME.CELL_EMPTY &&
                cell.value !== GAME.CELL_DISABLED &&
                neighbour &&
                neighbour.cell.value === cell.value &&
                !neighbour.cell.merged &&
                !cell.merged
            ) {
                neighbour.cell.value = cell.value * GAME.BASE_TILE;
                neighbour.cell.merged = true;
                this.gameEvents.emit(GAME.EVENT.SCOREUPDATE, neighbour.cell.value);
                cell.value = GAME.CELL_EMPTY;
                mergedTilesIndices.push(neighbour.index);
            }
        });
        return mergedTilesIndices;
    }

    // returns the next to current cell in the given direction
    private getNeighbour(cell: Cell): { cell: Cell; index: number } | null {
        for (let i = 0; i < this.field.length; i++) {
            if (
                this.field[i].x === cell.x + this.currDirVector[0] &&
                this.field[i].y === cell.y + this.currDirVector[1] &&
                this.field[i].z === cell.z - this.currDirVector[0] - this.currDirVector[1]
            )
                return { cell: this.field[i], index: i };
        }
        return null;
    }
}
