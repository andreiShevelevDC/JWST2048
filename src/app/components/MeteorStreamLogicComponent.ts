// Cells has a probability to temporarily became unavailable (disabled)
// freezing the current value
// it can become available/active later

import * as GAME from "../configs/Game";
import LogicComponent from "../components/LogicComponent";

export default class MeteorStreamLogicComponent extends LogicComponent {
    private frozen: number[] = []; // saves current value of the cell if it is frozen
    private readonly maxNumFrozenCells = 5; // max number of simultaneously frozen cells
    private readonly maxNumFrozenCellsPerMove = 1; // how many cells can be frozen each move
    private readonly maxNumCellsToProbePerMove = 3; // how many cells to try to freeze each move

    // a probability to freeze depends on the cell's value
    // [value, prob percent]
    private readonly cellFreezeProb = [
        [GAME.CELL_EMPTY, 120],
        [GAME.BASE_TILE ** 2, 90],
        [GAME.BASE_TILE ** 3, 75],
        [GAME.BASE_TILE ** 4, 65],
        [GAME.BASE_TILE ** 5, 50],
        [GAME.BASE_TILE ** 6, 35],
        [GAME.BASE_TILE ** 7, 20],
        [GAME.BASE_TILE ** 8, 15],
        [GAME.BASE_TILE ** 9, 10],
        [GAME.BASE_TILE ** 10, 5],
    ];
    // each move each frozen cells are probed to thaw
    private readonly cellThawProb = [
        [GAME.CELL_EMPTY, 85],
        [GAME.BASE_TILE ** 2, 75],
        [GAME.BASE_TILE ** 3, 65],
        [GAME.BASE_TILE ** 4, 60],
        [GAME.BASE_TILE ** 5, 45],
        [GAME.BASE_TILE ** 6, 40],
        [GAME.BASE_TILE ** 7, 30],
        [GAME.BASE_TILE ** 8, 25],
        [GAME.BASE_TILE ** 9, 20],
        [GAME.BASE_TILE ** 10, 18],
    ];

    public constructor(gameEvents: Phaser.Events.EventEmitter) {
        super(gameEvents);
        this.initFrozen();
    }

    public restart(): void {
        super.restart();
        this.frozen = [];
        this.initFrozen();
    }

    // overwrites base method to exchange "-1" to the value from this.frozen
    public getFieldValues(): number[] {
        const fieldValues: number[] = [];
        this.field.forEach((cell, index) => {
            if (cell.value === -1) fieldValues.push(this.frozen[index]);
            else fieldValues.push(cell.value);
        });
        return fieldValues;
    }

    // should be called after the move and before adding new tiles
    // returns arrays of thawed and frozen cells this turn
    public moveFreeze(): { thawed: number[]; frozen: number[] } {
        const numberOfAttemptsToFindCellToFreeze = 50;
        const frozenCells: number[] = [];
        const thawedCells = this.moveThaw(); // thawed cells can't freeze again this very turn
        if (this.getNumberOfFrozenCells() >= this.maxNumFrozenCells) return { thawed: thawedCells, frozen: [] };
        let cellToFreeze: number;
        let freezeCandidate: number;
        for (let j = 0; j < this.maxNumCellsToProbePerMove; j++) {
            cellToFreeze = -1;
            for (let i = 0; i < numberOfAttemptsToFindCellToFreeze; i++) {
                freezeCandidate = this.getRandomVal(this.field.length);
                if (
                    this.field[freezeCandidate].value !== GAME.CELL_DISABLED && // candidate is not among already frozen cells
                    thawedCells.find((thawedCell) => thawedCell === freezeCandidate) === undefined && // and not among freshly thawed cells
                    frozenCells.find((frozenCell) => frozenCell === freezeCandidate) === undefined // and not among cells already chosen for freezing
                ) {
                    cellToFreeze = freezeCandidate;
                    break;
                }
            }
            if (cellToFreeze === -1) {
                console.log("Wasn't been able to find a cell to freeze");
                return { thawed: thawedCells, frozen: frozenCells };
            }
            const freezeProbe = this.cellFreezeProb.find((pair) => pair[0] === this.field[cellToFreeze].value);
            if (freezeProbe && this.getRandomVal(1000) <= freezeProbe[1]) {
                this.freezeCell(cellToFreeze);
                frozenCells.push(cellToFreeze);
            }
            if (frozenCells.length >= this.maxNumFrozenCellsPerMove) break;
        }
        //if (frozenCells.length > 0) console.log("FREEZING #", frozenCells);
        //if (thawedCells.length > 0) console.log("THAWING #", thawedCells);
        return { thawed: thawedCells, frozen: frozenCells };
    }

    private getNumberOfFrozenCells = (): number => {
        let num = 0;
        this.frozen.forEach((item) => {
            if (item !== GAME.CELL_DISABLED) num++;
        });
        return num;
    };

    private moveThaw(): number[] {
        let thawProb: number[] | undefined;
        const thawedCells: number[] = [];
        this.frozen.forEach((frozenVal, index) => {
            if (frozenVal !== GAME.CELL_DISABLED) {
                thawProb = this.cellThawProb.find((pair) => pair[0] === frozenVal);
                if (thawProb && this.getRandomVal(1000) <= thawProb[1]) {
                    this.thawCell(index);
                    thawedCells.push(index);
                }
            }
        });
        return thawedCells;
    }

    private initFrozen(): void {
        this.field.forEach(() => this.frozen.push(GAME.CELL_DISABLED));
    }

    private freezeCell(cellIndex: number): void {
        if (this.field[cellIndex].value !== GAME.CELL_DISABLED && this.frozen[cellIndex] === GAME.CELL_DISABLED) {
            this.frozen[cellIndex] = this.field[cellIndex].value;
            this.field[cellIndex].value = GAME.CELL_DISABLED;
        } else console.log(`Cell ${cellIndex} is already disabled!`);
    }

    private thawCell(cellIndex: number): void {
        if (this.field[cellIndex].value === GAME.CELL_DISABLED && this.frozen[cellIndex] !== GAME.CELL_DISABLED) {
            this.field[cellIndex].value = this.frozen[cellIndex];
            this.frozen[cellIndex] = GAME.CELL_DISABLED;
        } else console.log(`Cell ${cellIndex} is already enabled!`);
    }
}
