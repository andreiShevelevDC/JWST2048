import * as HUD from "../configs/Hud";
import LabelComponent from "./LabelComponent";

export default class CounterComponent extends Phaser.GameObjects.Container {
    private rectBack: Phaser.GameObjects.Rectangle;
    private label: LabelComponent;
    private button: Phaser.GameObjects.Rectangle;
    private buttonLabel: LabelComponent;
    private readonly popupText = "Final score:";
    private readonly buttonText = "New Game";

    private isOpen: boolean;

    public constructor(scene) {
        super(scene);
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
            .on("pointerover", () => console.log("over"))
            .on("pointerout", () => console.log("out"))
            .on("pointerdown", () => console.log("down"));
        this.add(this.button);
    }

    private initButtonLabel(): void {
        this.buttonLabel = new LabelComponent(this.scene, 0, 0, this.buttonText, HUD.ENDGAME_POPUP_BUTTON_LABEL);
        this.add(this.buttonLabel);
        this.buttonLabel.hide();
    }
}
