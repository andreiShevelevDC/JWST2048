//import * as Stats from "stats.js";
import { SceneNames } from "../enums/Scenes";
import { ForegroundView } from "../views/ForegroundView";
import { GameView } from "../views/GameView";
import { UIView } from "../views/UIView";
import * as GAME from "../configs/Game";

export default class MainScene extends Phaser.Scene {
    private gameView: GameView;
    private uiView: UIView;
    private foregroundView: ForegroundView;

    private gameState = GAME.STATE.PAUSE;
    private moveCounter = 0;

    public constructor() {
        super({ key: SceneNames.Main });
        this.init();
    }

    public update(): void {}

    private init(): void {
        this.initGameView();
        this.initUIView();
        this.initForegroundView();
        //this.initStatJS();
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

    private initForegroundView(): void {
        this.foregroundView = new ForegroundView(this);
        this.add.existing(this.foregroundView);
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
                        //check if move changed field's state and skip if not
                        //console.log(field);
                        logic.makeMove(action[1]);
                        this.moveCounter++;
                        if (this.canContinueGame()) {
                            logic.newTiles(1, [2, 2, 2, 2, 4]);
                            DRAW.updateLabels(field);
                        } else {
                            this.gameState = GAME.STATE.PAUSE;
                            finishGame();
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

    // private initStatJS(): void {
    //     const stats = new Stats();
    //     stats.showPanel(2);
    //     const update = (): void => {
    //         stats.begin();
    //         stats.end();
    //         requestAnimationFrame(update);
    //     };
    //     update();
    //     document.body.appendChild(stats.dom);
    // }
}
