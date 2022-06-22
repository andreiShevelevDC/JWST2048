// Static field, 19 cells

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
    protected field: Cell[];
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
    private moveResults: GAME.MoveResults;

    public constructor(gameEvents: Phaser.Events.EventEmitter) {
        this.gameEvents = gameEvents;
        this.restart();
    }

    public restart(): void {
        this.field = [];
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
        //console.log("2add: ", tilesNum);
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

    public move(gameCall: boolean, dirVector: number[] | null): GAME.MoveResults {
        if (gameCall) this.moveResults = { shifted: [], merged: [], mergedScore: 0 };
        if (dirVector) {
            const shiftedTilesPairs = this.shift(dirVector);
            if (shiftedTilesPairs.length > 0) {
                this.fuseShiftedPairs(shiftedTilesPairs);
                this.move(false, dirVector);
            } else {
                const mergedCellsIndices = this.merge(dirVector);
                if (mergedCellsIndices.length > 0) {
                    // there are merged tiles, start shifting tiles again
                    this.moveResults.merged.push(...mergedCellsIndices);
                    this.move(false, dirVector);
                } else {
                    // no merged tiles
                    this.field.forEach((cell) => {
                        cell.merged = false;
                    });
                }
            }
        }
        return this.moveResults;
    }

    // check if the tile with goal value has been made
    // TODO: remake to accept and check goal as an array of values
    public checkGoal = (goalValue: number): boolean => this.field.some((cell) => cell.value >= goalValue);

    public shouldContinueGame = (): boolean => !(this.checkGoal(GAME.GOAL) || this.getEmptyCellsNum() === 0);

    // returns random integer, where 0 <= return < max
    protected getRandomVal = (max: number): number => Math.floor(Math.random() * max);

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

    // returns the number of empty tiles
    private getEmptyCellsNum(): number {
        let num = 0;
        this.field.forEach((cell) => {
            if (cell.value === GAME.CELL_EMPTY) num++;
        });
        return num;
    }

    // Shifting tiles in a given direction by one cell
    private shift(dirVector: number[]): GAME.ShiftedPair[] {
        let neighbour: { cell: Cell; index: number } | null;
        const shiftedPairs: GAME.ShiftedPair[] = [];

        // first run: only find candidates for shifting
        this.field.forEach((cell, index) => {
            if (cell.value !== GAME.CELL_EMPTY && cell.value !== GAME.CELL_DISABLED) {
                neighbour = this.getNeighbour(cell, dirVector);
                if (neighbour && neighbour.cell.value === GAME.CELL_EMPTY)
                    shiftedPairs.push({ start: index, finish: neighbour.index });
            }
        });
        // second run: shift tile (cell's value)
        shiftedPairs.forEach((pair) => {
            this.field[pair.finish].value = this.field[pair.start].value;
            this.field[pair.start].value = GAME.CELL_EMPTY;
        });
        return shiftedPairs;
    }

    private fuseShiftedPairs(shiftedPairs: GAME.ShiftedPair[]): void {
        if (this.moveResults.shifted.length !== 0) {
            let sameTileIndex: number;
            // checking each of the previously saved tiles
            // if new shifted from the same place prev tile finished
            this.moveResults.shifted.forEach((prevTile) => {
                sameTileIndex = shiftedPairs.findIndex((newTile) => newTile.start === prevTile.finish);
                if (sameTileIndex !== -1) {
                    prevTile.finish = shiftedPairs[sameTileIndex].finish;
                    shiftedPairs.splice(sameTileIndex, 1);
                }
            });
            // adding newly shifted tiles
            this.moveResults.shifted.push(...shiftedPairs);
        } else this.moveResults.shifted = shiftedPairs;
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

    private merge(dirVector: number[]): number[] {
        const mergedTilesIndices: number[] = [];
        const tempMergedPairs: GAME.ShiftedPair[] = [];
        let neighbour: { cell: Cell; index: number } | null;
        // this.field.forEach((cell) => {
        //     if (cell.value !== GAME.CELL_EMPTY && cell.value !== GAME.CELL_DISABLED) {
        //         neighbour = this.getNeighbour(cell, dirVector);
        //         if (neighbour && neighbour.cell.value === cell.value && !neighbour.cell.merged && !cell.merged) {
        //             neighbour.cell.value = cell.value * GAME.BASE_TILE;
        //             neighbour.cell.merged = true;
        //             cell.value = GAME.CELL_EMPTY;
        //             mergedTilesIndices.push(neighbour.index);
        //             this.moveResults.mergedScore += neighbour.cell.value;
        //         }
        //     }
        // });
        this.field.forEach((cell, index) => {
            if (cell.value !== GAME.CELL_EMPTY && cell.value !== GAME.CELL_DISABLED) {
                neighbour = this.getNeighbour(cell, dirVector);
                if (neighbour && neighbour.cell.value === cell.value)
                    tempMergedPairs.push({ start: index, finish: neighbour.index });
            }
        });
        for (let i = 0; i < tempMergedPairs.length; i++) {
            for (let j = 0; j < tempMergedPairs.length; j++) {
                if (tempMergedPairs[i].start === tempMergedPairs[j].finish) {
                    tempMergedPairs[j].start = -1;
                    tempMergedPairs[j].finish = -1;
                }
            }
        }
        tempMergedPairs.forEach((pair) => {
            if (pair.start !== -1 && !this.field[pair.start].merged && !this.field[pair.finish].merged) {
                this.field[pair.finish].value = this.field[pair.start].value * GAME.BASE_TILE;
                this.field[pair.start].value = GAME.CELL_EMPTY;
                this.field[pair.finish].merged = true;
                this.field[pair.start].merged = true;
                mergedTilesIndices.push(pair.finish);
                this.moveResults.mergedScore += this.field[pair.finish].value;
            }
        });
        return mergedTilesIndices;
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
