//import { IocContext } from "power-di";
import * as Stats from "stats.js";
import { SceneNames } from "../enums/Scenes";
//import { PopupService } from "../services/PopupService";
import { ForegroundView } from "../views/ForegroundView";
import GameView from "../views/GameView";
import { UIView } from "../views/UIView";
import * as GAME from "../configs/Game";
import LogicComponent from "../components/LogicComponent";

export default class MainScene extends Phaser.Scene {
    private gameView: GameView;
    private uiView: UIView;
    private foregroundView: ForegroundView;
    private gameEvents: Phaser.Events.EventEmitter;

    private logic: LogicComponent;
    private gameState = GAME.STATE.PAUSE;
    private moveCounter: number;
    private movingTiles: number[];

    public constructor() {
        super({ key: SceneNames.Main });
    }

    private init(): void {
        //this.initServices();
        this.initGameView();
        this.initUIView();
        this.initForegroundView();
        //if (process.env.NODE_ENV !== "production") this.initStatJS();
        this.makeNewGame();
    }

    private initGameView(): void {
        this.gameView = new GameView(this);
        // this.gameView.on("lap", () => {
        //     this.uiView.updateCounter();
        // });
        this.add.existing(this.gameView);
    }

    private initUIView(): void {
        this.uiView = new UIView(this);
        this.add.existing(this.uiView);
    }

    private initForegroundView(): void {
        this.foregroundView = new ForegroundView(this);
        // this.foregroundView.on("counterPopupClosed", () => {
        //     this.gameView.runRacoon();
        // });
        this.add.existing(this.foregroundView);
    }

    private makeNewGame(): void {
        this.gameEvents = new Phaser.Events.EventEmitter();
        this.gameEvents.on(GAME.EVENT.TILESSHIFTSTART, (shiftedTiles: number[], dirVector: number[]) => {
            this.movingTiles = shiftedTiles;
            this.gameView.animateShiftedTiles(shiftedTiles, dirVector);
        });
        this.gameEvents.on(GAME.EVENT.TILESSHIFTEND, () => this.logic.shiftEnd(this.movingTiles));
        this.gameEvents.on(GAME.EVENT.MOVE, this.startMove, this);
        this.gameEvents.on(GAME.EVENT.MOVEEND, this.endMove, this);
        this.gameEvents.on(GAME.EVENT.SCOREUPDATE, (newTilesSum: number) => this.uiView.updateCounter(newTilesSum));
        this.gameEvents.on(GAME.EVENT.UI, (key: string) => {
            if (key === "KeyF") {
                if (!this.foregroundView.endgamePopup.isOpen) {
                    this.uiView.hide();
                    this.foregroundView.showResults(this.uiView.getCounter());
                } else {
                    this.foregroundView.endgamePopup.hide();
                    this.uiView.show();
                }
            }
        });
        this.uiView.registerInputHandlers(this.gameEvents);
        this.gameView.registerEventHandler(this.gameEvents);
        this.scale.on("resize", () => {
            this.gameView.updatePosition();
            this.uiView.updatePosition();
            this.foregroundView.updatePosition();
        });

        this.startGame();
    }

    private startGame(): void {
        this.logic = new LogicComponent(this.gameEvents);
        this.logic.addNewTiles(1, GAME.NEW_TILES);
        this.gameView.updateLabelsData(this.logic.getFieldValues());
        this.moveCounter = 0;
        this.uiView.updateCounter(0);
        this.gameState = GAME.STATE.PLAYING;
    }

    private startMove(dir: number[]): void {
        if (this.gameState === GAME.STATE.PLAYING) this.logic.startMove(dir);
        else console.log(" START A NEW GAME");
    }

    private endMove(mergedTilesIndices: number[]): void {
        this.gameView.animateMergedTiles(mergedTilesIndices);
        this.moveCounter++;
        if (this.canContinueGame()) {
            const newTiles: number[] = this.logic.addNewTiles(1, GAME.NEW_TILES);
            this.gameView.updateLabelsData(this.logic.getFieldValues());
            this.gameView.animateNewTiles(newTiles);
        } else {
            this.gameState = GAME.STATE.PAUSE;
            this.finishGame();
        }
    }

    private finishGame(): void {
        console.log("  ***  GAME FINISHED!  ***  ");
        console.log(`Moves: ${this.moveCounter}`);
        this.uiView.hide();
        this.foregroundView.showResults(this.uiView.getCounter());
        if (this.logic.checkGoal(GAME.GOAL)) {
            console.log(" Game is WON: The goal has been achieved.");
            return;
        }
        console.log(` Game is lost: no empty tiles left (${this.logic.getEmptyCellsNum()}).`);

        // Ask for a new game
        //makeNewGame(newGameSizeIndex);
    }

    private canContinueGame = (): boolean => !(this.logic.checkGoal(GAME.GOAL) || this.logic.getEmptyCellsNum() === 0);

    // private initServices(): void {
    //     const popupService = IocContext.DefaultInstance.get(PopupService);
    //     popupService.initialize();
    // }

    private initStatJS(): void {
        const stats = new Stats();
        stats.showPanel(0);
        const update = (): void => {
            stats.begin();
            stats.end();
            requestAnimationFrame(update);
        };
        update();
        document.body.appendChild(stats.dom);
    }
}
