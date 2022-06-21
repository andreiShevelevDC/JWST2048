import * as HUD from "../configs/Hud";
import { EVENT } from "../configs/Game";
import LabelComponent from "./LabelComponent";

export default class PopupComponent extends Phaser.GameObjects.Container {
    public isOpen: boolean;

    private rectBack: Phaser.GameObjects.Rectangle;
    private label: LabelComponent;
    private button: Phaser.GameObjects.Rectangle;
    private buttonLabel: LabelComponent;
    private readonly popupText = "Final score:";
    private readonly buttonText = "New Game";
    private gameEvents: Phaser.Events.EventEmitter;

    public constructor(scene: Phaser.Scene, eventsEmitter: Phaser.Events.EventEmitter) {
        super(scene);
        this.gameEvents = eventsEmitter;
        this.init();
        this.hide();
        //this.show(4096);
    }

    public updatePosition(): void {
        if (this.isOpen) {
            const { width, height } = this.scene.scale.gameSize;
            this.rectBack.setPosition(width / 2, height / 2);
            this.label.setPosition(width / 2, height / 2 - 30);
            this.button.setPosition(width / 2, height / 2 + 30);
            this.buttonLabel.setPosition(width / 2, height / 2 + 30);
        }
    }

    public hide(): void {
        this.label.hide();
        this.rectBack.setVisible(false);
        this.button.setVisible(false);
        this.button.disableInteractive();
        this.buttonLabel.hide();
        this.isOpen = false;
    }

    public show(score: number): void {
        this.isOpen = true;
        this.updatePosition();
        this.label.setText(`${this.popupText} ${score.toString()}`);
        this.label.show();
        this.rectBack.setVisible(true);
        this.button.setVisible(true);
        this.button.setInteractive();
        this.buttonLabel.show();
    }

    private init(): void {
        this.initBkg();
        this.initLabel();
        this.initButton();
        this.initButtonLabel();
    }

    private initBkg(): void {
        this.rectBack = this.scene.add.rectangle(
            0,
            0,
            HUD.ENDGAME_POPUP_BACK.sizeX,
            HUD.ENDGAME_POPUP_BACK.sizeY,
            HUD.ENDGAME_POPUP_BACK.cFill,
            HUD.ENDGAME_POPUP_BACK.aFill,
        );
        this.rectBack.setStrokeStyle(
            HUD.ENDGAME_POPUP_BACK.wStroke,
            HUD.ENDGAME_POPUP_BACK.cStroke,
            HUD.ENDGAME_POPUP_BACK.aStroke,
        );
        this.rectBack.setOrigin(0.5, 0.5);
        this.add(this.rectBack);
    }

    private initLabel(): void {
        this.label = new LabelComponent(this.scene, 0, 0, `${this.popupText} 0`, HUD.SCORE_LABEL);
        this.add(this.label);
    }

    private initButton(): void {
        this.button = this.scene.add.rectangle(
            0,
            0,
            HUD.ENDGAME_POPUP_BUTTON.sizeX,
            HUD.ENDGAME_POPUP_BUTTON.sizeY,
            HUD.ENDGAME_POPUP_BUTTON.cFill,
            HUD.ENDGAME_POPUP_BUTTON.aFill,
        );
        this.button.setStrokeStyle(
            HUD.ENDGAME_POPUP_BUTTON.wStroke,
            HUD.ENDGAME_POPUP_BUTTON.cStroke,
            HUD.ENDGAME_POPUP_BUTTON.aStroke,
        );
        this.button.setOrigin(0.5, 0.5);
        this.button
            .setInteractive(
                new Phaser.Geom.Rectangle(0, 0, HUD.ENDGAME_POPUP_BUTTON.sizeX, HUD.ENDGAME_POPUP_BUTTON.sizeY),
                Phaser.Geom.Rectangle.Contains,
            )
            .on("pointerover", () => this.setButtonActive())
            .on("pointerout", () => this.setButtonNormal())
            .on("pointerdown", () => {
                this.hide();
                this.gameEvents.emit(EVENT.RESTART);
            });
        this.add(this.button);
    }

    private setButtonNormal(): void {
        this.button.setFillStyle(HUD.ENDGAME_POPUP_BUTTON.cFill, HUD.ENDGAME_POPUP_BUTTON.aFill);
        this.button.setStrokeStyle(
            HUD.ENDGAME_POPUP_BUTTON.wStroke,
            HUD.ENDGAME_POPUP_BUTTON.cStroke,
            HUD.ENDGAME_POPUP_BUTTON.aStroke,
        );
        this.button.setScale(1.0);
        this.buttonLabel.setFill(HUD.ENDGAME_POPUP_BUTTON_LABEL.color);
        this.buttonLabel.setFont(HUD.ENDGAME_POPUP_BUTTON_LABEL.font);
    }

    private setButtonActive(): void {
        this.button.setFillStyle(HUD.ENDGAME_POPUP_BUTTON.cFillActive, HUD.ENDGAME_POPUP_BUTTON.aFillActive);
        this.button.setStrokeStyle(
            HUD.ENDGAME_POPUP_BUTTON.wStrokeActive,
            HUD.ENDGAME_POPUP_BUTTON.cStrokeActive,
            HUD.ENDGAME_POPUP_BUTTON.aStrokeActive,
        );
        this.button.setScale(1.2);
        this.buttonLabel.setFill(HUD.ENDGAME_POPUP_BUTTON_LABEL_ACTIVE.color);
        this.buttonLabel.setFont(HUD.ENDGAME_POPUP_BUTTON_LABEL_ACTIVE.font);
    }

    private initButtonLabel(): void {
        this.buttonLabel = new LabelComponent(this.scene, 0, 0, this.buttonText, HUD.ENDGAME_POPUP_BUTTON_LABEL);
        this.add(this.buttonLabel);
        this.buttonLabel.hide();
    }
}
