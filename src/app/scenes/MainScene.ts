//import { IocContext } from "power-di";
import * as Stats from "stats.js";
import { SceneNames } from "../enums/Scenes";
//import { PopupService } from "../services/PopupService";
import { ForegroundView } from "../views/ForegroundView";
import GameView from "../views/GameView";
import { UIView } from "../views/UIView";
import * as GAME from "../configs/Game";
//import LogicComponent from "../components/LogicComponent";
import MeteorStreamLogicComponent from "../components/MeteorStreamLogicComponent";

export default class MainScene extends Phaser.Scene {
    private gameView: GameView;
    private uiView: UIView;
    private foregroundView: ForegroundView;
    private gameEvents: Phaser.Events.EventEmitter;

    private logic: MeteorStreamLogicComponent;
    private gameState = GAME.STATE.ABSENT;
    private moveCounter: number;

    public constructor() {
        super({ key: SceneNames.Main });
    }

    public update(): void {
        if (this.gameState === GAME.STATE.PAUSE) this.uiView.updateCounterTween();
    }

    private resetGame(): void {
        this.moveCounter = 0;
        this.uiView.resetCounter();
        this.uiView.show();
        this.logic.restart();
        this.gameView.reset();
        this.gameView.newTiles(this.logic.addNewTiles(2, GAME.NEW_TILES), this.logic.getFieldValues());
        this.gameState = GAME.STATE.WAIT;
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
        this.add.existing(this.gameView);
    }

    private initUIView(): void {
        this.uiView = new UIView(this, this.gameEvents);
        this.add.existing(this.uiView);
    }

    private initForegroundView(): void {
        this.foregroundView = new ForegroundView(this, this.gameEvents);
        // this.foregroundView.on("counterPopupClosed", () => {
        //     this.gameView.runRacoon();
        // });
        this.add.existing(this.foregroundView);
    }

    private handleEvents(): void {
        this.gameEvents.on(GAME.EVENT.MOVE, this.makeMove, this);
        this.gameEvents.on(GAME.EVENT.MOVEEND, this.contMove, this);
        this.gameEvents.on(GAME.EVENT.FREEZEFINISHED, this.finishMove, this);
        this.gameEvents.on(GAME.EVENT.UI, (key: string) => this.uiEventHandler(key));
        this.gameEvents.on(GAME.EVENT.SHOWRESULTS, () => this.showEndGamePopup());
        this.gameEvents.on(GAME.EVENT.RESTART, () => this.resetGame());
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
                if (!this.foregroundView.endgamePopup.isOpen) {
                    this.uiView.hide();
                    this.showEndGamePopup();
                } else {
                    this.foregroundView.endgamePopup.hide();
                    this.uiView.show();
                }
                break;
            case GAME.UI_KEYS[1]: // Lose game
                this.gameState = GAME.STATE.ABSENT;
                this.endGame();
                break;
            case GAME.UI_KEYS[2]: // Win game
                this.gameState = GAME.STATE.ABSENT;
                this.uiView.hide();
                this.gameView.tweenWinGame();
                break;
            case GAME.UI_KEYS[3]:
            case GAME.UI_KEYS[4]:
            case GAME.UI_KEYS[5]:
                if (GAME.USE_VIDEO_BACKGROUND) this.gameView.changeVideo(key);
        }
    }

    private startGame(): void {
        this.logic = new MeteorStreamLogicComponent(this.gameEvents);
        this.moveCounter = 0;
        //this.uiView.updateCounter(0);
        this.gameView.newTiles(this.logic.addNewTiles(2, GAME.NEW_TILES), this.logic.getFieldValues());
        this.gameState = GAME.STATE.WAIT;
    }

    private makeMove(dir: number[] | null): void {
        if (this.gameState === GAME.STATE.WAIT) {
            this.gameState = GAME.STATE.PAUSE;
            const result = this.logic.move(true, dir);
            //console.log("MOVE FINISHED: ", JSON.stringify(result));
            this.moveCounter++;
            this.gameView.showMoveResult(result, this.logic.getFieldValues());
            this.uiView.updateCounter(result.mergedScore);
        }
    }

    private contMove(): void {
        if (this.logic.shouldContinueGame()) {
            const freezeResults = this.logic.moveFreeze();
            if (freezeResults.thawed.length > 0 || freezeResults.frozen.length > 0)
                this.gameView.tweenThawAndFreeze(freezeResults);
            else this.finishMove();
        } else {
            this.gameState = GAME.STATE.ABSENT;
            this.endGame();
        }
    }

    private finishMove(): void {
        this.gameView.newTiles(this.logic.addNewTiles(1, GAME.NEW_TILES), this.logic.getFieldValues());
        this.uiView.playMoveSound();
        this.gameState = GAME.STATE.WAIT;
    }

    private endGame(): void {
        console.log("  ***  GAME FINISHED!  ***  ");
        console.log(`Moves: ${this.moveCounter}`);
        this.uiView.hide();
        if (this.logic.checkGoal(GAME.GOAL)) {
            this.gameView.tweenWinGame();
            console.log(" Game is WON: The goal has been achieved.");
        } else {
            this.gameView.tweenLoseGame();
            console.log(` Game is lost: no empty tiles left.`);
        }

        // Ask for a new game
        //startNewGame();
    }

    private showEndGamePopup(): void {
        this.foregroundView.showResults(this.uiView.getCounter());
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
