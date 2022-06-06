//import { IocContext } from "power-di";
import * as Stats from "stats.js";
import { SceneNames } from "../enums/Scenes";
//import { PopupService } from "../services/PopupService";
//import { ForegroundView } from "../views/ForegroundView";
import { GameView } from "../views/GameView";
import { UIView } from "../views/UIView";
import * as GAME from "../configs/Game";
import Logic from "../components/Logic";

export default class MainScene extends Phaser.Scene {
    private gameView: GameView;
    private uiView: UIView;
    //private foregroundView: ForegroundView;

    private logic: Logic;
    private fieldValues: number[];
    private gameState = GAME.STATE.PAUSE;
    private moveCounter: number;

    public constructor() {
        super({ key: SceneNames.Main });
    }

    //public update(): void {}

    private init(): void {
        //this.initServices();
        this.initGameView();
        this.initUIView();
        //this.initForegroundView();
        if (process.env.NODE_ENV !== "production") this.initStatJS();
        this.makeNewGame();
        this.handleInput();
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

    // private initForegroundView(): void {
    //     this.foregroundView = new ForegroundView(this);
    //     this.foregroundView.on("counterPopupClosed", () => {
    //         this.gameView.runRacoon();
    //     });
    //     this.add.existing(this.foregroundView);
    // }

    private makeNewGame(): void {
        this.moveCounter = 0;
        this.gameState = GAME.STATE.PLAYING;
        this.startGame();
    }

    private startGame(): void {
        this.logic = new Logic();

        this.logic.addNewTiles(1, GAME.NEW_TILES);

        this.fieldValues = this.logic.getFieldValues();

        this.gameView.field.updateLabelsData(this.fieldValues);
    }

    private handleInput(): void {
        document.addEventListener(GAME.KEYBOARD_EVENT, (event) => {
            const action = this.uiView.keyboard.keyboardHandler(event);
            switch (action[0]) {
                case GAME.KEY.UNASSIGNED:
                    //TODO: show hotkeys help popup
                    break;
                case GAME.KEY.MOVE:
                    if (this.gameState === GAME.STATE.PLAYING) {
                        //check if move changed field state and skip if not
                        //console.log(fieldValues);
                        this.logic.makeMove(action[1]);
                        this.moveCounter++;
                        if (this.canContinueGame()) {
                            this.logic.addNewTiles(1, GAME.NEW_TILES);
                            this.gameView.field.updateLabelsData(this.fieldValues);
                        } else {
                            this.gameState = GAME.STATE.PAUSE;
                            this.finishGame();
                        }
                    } else {
                        console.log(" START A NEW GAME");
                    }
                    break;
                case GAME.KEY.UI:
                    // UI action
                    break;
            }
        });
    }

    private finishGame(): void {
        console.log("  ***  GAME FINISHED!  ***  ");
        console.log(` ${this.moveCounter} moves made.`);
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
