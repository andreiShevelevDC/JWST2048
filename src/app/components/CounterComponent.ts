import * as HUD from "../configs/Hud";
import LabelComponent from "./LabelComponent";

export default class CounterComponent extends Phaser.GameObjects.Container {
    private rectBack: Phaser.GameObjects.Rectangle;
    private label: LabelComponent;
    private counter = 0;
    private xPos = this.scene.scale.gameSize.width + HUD.SCORE_LABEL_POS_X;
    private yPos = HUD.SCORE_LABEL_POS_Y;
    private readonly scoreText = "Score:";
    private tweenCounter: Phaser.Tweens.Tween;

    public constructor(scene) {
        super(scene);
        this.init();
        this.updatePosition();
    }

    public updateCounterTween(): void {
        if (this.tweenCounter.isPlaying())
            this.label.setText(
                `${this.scoreText} ${Math.floor(this.tweenCounter.getValue()).toString().padStart(4, "0")}`,
            );
    }

    public reset(): void {
        this.counter = 0;
        this.label.setText(`${this.scoreText} 0000`);
    }

    public update(newValue: number): void {
        this.tweenCounter = this.scene.tweens.addCounter({
            from: this.counter,
            to: this.counter + newValue,
            duration: 500,
            paused: false,
            repeat: 0,
            yoyo: false,
            ease: "Linear",
            onComplete: () => {
                this.counter += newValue;
                this.label.setText(`${this.scoreText} ${this.counter.toString().padStart(4, "0")}`);
            },
        });
    }

    public updatePosition(): void {
        this.xPos = this.scene.scale.gameSize.width + HUD.SCORE_LABEL_POS_X;
        this.rectBack.setPosition(this.xPos, this.yPos);
        this.label.setPosition(this.xPos, this.yPos);
    }

    public hide(): void {
        this.label.hide();
        this.rectBack.setVisible(false);
    }

    public show(): void {
        this.label.show();
        this.rectBack.setVisible(true);
    }

    public getValue = (): number => this.counter;

    private init(): void {
        this.initBkg();
        this.initLabel();
    }

    private initBkg(): void {
        this.rectBack = this.scene.add.rectangle(
            this.xPos, // - HUD.SCORE_BACK_SIZE_X / 2,
            this.yPos, // - HUD.SCORE_BACK_SIZE_Y / 2,
            HUD.SCORE_BACK_SIZE_X,
            HUD.SCORE_BACK_SIZE_Y,
            HUD.SCORE_BACK.cFill,
            HUD.SCORE_BACK.aFill,
        );
        this.rectBack.setStrokeStyle(HUD.SCORE_BACK.wStroke, HUD.SCORE_BACK.cStroke, HUD.SCORE_BACK.aStroke);
        this.rectBack.setOrigin(0.5, 0.5);
        this.add(this.rectBack);
    }

    private initLabel(): void {
        this.label = new LabelComponent(
            this.scene,
            this.xPos,
            this.yPos,
            `${this.scoreText} ${this.counter.toString().padStart(4, "0")}`,
            HUD.SCORE_LABEL,
        );
        this.add(this.label);
    }
}
