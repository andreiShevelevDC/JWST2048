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
    private gameState = GAME.STATE.ABSENT;
    private moveCounter: number;
    private movingTiles: number[];

    public constructor() {
        super({ key: SceneNames.Main });
    }

    private init(): void {
        //this.initServices();
        this.gameEvents = new Phaser.Events.EventEmitter();
        this.initGameView();
        this.initUIView();
        this.initForegroundView();
        //if (process.env.NODE_ENV !== "production") this.initStatJS();
        this.handleEvents();
        this.startGame();
    }

    private initGameView(): void {
        this.gameView = new GameView(this, this.gameEvents);
        // this.gameView.on("lap", () => {
        //     this.uiView.updateCounter();
        // });
        this.add.existing(this.gameView);
    }

    private initUIView(): void {
        this.uiView = new UIView(this, this.gameEvents);
        this.add.existing(this.uiView);
    }

    private initForegroundView(): void {
        this.foregroundView = new ForegroundView(this);
        // this.foregroundView.on("counterPopupClosed", () => {
        //     this.gameView.runRacoon();
        // });
        this.add.existing(this.foregroundView);
    }

    private handleEvents(): void {
        // this.gameEvents.on(GAME.EVENT.TILESSHIFTSTART, (shiftedTiles: number[], dirVector: number[]) => {
        //     this.movingTiles = shiftedTiles;
        //     this.gameView.tweenShiftedTiles(shiftedTiles, dirVector);
        // });
        // this.gameEvents.on(GAME.EVENT.TILESSHIFTEND, () => this.logic.shiftEnd(this.movingTiles));
        this.gameEvents.on(GAME.EVENT.MOVE, this.makeMove, this);
        //this.gameEvents.on(GAME.EVENT.SCOREUPDATE, (newTilesSum: number) => this.uiView.updateCounter(newTilesSum));
        this.gameEvents.on(GAME.EVENT.UI, (key: string) => this.uiEventHandler(key));
        this.gameEvents.on(GAME.EVENT.SHOWRESULTS, () => this.showResults());
        this.uiView.registerInputHandlers();
        this.scale.on("resize", () => {
            this.gameView.updatePosition();
            this.uiView.updatePosition();
            this.foregroundView.updatePosition();
        });
    }

    private uiEventHandler(key: string): void {
        switch (key) {
            case GAME.UI_KEYS[0]: // show/hide end game popup
                if (!this.foregroundView.endgamePopup.isOpen) this.showResults();
                else {
                    this.foregroundView.endgamePopup.hide();
                    this.uiView.show();
                }
                break;
            case GAME.UI_KEYS[1]: // Lose game
                this.gameState = GAME.STATE.PAUSE;
                this.gameView.tweenLoseGame();
                break;
            case GAME.UI_KEYS[2]: // Win game
                this.gameState = GAME.STATE.PAUSE;
                this.gameView.tweenWinGame();
                break;
            case GAME.UI_KEYS[3]:
            case GAME.UI_KEYS[4]:
            case GAME.UI_KEYS[5]:
                this.gameView.changeVideo(key);
        }
    }

    private startGame(): void {
        this.logic = new LogicComponent(this.gameEvents);
        this.moveCounter = 0;
        this.uiView.updateCounter(0);
        this.gameState = GAME.STATE.WAIT;
        this.makeMove(null);
    }

    private makeMove(dir: number[] | null): void {
        if (this.gameState === GAME.STATE.WAIT) {
            this.gameState = GAME.STATE.PAUSE;
            const result = this.logic.move(true, dir);
            this.uiView.playMoveSound();
            this.moveCounter++;
            console.log(`${this.moveCounter} - ${result.shifted}/${result.merged}/${result.new}`);
            this.gameView.showMoveResult(result, this.logic.getFieldValues());
            //this.gameView.updateLabelsData(this.logic.getFieldValues());
            if (this.logic.canContinueGame()) {
                this.gameState = GAME.STATE.WAIT;
            } else {
                this.gameState = GAME.STATE.ABSENT;
                this.showResults();
            }
        }
    }

    private showResults(): void {
        console.log("  ***  GAME FINISHED!  ***  ");
        console.log(`Moves: ${this.moveCounter}`);
        this.uiView.hide();
        this.foregroundView.showResults(this.uiView.getCounter());
        if (this.logic.checkGoal(GAME.GOAL)) {
            console.log(" Game is WON: The goal has been achieved.");
            return;
        }
        console.log(` Game is lost: no empty tiles left.`);

        // Ask for a new game
        //startNewGame();
    }

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
